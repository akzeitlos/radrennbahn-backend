import express from "express";

import {
  getAllRaceClasses,
  getRaceClassById,
  createRaceClass,
  updateRaceClass,
  deleteRaceClass,
} from "../controllers/raceClassController.js";

const router = express.Router();

// Alle Rennklassen
router.get("/", getAllRaceClasses);

// Einzelne Rennklasse
router.get("/:id", getRaceClassById);

// Rennklasse erstellen
router.post("/", createRaceClass);

// Rennklasse bearbeiten
router.put("/:id", updateRaceClass);

// Rennklasse löschen
router.delete("/:id", deleteRaceClass);

export default router;