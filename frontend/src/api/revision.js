import client from "./client";
export const getRevisionProblems = () => client.get("/revision").then((r) => r.data);
export const markProblemRevised = (problemId) => client.post(`/revision/${problemId}/mark-revised`).then((r) => r.data);
