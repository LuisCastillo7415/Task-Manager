const API_URL = "http://localhost:5000/api";

export const getSystemData = async () => {
  const res = await fetch(`${API_URL}/system`);
  return res.json();
};

export const getProcesses = async () => {
  const res = await fetch(`${API_URL}/processes`);
  return res.json();
};