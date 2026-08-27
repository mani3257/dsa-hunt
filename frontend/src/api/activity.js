import client from "./client";

export const getActivity = (days = 140) =>
  client.get("/activity", { params: { days } }).then((r) => r.data);
