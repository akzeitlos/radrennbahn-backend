import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import athleteRoutes from "./routes/athleteRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import raceClassRoutes from "./routes/raceClassRoutes.js";
import raceRoutes from "./routes/raceRoutes.js";
import raceModeRoutes from "./routes/raceModeRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/race-classes", raceClassRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/race-modes", raceModeRoutes);

async function bootstrap() {
  try {
    await db.sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Database synced");
    const { user, role } = db;

    // =========================
    // 🔹 ADMIN ROLE
    // =========================
    let adminRole = await role.findOne({
      where: { name: "admin" },
    });

    if (!adminRole) {
      adminRole = await role.create({ name: "admin" });
      console.log("Admin role created");
    }

    // =========================
    // 🔹 ADMIN USER
    // =========================
    let adminUser = await user.findOne({
      where: { email: "kontakt@creative-codes.de" },
    });

    if (!adminUser) {
      const passwordHash = await bcrypt.hash("12341234", 10);
      adminUser = await user.create({
        email: "kontakt@creative-codes.de",
        username: "akzeitlos",
        firstname: "Andreas",
        lastname: "Krüger",
        passwordHash,
      });
      console.log("Admin user created");
    }

    // =========================
    // 🔹 ROLE ZUWEISUNG
    // =========================
    const roles = await adminUser.getRoles();
    const hasAdminRole = roles.some((r) => r.name === "admin");

    if (!hasAdminRole) {
      await adminUser.addRole(adminRole);
      console.log("Admin role assigned");
    }

    console.log("Bootstrap completed");
  } catch (err) {
    console.error("Bootstrap error:", err);
  }

  app.listen(5000, () => {
    console.log("Backend läuft auf http://localhost:5000");
  });
}

bootstrap();
