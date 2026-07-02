import db from "../db/index.js";

const { race, raceMode, raceClass, athlete, club, danishScoringRound, raceAthlete, raceEntry } = db;

// ==============================
// GET ALL
// ==============================
async function getAllRaces(req, res) {
  try {
    const races = await race.findAll({
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes", include: [{ model: raceClass, as: "raceClasses" }, { model: club, as: "club" }] },
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
        { model: athlete, as: "athletes", include: [{ model: raceClass, as: "raceClasses" }, { model: club, as: "club" }] },
        { model: danishScoringRound, as: "danishScoringRounds" },
        { model: raceEntry, as: "raceEntries", order: [["sortOrder", "ASC"]] },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    // raceAthlete-Pivot-Daten mit zurückgeben (Ergebnisse)
    const athleteResults = await raceAthlete.findAll({
      where: { raceId: found.id },
    });

    res.json({ ...found.toJSON(), athleteResults });
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
      time,
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
      time: time || null,
      raceModeId,
      rounds: rounds ?? null,
      scoringInterval: scoringInterval ?? 1,
      lapdownMode: lapdownMode ?? "lapped",
      lapdownPointsWin: lapdownMode === "points" ? lapdownPointsWin : null,
      lapdownPointsLoss: lapdownMode === "points" ? lapdownPointsLoss : null,
      pointsFirst: pointsFirst ?? null,
      pointsSecond: pointsSecond ?? null,
      pointsThird: pointsThird ?? null,
      pointsFourth: pointsFourth ?? null,
    });

    if (raceClasses.length > 0) {
      await newRace.setRaceClasses(raceClasses);
    }

    if (athletes.length > 0) {
      await newRace.setAthletes(athletes);
    }

    if (danishScoringRounds.length > 0) {
      const rounds = danishScoringRounds.map((r) => ({
        ...r,
        raceId: newRace.id,
      }));
      await danishScoringRound.bulkCreate(rounds);
    }

    const result = await race.findByPk(newRace.id, {
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes", include: [{ model: raceClass, as: "raceClasses" }, { model: club, as: "club" }] },
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
      time,
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
    if (time !== undefined) found.time = time || null;
    if (raceModeId !== undefined) found.raceModeId = raceModeId;
    if (rounds !== undefined) found.rounds = rounds;
    if (scoringInterval !== undefined) found.scoringInterval = scoringInterval;

    if (lapdownMode !== undefined) {
      found.lapdownMode = lapdownMode;
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
        { model: athlete, as: "athletes", include: [{ model: raceClass, as: "raceClasses" }, { model: club, as: "club" }] },
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

    await danishScoringRound.destroy({ where: { raceId: found.id } });
    await raceEntry.destroy({ where: { raceId: found.id } });

    await found.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Rennens." });
  }
}

// ==============================
// SAVE RESULTS
// Nimmt berechnete Ergebnisse + rohe Entries entgegen und speichert sie.
// Idempotent: überschreibt immer den kompletten Stand.
// Body: { results: [...], entries: [...] }
// ==============================
async function saveRaceResults(req, res) {
  try {
    const found = await race.findByPk(req.params.id, {
      include: [{ model: athlete, as: "athletes" }],
    });

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    const { results = [], entries = [] } = req.body;

    // ---- 1. Rohe Entries speichern (alte löschen, neue anlegen) ----
    await raceEntry.destroy({ where: { raceId: found.id } });

    if (entries.length > 0) {
      const entryRows = entries.map((e, idx) => ({
        raceId: found.id,
        sortOrder: idx,
        type: e.type,
        roundNumber: e.roundNumber ?? null,
        isLast: e.isLast ?? false,
        positions: e.positions ?? null,
        athleteNumber: e.athleteNumber ?? null,
      }));
      await raceEntry.bulkCreate(entryRows);
    }

    // ---- 2. Ergebnisse in raceAthlete-Pivot schreiben ----
    // Athlete-IDs nach Startnummer aufschlüsseln
    const athleteMap = {};
    for (const a of found.athletes) {
      athleteMap[a.raceNumber] = a.id;
    }

    for (const r of results) {
      const athleteId = athleteMap[r.athleteNumber];
      if (!athleteId) continue;

      await raceAthlete.update(
        {
          finalPosition: r.dnf || r.eliminated ? null : (r.finalPosition ?? null),
          points: r.points ?? null,
          laps: r.laps ?? 0,
          dnf: r.dnf ?? false,
          eliminated: r.eliminated ?? false,
        },
        { where: { raceId: found.id, athleteId } }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Speichern der Ergebnisse." });
  }
}

// ==============================
// GET RACE SESSION (Entries + Results für eine laufende/gespeicherte Session)
// ==============================
async function getRaceSession(req, res) {
  try {
    const found = await race.findByPk(req.params.id, {
      include: [
        { model: raceMode, as: "raceMode" },
        { model: raceClass, as: "raceClasses" },
        { model: athlete, as: "athletes", include: [{ model: raceClass, as: "raceClasses" }, { model: club, as: "club" }] },
        { model: danishScoringRound, as: "danishScoringRounds" },
        { model: raceEntry, as: "raceEntries" },
      ],
    });

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    // Entries sortiert nach sortOrder zurückgeben
    const sortedEntries = (found.raceEntries || []).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    // Pivot-Ergebnisse
    const athleteResults = await raceAthlete.findAll({
      where: { raceId: found.id },
    });

    res.json({
      race: { ...found.toJSON(), raceEntries: sortedEntries },
      athleteResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Rennsession." });
  }
}

// ==============================
// COMPLETE RACE
// Setzt isCompleted auf true (oder toggle)
// ==============================
async function completeRace(req, res) {
  try {
    const found = await race.findByPk(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Rennen nicht gefunden." });
    }

    found.isCompleted = req.body.isCompleted ?? true;
    await found.save();

    res.json({ success: true, isCompleted: found.isCompleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Abschließen des Rennens." });
  }
}

export {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace,
  saveRaceResults,
  getRaceSession,
  completeRace,
};
