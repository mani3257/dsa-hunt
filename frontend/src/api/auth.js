import client from "./client";

export const register = (payload) =>
  client.post("/auth/register", payload).then((r) => r.data);

export const login = (payload) =>
  client.post("/auth/login", payload).then((r) => r.data);

export const me = () => client.get("/auth/me").then((r) => r.data);

export const updateProfile = (payload) =>
  client.patch("/auth/profile", payload).then((r) => r.data);

export const logout = () => client.post("/auth/logout").then((r) => r.data);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const startGoogleLogin = () => {
  window.location.assign(`${API_URL}/auth/google`);
};

export const startGithubLogin = () => {
  window.location.assign(`${API_URL}/auth/github`);
};
