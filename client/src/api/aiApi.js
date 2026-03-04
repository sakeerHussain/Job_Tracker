import api from "./axiosInstance.js";

export const generateCoverLetter = (data) => api.post("/ai/cover-letter", data);
export const getResumeTips = (data) => api.post("/ai/resume-tips", data);