import client from "./client";
export const updateProgress = (problemId, updates) => client.post("/progress", { problemId, ...updates }).then((r) => r.data);
export const getAllProgress = () => client.get("/progress").then((r) => r.data);
export const markRevised = (problemId) => client.patch(`/progress/${problemId}/revised`).then((r) => r.data);
