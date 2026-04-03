import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export const loginApi = async (email, password) => {
  const response = await client.post("/auth/login", { email, password });
  return response.data;
};

export const signupApi = async (username,email, password) => {
  const response = await client.post("/auth/register", { username,email, password });
  return response.data;
};

export const getMeApi = async (token) => {
  const response = await client.get("/auth/get-me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
