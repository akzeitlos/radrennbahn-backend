import express from "express";

import {
  getAllRaceModes,
  getRaceModeById,
  createRaceMode,
  updateRaceMode,
  deleteRaceMode,
} from "../controllers/raceModeController.js";

import {
  validateCreateRaceMode,
  validateUpdateRaceMode,
} from "../middleware/validation/raceModeValidator.js";

const router = express.Router();

router.get("/", getAllRaceModes);
router.get("/:id", getRaceModeById);
router.post("/", validateCreateRaceMode, createRaceMode);
router.put("/:id", validateUpdateRaceMode, updateRaceMode);
router.delete("/:id", deleteRaceMode);

export default router;