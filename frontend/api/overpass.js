function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const fetchParks = async (userLat, userLon) => {
  const query = `
    [out:json][timeout:25];
    area[name="Helsinki"][admin_level=8]->.searchArea;
    (
      node["leisure"="dog_park"](area.searchArea);
      way["leisure"="dog_park"](area.searchArea);
      relation["leisure"="dog_park"](area.searchArea);
    );
    out body geom;
  >;
    out skel qt;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  const json = await res.json();

  const parks = json.elements
    .filter((el) => el.tags?.leisure === "dog_park")
    .map((el) => {
      // Centroid-laskenta ym. säilyy
      let lat = el.lat ?? el.center?.lat;
      let lon = el.lon ?? el.center?.lon;
      if ((lat == null || lon == null) && Array.isArray(el.geometry)) {
        const { lat: sumLat, lon: sumLon } = el.geometry.reduce(
          (acc, g) => ({ lat: acc.lat + g.lat, lon: acc.lon + g.lon }),
          { lat: 0, lon: 0 },
        );
        lat = sumLat / el.geometry.length;
        lon = sumLon / el.geometry.length;
      }

      const distance =
        userLat != null && lat != null && lon != null
          ? Math.round(getDistance(userLat, userLon, lat, lon))
          : undefined;

      const originalName = el.tags?.name;
      const name = originalName ?? "Koirapuisto";

      return {
        id: el.id,
        name,
        hasName: Boolean(originalName), // <— tämä kertoo, onko OSM:ssä ollut oma nimi
        latitude: lat,
        longitude: lon,
        distance,
        geometry: el.geometry,
        access: el.tags?.access,
        fenced: el.tags?.fenced,
        opening_hours: el.tags?.opening_hours,
        surface: el.tags?.surface,
      };
    })
    // Järjestä etäisyyden mukaan lähimmästä kauimpaan
    .sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

  return parks;
};
