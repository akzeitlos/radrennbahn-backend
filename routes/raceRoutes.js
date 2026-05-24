import express from "express";

import {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace,
  saveRaceResults,
  getRaceSession,
  completeRace,
} from "../controllers/raceController.js";

import {
  validateCreateRace,
  validateUpdateRace,
} from "../middleware/validation/raceValidator.js";

const router = express.Router();

router.get("/", getAllRaces);
router.get("/:id", getRaceById);
router.get("/:id/session", getRaceSession);
router.post("/", validateCreateRace, createRace);
router.put("/:id", validateUpdateRace, updateRace);
router.put("/:id/results", saveRaceResults);
router.delete("/:id", deleteRace);
router.put("/:id/complete", completeRace);

export default router;
