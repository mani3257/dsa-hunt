import client from "./client";

export const getGoal = () => client.get("/goal").then((r) => r.data);

export const saveGoal = (payload) => client.post("/goal", payload).then((r) => r.data);

export const deleteGoal = () => client.delete("/goal").then((r) => r.data);
