import { body, validationResult } from "express-validator";
import db from "../../db/index.js";

const { role } = db;

export const validateCreateRole = [
  body("name")
    .notEmpty()
    .withMessage("Name ist erforderlich.")
    .bail()
    .custom(async (name) => {
      const existing = await role.findOne({ where: { name } });
      if (existing) {
        return Promise.reject("Rolle existiert bereits.");
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

export const validateUpdateRole = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name darf nicht leer sein.")
    .bail()
    .custom(async (name, { req }) => {
      const existing = await role.findOne({
        where: { name, id: { [db.Sequelize.Op.ne]: req.params.id } },
      });
      if (existing) {
        return Promise.reject("Rolle existiert bereits.");
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
