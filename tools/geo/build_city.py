"""Kovai Streets city: a compact fictional city based on central Coimbatore.

Keeps from the real map (geodata/processed/pilot, OpenStreetMap at 1:1): the main roads (trunk, primary, secondary, tertiary,
links, flyovers), the railway, lakes, parks and landmark areas, inside a 3.2 x 3.2 km core around Town Hall and Gandhipuram.
Drops all small OSM streets and grows clean neighbourhood streets instead:
  - side streets every 80-120 m, roughly at right angles to the main road they start from, ending where they meet another road;
  - cross streets joining neighbouring side streets every ~85 m, so blocks follow each main road's direction and
    neighbourhoods meet at natural angles (not one global grid);
  - unconnected ends are cut back, so there are no dead ends.
Real buildings are kept unless they overlap a road; every street frontage is then filled with generated buildings
(taller and commercial on main roads and near the centres, houses on side streets).

Writes geodata/processed/city/{roads,buildings,water,landuse,rail,pois,landmarks,graph,graph_pilot}.json and meta.json,
in the same format as the pilot, so tools/geo/chunk_pilot.py (KS_DATASET=city) and the game read it unchanged.
Deterministic (fixed random seed). Run:  python tools/geo/build_city.py
"""
import json, math, os, random
from collections import defaultdict, Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "geodata", "processed", "pilot")
OUT = os.path.join(ROOT, "geodata", "processed", "city")
RECT = (-1250, -2650, 1950, 550)                      # x0, z0, x1, z1 in game metres (Town Hall = 0, 0): streets stop here
OUTER = (RECT[0] - 60, RECT[1] - 60, RECT[2] + 60, RECT[3] + 60)   # buildings also line the outer side of edge roads, so the map edge looks built up
MAIN = {"trunk", "primary", "secondary", "tertiary", "trunk_link", "primary_link", "secondary_link", "tertiary_link"}
GROW_FROM = {"trunk", "primary", "secondary", "tertiary"}
OBSTACLE_LANDUSE = {"park", "garden", "pitch", "playground", "stadium", "racetrack", "track", "cemetery", "grass", "recreation_ground", "railway",
                    "bus_station", "basin", "reservoir"}   # open ground kept; other land-use areas (campuses, commercial...) are built over and not drawn
REAL_MIN_AREA = 600                                    # real buildings kept only when this big (malls, stations, mills); small ones are regenerated
STREET_NAMES = ["Sivan Koil", "Bharathiyar", "Kamaraj", "Periyar", "Vivekanandar", "Thiruvalluvar", "Avvaiyar", "Kambar", "Ilango", "Rajaji",
                "Sathyamurthy", "Chinnaswamy", "Ponnaiyah", "Venkatasamy", "Mariamman Koil", "Perumal Koil", "Nehru", "Gandhi", "Anna", "Bharathi"]
CENTRES = [(0, 0), (624, -2308), (874, -2561)]          # Town Hall, Gandhipuram bus stands: denser and taller around them
CELL = 2.0                                             # occupancy raster resolution (m)
rnd = random.Random(20261124)
load = lambda n: json.load(open(os.path.join(SRC, n + ".json"), encoding="utf-8"))


# ---------------- geometry helpers ----------------
def clip_seg(a, b, r):
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


def lerp(a, b, t): return [round(a[0] + (b[0] - a[0]) * t, 1), round(a[1] + (b[1] - a[1]) * t, 1)]


def clip_line(p, r):
    """Polyline -> list of pieces inside rectangle r."""
    out, cur = [], None
    for k in range(1, len(p)):
        c = clip_seg(p[k - 1], p[k], r)
        if not c: cur = None; continue
        A, B = lerp(p[k - 1], p[k], c[0]), lerp(p[k - 1], p[k], c[1])
        if cur and cur[-1] == A and c[0] == 0: cur.append(B)
        else: cur = [A, B]; out.append(cur)
        if c[1] < 1: cur = None
    return [q for q in out if len(q) >= 2]


def clip_poly(poly, r):
    ring = poly[:-1] if poly and poly[0] == poly[-1] else poly[:]
    for edge in range(4):
        if not ring: break
        axis, val, keep = [(0, r[0], lambda q: q[0] >= r[0]), (0, r[2], lambda q: q[0] <= r[2]), (1, r[1], lambda q: q[1] >= r[1]), (1, r[3], lambda q: q[1] <= r[3])][edge]
        out = []
        for k in range(len(ring)):
            cur, prev = ring[k], ring[k - 1]
            if keep(cur):
                if not keep(prev): out.append(lerp(prev, cur, (val - prev[axis]) / (cur[axis] - prev[axis])))
                out.append(cur)
            elif keep(prev): out.append(lerp(prev, cur, (val - prev[axis]) / (cur[axis] - prev[axis])))
        ring = out
    return ring + [ring[0]] if len(ring) >= 3 else []


def seg_x(a, b, c, d):
    """Intersection of segments a-b and c-d: (t on a-b, point) or None."""
    den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
    if abs(den) < 1e-9: return None
    t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den
    u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den
    if 1e-6 < t <= 1 and 0 <= u <= 1: return t, u
    return None


def length(p): return sum(math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]) for i in range(1, len(p)))


# ---------------- occupancy raster ----------------
NX, NZ = int((OUTER[2] - OUTER[0]) / CELL) + 1, int((OUTER[3] - OUTER[1]) / CELL) + 1
grid = bytearray(NX * NZ)     # bit 1 = obstacle (water/park/landmark), 2 = road, 4 = building
def gi(x, z):
    i, j = int((x - OUTER[0]) / CELL), int((z - OUTER[1]) / CELL)
    return j * NX + i if 0 <= i < NX and 0 <= j < NZ else -1
def mark_poly(ring, bit):
    zs = [q[1] for q in ring]
    for j in range(max(0, int((min(zs) - OUTER[1]) / CELL)), min(NZ, int((max(zs) - OUTER[1]) / CELL) + 1)):
        z = OUTER[1] + (j + 0.5) * CELL; xs = []
        for k in range(len(ring) - 1):
            a, b = ring[k], ring[k + 1]
            if (a[1] <= z) != (b[1] <= z): xs.append(a[0] + (z - a[1]) / (b[1] - a[1]) * (b[0] - a[0]))
        xs.sort()
        for k in range(0, len(xs) - 1, 2):
            for i in range(max(0, int((xs[k] - OUTER[0]) / CELL)), min(NX, int((xs[k + 1] - OUTER[0]) / CELL) + 1)): grid[j * NX + i] |= bit
def mark_capsule(a, b, rad, bit):
    x0, x1, z0, z1 = min(a[0], b[0]) - rad, max(a[0], b[0]) + rad, min(a[1], b[1]) - rad, max(a[1], b[1]) + rad
    dx, dz = b[0] - a[0], b[1] - a[1]; L = dx * dx + dz * dz or 1
    for j in range(max(0, int((z0 - OUTER[1]) / CELL)), min(NZ, int((z1 - OUTER[1]) / CELL) + 1)):
        z = OUTER[1] + (j + 0.5) * CELL
        for i in range(max(0, int((x0 - OUTER[0]) / CELL)), min(NX, int((x1 - OUTER[0]) / CELL) + 1)):
            x = OUTER[0] + (i + 0.5) * CELL; t = max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
            if math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) <= rad: grid[j * NX + i] |= bit
def blocked(x, z, bits):
    k = gi(x, z); return k < 0 or grid[k] & bits


def build_graph(roads, bridge_ends=False):
    """Same method as build_pilot.py: shared points on the same layer are junctions.
    bridge_ends: a bridge's two end points count as ground level, so overbridges and flyovers join the roads at their ends (build_kovai.py)."""
    key = lambda q, layer: (round(q[0], 1), round(q[1], 1), layer)
    lay = lambda r, i: 0 if (bridge_ends and r["bridge"] and i in (0, len(r["pts"]) - 1)) else r["layer"]
    use = Counter(key(q, lay(r, i)) for r in roads for i, q in enumerate(r["pts"]))
    nid, nodes, edges = {}, [], []
    def node(k):
        if k not in nid: nid[k] = len(nodes); nodes.append([k[0], k[1], k[2]])
        return nid[k]
    for ri, r in enumerate(roads):
        p = r["pts"]; cut = [0] + [i for i in range(1, len(p) - 1) if use[key(p[i], lay(r, i))] > 1] + [len(p) - 1]
        for a, b in zip(cut, cut[1:]):
            na, nb = node(key(p[a], lay(r, a))), node(key(p[b], lay(r, b))); Ls = round(length(p[a:b + 1]), 1)
            if na == nb: continue
            if r["oneway"] >= 0: edges.append([na, nb, Ls, ri, a, b])
            if r["oneway"] <= 0: edges.append([nb, na, Ls, ri, a, b])
    adj = defaultdict(set)
    for a, b, *_ in edges: adj[a].add(b); adj[b].add(a)
    comp, sizes = {}, []
    for s in range(len(nodes)):
        if s in comp: continue
        st = [s]; comp[s] = len(sizes); n = 0
        while st:
            u = st.pop(); n += 1
            for v in adj[u]:
                if v not in comp: comp[v] = len(sizes); st.append(v)
        sizes.append(n)
    return nodes, edges, comp, sizes


def main():
    os.makedirs(OUT, exist_ok=True)
    src_roads = load("roads"); water = load("water"); landuse = load("landuse"); rail = load("rail"); blds = load("buildings")["buildings"]
    meta = dict(src_roads["meta"], note="Fictional city based on central Coimbatore: real main roads, railway, lakes, parks and landmarks from OpenStreetMap; generated neighbourhood streets and infill buildings.", rect=OUTER)

    # ---- real features inside the core ----
    roads = []
    for r in src_roads["roads"]:
        if r["cls"] not in MAIN: continue
        for p in clip_line(r["pts"], RECT):
            if length(p) >= 20: roads.append(dict(r, pts=p, gen=False))
    W = [dict(w, pts=clip_poly(w["pts"], OUTER)) for w in water["water"]]; W = [w for w in W if w["pts"]]
    WW = [dict(w, pts=p) for w in water["waterways"] for p in clip_line(w["pts"], OUTER)]
    LU = [dict(u, pts=clip_poly(u["pts"], OUTER)) for u in landuse["landuse"] if u["kind"] in OBSTACLE_LANDUSE]; LU = [u for u in LU if u["pts"]]
    RL = [dict(x, pts=p) for x in rail["rail"] for p in clip_line(x["pts"], OUTER)]
    inside = lambda x, z: RECT[0] <= x <= RECT[2] and RECT[1] <= z <= RECT[3]
    inside_o = lambda x, z: OUTER[0] <= x <= OUTER[2] and OUTER[1] <= z <= OUTER[3]

    # ---- raster: obstacles and main roads ----
    for w in W: mark_poly(w["pts"], 1)
    for u in LU: mark_poly(u["pts"], 1)
    for x in RL:
        for k in range(1, len(x["pts"])): mark_capsule(x["pts"][k - 1], x["pts"][k], 7, 1)
    for r in roads:
        if r["bridge"] and r["layer"] > 0: continue        # streets may pass under flyovers
        for k in range(1, len(r["pts"])): mark_capsule(r["pts"][k - 1], r["pts"][k], r["width"] / 2 + 1, 2)

    # ---- street growth ----
    HS = 40; segs = defaultdict(list)                      # spatial hash of road segments: (street index, segment index)
    def add_hash(si):
        p = roads[si]["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]
            for i in range(int(min(a[0], b[0]) // HS), int(max(a[0], b[0]) // HS) + 1):
                for j in range(int(min(a[1], b[1]) // HS), int(max(a[1], b[1]) // HS) + 1): segs[(i, j)].append((si, k))
    for si in range(len(roads)):
        if not (roads[si]["bridge"] and roads[si]["layer"] > 0): add_hash(si)
    splits = defaultdict(list)                             # street index -> [(segment k, t, point)]
    def first_hit(a, b, skip):
        best = None
        for i in range(int(min(a[0], b[0]) // HS), int(max(a[0], b[0]) // HS) + 1):
            for j in range(int(min(a[1], b[1]) // HS), int(max(a[1], b[1]) // HS) + 1):
                for si, k in segs.get((i, j), ()):
                    if si in skip: continue
                    p = roads[si]["pts"]; h = seg_x(a, b, p[k - 1], p[k])
                    if h and (best is None or h[0] < best[0]): best = (h[0], si, k, h[1])
        return best

    name_i = 0
    def street(pts, cls, width, name):
        roads.append(dict(id=-(len(roads) + 1), cls=cls, name=name, oneway=0, bridge=False, tunnel=False, layer=0, width=width, pts=pts, gen=True))
        si = len(roads) - 1; add_hash(si)
        for k in range(1, len(pts)): mark_capsule(pts[k - 1], pts[k], width / 2 + 1, 2)
        return si

    sides = []                                              # per main road side: list of (along, street index, points)
    order = sorted([i for i, r in enumerate(roads) if r["cls"] in GROW_FROM and not r["bridge"]], key=lambda i: ["trunk", "primary", "secondary", "tertiary"].index(roads[i]["cls"]))
    def grow(order, min_len):
        nonlocal name_i
        for mi in order:
            m = roads[mi]; p = m["pts"]; L = length(p)
            if L < min_len: continue
            for side in (1, -1):
                row = []; s = rnd.uniform(40, 70)
                while s < L - 40:
                    # point and tangent at distance s along the main road
                    acc = 0
                    for k in range(1, len(p)):
                        seg = math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
                        if acc + seg >= s: t = (s - acc) / seg; break
                        acc += seg
                    a, b = p[k - 1], p[k]; ux, uz = (b[0] - a[0]) / seg, (b[1] - a[1]) / seg
                    ang = math.atan2(ux * side, -uz * side) + math.radians(rnd.uniform(-7, 7))     # left/right normal, slightly turned
                    dx, dz = math.cos(ang), math.sin(ang)
                    base = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; base = [round(base[0], 1), round(base[1], 1)]
                    pts = [base]; cur = base; ended = None; wall = False; lim = rnd.uniform(300, 600)
                    start_ok = not blocked(base[0] + dx * (m["width"] / 2 + 6), base[1] + dz * (m["width"] / 2 + 6), 1 | 2)
                    # leave room for a row of plots on both sides: no other street within 36 m alongside the first 70 m
                    for along in (12, 40, 70):
                        for lat in range(-36, 37, 4):
                            if start_ok and blocked(base[0] + dx * (m["width"] / 2 + along) - dz * lat, base[1] + dz * (m["width"] / 2 + along) + dx * lat, 2): start_ok = False
                    if start_ok:
                        steps = int(lim / 6)
                        for n in range(1, steps + 1):
                            nxt = [round(base[0] + dx * 6 * n, 1), round(base[1] + dz * 6 * n, 1)]
                            if not inside(*nxt) or blocked(nxt[0], nxt[1], 1): wall = True; break      # ends at the railway, a lake, a park or the city edge
                            h = first_hit(cur, nxt, {mi})
                            if h and h[0] > 1e-6:
                                hp = lerp(cur, nxt, h[0]); ended = (h[1], h[2], h[3], hp); pts.append(hp); break
                            cur = nxt
                        if not ended: pts.append(cur)                  # straight street: start and end only (junctions are inserted later)
                        if length(pts) >= 50:
                            splits[mi].append((k, t, base))
                            if ended: splits[ended[0]].append((ended[1], ended[2], ended[3]))
                            nm = f"{STREET_NAMES[name_i % len(STREET_NAMES)]} Street"; name_i += 1
                            si = street(pts, "residential", 7.0, nm); roads[si]["ends_at_road"] = bool(ended) or wall; row.append((s, si))
                    s += rnd.uniform(80, 120)
                sides.append(row)
    grow(order, 120)
    # second level: streets off long generated streets fill blocks that no main road reaches
    grow([i for i, r in enumerate(roads) if r.get("gen") and r.get("ends_at_road") and length(r["pts"]) >= 200], 200)

    # cross streets between neighbouring side streets, every ~85 m of depth
    def point_at(pts, d):
        acc = 0
        for k in range(1, len(pts)):
            seg = math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])
            if acc + seg >= d: return k, (d - acc) / seg, lerp(pts[k - 1], pts[k], (d - acc) / seg)
            acc += seg
        return None
    cross_n = 0
    for row in sides:
        for (s1, a), (s2, b) in zip(row, row[1:]):
            if s2 - s1 > 140: continue
            pa, pb = roads[a]["pts"], roads[b]["pts"]
            d = rnd.uniform(78, 92)
            while d < min(length(pa), length(pb)) - 25:
                A, B = point_at(pa, d), point_at(pb, d)
                if not A or not B: break
                ok = all(not blocked(A[2][0] + (B[2][0] - A[2][0]) * f, A[2][1] + (B[2][1] - A[2][1]) * f, 1) for f in (0.25, 0.5, 0.75))
                h = first_hit(A[2], B[2], {a, b})
                if ok and not h:
                    splits[a].append((A[0], A[1], A[2])); splits[b].append((B[0], B[1], B[2]))
                    roads[a].setdefault("cross_at", []).append(d); roads[b].setdefault("cross_at", []).append(d)
                    street([A[2], B[2]], "living_street", 5.5, f"{roads[a]['name'].replace(' Street', '')} Cross Street"); cross_n += 1
                d += rnd.uniform(78, 92)

    # cut back side streets that end without meeting a road: keep up to their last cross street (no dead ends)
    trimmed = 0
    for r in roads:
        if not r.get("gen") or r["cls"] != "residential" or r.get("ends_at_road"): continue
        last = max(r.get("cross_at", [0]))
        if last < 1: r["drop"] = True; trimmed += 1; continue
        r["trim_at"] = last; trimmed += 1      # cut after the junctions are inserted (below)

    # apply junction splits (insert the exact meeting points into both streets)
    for si, lst in splits.items():
        r = roads[si]
        if r.get("drop"): continue
        p = r["pts"]; ins = defaultdict(list)
        for k, t, pt in lst:
            if k < len(p): ins[k].append((t, [round(pt[0], 1), round(pt[1], 1)]))
        new = [p[0]]
        for k in range(1, len(p)):
            for t, pt in sorted(ins.get(k, [])):
                if pt != new[-1] and pt != p[k]: new.append(pt)
            if p[k] != new[-1]: new.append(p[k])
        r["pts"] = new
    for r in roads:
        if "trim_at" in r and not r.get("drop"):
            k, t, pnt = point_at(r["pts"], r["trim_at"]); r["pts"] = r["pts"][:k] + ([pnt] if pnt != r["pts"][k - 1] else [])
    roads = [r for r in roads if not r.get("drop") and len(r["pts"]) >= 2]
    for r in roads: r.pop("cross_at", None); r.pop("ends_at_road", None); r.pop("trim_at", None)
    # drop road pieces that are not connected to the main network (flyover decks are kept)
    nodes, edges, comp, sizes = build_graph(roads); big = sizes.index(max(sizes))
    linked = {e[3] for e in edges if comp[e[0]] == big}
    cut_off = sum(1 for i, r in enumerate(roads) if i not in linked and not r["bridge"])
    roads = [r for i, r in enumerate(roads) if i in linked or r["bridge"]]

    # rebuild the road raster with the final network (for buildings and street furniture)
    for k in range(len(grid)): grid[k] &= ~2 & 0xff
    for r in roads:   # flyover decks included: nothing is built under them
        for k in range(1, len(r["pts"])): mark_capsule(r["pts"][k - 1], r["pts"][k], r["width"] / 2 + 3.5, 2)   # road + footpath

    # ---- buildings: real ones that don't touch a road or park, then infill along every frontage ----
    out_b = []
    for b in blds:
        ring = b["pts"]
        if not all(inside_o(*q) for q in ring): continue
        if abs(sum(ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] for i in range(len(ring) - 1))) / 2 < REAL_MIN_AREA: continue
        cx, cz = sum(q[0] for q in ring) / len(ring), sum(q[1] for q in ring) / len(ring)
        if any(blocked(q[0], q[1], 1 | 2) for q in ring + [[cx, cz]]): continue
        mark_poly(ring, 4); out_b.append(b)
    real_kept = len(out_b); bid = 900000000
    def try_lot(cx, cz, ux, uz, w, d, h, kind):
        nonlocal bid
        lx, lz = -uz, ux
        ring = [[cx + ux * w / 2 + lx * d / 2, cz + uz * w / 2 + lz * d / 2], [cx - ux * w / 2 + lx * d / 2, cz - uz * w / 2 + lz * d / 2],
                [cx - ux * w / 2 - lx * d / 2, cz - uz * w / 2 - lz * d / 2], [cx + ux * w / 2 - lx * d / 2, cz + uz * w / 2 - lz * d / 2]]
        for f1 in (0.1, 0.5, 0.9):
            for f2 in (0.1, 0.5, 0.9):
                x = ring[0][0] + (ring[1][0] - ring[0][0]) * f1 + (ring[3][0] - ring[0][0]) * f2
                z = ring[0][1] + (ring[1][1] - ring[0][1]) * f1 + (ring[3][1] - ring[0][1]) * f2
                if blocked(x, z, 1 | 2 | 4): return False
        ring = [[round(q[0], 2), round(q[1], 2)] for q in ring]; ring.append(ring[0]); mark_poly(ring, 4); bid += 1
        out_b.append(dict(id=bid, kind=kind, name=None, h=h, pts=ring, gen=True)); return True
    infill = 0
    for r in roads:
        if r["bridge"] and r["layer"] > 0: continue
        main = r["cls"] in MAIN; p = r["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]; L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < 8: continue
            ux, uz = (b[0] - a[0]) / L, (b[1] - a[1]) / L
            for side in (1, -1):
                s = 4.0
                while s < L - 4:
                    w = rnd.uniform(10, 16) if (r["cls"] in MAIN) else rnd.uniform(8, 13)
                    if s + w > L - 4: break
                    mx, mz = a[0] + ux * (s + w / 2), a[1] + uz * (s + w / 2)
                    near = min(math.hypot(mx - c[0], mz - c[1]) for c in CENTRES)
                    commercial = main or near < 600
                    d = rnd.uniform(14, 20) if commercial else rnd.uniform(10, 15)
                    h = round(rnd.uniform(10, 22) if commercial else rnd.uniform(6, 11), 1) if near > 300 or not commercial else round(rnd.uniform(14, 30), 1)
                    off = r["width"] / 2 + 4.0 + d / 2
                    cx, cz = mx - uz * off * side, mz + ux * off * side
                    if try_lot(cx, cz, ux, uz, w, d, h, "commercial" if commercial else ("retail" if rnd.random() < 0.3 else "house")):   # retail: a corner shop on the ground floor
                        infill += 1
                        if rnd.random() < 0.65: try_lot(cx - uz * (d + 1.5) * side, cz + ux * (d + 1.5) * side, ux, uz, w, d, round(h * rnd.uniform(0.7, 1.1), 1), "house")
                        s += w + rnd.uniform(0.0, 1.2)
                    else: s += 3

    # ---- points of interest and landmarks inside the core ----
    pois = [p for p in load("pois")["pois"] if inside(p["x"], p["z"])]
    lms = load("landmarks")["landmarks"]
    for L in lms: L["in_pilot"] = bool(L.get("in_pilot")) and inside(L["x"], L["z"])

    nodes, edges, comp, sizes = build_graph(roads)

    w = lambda name, obj: json.dump(obj, open(os.path.join(OUT, name), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for r in roads: r.pop("gen", None)
    w("roads.json", {"meta": meta, "roads": roads, "signals": [s for s in src_roads["signals"] if inside(*s)]})
    for b in out_b:   # one winding for every outline (as most OpenStreetMap ones), so shop signs and facade textures read the right way round
        r = b["pts"]
        if sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1)) > 0: b["pts"] = r[::-1]
    w("buildings.json", {"meta": meta, "buildings": out_b})
    w("water.json", {"meta": meta, "water": W, "waterways": WW}); w("landuse.json", {"meta": meta, "landuse": LU})
    w("rail.json", {"meta": meta, "rail": RL, "stations": [s for s in rail["stations"] if inside(*s["p"])], "crossings": [c for c in rail["crossings"] if inside(*c)]})
    w("paths.json", {"meta": meta, "paths": []}); w("pois.json", {"meta": meta, "pois": pois}); w("landmarks.json", {"meta": meta, "landmarks": lms})
    w("graph.json", {"meta": meta, "nodes": nodes, "edges": edges, "edge_fields": ["from", "to", "length_m", "road_index", "pt_from", "pt_to"]})
    w("meta.json", meta)
    # backdrop beyond the map edge: real buildings in a 700 m band around the city as plain boxes (centre, size, angle, height), and the lakes there
    BAND = (OUTER[0] - 700, OUTER[1] - 700, OUTER[2] + 700, OUTER[3] + 700); boxes = []
    for b in blds:
        ring = b["pts"][:-1]; cx, cz = sum(q[0] for q in ring) / len(ring), sum(q[1] for q in ring) / len(ring)
        if inside_o(cx, cz) or not (BAND[0] < cx < BAND[2] and BAND[1] < cz < BAND[3]): continue
        e = max(range(len(ring)), key=lambda k: math.hypot(ring[k][0] - ring[k - 1][0], ring[k][1] - ring[k - 1][1]))
        ang = math.atan2(ring[e][1] - ring[e - 1][1], ring[e][0] - ring[e - 1][0]); ux, uz = math.cos(ang), math.sin(ang)
        us = [(q[0] - cx) * ux + (q[1] - cz) * uz for q in ring]; vs = [-(q[0] - cx) * uz + (q[1] - cz) * ux for q in ring]
        mu, mv = (max(us) + min(us)) / 2, (max(vs) + min(vs)) / 2
        boxes.append([round(cx + mu * ux - mv * uz, 1), round(cz + mu * uz + mv * ux, 1), round(max(us) - min(us), 1), round(max(vs) - min(vs), 1), round(ang, 3), round(b.get("h") or rnd.uniform(6, 14), 1)])
    lakes = [dict(id=x["id"], pts=clip_poly(x["pts"], BAND)) for x in water["water"]]
    w("backdrop.json", {"meta": meta, "fields": ["x", "z", "w", "d", "angle", "h"], "boxes": boxes, "water": [l for l in lakes if l["pts"]]})
    gen = sum(1 for r in roads if r["id"] < 0); km = sum(length(r["pts"]) for r in roads) / 1000
    print(f"core {RECT}: roads {len(roads)} ({gen} generated, {km:.0f} km), buildings {len(out_b)} ({real_kept} real, {len(out_b) - real_kept} generated), "
          f"cross streets {cross_n}, side streets cut back {trimmed}, unconnected pieces dropped {cut_off}; graph {len(nodes)} nodes, {len(edges)} edges, {len(sizes)} pieces, largest {100 * max(sizes) / len(nodes):.1f}%")


if __name__ == "__main__":
    main()
