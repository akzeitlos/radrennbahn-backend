import db from "../db/index.js";
const { athlete, club, raceClass, race, raceMode, raceAthlete } = db;

async function getAllAthletes(req, res) {
  try {
    const athletes = await athlete.findAll({
      include: [
        { model: club, as: "club" },
        { model: raceClass, as: "raceClasses" },
      ],
    });
    res.json(athletes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Athleten." });
  }
}

async function getAthleteById(req, res) {
  try {
    const found = await athlete.findByPk(req.params.id, {
      include: [
        { model: club, as: "club" },
        { model: raceClass, as: "raceClasses" },
        {
          model: race,
          as: "races",
          include: [{ model: raceMode, as: "raceMode" }],
          through: { attributes: ["finalPosition", "points", "laps", "dnf", "eliminated"] },
        },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Athlet nicht gefunden." });
    }

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen des Athleten." });
  }
}

async function createAthlete(req, res) {
  try {
    const {
      firstname,
      lastname,
      raceNumber,
      gender,
      clubId,
      raceClasses = [],
    } = req.body;

    const sanitizedClubId = clubId === 0 || clubId === "" ? null : clubId;

    const newAthlete = await athlete.create({
      firstname,
      lastname,
      raceNumber,
      gender,
      clubId: sanitizedClubId,
    });

    if (raceClasses.length > 0) {
      await newAthlete.setRaceClasses(raceClasses);
    }

    const result = await athlete.findByPk(newAthlete.id, {
      include: [
        { model: club, as: "club" },
        { model: raceClass, as: "raceClasses" },
      ],
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen des Athleten." });
  }
}

async function updateAthlete(req, res) {
  try {
    const found = await athlete.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Athlet nicht gefunden." });
    }

    const {
      firstname,
      lastname,
      raceNumber,
      gender,
      clubId,
      raceClasses,
    } = req.body;

    if (firstname !== undefined) found.firstname = firstname;
    if (lastname !== undefined) found.lastname = lastname;
    if (raceNumber !== undefined) found.raceNumber = raceNumber;
    if (gender !== undefined) found.gender = gender;

    if (clubId !== undefined) {
      found.clubId = clubId === 0 || clubId === "" ? null : clubId;
    }

    await found.save();

    if (raceClasses) {
      await found.setRaceClasses(raceClasses);
    }

    const updated = await athlete.findByPk(found.id, {
      include: [
        { model: club, as: "club" },
        { model: raceClass, as: "raceClasses" },
      ],
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Athleten." });
  }
}

async function deleteAthlete(req, res) {
  try {
    const found = await athlete.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Athlet nicht gefunden." });
    }

    await found.destroy();

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Athleten." });
  }
}

// ==============================
// GET RACE HISTORY für einen Athleten
// Gibt alle Rennen zurück, an denen der Athlet teilgenommen hat,
// inkl. Ergebnisse aus der raceAthlete-Pivot-Tabelle.
// ==============================
async function getAthleteRaceHistory(req, res) {
  try {
    const found = await athlete.findByPk(req.params.id, {
      include: [
        {
          model: race,
          as: "races",
          include: [{ model: raceMode, as: "raceMode" }],
          through: { attributes: ["finalPosition", "points", "laps", "dnf", "eliminated"] },
        },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Athlet nicht gefunden." });
    }

    // Rennen nach Datum sortieren (neueste zuerst)
    const races = (found.races || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(races);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Rennhistorie." });
  }
}

export {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
  getAthleteRaceHistory,
};
