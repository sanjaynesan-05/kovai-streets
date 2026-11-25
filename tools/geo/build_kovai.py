"""Kovai Streets rebuild, step R1: the fictional city from the concept map (REBUILD_SPEC.md).

Designed main network (ring road, radial roads, inner loop around Central Kovai, outer highway, lake road, hill road,
one flyover over the railway), the railway with Kovai Central station, Silver Lake, Silver Hill forest and quarry,
the stadium, parks and farmland. Inside the ring each district grows its own streets and buildings (street spacing,
angle jitter, lot sizes, heights and shop share differ by district). Landmarks with their own models, trees.

Writes geodata/processed/kovai/{roads,buildings,water,landuse,rail,paths,pois,landmarks,trees,graph,meta,backdrop}.json
in the same format as the earlier datasets, then:  KS_DATASET=kovai python tools/geo/chunk_pilot.py
Deterministic (fixed seed). Run:  python tools/geo/build_kovai.py
"""
import json, math, os, random, sys
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_city import clip_line, clip_poly, seg_x, length, lerp, build_graph   # shared geometry helpers

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "geodata", "processed", "kovai")
RECT = (-2700, -2400, 2700, 2100)            # whole map, farmland included (game metres, +x east, -z north)
CELL = 2.0
rnd = random.Random(20261126)

# ---------------- design (REBUILD_SPEC.md section 1) ----------------
DISTRICTS = {   # centre, look
    "central": dict(name="Central Kovai", c=(200, -320)),
    "old": dict(name="Old Kovai", c=(1140, -410)),
    "campus": dict(name="Campus Nagar", c=(-800, -780)),
    "mill": dict(name="Mill Estate", c=(-1410, 90)),
    "east": dict(name="East Junction", c=(1570, 170)),
    "hill": dict(name="Hillcrest", c=(450, -1150)),
    "lake": dict(name="Lakeview", c=(450, 1200)),
    "green": dict(name="Greenfield", c=(1810, 980)),
}
# street gap along the parent road, cross-street spacing, angle jitter (deg), street width, lot width, lot depth, height,
# share of shopfronts, the district's building kind, chance a plot is built at all, chance of a second row
STYLE = {
    "central": dict(gap=(60, 80), cross=(55, 70), jit=3, w=7.0, lot=(10, 16), dep=(14, 22), h=(14, 32), shop=0.9, kind="commercial", fill=1.0, row2=0.85),
    "old": dict(gap=(34, 46), cross=(30, 42), jit=5, w=5.0, lot=(5, 9), dep=(8, 11), h=(6, 11), shop=0.8, kind="house", fill=1.0, row2=0.95),   # narrow lanes, small shophouses
    "campus": dict(gap=(90, 120), cross=(80, 100), jit=4, w=7.0, lot=(14, 22), dep=(14, 20), h=(9, 16), shop=0.25, kind="apartments", fill=0.8, row2=0.5),
    "mill": dict(gap=(120, 160), cross=(100, 130), jit=2, w=9.0, lot=(28, 46), dep=(22, 34), h=(8, 13), shop=0.08, kind="industrial", fill=0.9, row2=0.6),
    "east": dict(gap=(85, 115), cross=(75, 95), jit=4, w=8.0, lot=(12, 22), dep=(14, 24), h=(9, 18), shop=0.55, kind="commercial", fill=0.95, row2=0.6),
    "hill": dict(gap=(85, 115), cross=(80, 100), jit=6, w=6.5, lot=(12, 18), dep=(12, 18), h=(6, 10), shop=0.05, kind="house", fill=0.85, row2=0.45),
    "lake": dict(gap=(75, 100), cross=(70, 90), jit=3, w=7.0, lot=(11, 15), dep=(12, 17), h=(10, 24), shop=0.35, kind="apartments", fill=0.95, row2=0.7),
    "green": dict(gap=(140, 190), cross=(120, 160), jit=3, w=7.0, lot=(16, 32), dep=(16, 30), h=(6, 10), shop=0.1, kind="warehouse", fill=0.5, row2=0.3),
}
RING = [(-2000, 0), (-1880, -700), (-1500, -1300), (-750, -1470), (0, -1440), (850, -1420), (1650, -1260), (1990, -650), (2060, 0),
        (1960, 720), (1700, 1340), (850, 1520), (0, 1520), (-850, 1430), (-1580, 1180), (-1900, 600)]
INNER = [(-280, -330), (-180, -700), (250, -820), (700, -690), (820, -320), (720, -200), (250, -205), (-160, -200)]   # south side runs just north of the Kovai Central precinct
RAIL = [(-2700, -498), (2700, 458)]          # straight, through Kovai Central
STATION = (200, 15)   # on the line
LAKE = dict(c=(400, 860), r=(600, 230))
HILL = dict(c=(120, -1830), r=(720, 400))   # Silver Hill forest
VIEWPOINT = (100, -1760)
# Silver Hill height (R2) lives in js/core.js (HILL, groundH): about 55 m at the viewpoint, zero at the ring road and over the quarry floor
QUARRY = dict(c=(-420, -1760), r=(170, 115))
STADIUM = dict(c=(-830, 540), r=(150, 115))


def spline(ctrl, closed=False, step=22.0):
    """Catmull-Rom through the control points, sampled about every step metres."""
    P = [list(map(float, p)) for p in ctrl]; n = len(P); out = []
    segs = n if closed else n - 1
    for i in range(segs):
        p0, p1, p2, p3 = P[(i - 1) % n] if closed or i > 0 else P[0], P[i], P[(i + 1) % n], P[(i + 2) % n] if closed or i + 2 < n else P[-1]
        k = max(1, int(math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step))
        for s in range(k):
            t = s / k; t2, t3 = t * t, t * t * t
            out.append([round(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3), 1) for j in (0, 1)])
    out.append(out[0][:] if closed else [round(P[-1][0], 1), round(P[-1][1], 1)])
    return out


def blob(c, r, n=48, amp=0.1, seed=0):
    g = random.Random(seed); ph = [g.uniform(0, 6.28) for _ in range(4)]; out = []
    for i in range(n):
        a = i / n * 2 * math.pi; f = 1 + amp * (math.sin(2 * a + ph[0]) * 0.6 + math.sin(3 * a + ph[1]) * 0.3 + math.sin(5 * a + ph[2]) * 0.15)
        out.append([round(c[0] + math.cos(a) * r[0] * f, 1), round(c[1] + math.sin(a) * r[1] * f, 1)])
    return out + [out[0]]


def inside_poly(x, z, ring):
    ins = False
    for i in range(len(ring) - 1):
        a, b = ring[i], ring[i + 1]
        if (a[1] > z) != (b[1] > z) and x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]: ins = not ins
    return ins


def seg_dist(p, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]; L = dx * dx + dz * dz
    t = 0 if not L else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L))
    return math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t)


# ---------------- occupancy raster: 1 = keep open (water, park, forest, landmark plot...), 2 = road, 4 = building ----------------
NX, NZ = int((RECT[2] - RECT[0]) / CELL) + 1, int((RECT[3] - RECT[1]) / CELL) + 1
grid = bytearray(NX * NZ)
def gi(x, z):
    i, j = int((x - RECT[0]) / CELL), int((z - RECT[1]) / CELL)
    return j * NX + i if 0 <= i < NX and 0 <= j < NZ else -1
def blocked(x, z, bits):
    k = gi(x, z); return k < 0 or grid[k] & bits
def mark_poly(ring, bit):
    zs = [q[1] for q in ring]
    for j in range(max(0, int((min(zs) - RECT[1]) / CELL)), min(NZ, int((max(zs) - RECT[1]) / CELL) + 1)):
        z = RECT[1] + (j + 0.5) * CELL; xs = []
        for k in range(len(ring) - 1):
            a, b = ring[k], ring[k + 1]
            if (a[1] <= z) != (b[1] <= z): xs.append(a[0] + (z - a[1]) / (b[1] - a[1]) * (b[0] - a[0]))
        xs.sort()
        for k in range(0, len(xs) - 1, 2):
            for i in range(max(0, int((xs[k] - RECT[0]) / CELL)), min(NX, int((xs[k + 1] - RECT[0]) / CELL) + 1)): grid[j * NX + i] |= bit
def mark_capsule(a, b, rad, bit):
    x0, x1, z0, z1 = min(a[0], b[0]) - rad, max(a[0], b[0]) + rad, min(a[1], b[1]) - rad, max(a[1], b[1]) + rad
    dx, dz = b[0] - a[0], b[1] - a[1]; L = dx * dx + dz * dz or 1
    for j in range(max(0, int((z0 - RECT[1]) / CELL)), min(NZ, int((z1 - RECT[1]) / CELL) + 1)):
        z = RECT[1] + (j + 0.5) * CELL
        for i in range(max(0, int((x0 - RECT[0]) / CELL)), min(NX, int((x1 - RECT[0]) / CELL) + 1)):
            x = RECT[0] + (i + 0.5) * CELL; t = max(0, min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L))
            if math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) <= rad: grid[j * NX + i] |= bit
def mark_rect(cx, cz, w, d, ang, bit):
    ux, uz = math.cos(ang), math.sin(ang)
    ring = [[cx + ux * sx * w / 2 - uz * sz * d / 2, cz + uz * sx * w / 2 + ux * sz * d / 2] for sx, sz in ((1, 1), (-1, 1), (-1, -1), (1, -1))]
    mark_poly(ring + [ring[0]], bit); return ring + [ring[0]]


def node_roads(roads):
    """Insert a shared point wherever two ground roads cross, so they form junctions."""
    HS = 50; cells = defaultdict(list)
    for ri, r in enumerate(roads):
        if r["layer"]: continue
        p = r["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]
            for i in range(int(min(a[0], b[0]) // HS), int(max(a[0], b[0]) // HS) + 1):
                for j in range(int(min(a[1], b[1]) // HS), int(max(a[1], b[1]) // HS) + 1): cells[(i, j)].append((ri, k))
    ins = defaultdict(list); seen = set()
    for lst in cells.values():
        for x in range(len(lst)):
            for y in range(x + 1, len(lst)):
                (r1, k1), (r2, k2) = lst[x], lst[y]
                if r1 == r2 or (r1, k1, r2, k2) in seen: continue
                seen.add((r1, k1, r2, k2))
                a, b, c, d = roads[r1]["pts"][k1 - 1], roads[r1]["pts"][k1], roads[r2]["pts"][k2 - 1], roads[r2]["pts"][k2]
                den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
                if abs(den) < 1e-9: continue
                t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den
                u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den
                if not (0 <= t <= 1 and 0 <= u <= 1): continue
                pt = [round(a[0] + (b[0] - a[0]) * t, 1), round(a[1] + (b[1] - a[1]) * t, 1)]
                ins[r1].append((k1, t, pt)); ins[r2].append((k2, u, pt))
    for ri, lst in ins.items():
        p = roads[ri]["pts"]; by = defaultdict(list)
        for k, t, pt in lst: by[k].append((t, pt))
        new = [p[0]]
        for k in range(1, len(p)):
            for t, pt in sorted(by.get(k, [])):
                if pt != new[-1] and pt != p[k]: new.append(pt)
            if p[k] != new[-1]: new.append(p[k])
        roads[ri]["pts"] = new


def trim_stubs(roads, keep_edge):
    """Cut the short loose ends left where a designed road runs a little past the road it meets."""
    key = lambda q: (round(q[0], 1), round(q[1], 1))
    use = defaultdict(int)
    for r in roads:
        if r["layer"]: continue
        for q in r["pts"]: use[key(q)] += 1
    for r in roads:
        if r["layer"] or r.get("closed"): continue
        p = r["pts"]; js = [i for i, q in enumerate(p) if use[key(q)] > 1]
        if not js: continue
        a, b = js[0], js[-1]
        if a > 0 and length(p[:a + 1]) < 60 and not keep_edge(p[0]): p = p[a:]; b -= a
        if b < len(p) - 1 and length(p[b:]) < 60 and not keep_edge(p[-1]): p = p[:b + 1]
        r["pts"] = p


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = {"units": "metres, +x east, -z north", "origin": "city centre, just north of Kovai Central station",
            "note": "Fictional city of Kovai Streets (REBUILD_SPEC.md): designed main roads, generated district streets and buildings.", "rect": list(RECT)}
    on_edge = lambda q: q[0] <= RECT[0] + 1 or q[0] >= RECT[2] - 1 or q[1] <= RECT[1] + 1 or q[1] >= RECT[3] - 1
    rid = [0]
    def road(pts, cls, width, name, oneway=0, bridge=False, layer=0, closed=False):
        rid[0] += 1; return dict(id=rid[0], cls=cls, name=name, oneway=oneway, bridge=bridge, tunnel=False, layer=layer, width=width, pts=pts, closed=closed)

    # ---- designed main roads ----
    ring = spline(RING, closed=True)
    roads = [road(ring, "trunk", 16, "Kovai Ring Road", closed=True), road(spline(INNER, closed=True, step=18), "secondary", 10, "Temple Loop", closed=True)]
    def ext(p, m=40.0):
        (ax_, az_), (bx_, bz_) = p[1], p[0]; l = math.hypot(bx_ - ax_, bz_ - az_) or 1; s0 = [round(bx_ + (bx_ - ax_) / l * m, 1), round(bz_ + (bz_ - az_) / l * m, 1)]
        (ax_, az_), (bx_, bz_) = p[-2], p[-1]; l = math.hypot(bx_ - ax_, bz_ - az_) or 1; s1 = [round(bx_ + (bx_ - ax_) / l * m, 1), round(bz_ + (bz_ - az_) / l * m, 1)]
        clampq = lambda q: [min(max(q[0], RECT[0]), RECT[2]), min(max(q[1], RECT[1]), RECT[3])]
        return [clampq(s0)] + p + [clampq(s1)]
    def R(pts, cls, w, name, extend=True, step=22.0): roads.append(road(ext(spline(pts, step=step)) if extend else spline(pts, step=step), cls, w, name))
    R([(-190, -690), (-500, -760), (-800, -790), (-1150, -1000), (-1520, -1320)], "primary", 12, "Campus Road")
    R([(-290, -260), (-800, -120), (-1410, 60), (-2010, 20), (-2700, 120)], "primary", 12, "Mill Road")
    R([(-170, -200), (-420, 260), (-830, 380), (-1250, 820), (-1600, 1200), (-2200, 1700), (-2700, 1900)], "primary", 12, "Stadium Road")
    R([(820, -330), (1140, -400), (1450, -100), (1570, 160), (2070, 10), (2700, 160)], "primary", 12, "East Junction Road")
    R([(700, -680), (1100, -950), (1660, -1280), (2200, -1700), (2700, -1950)], "primary", 12, "Old Kovai Road")
    R([(720, -200), (1050, 400), (1250, 760), (1810, 980), (1720, 1350), (1900, 1900), (2000, 2100)], "primary", 12, "Greenfield Road")
    R([(-60, -200), (-60, 420), (-320, 700), (-150, 1150), (0, 1530), (0, 2100)], "primary", 12, "Lake Road")
    R([(-2700, 1050), (-2200, 1720), (-800, 1960), (800, 1960), (2200, 1720), (2700, 1050)], "trunk", 14, "Outer Highway")
    R([(-480, 1020), (-120, 1180), (400, 1200), (900, 1170), (1260, 980), (1300, 700)], "tertiary", 9, "Lakeview Promenade")
    R([(1450, -100), (1700, -500), (2010, -640)], "secondary", 10, "Market Road")
    R([(-800, -790), (-700, -300), (-420, 255)], "secondary", 10, "College Road")
    R([(1140, -400), (1000, -150), (720, -200)], "secondary", 10, "Church Street")
    R([(250, -830), (300, -1150), (320, -1470), (440, -1540), (200, -1600), (380, -1680), (150, -1730), VIEWPOINT], "secondary", 9, "Silver Hill Road", step=8.0)   # dense points: it follows the hill (R2)
    R([(440, -1540), (40, -1590), (-250, -1690), (-420, -1760)], "tertiary", 7, "Quarry Road", step=8.0)
    # Central avenue: crosses the railway on a flyover (layer 1, ramps at both ends; it joins the ground roads at its ends like a real flyover)
    R([(620, -690), (630, -360), (640, -160)], "secondary", 12, "Station Avenue", extend=False)
    roads.append(road(spline([(640, -160), (650, 90), (660, 330)]), "secondary", 12, "Station Flyover", bridge=True, layer=1))
    R([(660, 330), (700, 520), (1000, 560), (1250, 760)], "secondary", 12, "Station Avenue", extend=False)
    node_roads(roads); trim_stubs(roads, on_edge)
    designed = len(roads)

    # ---- water, land use, rail ----
    lake = blob(LAKE["c"], LAKE["r"], amp=0.12, seed=3)
    W = [dict(id=1, name="Silver Lake", kind="lake", pts=lake, area=0)]
    ponds = [(-2350, -900), (-2300, 1300), (2350, -1500), (2400, 1300), (1300, 1800), (-1300, 1750), (-2000, -1700)]
    for i, c in enumerate(ponds): W.append(dict(id=2 + i, name=None, kind="pond", pts=blob(c, (rnd.uniform(40, 80), rnd.uniform(30, 60)), 24, 0.15, 10 + i), area=0))
    LU = []; lid = [0]
    def lu(kind, pts, name=None): lid[0] += 1; LU.append(dict(id=lid[0], kind=kind, name=name, pts=pts, area=0)); return pts
    forest = lu("forest", blob(HILL["c"], HILL["r"], amp=0.14, seed=5), "Silver Hill")
    quarry = lu("quarry", blob(QUARRY["c"], QUARRY["r"], 28, 0.12, 6), "Silver Hill quarry")
    stadium = lu("stadium", blob(STADIUM["c"], STADIUM["r"], 36, 0.02, 7), "Kovai Municipal Cricket Stadium")
    lu("pitch", blob(STADIUM["c"], (72, 60), 28, 0.0, 8))
    lu("pitch", blob((-480, -590), (70, 48), 24, 0.0, 9), "College ground")
    parks = [lu("park", blob((80, -470), (90, 70), 28, 0.12, 11), "Town Hall Park"), lu("park", blob((450, 1080), (260, 45), 28, 0.08, 12), "Lakeside Park"),
             lu("park", blob((1150, -560), (55, 45), 20, 0.1, 13), "Church Green"), lu("park", blob((-1050, 1000), (90, 70), 24, 0.12, 14))]
    plaza = lu("marketplace", blob((180, -262), (55, 36), 20, 0.0, 15), "Town Hall Square")
    lu("marketplace", blob((1230, -300), (45, 30), 16, 0.0, 16), "Old Kovai market")
    terminus = lu("bus_station", [[1595, 140], [1765, 140], [1765, 230], [1595, 230], [1595, 140]], "East Junction bus terminus")
    RL = []; rail_corr = []
    (ax, az), (bx, bz) = RAIL; L = math.hypot(bx - ax, bz - az); nx, nz = -(bz - az) / L, (bx - ax) / L
    for k, off in enumerate((-2.2, 2.2)): RL.append(dict(id=k + 1, kind="rail", service=None, bridge=False, pts=[[round(ax + nx * off, 1), round(az + nz * off, 1)], [round(bx + nx * off, 1), round(bz + nz * off, 1)]]))
    rail_corr = [[ax + nx * 14, az + nz * 14], [bx + nx * 14, bz + nz * 14], [bx - nx * 14, bz - nz * 14], [ax - nx * 14, az - nz * 14], [ax + nx * 14, az + nz * 14]]
    lu("railway", [[round(q[0], 1), round(q[1], 1)] for q in rail_corr])
    ring_poly = [q for q in ring]
    in_city = lambda x, z: inside_poly(x, z, ring_poly)

    # ---- landmarks with their own models (drawn by js/geolandmarks.js); their plots stay clear ----
    LM = []
    def lm(id_, name, cat, model, x, z, w, d, ang=0.0, h=0):
        mark_rect(x, z, w + 8, d + 8, ang, 1); LM.append(dict(id=id_, name=name, category=cat, model=model, x=x, z=z, w=w, d=d, angle=round(ang, 3), h=h, in_pilot=True))
    lm("gopuram", "Kovai Temple", "landmark", "gopuram", 200, -620, 46, 46)
    lm("church", "Old Kovai Church", "landmark", "church", 1140, -640, 26, 44)
    lm("mosque", "East Mosque", "landmark", "mosque", 1760, -420, 34, 34)
    ra = math.atan2(bz - az, bx - ax); rz_at = lambda x: az + (x - ax) * (bz - az) / (bx - ax)
    precinct = [[0, -205], [400, -205], [400, round(rz_at(400) + 32, 1)], [0, round(rz_at(0) + 32, 1)], [0, -205]]
    mark_poly(precinct, 1)
    LM.append(dict(id="station", name="Kovai Central", category="transport", model="station", x=STATION[0], z=round(rz_at(STATION[0]), 1), w=380, d=0, angle=round(ra, 4), h=0, in_pilot=True))
    lu("station_plaza", [[15, -198], [385, -198], [385, round(rz_at(385) - 50, 1)], [15, round(rz_at(15) - 50, 1)], [15, -198]], "Kovai Central forecourt")
    ux_, uz_ = math.cos(ra), math.sin(ra); nx_, nz_ = -uz_, ux_
    SP = lambda u, v: [round(STATION[0] + ux_ * u + nx_ * v, 1), round(rz_at(STATION[0]) + uz_ * u + nz_ * v, 1)]
    for k, v in enumerate((-14, 14)):   # platform loop lines, joining the main lines beyond the platforms
        RL.append(dict(id=10 + k, kind="rail", service="siding", bridge=False, pts=[SP(-235, v / abs(v) * 2.2), SP(-175, v), SP(175, v), SP(235, v / abs(v) * 2.2)]))
    lm("terminus", "East Junction bus terminus", "transport", "terminus", 1680, 185, 170, 90)
    lm("stadium", "Kovai Municipal Cricket Stadium", "sports", "stadium", STADIUM["c"][0], STADIUM["c"][1], STADIUM["r"][0] * 2, STADIUM["r"][1] * 2)
    lm("viewpoint", "Silver Hill Viewpoint", "viewpoint", "viewpoint", VIEWPOINT[0], VIEWPOINT[1] - 22, 18, 18)
    for i, (x, z) in enumerate([(-1530, -40), (-1330, 260), (-1600, 230), (-1200, -60)]): lm(f"chimney_{i}", "Mill chimney", "industry", "chimney", x, z, 5, 5, h=38 + i * 3)
    lm("town_hall", "Town Hall", "civic", "townhall", 180, -330, 40, 26)
    # named buildings drawn with the normal building look (mission places)
    named = [("Devarajan Tower", "office", 420, -300, 30, 30, 62), ("Royal Grand Hotel", "hotel", -40, -300, 46, 26, 36),
             ("Government Hospital", "hospital", -430, -430, 60, 34, 16), ("Old Kovai Hospital", "hospital", 930, -90, 44, 30, 14),
             ("Mill Estate Police Station", "civic", -1460, -140, 34, 22, 10),
             ("Fire Station", "civic", -40, -600, 30, 22, 9), ("Kovai Arts College", "college", -820, -700, 80, 26, 18), ("Communications Facility", "industrial", 1880, 330, 50, 34, 12),
             ]
    nb = []; bid = [0]
    def bld(pts, kind, h, name=None):
        bid[0] += 1; b = dict(id=bid[0], kind=kind, name=name, h=round(h, 1), pts=[[round(q[0], 2), round(q[1], 2)] for q in pts]); nb.append(b); return b
    for name, kind, x, z, w, d, h in named:
        bld(mark_rect(x, z, w, d, 0, 4), kind, h, name); mark_rect(x, z, w + 8, d + 8, 0, 1 | 4)   # plot kept clear of streets and other buildings

    # ---- raster: open land and main roads ----
    for w in W: mark_poly(w["pts"], 1)
    for u in LU:
        if u["kind"] != "farmland": mark_poly(u["pts"], 1)
    for x in RL: mark_capsule(x["pts"][0], x["pts"][1], 9, 1)
    for r in roads:
        if r["layer"]: continue
        for k in range(1, len(r["pts"])): mark_capsule(r["pts"][k - 1], r["pts"][k], r["width"] / 2 + 1, 2)

    def district(x, z):
        return min(DISTRICTS, key=lambda k: math.hypot(x - DISTRICTS[k]["c"][0], z - DISTRICTS[k]["c"][1]))

    # ---- district streets (same growth method as build_city.py, with each district's style) ----
    HS = 40; segs = defaultdict(list)
    def add_hash(si):
        p = roads[si]["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]
            for i in range(int(min(a[0], b[0]) // HS), int(max(a[0], b[0]) // HS) + 1):
                for j in range(int(min(a[1], b[1]) // HS), int(max(a[1], b[1]) // HS) + 1): segs[(i, j)].append((si, k))
    for si in range(len(roads)):
        if not roads[si]["layer"]: add_hash(si)
    def first_hit(a, b, skip):
        best = None
        for i in range(int(min(a[0], b[0]) // HS), int(max(a[0], b[0]) // HS) + 1):
            for j in range(int(min(a[1], b[1]) // HS), int(max(a[1], b[1]) // HS) + 1):
                for si, k in segs.get((i, j), ()):
                    if si in skip: continue
                    p = roads[si]["pts"]; h = seg_x(a, b, p[k - 1], p[k])
                    if h and (best is None or h[0] < best[0]): best = (h[0], si, k, h[1])
        return best
    splits = defaultdict(list)
    NAMES = ["Bharathiyar", "Kamaraj", "Periyar", "Vivekanandar", "Thiruvalluvar", "Avvaiyar", "Kambar", "Ilango", "Rajaji", "Sathyamurthy", "Chinnaswamy",
             "Mariamman Koil", "Perumal Koil", "Nehru", "Anna", "Bharathi", "Kumaran", "Pudhu", "Thiru Vi Ka", "Sivan Koil", "Velan", "Selvam", "Arul", "Thendral"]
    name_i = [0]
    def street(pts, cls, width, name):
        roads.append(road(pts, cls, width, name)); si = len(roads) - 1; roads[si]["gen"] = True; add_hash(si)
        for k in range(1, len(pts)): mark_capsule(pts[k - 1], pts[k], width / 2 + 1, 2)
        return si
    def point_at(pts, d):
        acc = 0
        for k in range(1, len(pts)):
            seg = math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])
            if acc + seg >= d: return k, (d - acc) / seg, lerp(pts[k - 1], pts[k], (d - acc) / seg)
            acc += seg
        return None
    sides = []
    def grow(order, min_len):
        for mi in order:
            m = roads[mi]; p = m["pts"]; L = length(p)
            if L < min_len: continue
            for side in (1, -1):
                row = []; s = rnd.uniform(30, 60)
                while s < L - 30:
                    k, t, base = point_at(p, s); a, b = p[k - 1], p[k]; seg = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
                    st = STYLE[district(*base)]
                    ux, uz = (b[0] - a[0]) / seg, (b[1] - a[1]) / seg
                    ang = math.atan2(ux * side, -uz * side) + math.radians(rnd.uniform(-st["jit"], st["jit"]))
                    dx, dz = math.cos(ang), math.sin(ang); base = [round(base[0], 1), round(base[1], 1)]
                    off = m["width"] / 2
                    ok = in_city(base[0] + dx * (off + 8), base[1] + dz * (off + 8)) and not blocked(base[0] + dx * (off + 6), base[1] + dz * (off + 6), 1 | 2)
                    for along in (12, 35, 60):
                        for lat in range(-int(st["gap"][0] * 0.42), int(st["gap"][0] * 0.42) + 1, 4):
                            if ok and blocked(base[0] + dx * (off + along) - dz * lat, base[1] + dz * (off + along) + dx * lat, 2): ok = False
                    if ok:
                        pts = [base]; cur = base; ended = None; wall = False
                        for n in range(1, int(rnd.uniform(300, 600) / 6) + 1):
                            nxt = [round(base[0] + dx * 6 * n, 1), round(base[1] + dz * 6 * n, 1)]
                            if not in_city(*nxt) or blocked(nxt[0], nxt[1], 1): wall = True; break
                            h = first_hit(cur, nxt, {mi})
                            if h and h[0] > 1e-6:
                                hp = lerp(cur, nxt, h[0]); ended = (h[1], h[2], h[3], hp); pts.append(hp); break
                            cur = nxt
                        if not ended: pts.append(cur)
                        if length(pts) >= 50:
                            splits[mi].append((k, t, base))
                            if ended: splits[ended[0]].append((ended[1], ended[2], ended[3]))
                            si = street(pts, "residential", st["w"], f"{NAMES[name_i[0] % len(NAMES)]} Street"); name_i[0] += 1
                            roads[si]["ends"] = bool(ended) or wall; roads[si]["style"] = st; row.append((s, si))
                    s += rnd.uniform(*st["gap"])
                sides.append(row)
    grow([i for i, r in enumerate(roads) if r["cls"] in ("trunk", "primary", "secondary", "tertiary") and not r["layer"]], 120)
    grow([i for i, r in enumerate(roads) if r.get("gen") and r.get("ends") and length(r["pts"]) >= 180], 180)
    cross_n = 0
    for row in sides:
        for (s1, a), (s2, b) in zip(row, row[1:]):
            if s2 - s1 > 200: continue
            pa, pb = roads[a]["pts"], roads[b]["pts"]; st = roads[a]["style"]
            d = rnd.uniform(*st["cross"])
            while d < min(length(pa), length(pb)) - 20:
                A, B = point_at(pa, d), point_at(pb, d)
                if not A or not B: break
                ok = all(not blocked(A[2][0] + (B[2][0] - A[2][0]) * f, A[2][1] + (B[2][1] - A[2][1]) * f, 1) for f in (0.25, 0.5, 0.75))
                if ok and not first_hit(A[2], B[2], {a, b}):
                    splits[a].append((A[0], A[1], A[2])); splits[b].append((B[0], B[1], B[2]))
                    roads[a].setdefault("cross_at", []).append(d); roads[b].setdefault("cross_at", []).append(d)
                    si = street([A[2], B[2]], "living_street", max(5.0, st["w"] - 1.5), f"{roads[a]['name'].replace(' Street', '')} Cross Street"); roads[si]["style"] = st; cross_n += 1
                d += rnd.uniform(*st["cross"])
    for r in roads:
        if r.get("gen") and r["cls"] == "residential" and not r.get("ends"):
            last = max(r.get("cross_at", [0]))
            if last < 1: r["drop"] = True
            else: r["trim_at"] = last
    for si, lst in splits.items():
        r = roads[si]
        if r.get("drop"): continue
        p = r["pts"]; by = defaultdict(list)
        for k, t, pt in lst:
            if k < len(p): by[k].append((t, [round(pt[0], 1), round(pt[1], 1)]))
        new = [p[0]]
        for k in range(1, len(p)):
            for t, pt in sorted(by.get(k, [])):
                if pt != new[-1] and pt != p[k]: new.append(pt)
            if p[k] != new[-1]: new.append(p[k])
        r["pts"] = new
    for r in roads:
        if "trim_at" in r and not r.get("drop"):
            k, t, pnt = point_at(r["pts"], r["trim_at"]); r["pts"] = r["pts"][:k] + ([pnt] if pnt != r["pts"][k - 1] else [])
    roads = [r for r in roads if not r.get("drop") and len(r["pts"]) >= 2]
    nodes, edges, comp, sizes = build_graph(roads); big = sizes.index(max(sizes))
    linked = {e[3] for e in edges if comp[e[0]] == big}
    roads = [r for i, r in enumerate(roads) if i in linked or r["bridge"]]

    # ---- buildings along every frontage, in the district's style ----
    for k in range(len(grid)): grid[k] &= ~2 & 0xff
    for r in roads:
        for k in range(1, len(r["pts"])): mark_capsule(r["pts"][k - 1], r["pts"][k], r["width"] / 2 + 3.5, 2)
    def point_on(p, d):
        acc = 0
        for k in range(1, len(p)):
            seg = math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1])
            if acc + seg >= d and seg > 0: t = (d - acc) / seg; return p[k - 1][0] + (p[k][0] - p[k - 1][0]) * t, p[k - 1][1] + (p[k][1] - p[k - 1][1]) * t, (p[k][0] - p[k - 1][0]) / seg, (p[k][1] - p[k - 1][1]) / seg
            acc += seg
        return None
    fuel_n = 0
    for r in roads:
        if r["name"] not in ("Kovai Ring Road", "Outer Highway"): continue
        L = length(r["pts"]); n = 5 if r["name"] == "Kovai Ring Road" else 3
        for i in range(n):
            for tries in range(12):
                q = point_on(r["pts"], (i + 0.5) * L / n + tries * 37)
                if not q: break
                x, z, ux, uz = q; placed = False
                for side in (1, -1):
                    off = r["width"] / 2 + 16; cx, cz = x - uz * off * side, z + ux * off * side
                    if all(not blocked(cx + ux * a - uz * b, cz + uz * a + ux * b, 1 | 2 | 4) for a in (-14, 0, 14) for b in (-10, 0, 10)):
                        ang = math.atan2(uz, ux); lm(f"fuel_{fuel_n}", "Petrol bunk", "fuel", "fuel", round(cx, 1), round(cz, 1), 26, 18, ang); fuel_n += 1; placed = True; break
                if placed: break
    def try_lot(cx, cz, ux, uz, w, d, h, kind):
        lx, lz = -uz, ux
        ring_ = [[cx + ux * w / 2 + lx * d / 2, cz + uz * w / 2 + lz * d / 2], [cx - ux * w / 2 + lx * d / 2, cz - uz * w / 2 + lz * d / 2],
                 [cx - ux * w / 2 - lx * d / 2, cz - uz * w / 2 - lz * d / 2], [cx + ux * w / 2 - lx * d / 2, cz + uz * w / 2 - lz * d / 2]]
        n1, n2 = max(2, math.ceil(w / 4)), max(2, math.ceil(d / 4))   # check the plot every 4 m or closer, so no road corridor slips between the checks
        for f1 in [0.05 + 0.9 * i / n1 for i in range(n1 + 1)]:
            for f2 in [0.05 + 0.9 * j / n2 for j in range(n2 + 1)]:
                x = ring_[0][0] + (ring_[1][0] - ring_[0][0]) * f1 + (ring_[3][0] - ring_[0][0]) * f2
                z = ring_[0][1] + (ring_[1][1] - ring_[0][1]) * f1 + (ring_[3][1] - ring_[0][1]) * f2
                if blocked(x, z, 1 | 2 | 4): return False
        ring_.append(ring_[0]); mark_poly(ring_, 4); bld(ring_, kind, h); return True
    for r in roads:
        if r["layer"]: continue
        main = r["cls"] in ("trunk", "primary", "secondary"); p = r["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]; L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < 8: continue
            ux, uz = (b[0] - a[0]) / L, (b[1] - a[1]) / L
            for side in (1, -1):
                s = 4.0
                while s < L - 4:
                    mx, mz = a[0] + ux * s, a[1] + uz * s; city = in_city(mx, mz)
                    st = STYLE[district(mx, mz)] if city else None
                    if not city:   # farmland: an occasional farmhouse by the road
                        if rnd.random() < 0.04:
                            w, d = rnd.uniform(9, 14), rnd.uniform(8, 12); off = r["width"] / 2 + 8 + d / 2
                            try_lot(mx + w / 2 * ux - uz * off * side, mz + w / 2 * uz + ux * off * side, ux, uz, w, d, round(rnd.uniform(4.5, 7), 1), "house")
                        s += rnd.uniform(40, 90); continue
                    w = rnd.uniform(*st["lot"])
                    if s + w > L - 4: break
                    if rnd.random() > st["fill"]: s += w; continue
                    d = rnd.uniform(*st["dep"]); h = rnd.uniform(*st["h"]) * (1.25 if main and st["kind"] in ("commercial", "apartments") else 1)
                    kind = "commercial" if (rnd.random() < st["shop"] or (main and st["shop"] > 0.3)) else st["kind"]
                    off = r["width"] / 2 + 4.0 + d / 2; cx, cz = mx + ux * w / 2 - uz * off * side, mz + uz * w / 2 + ux * off * side
                    if try_lot(cx, cz, ux, uz, w, d, round(h, 1), kind):
                        if rnd.random() < st["row2"]: try_lot(cx - uz * (d + 1.5) * side, cz + ux * (d + 1.5) * side, ux, uz, w, d, round(h * rnd.uniform(0.7, 1.05), 1), st["kind"])
                        s += w + rnd.uniform(0.0, 1.5 if st["fill"] >= 0.9 else 6)
                    else: s += 3
    # R3: fill what is left inside the ring: every open plot gets a building, turned to the nearest street, so there is no empty land to cut across
    SC = defaultdict(list)
    for r in roads:
        if r["layer"]: continue
        p = r["pts"]
        for k in range(1, len(p)):
            a, b = p[k - 1], p[k]; L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < 1: continue
            for i in range(int(min(a[0], b[0]) // 60) - 1, int(max(a[0], b[0]) // 60) + 2):
                for j in range(int(min(a[1], b[1]) // 60) - 1, int(max(a[1], b[1]) // 60) + 2): SC[(i, j)].append((a, b, (b[0] - a[0]) / L, (b[1] - a[1]) / L))
    def street_dir(x, z):
        best, bd = (1.0, 0.0), 1e9
        for a, b, ux, uz in SC.get((int(x // 60), int(z // 60)), ()):
            d = seg_dist((x, z), a, b)
            if d < bd: bd, best = d, (ux, uz)
        return best
    filled = 0
    for gz in range(int(RECT[1]), int(RECT[3]), 8):
        for gx in range(int(RECT[0]), int(RECT[2]), 8):
            if not in_city(gx, gz) or blocked(gx, gz, 1 | 2 | 4): continue
            st = STYLE[district(gx, gz)]; ux, uz = street_dir(gx, gz)
            for f in (1.0, 0.7, 0.45):
                w, d = rnd.uniform(*st["lot"]) * f, rnd.uniform(*st["dep"]) * f
                if w < 4 or d < 4: break
                if try_lot(gx, gz, ux, uz, w, d, round(rnd.uniform(*st["h"]), 1), st["kind"]): filled += 1; break
    print("open plots filled:", filled)
    for b in nb:   # one winding for every outline, so facade textures and shop signs read the right way round
        q = b["pts"]
        if sum(q[i][0] * q[i + 1][1] - q[i + 1][0] * q[i][1] for i in range(len(q) - 1)) > 0: b["pts"] = q[::-1]

    # ---- farmland: field patches outside the ring ----
    gz = RECT[1]
    while gz < RECT[3]:   # rows of fields with uneven sizes; some plots left fallow
        fh = rnd.uniform(70, 150); gx = RECT[0] + rnd.uniform(-60, 0)
        while gx < RECT[2]:
            fw = rnd.uniform(80, 190); cx, cz = gx + fw / 2, gz + fh / 2
            if rnd.random() < 0.85 and not in_city(cx, cz) and not inside_poly(cx, cz, forest) and not blocked(cx, cz, 1):
                pts = [[gx + 5, gz + 5], [gx + fw - 5, gz + 5 + rnd.uniform(-6, 6)], [gx + fw - 5, gz + fh - 5], [gx + 5, gz + fh - 5 + rnd.uniform(-6, 6)]]
                if not any(blocked(q[0], q[1], 1 | 2 | 4) for q in pts):
                    lu(rnd.choice(["farmland", "farmland", "meadow", "orchard"]), [[round(q[0], 1), round(q[1], 1)] for q in pts] + [[round(pts[0][0], 1), round(pts[0][1], 1)]])
            gx += fw
        gz += fh

    # ---- trees: forest, parks, farm edges, gardens in Hillcrest and Lakeview ----
    trees = []
    def scatter(poly, gap, kind=0, avoid=1 | 2 | 4):
        xs, zs = [q[0] for q in poly], [q[1] for q in poly]
        x = min(xs)
        while x < max(xs):
            z = min(zs)
            while z < max(zs):
                px, pz = x + rnd.uniform(-gap * 0.4, gap * 0.4), z + rnd.uniform(-gap * 0.4, gap * 0.4)
                if poly is forest and math.hypot(px - VIEWPOINT[0], (pz - VIEWPOINT[1]) * 1.6) < 110 and pz > VIEWPOINT[1] - 30: z += gap; continue   # a clearing below the viewpoint: the city stays in view
                if inside_poly(px, pz, poly) and not blocked(px, pz, avoid & ~1 if poly is forest or poly in parks else avoid) and not inside_poly(px, pz, quarry):
                    trees.append([round(px, 1), round(pz, 1), kind])
                z += gap
            x += gap
    scatter(forest, 11)
    for p in parks: scatter(p, 14)
    for u in LU:
        if u["kind"] in ("farmland", "meadow", "orchard"):
            q = u["pts"]
            for k in range(4):
                a, b = q[k], q[k + 1]
                for f in range(0, 10):
                    if rnd.random() < 0.35: trees.append([round(a[0] + (b[0] - a[0]) * f / 10, 1), round(a[1] + (b[1] - a[1]) * f / 10, 1), 1 if rnd.random() < 0.4 else 0])
    for _ in range(9000):   # gardens and street corners in the leafy districts
        x, z = rnd.uniform(RECT[0], RECT[2]), rnd.uniform(RECT[1], RECT[3])
        if in_city(x, z) and district(x, z) in ("hill", "lake", "campus", "green") and not blocked(x, z, 1 | 2 | 4): trees.append([round(x, 1), round(z, 1), 0])

    # ---- points of interest and signals ----
    pois = [dict(kind="hospital", name=n, x=x + 0.0, z=z + 0.0) for n, k, x, z, *_ in named if k == "hospital"]
    pois += [dict(kind="police", name=n, x=x + 0.0, z=z + 0.0) for n, k, x, z, *_ in named if "Police" in n] + [dict(kind="police", name="East Junction Police Station", x=1400.0, z=-50.0)]   # the station itself is the police mission site
    pois += [dict(kind="bus_station", name="East Junction bus terminus", x=1680.0, z=185.0), dict(kind="fire", name="Fire Station", x=-40.0, z=-600.0)]
    pois += [dict(kind="fuel", name="Petrol bunk", x=L_["x"], z=L_["z"]) for L_ in LM if L_["model"] == "fuel"]
    for k, dd in DISTRICTS.items(): LM.append(dict(id="district_" + k, name=dd["name"], category="district", model=None, x=dd["c"][0], z=dd["c"][1], in_pilot=True))
    LM.append(dict(id="silver_lake", name="Silver Lake", category="landmark", model=None, x=LAKE["c"][0], z=LAKE["c"][1], in_pilot=True))
    nodes, edges, comp, sizes = build_graph(roads)
    des = defaultdict(set)
    for e in edges:
        if not roads[e[3]].get("gen"): des[e[0]].add(e[3])
    signals = [[nodes[i][0], nodes[i][1]] for i, s_ in des.items() if len(s_) >= 2 and nodes[i][2] == 0]
    crossings = []
    for r in roads:
        if r["layer"]: continue
        p = r["pts"]
        for k in range(1, len(p)):
            h = seg_x(p[k - 1], p[k], RAIL[0], RAIL[1])
            if h: crossings.append(lerp(p[k - 1], p[k], h[0]))

    w = lambda name, obj: json.dump(obj, open(os.path.join(OUT, name), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for r in roads:
        for k in ("gen", "ends", "style", "cross_at", "trim_at", "closed", "drop"): r.pop(k, None)
    w("roads.json", {"meta": meta, "roads": roads, "signals": signals})
    w("buildings.json", {"meta": meta, "buildings": nb})
    w("water.json", {"meta": meta, "water": W, "waterways": []}); w("landuse.json", {"meta": meta, "landuse": LU})
    w("rail.json", {"meta": meta, "rail": RL, "stations": [dict(p=list(STATION), name="Kovai Central")], "crossings": crossings})
    w("paths.json", {"meta": meta, "paths": []}); w("pois.json", {"meta": meta, "pois": pois}); w("landmarks.json", {"meta": meta, "landmarks": LM})
    w("trees.json", {"meta": meta, "fields": ["x", "z", "kind (0 broadleaf, 1 palm)"], "trees": trees})
    w("graph.json", {"meta": meta, "nodes": nodes, "edges": edges, "edge_fields": ["from", "to", "length_m", "road_index", "pt_from", "pt_to"]})
    w("backdrop.json", {"meta": meta, "boxes": [], "water": []}); w("meta.json", meta)
    print(f"roads {len(roads)} ({designed} designed, {sum(length(r['pts']) for r in roads) / 1000:.0f} km), cross streets {cross_n}, buildings {len(nb)}, "
          f"landuse {len(LU)}, trees {len(trees)}, landmarks {len(LM)}, signals {len(signals)}, rail crossings {len(crossings)}; "
          f"graph {len(nodes)} nodes, {len(edges)} edges, {len(sizes)} pieces, largest {100 * max(sizes) / len(nodes):.1f}%")


if __name__ == "__main__":
    main()
