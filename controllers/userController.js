import db from "../db/index.js";
import bcrypt from "bcrypt";
const { user, role } = db;

const SALT_ROUNDS = 10;

async function getAllUsers(req, res) {
  try {
    const users = await user.findAll({
      where: { deleted: false },
      include: [
        { model: role, as: "roles" }, // <-- 'roles' hier unbedingt verwenden
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Laden der Benutzer." });
  }
}

async function getUserById(req, res) {
  try {
    const foundUser = await user.findByPk(req.params.id, {
      include: [
        { model: role, as: "roles" }, // <-- 'roles' alias verwenden
      ],
    });
    if (!foundUser || foundUser.deleted) {
      return res.status(404).json({ error: "Benutzer nicht gefunden." });
    }
    res.json(foundUser);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Abrufen des Benutzers." });
  }
}

async function createUser(req, res) {
  try {
    const {
      email,
      username,
      password,
      firstname,
      lastname,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await user.create({
      email,
      username,
      passwordHash,
      firstname,
      lastname,
    });

    if (req.body.roles) {
      await newUser.setRoles(req.body.roles);
    }

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen des Benutzers." });
  }
}

async function updateUser(req, res) {
  try {
    const foundUser = await user.findByPk(req.params.id);
    if (!foundUser || foundUser.deleted) {
      return res.status(404).json({ error: "Benutzer nicht gefunden." });
    }

    const {
      email,
      username,
      password,
      firstname,
      lastname,
    } = req.body;

    if (email !== undefined) foundUser.email = email;
    if (username !== undefined) foundUser.username = username;
    if (firstname !== undefined) foundUser.firstname = firstname;
    if (lastname !== undefined) foundUser.lastname = lastname;

    if (password) {
      foundUser.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await foundUser.save();

    // Update associations
    if (req.body.roles) {
      await foundUser.setRoles(req.body.roles);
    }

    // 🔁 Hier relationalen User erneut holen:
    const updatedUser = await user.findByPk(foundUser.id, {
      include: [
        { model: role, as: "roles" },
      ],
    });

    res.json(updatedUser); // ✅ enthält jetzt auch Rollen & Bereiche
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Benutzers." });
  }
}

async function deleteUser(req, res) {
  try {
    const foundUser = await user.findByPk(req.params.id);
    if (!foundUser || foundUser.deleted) {
      return res.status(404).json({ error: "Benutzer nicht gefunden." });
    }

    foundUser.deleted = true;
    await foundUser.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Löschen des Benutzers." });
  }
}

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
