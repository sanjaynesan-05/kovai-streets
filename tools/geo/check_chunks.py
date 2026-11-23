"""Step G1 check: the chunk files reassemble into the pilot data with no gaps, overlaps or losses.

Checks (all must pass):
1. Every line (road, path, rail, waterway): total length of its pieces across all chunks = its length inside the pilot rectangle.
2. Every piece lies inside its own chunk.
3. Every piece end on a border between two chunks meets the start or end of a piece of the same line in the neighbouring chunk.
4. Every area (lake, landuse): total area of its pieces = its area inside the pilot rectangle.
5. Every building whose centre is inside the pilot is in exactly one chunk; no other building is.
6. The trimmed road graph only has nodes inside the pilot, and every edge points at real nodes.
Run:  python tools/geo/check_chunks.py
"""
import json, math, os, sys
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chunk_pilot import clip_poly, ring_area   # area clipping is shared with the chunker; the line checks below are independent

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "geodata", "processed", "pilot")
CH = os.path.join(SRC, "chunks")
EPS = 0.02   # metres: coordinates are stored to 0.01 m


def seg_len_inside(a, b, R):
    """Length of segment a-b inside rectangle R, by sampling-free parametric clipping written separately from the chunker."""
    lo, hi = 0.0, 1.0
    for axis, mn, mx in ((0, R[0], R[2]), (1, R[1], R[3])):
        d = b[axis] - a[axis]
        if abs(d) < 1e-12:
            if not (mn <= a[axis] <= mx): return 0.0
            continue
        t1, t2 = (mn - a[axis]) / d, (mx - a[axis]) / d
        lo, hi = max(lo, min(t1, t2)), min(hi, max(t1, t2))
        if lo >= hi: return 0.0
    return (hi - lo) * math.hypot(b[0] - a[0], b[1] - a[1])


def plen(p):
    return sum(math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]) for k in range(1, len(p)))


def main():
    idx = json.load(open(os.path.join(CH, "index.json"), encoding="utf-8")); R = idx["rect"]; S = idx["size_m"]
    chunks = {(c["i"], c["j"]): json.load(open(os.path.join(CH, c["file"]), encoding="utf-8")) for c in idx["chunks"]}
    load = lambda n: json.load(open(os.path.join(SRC, n), encoding="utf-8"))
    src = {"roads": load("roads.json")["roads"], "paths": load("paths.json")["paths"], "rail": load("rail.json")["rail"],
           "waterways": load("water.json")["waterways"], "water": load("water.json")["water"], "landuse": load("landuse.json")["landuse"]}
    fails = defaultdict(list)

    for kind in ("roads", "paths", "rail", "waterways"):
        got, ends = defaultdict(float), defaultdict(list)
        for (i, j), c in chunks.items():
            b = c["bounds"]
            for pc in c.get(kind, []):
                got[pc["src"]] += plen(pc["pts"])
                if any(not (b[0] - EPS <= q[0] <= b[2] + EPS and b[1] - EPS <= q[1] <= b[3] + EPS) for q in pc["pts"]): fails["piece outside its chunk"].append((kind, pc["src"], i, j))
                for q in (pc["pts"][0], pc["pts"][-1]): ends[pc["src"]].append((i, j, q))
        for s, it in enumerate(src[kind]):
            want = sum(seg_len_inside(it["pts"][k - 1], it["pts"][k], R) for k in range(1, len(it["pts"])))
            if abs(want - got.get(s, 0)) > EPS * (len(it["pts"]) + 2): fails["line length mismatch"].append((kind, s, round(want, 2), round(got.get(s, 0), 2)))
        for s, lst in ends.items():
            for (i, j, q) in lst:
                on_x = abs(q[0] / S - round(q[0] / S)) * S < EPS and R[0] + EPS < q[0] < R[2] - EPS
                on_z = abs(q[1] / S - round(q[1] / S)) * S < EPS and R[1] + EPS < q[1] < R[3] - EPS
                if not (on_x or on_z): continue
                ok = any((i2, j2) != (i, j) and abs(q2[0] - q[0]) < EPS and abs(q2[1] - q[1]) < EPS for (i2, j2, q2) in lst)
                orig = src[kind][s]["pts"]
                if not ok and not any(abs(o[0] - q[0]) < EPS and abs(o[1] - q[1]) < EPS for o in (orig[0], orig[-1])):
                    fails["gap at a chunk border"].append((kind, s, q))

    for kind in ("water", "landuse"):
        got = defaultdict(float)
        for c in chunks.values():
            for pc in c.get(kind, []): got[pc["src"]] += ring_area(pc["pts"])
        for s, it in enumerate(src[kind]):
            ring = clip_poly(it["pts"], R); want = ring_area(ring) if ring else 0.0
            if abs(want - got.get(s, 0)) > max(1.0, want * 0.005): fails["area mismatch"].append((kind, s, round(want), round(got.get(s, 0))))

    blds = load("buildings.json")["buildings"]; seen = defaultdict(int)
    for c in chunks.values():
        for b in c.get("buildings", []): seen[b["src"]] += 1
    for k, b in enumerate(blds):
        ring = b["pts"][:-1] if b["pts"][0] == b["pts"][-1] else b["pts"]
        cx, cz = sum(q[0] for q in ring) / len(ring), sum(q[1] for q in ring) / len(ring)
        want = 1 if (R[0] <= cx < R[2] and R[1] <= cz < R[3]) else 0
        if seen.get(k, 0) != want: fails["building count"].append((k, want, seen.get(k, 0)))

    g = load("graph_pilot.json")
    if any(not (R[0] <= n[0] <= R[2] and R[1] <= n[1] <= R[3]) for n in g["nodes"]): fails["graph node outside"].append(1)
    if any(not (0 <= e[0] < len(g["nodes"]) and 0 <= e[1] < len(g["nodes"])) for e in g["edges"]): fails["graph edge index"].append(1)

    total = sum(len(v) for v in fails.values())
    print(f"{len(chunks)} chunks checked: " + ("ALL CHECKS PASSED" if not total else f"{total} problem(s)"))
    for k, v in fails.items(): print(f"  {k}: {len(v)}  e.g. {v[:3]}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
