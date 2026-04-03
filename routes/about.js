import express from "express";
import { getAboutPage } from "../controllers/aboutController.js";

const router = express.Router();

// GET /about
router.get("/", getAboutPage);

export default router;