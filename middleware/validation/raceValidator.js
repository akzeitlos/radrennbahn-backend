import { body, validationResult } from "express-validator";
import db from "../../db/index.js";

const { raceMode, raceClass, athlete } = db;

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ==============================
// Wiederverwendbare Custom Checks
// ==============================

const checkRaceModeExists = body("raceModeId")
  .notEmpty()
  .withMessage("Rennmodus ist erforderlich.")
  .bail()
  .custom(async (id) => {
    const found = await raceMode.findByPk(id);
    if (!found) return Promise.reject("Rennmodus existiert nicht.");
  });

const checkRaceClassesExist = body("raceClasses")
  .optional()
  .isArray()
  .withMessage("Rennklassen müssen ein Array sein.")
  .bail()
  .custom(async (ids) => {
    if (!ids || ids.length === 0) return true;
    const count = await raceClass.count({ where: { id: ids } });
    if (count !== ids.length) {
      return Promise.reject("Eine oder mehrere Rennklassen existieren nicht.");
    }
  });

const checkAthletesExist = body("athletes")
  .optional()
  .isArray()
  .withMessage("Athleten müssen ein Array sein.")
  .bail()
  .custom(async (ids) => {
    if (!ids || ids.length === 0) return true;
    const count = await athlete.count({ where: { id: ids } });
    if (count !== ids.length) {
      return Promise.reject("Eine oder mehrere Athleten existieren nicht.");
    }
  });

const checkDanishScoringRounds = body("danishScoringRounds")
  .optional()
  .isArray()
  .withMessage("Dänische Wertungsrunden müssen ein Array sein.")
  .bail()
  .custom((rounds) => {
    if (!rounds || rounds.length === 0) return true;

    for (const round of rounds) {
      if (typeof round.roundNumber !== "number" || round.roundNumber < 1) {
        throw new Error("Jede Wertungsrunde braucht eine gültige roundNumber (>= 1).");
      }
      if (!Array.isArray(round.pointsDistribution)) {
        throw new Error("pointsDistribution muss ein Array sein.");
      }
      if (round.pointsDistribution.some((p) => typeof p !== "number" || p < 0)) {
        throw new Error("Alle Punktwerte in pointsDistribution müssen positive Zahlen sein.");
      }
    }

    return true;
  });

// ==============================
// Lapdown-Punkte nur prüfen wenn lapdownMode === "points"
// ==============================
const checkLapdownPoints = [
  body("lapdownPointsWin")
    .if(body("lapdownMode").equals("points"))
    .notEmpty()
    .withMessage("lapdownPointsWin ist erforderlich wenn lapdownMode 'points' ist.")
    .bail()
    .isInt()
    .withMessage("lapdownPointsWin muss eine Zahl sein."),

  body("lapdownPointsLoss")
    .if(body("lapdownMode").equals("points"))
    .notEmpty()
    .withMessage("lapdownPointsLoss ist erforderlich wenn lapdownMode 'points' ist.")
    .bail()
    .isInt()
    .withMessage("lapdownPointsLoss muss eine Zahl sein."),
];

// ==============================
// CREATE
// ==============================
export const validateCreateRace = [
  body("date")
    .notEmpty()
    .withMessage("Datum ist erforderlich.")
    .bail()
    .isDate()
    .withMessage("Datum muss ein gültiges Datum sein."),

  checkRaceModeExists,

  body("rounds")
    .notEmpty()
    .withMessage("Rundenanzahl ist erforderlich.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Rundenanzahl muss eine positive Zahl sein."),

  body("scoringInterval")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Wertungsintervall muss eine positive Zahl sein."),

  body("lapdownMode")
    .notEmpty()
    .withMessage("Überrundungsmodus ist erforderlich.")
    .bail()
    .isIn(["points", "lapped"])
    .withMessage("Überrundungsmodus muss 'points' oder 'lapped' sein."),

  ...checkLapdownPoints,

  body("pointsFirst").optional({ nullable: true }).isInt({ min: 0 }).withMessage("Punkte Erster muss eine positive Zahl sein."),
  body("pointsSecond").optional({ nullable: true }).isInt({ min: 0 }).withMessage("Punkte Zweiter muss eine positive Zahl sein."),
  body("pointsThird").optional({ nullable: true }).isInt({ min: 0 }).withMessage("Punkte Dritter muss eine positive Zahl sein."),
  body("pointsFourth").optional({ nullable: true }).isInt({ min: 0 }).withMessage("Punkte Vierter muss eine positive Zahl sein."),

  checkRaceClassesExist,
  checkAthletesExist,
  checkDanishScoringRounds,

  handleValidationErrors,
];

// ==============================
// UPDATE
// ==============================
export const validateUpdateRace = [
  body("date")
    .optional()
    .isDate()
    .withMessage("Datum muss ein gültiges Datum sein."),

  body("raceModeId")
    .optional()
    .custom(async (id) => {
      const found = await raceMode.findByPk(id);
      if (!found) return Promise.reject("Rennmodus existiert nicht.");
    }),

  body("rounds")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Rundenanzahl muss eine positive Zahl sein."),

  body("scoringInterval")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Wertungsintervall muss eine positive Zahl sein."),

  body("lapdownMode")
    .optional()
    .isIn(["points", "lapped"])
    .withMessage("Überrundungsmodus muss 'points' oder 'lapped' sein."),

  ...checkLapdownPoints,

  body("pointsFirst").optional({ nullable: true }).isInt({ min: 0 }),
  body("pointsSecond").optional({ nullable: true }).isInt({ min: 0 }),
  body("pointsThird").optional({ nullable: true }).isInt({ min: 0 }),
  body("pointsFourth").optional({ nullable: true }).isInt({ min: 0 }),

  checkRaceClassesExist,
  checkAthletesExist,
  checkDanishScoringRounds,

  handleValidationErrors,
];