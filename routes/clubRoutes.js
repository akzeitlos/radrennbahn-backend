import express from "express";

import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
} from "../controllers/clubController.js";

const router = express.Router();

// Alle Vereine
router.get("/", getAllClubs);

// Einzelner Verein
router.get("/:id", getClubById);

// Verein erstellen
router.post("/", createClub);

// Verein bearbeiten
router.put("/:id", updateClub);

// Verein löschen
router.delete("/:id", deleteClub);

export default router;