// frontend/api/client.js
const BACKEND_URL = "http://192.168.1.106:3000";

export const fetchStatus = async (parkId) => {
  const url = parkId
    ? `${BACKEND_URL}/status?parkId=${encodeURIComponent(parkId)}`
    : `${BACKEND_URL}/status`;
  const res = await fetch(url);
  return res.json();
};

export const sendPresence = async ({
  userId,
  parkId,
  peopleCount,
  dogCount,
  action,
}) => {
  return fetch(`${BACKEND_URL}/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, parkId, peopleCount, dogCount, action }),
  });
};
