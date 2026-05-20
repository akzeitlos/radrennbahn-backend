import db from "../db/index.js";
const { athlete, club, raceClass } = db;

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

    // FIX: Wenn clubId 0, "" oder nicht gesetzt ist, wandle sie in null um
    const sanitizedClubId = clubId === 0 || clubId === "" ? null : clubId;

    const newAthlete = await athlete.create({
      firstname,
      lastname,
      raceNumber,
      gender,
      clubId: sanitizedClubId, // Bereinigten Wert nutzen
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
    
    // FIX: Auch beim Update prüfen, ob der Verein abgewählt wurde (0 oder "")
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

export {
  getAllAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  deleteAthlete,
};