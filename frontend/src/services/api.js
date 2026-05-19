const API_URL = "http://localhost:5000/api";

export const getSystemData = async () => {
  const res = await fetch(`${API_URL}/system`);
  return res.json();
};

export const getProcesses = async () => {
  const res = await fetch(`${API_URL}/processes`);
  return res.json();
};

export const getCpuDetail = async () => {
  const res = await fetch(`${API_URL}/cpu/detail`);
  return res.json();
};

export const getGpuInfo = async () => {
  const res = await fetch(`${API_URL}/gpu`);
  return res.json();
};

export const getNetworkInfo = async () => {
  const res = await fetch(`${API_URL}/network`);
  return res.json();
};

export const getSysInfo = async () => {
  const res = await fetch(`${API_URL}/sysinfo`);
  return res.json();
};

export const getHistory = async (period = "24h") => {
  const res = await fetch(`${API_URL}/history?period=${period}`);
  return res.json();
};

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/settings`);
  return res.json();
};

export const saveSettings = async (data) => {
  const res = await fetch(`${API_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};