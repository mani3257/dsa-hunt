import client from "./client";

export const getProblemsWithProgress = (params = {}) =>
  client.get("/problems/with-progress", { params }).then((r) => r.data);
export const getProblems = (params = {}) => client.get("/problems", { params }).then((r) => r.data);
export const getCategories = (sheet) => client.get("/problems/categories", { params: { sheet } }).then((r) => r.data);
export const getPatterns = (sheet, category) => client.get("/problems/patterns", { params: { sheet, category } }).then((r) => r.data);
