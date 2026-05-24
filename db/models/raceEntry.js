// Speichert die rohen Eingaben einer Rennsession (Wertungsrunden, Zieleinlauf,
// Überrundungen, DNF) — damit das Rennen jederzeit vollständig rekonstruiert
// werden kann und die Berechnung clientseitig neu durchgeführt werden kann.
export default (sequelize, DataTypes) => {
  const raceEntry = sequelize.define(
    "raceEntry",
    {
      // Typ: "scoring" | "finish" | "lapup" | "lapdown" | "dnf"
      type: {
        type: DataTypes.ENUM("scoring", "finish", "lapup", "lapdown", "dnf"),
        allowNull: false,
      },

      // Sortierung / Reihenfolge der Einträge
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      // Für "scoring": Wertungsrunden-Nummer
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      // Für "scoring": War das die letzte Wertungsrunde?
      isLast: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },

      // Für "scoring" und "finish": Reihenfolge als JSON-Array von Startnummern
      // z.B. [12, 5, 7, 3]
      positions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },

      // Für "lapup", "lapdown", "dnf": Startnummer des betroffenen Athleten
      athleteNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
    }
  );

  raceEntry.associate = (models) => {
    raceEntry.belongsTo(models.race, {
      foreignKey: "raceId",
      as: "race",
    });
  };

  return raceEntry;
};
