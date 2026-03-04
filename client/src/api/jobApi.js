import api from "./axiosInstance.js";

export const fetchJobs = () => api.get("/jobs");
export const fetchJobById = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const fetchAnalytics = () => api.get("/jobs/analytics");