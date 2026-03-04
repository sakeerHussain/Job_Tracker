import express from "express";
import { generateCoverLetter, getResumeTips } from "../controllers/aiController.js";
import protect from "../middlewares/authMIddleware.js";

const router = express.Router();
router.use(protect);

router.post("/cover-letter", generateCoverLetter);
router.post("/resume-tips", getResumeTips);

export default router;