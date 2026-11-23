"""Kovai Streets real-geography pilot (6 x 6 km, 1:1): turn the raw OpenStreetMap extract into game-ready data.

Reads   geodata/raw/osm/pilot_features.json, pilot_buildings.json   (downloaded once with tools/geo/*.overpassql)
        tools/map/landmarks.json                                    (landmark lat/lon from step D1)
Writes  geodata/processed/pilot/roads.json      drivable roads: class, name, one-way, bridge/tunnel, layer, width, points
        geodata/processed/pilot/paths.json      footways, paths, steps, pedestrian streets
        geodata/processed/pilot/rail.json       railway lines and stations
        geodata/processed/pilot/water.json      lakes/tanks (polygons) and waterways (lines)
        geodata/processed/pilot/landuse.json    landuse and parks (polygons)
        geodata/processed/pilot/buildings.json  building footprints with height
        geodata/processed/pilot/graph.json      road navigation graph (nodes, directed edges)
        geodata/processed/pilot/landmarks.json  landmark registry at 1:1
        geodata/processed/pilot/pois.json       hospitals, police stations and bus stands (map icons)
        geodata/validation/pilot_report.md      counts, connectivity, landmark coverage
All coordinates are game metres from tools/geo/geo.py (the only transform). Run:  python tools/geo/build_pilot.py
"""
import json, math, os, sys
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import to_game, to_utm, ORIGIN_LATLON

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "geodata", "raw", "osm")
OUT = os.path.join(ROOT, "geodata", "processed", "pilot")
VAL = os.path.join(ROOT, "geodata", "validation")
BBOX = (10.978, 76.947, 11.032, 77.003)        # south, west, north, east (same as the Overpass queries)

# Default carriageway width (m) per road class when OSM has no width/lanes tag
WIDTH = {"trunk": 14, "primary": 12, "secondary": 10, "tertiary": 8, "unclassified": 6.5, "residential": 6, "living_street": 5,
         "service": 4.5, "trunk_link": 7, "primary_link": 7, "secondary_link": 6.5, "tertiary_link": 6, "track": 4}
PATH_CLASSES = {"footway", "path", "steps", "pedestrian", "cycleway", "corridor"}
SKIP = {"construction", "proposed", "platform", "bus_stop", "elevator", "abandoned", "raceway"}


def pts(geom):
    return [list(to_game(p["lat"], p["lon"])) for p in geom]


def length(p):
    return sum(math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]) for i in range(1, len(p)))


def area(p):
    return abs(sum(p[i - 1][0] * p[i][1] - p[i][0] * p[i - 1][1] for i in range(len(p)))) / 2


def num(v, default):
    try:
        return float(str(v).split(";")[0].replace("m", "").strip())
    except (TypeError, ValueError):
        return default


def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(VAL, exist_ok=True)
    feats = json.load(open(os.path.join(RAW, "pilot_features.json"), encoding="utf-8"))["elements"]
    blds = json.load(open(os.path.join(RAW, "pilot_buildings.json"), encoding="utf-8"))["elements"]
    roads, paths, rail, stations, water, waterways, landuse = [], [], [], [], [], [], []
    signals, crossings, pois = [], [], []

    POI_KINDS = ("hospital", "police", "bus_station")
    for e in feats:
        t = e.get("tags", {})
        if t.get("amenity") in POI_KINDS:
            c = (e["lat"], e["lon"]) if e["type"] == "node" else ((e["bounds"]["minlat"] + e["bounds"]["maxlat"]) / 2, (e["bounds"]["minlon"] + e["bounds"]["maxlon"]) / 2) if "bounds" in e else None
            if c: x, z = to_game(*c); pois.append({"kind": t["amenity"], "name": t.get("name"), "x": x, "z": z, "osm": e["type"][0] + str(e["id"])})
        if e["type"] == "node":
            if t.get("highway") == "traffic_signals": signals.append(list(to_game(e["lat"], e["lon"])))
            elif t.get("railway") in ("station", "halt"): stations.append({"name": t.get("name"), "p": list(to_game(e["lat"], e["lon"]))})
            elif t.get("railway") == "level_crossing": crossings.append(list(to_game(e["lat"], e["lon"])))
            continue
        if e["type"] == "relation":
            members = [m for m in e.get("members", []) if m.get("role") in ("outer", "") and m.get("geometry")]
            polys = [pts(m["geometry"]) for m in members]
        else:
            polys = [pts(e["geometry"])] if e.get("geometry") else []
        if not polys: continue
        hw = t.get("highway")
        if hw and e["type"] == "way":
            if hw in SKIP or t.get("area") == "yes": continue
            p = polys[0]
            if hw in PATH_CLASSES:
                paths.append({"id": e["id"], "cls": hw, "name": t.get("name"), "pts": p}); continue
            lanes = num(t.get("lanes"), 0)
            w = num(t.get("width"), 0) or (lanes * 3.3 if lanes else WIDTH.get(hw, 6))
            ow = t.get("oneway")
            roads.append({"id": e["id"], "cls": hw, "name": t.get("name"), "oneway": 1 if ow in ("yes", "1", "true") else -1 if ow == "-1" else 0,
                          "bridge": t.get("bridge") not in (None, "no"), "tunnel": t.get("tunnel") not in (None, "no"),
                          "layer": int(num(t.get("layer"), 0)), "width": round(w, 1), "pts": p})
        elif t.get("railway") in ("rail", "light_rail", "narrow_gauge", "disused", "siding", "spur", "yard") or (t.get("railway") and t.get("railway") != "platform" and e["type"] == "way" and "service" in t):
            for p in polys: rail.append({"id": e["id"], "kind": t.get("railway"), "service": t.get("service"), "bridge": t.get("bridge") not in (None, "no"), "pts": p})
        elif t.get("natural") == "water" or "water" in t:
            for p in polys: water.append({"id": e["id"], "name": t.get("name"), "kind": t.get("water", "water"), "pts": p, "area": round(area(p))})
        elif "waterway" in t:
            for p in polys: waterways.append({"id": e["id"], "name": t.get("name"), "kind": t["waterway"], "pts": p})
        elif "landuse" in t or "leisure" in t or "amenity" in t:
            kind = t.get("landuse") or t.get("leisure") or t.get("amenity")
            for p in polys:
                if len(p) >= 4 and p[0] == p[-1]: landuse.append({"id": e["id"], "kind": kind, "name": t.get("name"), "pts": p, "area": round(area(p))})

    buildings = []
    for e in blds:
        t = e.get("tags", {})
        if e["type"] == "relation":
            polys = [pts(m["geometry"]) for m in e.get("members", []) if m.get("role") == "outer" and m.get("geometry")]
        else:
            polys = [pts(e["geometry"])] if e.get("geometry") else []
        lv = num(t.get("building:levels"), 0)
        h = num(t.get("height"), 0) or (lv * 3.2 if lv else 0)   # 0 = unknown: the game picks a height from land use
        for p in polys:
            if len(p) >= 4: buildings.append({"id": e["id"], "kind": t.get("building"), "name": t.get("name"), "h": round(h, 1), "pts": p})

    # ---- road navigation graph: shared points (same position and layer) are junctions; flyovers never join the road below ----
    key = lambda p, layer: (round(p[0], 1), round(p[1], 1), layer)
    use = Counter()
    for r in roads:
        for q in r["pts"]: use[key(q, r["layer"])] += 1
    nid, nodes, edges = {}, [], []
    def node(k):
        if k not in nid: nid[k] = len(nodes); nodes.append([k[0], k[1], k[2]])
        return nid[k]
    for ri, r in enumerate(roads):
        p, cut = r["pts"], [0]
        cut += [i for i in range(1, len(p) - 1) if use[key(p[i], r["layer"])] > 1] + [len(p) - 1]
        for a, b in zip(cut, cut[1:]):
            seg = p[a:b + 1]; na, nb = node(key(p[a], r["layer"])), node(key(p[b], r["layer"]))
            L = round(length(seg), 1)
            if r["oneway"] >= 0: edges.append([na, nb, L, ri, a, b])
            if r["oneway"] <= 0: edges.append([nb, na, L, ri, a, b])
    # connected components (treating edges as undirected)
    adj = defaultdict(set)
    for a, b, *_ in edges: adj[a].add(b); adj[b].add(a)
    comp, comps = {}, []
    for s in range(len(nodes)):
        if s in comp: continue
        stack, size = [s], 0; comp[s] = len(comps)
        while stack:
            u = stack.pop(); size += 1
            for v in adj[u]:
                if v not in comp: comp[v] = len(comps); stack.append(v)
        comps.append(size)

    # ---- landmarks at 1:1 from the D1 registry ----
    reg = json.load(open(os.path.join(ROOT, "tools", "map", "landmarks.json"), encoding="utf-8"))["landmarks"]
    landmarks = []
    for L in reg:
        x, z = to_game(L["lat"], L["lon"]); e_, n_ = to_utm(L["lat"], L["lon"])
        inside = BBOX[0] <= L["lat"] <= BBOX[2] and BBOX[1] <= L["lon"] <= BBOX[3]
        landmarks.append({"id": L["id"], "name": L["name"], "category": L["category"], "lat": L["lat"], "lon": L["lon"], "utm43n": [round(e_, 1), round(n_, 1)],
                          "x": x, "z": z, "approximate": L["source"] != "osm", "source": ("OSM " + L["osm"]) if L["osm"] else "manual estimate", "in_pilot": inside})

    w = lambda name, obj: json.dump(obj, open(os.path.join(OUT, name), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    meta = {"crs": "EPSG:32643 (WGS84 / UTM 43N)", "origin_latlon": ORIGIN_LATLON, "units": "metres, +x east, -z north", "source": "(c) OpenStreetMap contributors, ODbL 1.0"}
    w("roads.json", {"meta": meta, "roads": roads, "signals": signals}); w("paths.json", {"meta": meta, "paths": paths})
    w("rail.json", {"meta": meta, "rail": rail, "stations": stations, "crossings": crossings})
    w("water.json", {"meta": meta, "water": water, "waterways": waterways}); w("landuse.json", {"meta": meta, "landuse": landuse})
    w("buildings.json", {"meta": meta, "buildings": buildings})
    w("graph.json", {"meta": meta, "nodes": nodes, "edges": edges, "edge_fields": ["from", "to", "length_m", "road_index", "pt_from", "pt_to"]})
    w("landmarks.json", {"meta": meta, "landmarks": landmarks}); w("pois.json", {"meta": meta, "pois": pois})

    # ---- validation report ----
    xs = [q[0] for r in roads for q in r["pts"]]; zs = [q[1] for r in roads for q in r["pts"]]
    big = sorted(comps, reverse=True)
    km = Counter()
    for r in roads: km[r["cls"]] += length(r["pts"]) / 1000
    named = sum(1 for r in roads if r["name"])
    rep = ["# Real-geography pilot: data validation", "",
           "Generated by `tools/geo/build_pilot.py`. Data © OpenStreetMap contributors, ODbL 1.0. Transform: `tools/geo/geo.py` (UTM 43N, 1:1, origin Victoria Town Hall).", "",
           f"**Area:** lat {BBOX[0]}–{BBOX[2]}, lon {BBOX[1]}–{BBOX[3]}; game x {min(xs):.0f}…{max(xs):.0f} m, z {min(zs):.0f}…{max(zs):.0f} m.", "",
           "| Data | Count |", "|---|---|",
           f"| Drivable roads | {len(roads)} ({named} named), {sum(km.values()):.0f} km |", f"| Footways and paths | {len(paths)} |",
           f"| Railway lines / stations / level crossings | {len(rail)} / {len(stations)} / {len(crossings)} |",
           f"| Lakes and tanks / waterways | {len(water)} / {len(waterways)} |", f"| Landuse and park areas | {len(landuse)} |",
           f"| Buildings | {len(buildings)} ({sum(1 for b in buildings if b['h'])} with a height or level count) |",
           f"| Traffic signals | {len(signals)} |", "",
           "**Road length by class (km):** " + ", ".join(f"{c} {v:.1f}" for c, v in km.most_common()), "",
           "## Road graph", "",
           f"- {len(nodes)} nodes, {len(edges)} directed edges ({sum(1 for r in roads if r['oneway'])} one-way roads).",
           f"- {len(comps)} connected pieces. The largest holds {big[0]} nodes ({100 * big[0] / len(nodes):.1f}%).",
           f"- Pieces with fewer than 10 nodes: {sum(1 for c in comps if c < 10)}. Most are roads cut by the pilot boundary or private service roads; they are listed for checking, not joined automatically.",
           "- Junctions are points shared by two roads on the same layer, so flyovers and bridges never join the road beneath them.", "",
           "## Landmarks inside the pilot", "", "| Landmark | Game x, z (m) | Source |", "|---|---|---|",
           *[f"| {L['name']} | {L['x']:.0f}, {L['z']:.0f} | {L['source']}{' (approximate)' if L['approximate'] else ''} |" for L in landmarks if L["in_pilot"]], "",
           "## Not yet covered", "",
           "- **Elevation:** flat ground. Real heights need the Copernicus DEM (not downloaded).",
           "- **Turn restrictions:** OSM turn-restriction relations are not in this extract yet.",
           "- **Official planning boundary and Master Plan 2041 land use:** not downloaded; land use comes from OSM only.", ""]
    open(os.path.join(VAL, "pilot_report.md"), "w", encoding="utf-8").write("\n".join(rep))
    print(f"roads {len(roads)}, paths {len(paths)}, rail {len(rail)}, water {len(water)}, landuse {len(landuse)}, buildings {len(buildings)}, "
          f"graph {len(nodes)} nodes / {len(edges)} edges / {len(comps)} pieces (largest {big[0]})")
    for f in sorted(os.listdir(OUT)): print(f"  {f}: {os.path.getsize(os.path.join(OUT, f)) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
