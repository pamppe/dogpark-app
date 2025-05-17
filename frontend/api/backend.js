const BACKEND_URL = 'http://192.168.1.106:3000';

export const sendData = async (lat, lon, people, dogs) => {
  return fetch(`${BACKEND_URL}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, people, dogs })
  });
};

export const fetchStatus = async () => {
  const res = await fetch(`${BACKEND_URL}/status`);
  return await res.json();
};
