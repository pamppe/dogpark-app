// Laske etäisyys kahden pisteen välillä metreinä
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


export const fetchDogParks = async (userLat, userLon) => {
  const query = `
    [out:json][timeout:10];
    area["name"="Helsinki"]->.searchArea;
    (
      node["leisure"="dog_park"](area.searchArea);
      way["leisure"="dog_park"](area.searchArea);
      relation["leisure"="dog_park"](area.searchArea);
    );
    out center;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `data=${encodeURIComponent(query)}`
  });

  const data = await response.json();

  // array of coordinates
  const parks = data.elements
  .map(el => {
    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;
    if (!lat || !lon) return null;

    return {
      id: el.id,
      name: el.tags?.name || "Koirapuisto",
      latitude: lat,
      longitude: lon,
      distance:
          userLat != null
            ? Math.round(getDistance(userLat, userLon, lat, lon))
            : undefined,
        access: el.tags?.access,             // "yes"/"no"/"permissive"
        fenced: el.tags?.fenced,             // "yes"/"no"
        opening_hours: el.tags?.opening_hours,
        surface: el.tags?.surface
    };
  })
  .filter(Boolean); // removes nulls

  return parks;
};
