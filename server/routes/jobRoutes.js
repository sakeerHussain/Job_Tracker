import express from "express";
import { getJobs, getJobById, createJob, updateJob, deleteJob, getAnalytics } from "../controllers/jobController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/analytics", getAnalytics);
router.route("/").get(getJobs).post(createJob);
router.route("/:id").get(getJobById).put(updateJob).delete(deleteJob);

export default router;