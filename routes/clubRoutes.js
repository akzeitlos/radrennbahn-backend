import express from "express";

import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
} from "../controllers/clubController.js";

import {
  validateCreateClub,
  validateUpdateClub,
} from "../middleware/validation/clubValidator.js";

const router = express.Router();

router.get("/", getAllClubs);
router.get("/:id", getClubById);
router.post("/", validateCreateClub, createClub);
router.put("/:id", validateUpdateClub, updateClub);
router.delete("/:id", deleteClub);

export default router;