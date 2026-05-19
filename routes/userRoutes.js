import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

import { validateCreateUser, validateUpdateUser } from "../middleware/validation/userValidator.js";

const router = express.Router();

// Alle Rollen abrufen
router.get("/", getAllUsers);

// Einzelne Rolle abrufen
router.get("/:id", getUserById);

// Neue Rolle erstellen
router.post("/", validateCreateUser, createUser);

// Rolle aktualisieren
router.put("/:id", validateUpdateUser, updateUser);

// Rolle löschen
router.delete("/:id", deleteUser);

export default router;
