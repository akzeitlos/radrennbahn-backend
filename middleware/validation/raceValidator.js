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
    .withMessage("Bitte die Punkte für die Überrundung (Gewinn) eintragen.")
    .bail()
    .isInt()
    .withMessage("Überrundung Gewinn muss eine ganze Zahl sein."),

  body("lapdownPointsLoss")
    .if(body("lapdownMode").equals("points"))
    .notEmpty()
    .withMessage("Bitte die Punkte für die Überrundung (Verlust) eintragen.")
    .bail()
    .isInt()
    .withMessage("Überrundung Verlust muss eine ganze Zahl sein."),
];

const isEliminationMode = async (raceModeId) => {
  if (!raceModeId) return false;
  const mode = await raceMode.findByPk(raceModeId);
  return mode?.slug === "elimination";
};

const roundsNotRequired = async (raceModeId) => {
  if (!raceModeId) return false;
  const mode = await raceMode.findByPk(raceModeId);
  return mode?.slug === "elimination" || mode?.slug === "scratch";
};

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

  body("time")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Uhrzeit muss im Format HH:MM sein."),

  checkRaceModeExists,

  body("rounds").custom(async (value, { req }) => {
    if (await roundsNotRequired(req.body.raceModeId)) return true;
    if (value === undefined || value === null || value === "")
      throw new Error("Rundenanzahl ist erforderlich.");
    if (!Number.isInteger(Number(value)) || Number(value) < 1)
      throw new Error("Rundenanzahl muss eine positive Zahl sein.");
    return true;
  }),

  body("scoringInterval")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Wertungsintervall muss eine positive Zahl sein."),

  body("lapdownMode").custom(async (value, { req }) => {
    if (await isEliminationMode(req.body.raceModeId)) return true;
    if (!value) throw new Error("Überrundungsmodus ist erforderlich.");
    if (!["points", "lapped"].includes(value))
      throw new Error("Überrundungsmodus muss 'points' oder 'lapped' sein.");
    return true;
  }),

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

  body("time")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Uhrzeit muss im Format HH:MM sein."),

  body("raceModeId")
    .optional()
    .custom(async (id) => {
      const found = await raceMode.findByPk(id);
      if (!found) return Promise.reject("Rennmodus existiert nicht.");
    }),

  body("rounds")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Rundenanzahl muss eine positive Zahl sein."),

  body("scoringInterval")
    .optional({ nullable: true })
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