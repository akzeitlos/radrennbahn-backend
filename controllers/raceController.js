import db from "../db/index.js";

const { race, raceMode, raceClass, athlete, danishScoringRound } = db;

// ==============================
// GET ALL
// ==============================
async function getAllRaces(req, res) {
  try {
    const races = await race.findAll({
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes" },
        { model: danishScoringRound, as: "danishScoringRounds" },
      ],
    });
    res.json(races);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Rennen." });
  }
}

// ==============================
// GET BY ID
// ==============================
async function getRaceById(req, res) {
  try {
    const found = await race.findByPk(req.params.id, {
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes" },
        { model: danishScoringRound, as: "danishScoringRounds" },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    res.json(found);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abrufen des Rennens." });
  }
}

// ==============================
// CREATE
// ==============================
async function createRace(req, res) {
  try {
    const {
      date,
      raceModeId,
      rounds,
      scoringInterval,
      lapdownMode,
      lapdownPointsWin,
      lapdownPointsLoss,
      pointsFirst,
      pointsSecond,
      pointsThird,
      pointsFourth,
      raceClasses = [],
      athletes = [],
      danishScoringRounds = [],
    } = req.body;

    const newRace = await race.create({
      date,
      raceModeId,
      rounds,
      scoringInterval,
      lapdownMode,
      // Nur speichern wenn lapdownMode === "points", sonst null
      lapdownPointsWin: lapdownMode === "points" ? lapdownPointsWin : null,
      lapdownPointsLoss: lapdownMode === "points" ? lapdownPointsLoss : null,
      pointsFirst: pointsFirst ?? null,
      pointsSecond: pointsSecond ?? null,
      pointsThird: pointsThird ?? null,
      pointsFourth: pointsFourth ?? null,
    });

    // Rennklassen setzen
    if (raceClasses.length > 0) {
      await newRace.setRaceClasses(raceClasses);
    }

    // Athleten setzen
    if (athletes.length > 0) {
      await newRace.setAthletes(athletes);
    }

    // Dänische Wertungsrunden anlegen
    if (danishScoringRounds.length > 0) {
      const rounds = danishScoringRounds.map((r) => ({
        ...r,
        raceId: newRace.id,
      }));
      await danishScoringRound.bulkCreate(rounds);
    }

    // Vollständiges Objekt zurückgeben
    const result = await race.findByPk(newRace.id, {
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes" },
        { model: danishScoringRound, as: "danishScoringRounds" },
      ],
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Erstellen des Rennens." });
  }
}

// ==============================
// UPDATE
// ==============================
async function updateRace(req, res) {
  try {
    const found = await race.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    const {
      date,
      raceModeId,
      rounds,
      scoringInterval,
      lapdownMode,
      lapdownPointsWin,
      lapdownPointsLoss,
      pointsFirst,
      pointsSecond,
      pointsThird,
      pointsFourth,
      raceClasses,
      athletes,
      danishScoringRounds,
    } = req.body;

    if (date !== undefined) found.date = date;
    if (raceModeId !== undefined) found.raceModeId = raceModeId;
    if (rounds !== undefined) found.rounds = rounds;
    if (scoringInterval !== undefined) found.scoringInterval = scoringInterval;

    if (lapdownMode !== undefined) {
      found.lapdownMode = lapdownMode;
      // Wenn auf "lapped" gewechselt wird, Punkte zurücksetzen
      if (lapdownMode === "lapped") {
        found.lapdownPointsWin = null;
        found.lapdownPointsLoss = null;
      }
    }

    if (lapdownPointsWin !== undefined && found.lapdownMode === "points") {
      found.lapdownPointsWin = lapdownPointsWin;
    }
    if (lapdownPointsLoss !== undefined && found.lapdownMode === "points") {
      found.lapdownPointsLoss = lapdownPointsLoss;
    }

    if (pointsFirst !== undefined) found.pointsFirst = pointsFirst ?? null;
    if (pointsSecond !== undefined) found.pointsSecond = pointsSecond ?? null;
    if (pointsThird !== undefined) found.pointsThird = pointsThird ?? null;
    if (pointsFourth !== undefined) found.pointsFourth = pointsFourth ?? null;

    await found.save();

    if (raceClasses !== undefined) {
      await found.setRaceClasses(raceClasses);
    }

    if (athletes !== undefined) {
      await found.setAthletes(athletes);
    }

    // Dänische Runden: alte löschen, neue anlegen
    if (danishScoringRounds !== undefined) {
      await danishScoringRound.destroy({ where: { raceId: found.id } });

      if (danishScoringRounds.length > 0) {
        const newRounds = danishScoringRounds.map((r) => ({
          ...r,
          raceId: found.id,
        }));
        await danishScoringRound.bulkCreate(newRounds);
      }
    }

    const updated = await race.findByPk(found.id, {
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes" },
        { model: danishScoringRound, as: "danishScoringRounds" },
      ],
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Rennens." });
  }
}

// ==============================
// DELETE
// ==============================
async function deleteRace(req, res) {
  try {
    const found = await race.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    // Dänische Wertungsrunden mitlöschen
    await danishScoringRound.destroy({ where: { raceId: found.id } });

    await found.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Rennens." });
  }
}

export {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace,
};