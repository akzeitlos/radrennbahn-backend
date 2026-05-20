import db from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import crypto from "crypto";
import nodemailer from "nodemailer";

const { user, role } = db;

// 🔑 Login: Authenticate user by email/username and password
export const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find user by email or username, exclude deleted users
    const existingUser = await user.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { email: emailOrUsername },
              { username: emailOrUsername },
            ],
          },
          { deleted: false },
        ],
      },
      include: [
        { model: role, as: "roles" }, // <-- 'roles' hier unbedingt verwenden
      ],
    });

    // If user not found, return 401 Unauthorized
    if (!existingUser) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Check password hash
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Create JWT token with user info and roles, valid for 2 hours
    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        roles: existingUser.roles.map((r) => r.name),
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Return token and user info in response
    res.json({
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        roles: existingUser.roles.map((r) => r.name),
      },
    });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
};

// 🧾 "Who am I?" endpoint: Returns profile of logged-in user
export const me = async (req, res) => {
  try {
    // Find user by ID from auth middleware token
    const currentUser = await user.findByPk(req.user.id, {
      include: [
        { model: role, as: "roles" }, // <-- 'roles' hier unbedingt verwenden
      ],
      attributes: { exclude: ["passwordHash"] }, // Exclude password hash
    });

    if (!currentUser) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    // Return user info including roles
    res.json({
      user: {
        ...currentUser.toJSON(),
        roles: currentUser.roles.map((r) => r.name),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden des Profils" });
  }
};

// ✅ Register new user (usually by admins only)
export const register = async (req, res) => {
  const {
    email,
    username,
    password,
    firstname,
    lastname,
    roles = [],
  } = req.body;

  try {
    // Check if email already exists
    const existing = await user.findOne({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Benutzer mit dieser E-Mail existiert bereits" });
    }

    // Hash password for secure storage
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user without roles
    const newUser = await user.create({
      email,
      username,
      passwordHash,
      firstname,
      lastname,
    });

    // Assign roles if provided
    if (roles.length > 0) {
      const foundRoles = await role.findAll({
        where: { name: roles },
      });
      await newUser.setRoles(foundRoles);
    }

    res.status(201).json({ message: "Benutzer erfolgreich erstellt" });
  } catch (err) {
    console.error("Fehler bei Registrierung:", err);
    res.status(500).json({ message: "Registrierung fehlgeschlagen" });
  }
};

// 🚪 Logout: Simple endpoint as token is client-side managed
export const logout = async (req, res) => {
  // No server-side action needed since JWT is stateless
  res.json({ message: "Logout erfolgreich (Client-seitig Token entfernen)" });
};

// 🔑 Request password reset: Sends reset link via email
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email who is not deleted
    const existingUser = await user.findOne({
      where: { email, deleted: false },
    });

    // Always return success for security reasons even if user doesn't exist
    if (!existingUser) {
      return res.status(200).json({
        message: "Wenn deine E-Mail registriert ist, erhältst du einen Link.",
      });
    }

    // Generate random token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Save token and expiry to DB
    await existingUser.update({
      resetToken,
      resetTokenExpires: expires,
    });

    // Construct frontend reset link with token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Configure email transporter (e.g. Gmail, SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send reset email with link
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: existingUser.email,
      subject: "Passwort zurücksetzen",
      html: `<p>Hier kannst du dein Passwort zurücksetzen:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    // Return success message
    res.json({
      message: "Wenn deine E-Mail registriert ist, erhältst du einen Link.",
    });
  } catch (err) {
    console.error("Reset-Passwort Fehler:", err);
    res.status(500).json({ message: "Fehler beim Versenden der E-Mail" });
  }
};

// 🔑 Reset password: Validate token and set new password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with valid token and expiry date in the future
    const existingUser = await user.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: new Date() },
      },
    });

    // If token invalid or expired, return error
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Token ist ungültig oder abgelaufen" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Save new password and remove reset token fields
    await existingUser.update({
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    });

    res.json({ message: "Passwort erfolgreich zurückgesetzt" });
  } catch (err) {
    console.error("Passwort-Reset-Fehler:", err);
    res.status(500).json({ message: "Fehler beim Zurücksetzen" });
  }
};
