[out:json][timeout:180][bbox:10.978,76.947,11.032,77.003];
(
  way["highway"];
  way["railway"];
  way["natural"="water"]; relation["natural"="water"];
  way["water"]; way["waterway"];
  way["landuse"]; relation["landuse"];
  way["leisure"~"park|garden|pitch|stadium|track|playground"];
  way["amenity"~"bus_station|hospital|school|college|university|place_of_worship|marketplace|police"];
  node["amenity"~"bus_station|hospital|police|place_of_worship"]["name"];
  node["railway"~"station|halt|level_crossing"];
  node["highway"="traffic_signals"];
);
out geom tags;
