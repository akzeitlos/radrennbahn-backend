import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ==============================
// CREATE
// ==============================
export const validateCreateRaceMode = [
  body("title")
    .notEmpty()
    .withMessage("Titel ist erforderlich.")
    .bail()
    .isString()
    .withMessage("Titel muss ein Text sein."),

  body("slug")
    .notEmpty()
    .withMessage("Slug ist erforderlich.")
    .bail()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten (z.B. 'dänisches-punkterennen' → 'danisches-punkterennen')."),

  body("description")
    .optional()
    .isString()
    .withMessage("Beschreibung muss ein Text sein."),

  handleValidationErrors,
];

// ==============================
// UPDATE
// ==============================
export const validateUpdateRaceMode = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Titel darf nicht leer sein.")
    .bail()
    .isString()
    .withMessage("Titel muss ein Text sein."),

  body("slug")
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten."),

  body("description")
    .optional()
    .isString()
    .withMessage("Beschreibung muss ein Text sein."),

  handleValidationErrors,
];