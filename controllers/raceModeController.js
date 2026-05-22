import db from "../db/index.js";

const { raceMode } = db;

// ==============================
// GET ALL
// ==============================
async function getAllRaceModes(req, res) {
  try {
    const raceModes = await raceMode.findAll();
    res.json(raceModes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Rennmodi." });
  }
}

// ==============================
// GET BY ID
// ==============================
async function getRaceModeById(req, res) {
  try {
    const found = await raceMode.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennmodus nicht gefunden." });
    }

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen des Rennmodus." });
  }
}

// ==============================
// CREATE
// ==============================
async function createRaceMode(req, res) {
  try {
    const { title, slug, description } = req.body;

    const newRaceMode = await raceMode.create({ title, slug, description });

    res.status(201).json(newRaceMode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen des Rennmodus." });
  }
}

// ==============================
// UPDATE
// ==============================
async function updateRaceMode(req, res) {
  try {
    const found = await raceMode.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennmodus nicht gefunden." });
    }

    const { title, slug, description } = req.body;

    if (title !== undefined) found.title = title;
    if (slug !== undefined) found.slug = slug;
    if (description !== undefined) found.description = description;

    await found.save();

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Rennmodus." });
  }
}

// ==============================
// DELETE
// ==============================
async function deleteRaceMode(req, res) {
  try {
    const found = await raceMode.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennmodus nicht gefunden." });
    }

    // Prüfen ob noch Rennen mit diesem Modus existieren
    const linkedRaces = await found.getRaces();
    if (linkedRaces.length > 0) {
      return res.status(409).json({
        error:
          "Rennmodus kann nicht gelöscht werden, da noch Rennen damit verknüpft sind.",
      });
    }

    await found.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Rennmodus." });
  }
}

export {
  getAllRaceModes,
  getRaceModeById,
  createRaceMode,
  updateRaceMode,
  deleteRaceMode,
};
