import express from "express";
import {
  getAllReports, getReport, createReport, deleteReport
} from "../controllers/HistoryController.js";

const router = express.Router();

router.get("/", getAllReports);
router.post("/", createReport);
router.get("/:id", getReport);
router.delete("/:id", deleteReport);

export default router;
