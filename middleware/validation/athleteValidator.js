import { body, validationResult } from "express-validator";
import db from "../../db/index.js";

const { athlete, club, raceClass } = db;

export const validateCreateAthlete = [
  body("firstname")
    .notEmpty()
    .withMessage("Vorname ist erforderlich."),

  body("lastname")
    .notEmpty()
    .withMessage("Nachname ist erforderlich."),

  body("raceNumber")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Startnummer muss eine Zahl sein."),

  body("gender")
    .notEmpty()
    .isString()
    .withMessage("Geschlecht ist ungültig."),

  body("clubId")
    .notEmpty()
    .withMessage("Club ist erforderlich.")
    .bail()
    .custom(async (clubId) => {
      const existingClub = await club.findByPk(clubId);
      if (!existingClub) {
        return Promise.reject("Club existiert nicht.");
      }
    }),

  body("raceClasses")
    .optional()
    .isArray()
    .withMessage("RaceClasses müssen ein Array sein.")
    .bail()
    .custom(async (ids) => {
      if (!ids || ids.length === 0) return true;

      const count = await raceClass.count({
        where: { id: ids },
      });

      if (count !== ids.length) {
        return Promise.reject("Eine oder mehrere Rennklassen existieren nicht.");
      }
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateUpdateAthlete = [
  body("firstname").optional().notEmpty(),
  body("lastname").optional().notEmpty(),

  body("raceNumber")
    .optional()
    .isInt({ min: 0 }),

  body("gender")
    .optional()
    .isString(),

  body("clubId")
    .optional()
    .custom(async (clubId) => {
      const existingClub = await club.findByPk(clubId);
      if (!existingClub) {
        return Promise.reject("Club existiert nicht.");
      }
    }),

  body("raceClasses")
    .optional()
    .isArray()
    .withMessage("RaceClasses müssen ein Array sein.")
    .bail()
    .custom(async (ids) => {
      if (!ids) return true;

      const count = await raceClass.count({
        where: { id: ids },
      });

      if (count !== ids.length) {
        return Promise.reject("Eine oder mehrere Rennklassen existieren nicht.");
      }
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];