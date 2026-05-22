import express from "express";

import {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace,
} from "../controllers/raceController.js";

import {
  validateCreateRace,
  validateUpdateRace,
} from "../middleware/validation/raceValidator.js";

const router = express.Router();

router.get("/", getAllRaces);
router.get("/:id", getRaceById);
router.post("/", validateCreateRace, createRace);
router.put("/:id", validateUpdateRace, updateRace);
router.delete("/:id", deleteRace);

export default router;