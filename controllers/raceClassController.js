import db from "../db/index.js";
const { raceClass, athlete } = db;

async function getAllRaceClasses(req, res) {
  try {
    const classes = await raceClass.findAll({
      include: [
        {
          model: athlete,
          as: "athletes",
        },
      ],
    });

    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Rennklassen." });
  }
}

async function getRaceClassById(req, res) {
  try {
    const found = await raceClass.findByPk(req.params.id, {
      include: [
        {
          model: athlete,
          as: "athletes",
        },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Rennklasse nicht gefunden." });
    }

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen der Rennklasse." });
  }
}

async function createRaceClass(req, res) {
  try {
    const { name, description } = req.body;

    const newClass = await raceClass.create({
      name,
      description,
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen der Rennklasse." });
  }
}

async function updateRaceClass(req, res) {
  try {
    const found = await raceClass.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennklasse nicht gefunden." });
    }

    const { name, description } = req.body;

    if (name !== undefined) found.name = name;
    if (description !== undefined) found.description = description;

    await found.save();

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Rennklasse." });
  }
}

async function deleteRaceClass(req, res) {
  try {
    const found = await raceClass.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennklasse nicht gefunden." });
    }

    await found.destroy();

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen der Rennklasse." });
  }
}

export {
  getAllRaceClasses,
  getRaceClassById,
  createRaceClass,
  updateRaceClass,
  deleteRaceClass,
};