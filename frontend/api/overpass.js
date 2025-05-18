export const fetchDogParks = async () => {
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
      longitude: lon
    };
  })
  .filter(Boolean); // removes nulls

  return parks;
};
