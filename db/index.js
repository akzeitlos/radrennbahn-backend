import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

import userModel from "./models/user.js";
import roleModel from "./models/role.js";
import userRoleModel from "./models/userRole.js";

import athleteModel from "./models/athlete.js";
import clubModel from "./models/club.js";
import raceClassModel from "./models/raceClass.js";
import athleteRaceClassModel from "./models/athleteRaceClass.js";

dotenv.config();

// ==============================
// Sequelize Verbindung
// ==============================
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// ==============================
// Models initialisieren
// ==============================
const user = userModel(sequelize, DataTypes);
const role = roleModel(sequelize, DataTypes);
const userRole = userRoleModel(sequelize);

const athlete = athleteModel(sequelize, DataTypes);
const club = clubModel(sequelize, DataTypes);
const raceClass = raceClassModel(sequelize, DataTypes);
const athleteRaceClass = athleteRaceClassModel(sequelize);

// ==============================
// DB Objekt
// ==============================
const db = {
  sequelize,
  Sequelize,

  user,
  role,
  userRole,

  athlete,
  club,
  raceClass,
  athleteRaceClass,
};

// ==============================
// Associations ausführen
// ==============================
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

// ==============================
// Export
// ==============================
export default db;