import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/roleController.js";

import {
  validateCreateRole,
  validateUpdateRole,
} from "../middleware/validation/roleValidator.js";

const router = express.Router();

// Alle Rollen abrufen
router.get("/", getAllRoles);

// Einzelne Rolle abrufen
router.get("/:id", getRoleById);

// Neue Rolle erstellen
router.post("/", validateCreateRole, createRole);

// Rolle aktualisieren
router.put("/:id", validateUpdateRole, updateRole);

// Rolle löschen
router.delete("/:id", deleteRole);

export default router;
