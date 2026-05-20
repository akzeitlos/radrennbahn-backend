import db from "../db/index.js";
const { club, athlete } = db;

async function getAllClubs(req, res) {
  try {
    const clubs = await club.findAll({
      include: [
        {
          model: athlete,
          as: "athletes",
        },
      ],
    });

    res.json(clubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Vereine." });
  }
}

async function getClubById(req, res) {
  try {
    const foundClub = await club.findByPk(req.params.id, {
      include: [
        {
          model: athlete,
          as: "athletes",
        },
      ],
    });

    if (!foundClub) {
      return res.status(404).json({ error: "Verein nicht gefunden." });
    }

    res.json(foundClub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen des Vereins." });
  }
}

async function createClub(req, res) {
  try {
    const { name } = req.body;

    const newClub = await club.create({
      name,
    });

    res.status(201).json(newClub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen des Vereins." });
  }
}

async function updateClub(req, res) {
  try {
    const foundClub = await club.findByPk(req.params.id);

    if (!foundClub) {
      return res.status(404).json({ error: "Verein nicht gefunden." });
    }

    const { name, shortName, city } = req.body;

    if (name !== undefined) foundClub.name = name;

    await foundClub.save();

    res.json(foundClub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Vereins." });
  }
}

async function deleteClub(req, res) {
  try {
    const foundClub = await club.findByPk(req.params.id);

    if (!foundClub) {
      return res.status(404).json({ error: "Verein nicht gefunden." });
    }

    await foundClub.destroy();

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Vereins." });
  }
}

export {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
};