import express from "express";
import { getServicesPage } from "../controllers/servicesController.js";

const router = express.Router();

router.get("/services", getServicesPage);

export default router;