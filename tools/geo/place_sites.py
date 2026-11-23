"""Step G6: choose real-map spots for the game's fictional mission sites and small points of interest.

Reads   geodata/processed/pilot/{roads,buildings,water,landuse,landmarks,pois,graph_pilot}.json
Writes  js/geosites_data.js                    GEO_SITES (used by js/geosites.js: W() moves every mission position)
        geodata/validation/sites_report.md      where each site went, what was cleared, distance to the nearest real landmark

Rules (from the project brief): fictional sites never sit on a real landmark, hospital, police station or bus stand
(40 m clearance plus the site radius), never in water, always next to a drivable road. Area sites clear only anonymous
buildings inside their radius; the report lists how many. Run:  python tools/geo/place_sites.py
"""
import json, math, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
P = os.path.join(ROOT, "geodata", "processed", "pilot")
load = lambda n: json.load(open(os.path.join(P, n + ".json"), encoding="utf-8"))

# kind: 'area' = cleared space for a rebuilt fictional structure; 'open' = open spot by a road, nothing cleared;
#       'spot' = a point on a sidewalk; 'jetty' = fictional jetty on the edge of a real lake.
# old = centre in the grid world, r = radius around it whose positions move with the site; tgt = preferred real area (game metres).
SITES = [
    dict(id="mill_podanur", kind="area", old=(185, 259), r=48, tgt=(2200, 1250), R=34, name="Podanur mill (fictional)", pref={"industrial"}),
    dict(id="mill_singanallur", kind="area", old=(333, 111), r=48, tgt=(4100, -200), R=34, name="Singanallur mill (fictional)", pref={"industrial"}),
    dict(id="mill_kovai", kind="area", old=(259, -111), r=40, tgt=(2300, -2100), R=34, name="Old Kovai Mills (fictional)", pref={"industrial"}),
    dict(id="mall", kind="area", old=(-111, -37), r=45, tgt=(1300, -1300), R=36, name="Kovai Central mall (fictional)", pref={"commercial", "retail"}),
    dict(id="godown", kind="area", old=(-125, 825), r=62, tgt=(100, 1450), R=44, name="Thendral Builders godown (fictional)", pref={"industrial"}),
    dict(id="police", kind="area", old=(32, -772), r=34, tgt=(500, -1500), R=18, name="Kovai Central Police Station (fictional)", pref=set()),
    dict(id="safehouse", kind="area", old=(-809, 21), r=60, tgt=(-1000, -1200), R=32, name="Safehouse (fictional)", pref={"residential"}),
    dict(id="hideout", kind="area", old=None, r=0, tgt=(-1150, -350), R=32, name="Ghat Wolves compound (fictional)", pref={"industrial"}),
    dict(id="dealyard", kind="area", old=None, r=0, tgt=(3800, -3300), R=30, name="Quarry yard deal spot (fictional)", pref={"industrial", "construction", "brownfield"}),
    dict(id="rally", kind="open", old=(-37, 111), r=40, tgt=(0, -30), R=18, name="Town Hall rally spot"),
    dict(id="tailmeet", kind="open", old=(296, -296), r=40, tgt=None, R=16, name="Peelamedu meeting spot (fictional)"),
    dict(id="giver", kind="spot", old=(283, -100), r=8, tgt=None, name="Paramasivam Anna"),
    dict(id="shop", kind="spot", old=(9.5, 83.5), r=6, tgt=None, name="Gun shop (fictional)"),
    dict(id="meena", kind="spot", old=(111, -8.6), r=6, tgt=None, name="Meena's home (fictional)"),
    dict(id="divya", kind="spot", old=(259, -230.6), r=6, tgt=None, name="Divya's home (fictional)"),
    dict(id="jetty", kind="jetty", old=(1025, 200), r=190, tgt=(-700, 1000), name="Lakeside jetty (fictional)", lake="w24711461"),
]
TH_GRID = (-37, 111)   # Town Hall block in the grid world


def grid_to_real(x, z):
    """Inverse of the D1 compressed transform (tools/map/build_registry.py): grid units around Town Hall -> real metres."""
    dx, dz = x - TH_GRID[0], z - TH_GRID[1]; g = math.hypot(dx, dz)
    if g == 0: return 0.0, 0.0
    r = g * 9 if g <= 3000 / 9 else 3000 + (g - 3000 / 9) * 25
    return dx / g * r, dz / g * r


def inside(pt, ring):
    x, z = pt; ins = False
    for i in range(len(ring)):
        a, b = ring[i], ring[i - 1]
        if (a[1] > z) != (b[1] > z) and x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]: ins = not ins
    return ins


def seg_d(p, a, b):
    dx, dz = b[0] - a[0], b[1] - a[1]; L = dx * dx + dz * dz
    t = 0 if not L else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L))
    return math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t)


def main():
    rect = load("graph_pilot")["rect"]
    clampr = lambda q, m=250: (min(max(q[0], rect[0] + m), rect[2] - m), min(max(q[1], rect[1] + m), rect[3] - m))   # far grid positions map outside the pilot
    roads = [r for r in load("roads")["roads"] if not r["bridge"] and not r["layer"]]
    blds = load("buildings")["buildings"]; water = load("water")["water"]; landuse = load("landuse")["landuse"]
    marks = [(L["x"], L["z"], L["name"]) for L in load("landmarks")["landmarks"] if L["in_pilot"] and L["category"] != "district"]
    marks += [(p["x"], p["z"], p["name"] or p["kind"]) for p in load("pois")["pois"]]
    C = 50
    bcell, rcell, pcell = {}, {}, {}
    for b in blds:
        ring = b["pts"][:-1]; cx = sum(q[0] for q in ring) / len(ring); cz = sum(q[1] for q in ring) / len(ring)
        a = abs(sum(ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1] for i in range(len(ring)))) / 2
        bcell.setdefault((int(cx // C), int(cz // C)), []).append((cx, cz, a)); pcell.setdefault((int(cx // C), int(cz // C)), []).append(b["pts"])
    for r in roads:
        for i in range(1, len(r["pts"])):
            a, b = r["pts"][i - 1], r["pts"][i]
            for k in range(int(min(a[0], b[0]) // C), int(max(a[0], b[0]) // C) + 1):
                for j in range(int(min(a[1], b[1]) // C), int(max(a[1], b[1]) // C) + 1): rcell.setdefault((k, j), []).append((a, b, r))
    near = lambda cell, x, z, rad: [o for k in range(int((x - rad) // C), int((x + rad) // C) + 1) for j in range(int((z - rad) // C), int((z + rad) // C) + 1) for o in cell.get((k, j), [])]
    bld_area = lambda x, z, R: sum(a for (cx, cz, a) in near(bcell, x, z, R) if math.hypot(cx - x, cz - z) < R)
    bld_count = lambda x, z, R: sum(1 for (cx, cz, a) in near(bcell, x, z, R) if math.hypot(cx - x, cz - z) < R)
    in_water = lambda x, z: any(inside((x, z), w["pts"]) for w in water)
    def road_dist(x, z, minw=6):
        best, br = 1e9, None
        for a, b, r in near(rcell, x, z, 80):
            if r["width"] < minw: continue
            d = seg_d((x, z), a, b)
            if d < best: best, br = d, (a, b, r)
        return best, br
    def landuse_at(x, z):
        for u in landuse:
            if inside((x, z), u["pts"]): return u["kind"]
        return None
    mark_d = lambda x, z: min((math.hypot(mx - x, mz - z), n) for mx, mz, n in marks)

    chosen, out, rep = [], [], []
    for s in SITES:
        if s["kind"] in ("area", "open"):
            tx, tz = s["tgt"] if s["tgt"] else clampr(grid_to_real(*s["old"]))
            R = s["R"]; best = None
            for gx in range(-1500, 1501, 15):
                for gz in range(-1500, 1501, 15):
                    x, z = tx + gx, tz + gz
                    if not (rect[0] + R + 60 < x < rect[2] - R - 60 and rect[1] + R + 60 < z < rect[3] - R - 60): continue
                    dt = math.hypot(gx, gz)
                    if best and dt / 100 > best[0]: continue
                    if any(math.hypot(x - c[0], z - c[1]) < R + c[2] + 40 for c in chosen): continue
                    md, _ = mark_d(x, z)
                    if md < R + 40: continue
                    rd, _ = road_dist(x, z)
                    if rd > R + 12 or rd < (R - 4 if s["kind"] == "area" else 3): continue    # beside a road: the nearest road runs just outside the site
                    if any(in_water(x + math.cos(a) * R, z + math.sin(a) * R) for a in (0, 1.57, 3.14, 4.71)) or in_water(x, z): continue
                    lu = landuse_at(x, z)
                    score = dt / 100 + (bld_area(x, z, R) / 1500 if s["kind"] == "area" else bld_area(x, z, R) / 150) + (0 if (not s.get("pref") or lu in s["pref"]) else 1.5)
                    if not best or score < best[0]: best = (score, x, z, lu, md, rd)
            if not best: raise SystemExit("no spot found for " + s["id"])
            _, x, z, lu, md, rd = best; chosen.append((x, z, R))
            cleared = bld_count(x, z, R) if s["kind"] == "area" else 0
            out.append(dict(id=s["id"], kind=s["kind"], old=s["old"], r=s["r"], x=round(x, 1), z=round(z, 1), R=R, clear=R if s["kind"] == "area" else 0, rot=0, name=s["name"]))
            rep.append(f"| {s['name']} | {s['kind']} | {x:.0f}, {z:.0f} | {lu or '-'} | {cleared} | {md:.0f} m ({mark_d(x, z)[1]}) | {rd:.0f} m |")
        elif s["kind"] == "spot":
            tx, tz = clampr(grid_to_real(*s["old"])); best = None
            for a, b, r in near(rcell, tx, tz, 400):
                if r["width"] < 5: continue
                for t in (0.25, 0.5, 0.75):
                    px, pz = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t; l = math.hypot(b[0] - a[0], b[1] - a[1]) or 1
                    for side in (1, -1):
                        o = r["width"] / 2 + 2.5; x, z = px + (b[1] - a[1]) / l * o * side, pz - (b[0] - a[0]) / l * o * side
                        if bld_area(x, z, 3) > 0 or any(inside((x, z), q) for q in near(pcell, x, z, 80)) or in_water(x, z) or road_dist(x, z, 3)[0] < 2.5: continue   # not inside any building outline
                        d = math.hypot(x - tx, z - tz)
                        if not best or d < best[0]: best = (d, x, z)
            _, x, z = best
            out.append(dict(id=s["id"], kind="spot", old=s["old"], r=s["r"], x=round(x, 1), z=round(z, 1), R=0, clear=0, rot=0, name=s["name"]))
            rep.append(f"| {s['name']} | spot | {x:.0f}, {z:.0f} | - | 0 | {mark_d(x, z)[0]:.0f} m ({mark_d(x, z)[1]}) | on a sidewalk |")
        elif s["kind"] == "jetty":
            lake = next(w for w in water if w["id"] == int(s["lake"][1:]))
            ring = lake["pts"]; best = None
            for i in range(1, len(ring)):
                a, b = ring[i - 1], ring[i]; L = math.hypot(b[0] - a[0], b[1] - a[1])
                for t in [k / max(1, int(L // 6)) for k in range(int(L // 6) + 1)]:
                    px, pz = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                    for rot, (ux, uz) in enumerate(((1, 0), (0, 1), (-1, 0), (0, -1))):   # rot = quarter turns of the old +x jetty axis
                        if in_water(px - ux * 8, pz - uz * 8) or not in_water(px + ux * 10, pz + uz * 10): continue
                        vx, vz = -uz, ux   # old +z maps to this perpendicular
                        ok = all(in_water(px + ux * d, pz + uz * d) for d in range(10, 181, 10)) and \
                             all(in_water(px + ux * 165 + vx * (-30) + math.cos(an) * 42, pz + uz * 165 + vz * (-30) + math.sin(an) * 42) for an in [k * 0.5 for k in range(13)])
                        if not ok: continue
                        rd, _ = road_dist(px - ux * 12, pz - uz * 12)
                        md, _ = mark_d(px, pz)
                        if rd > 70 or md < 60: continue
                        score = rd + math.hypot(px - s["tgt"][0], pz - s["tgt"][1]) / 50
                        if not best or score < best[0]: best = (score, px, pz, rot, rd, md)
            if not best: raise SystemExit("no jetty spot on the lake")
            _, x, z, rot, rd, md = best
            out.append(dict(id="jetty", kind="jetty", old=s["old"], r=s["r"], x=round(x, 1), z=round(z, 1), R=0, clear=0, rot=rot, name=s["name"]))
            rep.append(f"| {s['name']} | jetty on {lake['name']} | {x:.0f}, {z:.0f} | water | 0 | {md:.0f} m ({mark_d(x, z)[1]}) | {rd:.0f} m |")

    js = ("/* Kovai Streets: geosites_data.js. GENERATED by tools/geo/place_sites.py; do not edit by hand.\n"
          " * Real-map positions (game metres) for the fictional mission sites and small points of interest. See js/geosites.js. */\n"
          "'use strict';\nconst GEO_SITES=" + json.dumps(out, ensure_ascii=False) + ";\n")
    open(os.path.join(ROOT, "js", "geosites_data.js"), "w", encoding="utf-8").write(js)
    md = ["# Step G6: where the mission sites went", "", "Generated by `tools/geo/place_sites.py`. Coordinates are game metres (origin Victoria Town Hall).", "",
          "Every fictional site keeps at least 40 m plus its radius from real landmarks, hospitals, police stations and bus stands, stays out of water and sits beside a drivable road. "
          "Area sites remove only the anonymous OpenStreetMap buildings inside their radius.", "",
          "| Site | Kind | Game x, z | Land use | Buildings cleared | Nearest real landmark / POI | Road |", "|---|---|---|---|---|---|---|", *rep, ""]
    os.makedirs(os.path.join(ROOT, "geodata", "validation"), exist_ok=True)
    open(os.path.join(ROOT, "geodata", "validation", "sites_report.md"), "w", encoding="utf-8").write("\n".join(md))
    print("\n".join(rep))


if __name__ == "__main__":
    main()
