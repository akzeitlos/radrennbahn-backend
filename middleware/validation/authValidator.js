import { body, validationResult } from "express-validator";

export const validateLogin = [
  body("emailOrUsername").notEmpty().withMessage("E-Mail oder Benutzername ist erforderlich."),
  body("password").notEmpty().withMessage("Passwort ist erforderlich."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateRegister = [
  body("email").isEmail().withMessage("E-Mail ist ungültig."),
  body("username").notEmpty().withMessage("Benutzername ist erforderlich."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Passwort muss mindestens 6 Zeichen lang sein."),
  body("firstname").optional().isString(),
  body("lastname").optional().isString(),
  body("roles").optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateRequestPasswordReset = [
  body("email").isEmail().withMessage("E-Mail ist ungültig."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateResetPassword = [
  body("token").notEmpty().withMessage("Token ist erforderlich."),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Neues Passwort muss mindestens 6 Zeichen lang sein."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
