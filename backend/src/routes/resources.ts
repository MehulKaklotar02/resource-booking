import express from "express";
import { getResources, getResourceSlots } from "../controllers/resource.controller";

const router = express.Router();

router.get("/", getResources);
router.get("/:id/slots", getResourceSlots);

export default router;
