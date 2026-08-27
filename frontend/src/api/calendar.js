import client from "./client";

export const getCalendarPlan = () => client.get("/goal").then((r) => r.data);

export const saveCalendarPlan = (payload) => client.post("/goal", payload).then((r) => r.data);

export const deleteCalendarPlan = () => client.delete("/goal").then((r) => r.data);
