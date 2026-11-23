"""Step G1: split the processed pilot data into 1 x 1 km chunks for streaming.

Reads   geodata/processed/pilot/{roads,paths,rail,water,landuse,buildings,graph}.json   (from build_pilot.py)
Writes  geodata/processed/pilot/chunks/c_<i>_<j>.json   one file per chunk; chunk (i, j) covers x in [i*1000, (i+1)*1000), z in [j*1000, (j+1)*1000)
        geodata/processed/pilot/chunks/index.json       pilot rectangle, chunk list with bounds and counts
        geodata/processed/pilot/graph_pilot.json        road graph trimmed to the pilot rectangle (for AI and GPS)

Rules:
- Everything is first clipped to the pilot rectangle: the largest axis-aligned rectangle inside the projected download box.
- Lines (roads, paths, rail, waterways) are cut exactly at chunk borders. The cut point is computed once from the original
  segment, so the two pieces on either side of a border share the same end point (no gaps).
- Areas (lakes, landuse) are clipped to each chunk they overlap (Sutherland-Hodgman).
- Buildings are not cut: each goes, whole, to the chunk that contains its centre.
- Points (signals, stations, level crossings) go to the chunk that contains them.
Check the result with:  python tools/geo/check_chunks.py
"""
import json, math, os, sys
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import to_game

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "geodata", "processed", "pilot")
OUT = os.path.join(SRC, "chunks")
BBOX = (10.978, 76.947, 11.032, 77.003)
SIZE = 1000.0


def pilot_rect():
    """Largest axis-aligned game rectangle inside the projected lat/lon box (UTM grid north differs slightly from true north)."""
    c = [to_game(la, lo) for la in (BBOX[0], BBOX[2]) for lo in (BBOX[1], BBOX[3])]   # SW, SE, NW, NE
    (swx, swz), (sex, sez), (nwx, nwz), (nex, nez) = c
    return (math.ceil(max(swx, nwx)), math.ceil(max(nwz, nez)), math.floor(min(sex, nex)), math.floor(min(swz, sez)))   # x0, z0, x1, z1


def clip_seg(a, b, r):
    """Liang-Barsky: part of segment a-b inside rectangle r=(x0,z0,x1,z1), or None."""
    t0, t1, dx, dz = 0.0, 1.0, b[0] - a[0], b[1] - a[1]
    for p, q in ((-dx, a[0] - r[0]), (dx, r[2] - a[0]), (-dz, a[1] - r[1]), (dz, r[3] - a[1])):
        if p == 0:
            if q < 0: return None
        else:
            t = q / p
            if p < 0: t0 = max(t0, t)
            else: t1 = min(t1, t)
            if t0 > t1: return None
    return t0, t1


def lerp(a, b, t):
    return [round(a[0] + (b[0] - a[0]) * t, 2), round(a[1] + (b[1] - a[1]) * t, 2)]


def chunk_of(x, z):
    return int(math.floor(x / SIZE)), int(math.floor(z / SIZE))


def chunk_rect(i, j):
    return (i * SIZE, j * SIZE, (i + 1) * SIZE, (j + 1) * SIZE)


def split_line(p, R, starts=None):
    """Cut a polyline to the pilot rectangle R and at chunk borders. Returns {(i,j): [piece, ...]}.
    starts, if given, maps id(piece) -> distance (m) along the original polyline where the piece begins."""
    out = defaultdict(list); run = 0.0
    for k in range(1, len(p)):
        a, b = p[k - 1], p[k]; seg = math.hypot(b[0] - a[0], b[1] - a[1]); base = run; run += seg
        c = clip_seg(a, b, R)
        if not c: continue
        A, B = lerp(a, b, c[0]), lerp(a, b, c[1])
        # cut points where the segment crosses chunk borders (as fractions of the original segment)
        ts = {c[0], c[1]}
        for axis in (0, 1):
            lo, hi = sorted((a[axis], b[axis]))
            for g in range(math.ceil(lo / SIZE), math.floor(hi / SIZE) + 1):
                if b[axis] != a[axis]:
                    t = (g * SIZE - a[axis]) / (b[axis] - a[axis])
                    if c[0] < t < c[1]: ts.add(t)
        ts = sorted(ts)
        for t0, t1 in zip(ts, ts[1:]):
            if t1 - t0 < 1e-9: continue
            P, Q = lerp(a, b, t0), lerp(a, b, t1)
            if P == Q: continue
            key = chunk_of((P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2)
            pieces = out[key]
            if pieces and pieces[-1][-1] == P: pieces[-1].append(Q)
            else:
                pieces.append([P, Q])
                if starts is not None: starts[id(pieces[-1])] = round(base + t0 * seg, 2)
    return out


def clip_poly(poly, r):
    """Sutherland-Hodgman clip of a closed polygon (first point == last point) to rectangle r. Returns an open ring or []."""
    ring = poly[:-1] if poly and poly[0] == poly[-1] else poly[:]
    for edge in range(4):
        if not ring: break
        inside = [lambda q: q[0] >= r[0], lambda q: q[0] <= r[2], lambda q: q[1] >= r[1], lambda q: q[1] <= r[3]][edge]
        axis, val = (0, r[0]) if edge == 0 else (0, r[2]) if edge == 1 else (1, r[1]) if edge == 2 else (1, r[3])
        out = []
        for k in range(len(ring)):
            cur, prev = ring[k], ring[k - 1]
            if inside(cur):
                if not inside(prev): t = (val - prev[axis]) / (cur[axis] - prev[axis]); out.append(lerp(prev, cur, t))
                out.append(cur)
            elif inside(prev):
                t = (val - prev[axis]) / (cur[axis] - prev[axis]); out.append(lerp(prev, cur, t))
        ring = out
    return ring if len(ring) >= 3 else []


def ring_area(r):
    return abs(sum(r[i - 1][0] * r[i][1] - r[i][0] * r[i - 1][1] for i in range(len(r)))) / 2


def main():
    R = pilot_rect()
    load = lambda n: json.load(open(os.path.join(SRC, n), encoding="utf-8"))
    roads, paths, rail, water, landuse, blds = load("roads.json"), load("paths.json"), load("rail.json"), load("water.json"), load("landuse.json"), load("buildings.json")
    i0, j0 = chunk_of(R[0], R[1]); i1, j1 = chunk_of(R[2] - 1e-6, R[3] - 1e-6)
    chunks = {(i, j): defaultdict(list) for i in range(i0, i1 + 1) for j in range(j0, j1 + 1)}

    def lines(items, kind, keep):
        for idx, it in enumerate(items):
            st = {}; L = round(sum(math.hypot(it["pts"][k][0] - it["pts"][k - 1][0], it["pts"][k][1] - it["pts"][k - 1][1]) for k in range(1, len(it["pts"]))), 2)
            for key, pieces in split_line(it["pts"], R, st).items():
                for pc in pieces:
                    o = dict({k: it[k] for k in keep if k in it}, src=idx, pts=pc)
                    if kind == "roads" and it.get("bridge"): o["s0"], o["L"] = st[id(pc)], L   # where this piece sits along the whole bridge (for ramp heights)
                    chunks[key][kind].append(o)
    lines(roads["roads"], "roads", ("id", "cls", "name", "oneway", "bridge", "tunnel", "layer", "width"))
    lines(paths["paths"], "paths", ("id", "cls", "name"))
    lines(rail["rail"], "rail", ("id", "kind", "service", "bridge"))
    lines(water["waterways"], "waterways", ("id", "name", "kind"))

    def areas(items, kind, keep):
        for idx, it in enumerate(items):
            xs, zs = [q[0] for q in it["pts"]], [q[1] for q in it["pts"]]
            for (i, j) in chunks:
                cr = chunk_rect(i, j); r = (max(cr[0], R[0]), max(cr[1], R[1]), min(cr[2], R[2]), min(cr[3], R[3]))
                if max(xs) < r[0] or min(xs) > r[2] or max(zs) < r[1] or min(zs) > r[3]: continue
                ring = clip_poly(it["pts"], r)
                if ring and ring_area(ring) > 0.01: chunks[(i, j)][kind].append(dict({k: it[k] for k in keep if k in it}, src=idx, pts=ring))
    areas(water["water"], "water", ("id", "name", "kind"))
    areas(landuse["landuse"], "landuse", ("id", "kind", "name"))

    inside = lambda x, z: R[0] <= x < R[2] and R[1] <= z < R[3]
    for idx, b in enumerate(blds["buildings"]):
        ring = b["pts"][:-1] if b["pts"][0] == b["pts"][-1] else b["pts"]
        cx, cz = sum(q[0] for q in ring) / len(ring), sum(q[1] for q in ring) / len(ring)
        if inside(cx, cz): chunks[chunk_of(cx, cz)]["buildings"].append(dict(b, src=idx))
    for kind, items in (("signals", roads["signals"]), ("crossings", rail["crossings"])):
        for p in items:
            if inside(*p): chunks[chunk_of(*p)][kind].append(p)
    for s in rail["stations"]:
        if inside(*s["p"]): chunks[chunk_of(*s["p"])]["stations"].append(s)

    # graph trimmed to the pilot rectangle: keep edges whose two ends are inside
    g = load("graph.json")
    keep = [k for k, n in enumerate(g["nodes"]) if inside(n[0], n[1])]
    remap = {old: new for new, old in enumerate(keep)}
    gp = {"meta": g["meta"], "rect": R, "nodes": [g["nodes"][k] for k in keep], "edge_fields": g["edge_fields"],
          "edges": [[remap[e[0]], remap[e[1]]] + e[2:] for e in g["edges"] if e[0] in remap and e[1] in remap]}
    json.dump(gp, open(os.path.join(SRC, "graph_pilot.json"), "w", encoding="utf-8"), separators=(",", ":"))

    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.startswith("c_"): os.remove(os.path.join(OUT, f))
    index = {"meta": roads["meta"], "size_m": SIZE, "rect": R, "chunks": []}
    for (i, j), data in sorted(chunks.items()):
        name = f"c_{i}_{j}.json"
        json.dump({"i": i, "j": j, "bounds": chunk_rect(i, j), **data}, open(os.path.join(OUT, name), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        index["chunks"].append({"i": i, "j": j, "file": name, "bounds": chunk_rect(i, j), "kb": round(os.path.getsize(os.path.join(OUT, name)) / 1024),
                                "counts": {k: len(v) for k, v in data.items()}})
    json.dump(index, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"), separators=(",", ":"))
    tot = lambda k: sum(c["counts"].get(k, 0) for c in index["chunks"])
    print(f"pilot rect x {R[0]}..{R[2]}, z {R[1]}..{R[3]} ({(R[2]-R[0])/1000:.2f} x {(R[3]-R[1])/1000:.2f} km); {len(chunks)} chunks")
    print(f"road pieces {tot('roads')}, buildings {tot('buildings')}, water pieces {tot('water')}, landuse pieces {tot('landuse')}, "
          f"rail pieces {tot('rail')}; graph {len(gp['nodes'])} nodes / {len(gp['edges'])} edges; largest chunk {max(c['kb'] for c in index['chunks'])} KB")


if __name__ == "__main__":
    main()
