import express from "express";

import {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from "../controllers/athleteController.js";

import {
  validateCreateAthlete,
  validateUpdateAthlete,
} from "../middleware/validation/athleteValidator.js";

const router = express.Router();

router.get("/", getAllAthletes);
router.get("/:id", getAthleteById);
router.post("/", validateCreateAthlete, createAthlete);
router.put("/:id", validateUpdateAthlete, updateAthlete);
router.delete("/:id", deleteAthlete);

export default router;