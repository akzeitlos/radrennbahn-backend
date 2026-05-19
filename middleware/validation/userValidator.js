import { body, validationResult } from "express-validator";
import db from "../../db/index.js";

const { user } = db;

export const validateCreateUser = [
  body("email").isEmail().withMessage("E-Mail ist ungültig."),
  body("username").notEmpty().withMessage("Benutzername ist erforderlich."),
  body("password").isLength({ min: 6 }).withMessage("Passwort muss mindestens 6 Zeichen lang sein."),
  async (req, res, next) => {
    // Validation Errors sammeln
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Prüfen, ob E-Mail oder Username schon existieren
    const { email, username } = req.body;
    const existing = await user.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { username }],
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Benutzer mit dieser E-Mail oder diesem Benutzernamen existiert bereits." });
    }

    next();
  },
];

export const validateUpdateUser = [
  body("email").optional().isEmail().withMessage("E-Mail ist ungültig."),
  body("username").optional().notEmpty().withMessage("Benutzername darf nicht leer sein."),
  body("password").optional().isLength({ min: 6 }).withMessage("Passwort muss mindestens 6 Zeichen lang sein."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Falls E-Mail oder Username geändert wird, prüfen ob schon vergeben
    const { email, username } = req.body;
    if (email || username) {
      const existing = await user.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ email }, { username }],
          id: { [db.Sequelize.Op.ne]: req.params.id }, // exclude current user
        },
      });
      if (existing) {
        return res.status(409).json({ error: "E-Mail oder Benutzername bereits vergeben." });
      }
    }

    next();
  },
];
