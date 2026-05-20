import express from "express";

import {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from "../controllers/athleteController.js";

const router = express.Router();

// Alle Athleten
router.get("/", getAllAthletes);

// Einzelner Athlet
router.get("/:id", getAthleteById);

// Athlet erstellen
router.post("/", createAthlete);

// Athlet bearbeiten
router.put("/:id", updateAthlete);

// Athlet löschen
router.delete("/:id", deleteAthlete);

export default router;