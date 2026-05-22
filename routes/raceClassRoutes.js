import express from "express";

import {
  getAllRaceClasses,
  getRaceClassById,
  createRaceClass,
  updateRaceClass,
  deleteRaceClass,
} from "../controllers/raceClassController.js";

import {
  validateCreateRaceClass,
  validateUpdateRaceClass,
} from "../middleware/validation/raceClassValidator.js";

const router = express.Router();

router.get("/", getAllRaceClasses);
router.get("/:id", getRaceClassById);
router.post("/", validateCreateRaceClass, createRaceClass);
router.put("/:id", validateUpdateRaceClass, updateRaceClass);
router.delete("/:id", deleteRaceClass);

export default router;