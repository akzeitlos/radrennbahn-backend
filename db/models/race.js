export default (sequelize, DataTypes) => {
  const race = sequelize.define(
    "race",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // Optionale Startzeit im Format "HH:MM" (24h)
      time: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },

      rounds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      // Aller wieviel Runden wird gewertet
      scoringInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // Überrundung: Punkteverlust oder nur Überrundung registrieren
      lapdownMode: {
        type: DataTypes.ENUM("points", "lapped"),
        allowNull: false,
        defaultValue: "lapped",
      },

      // Nur relevant wenn lapdownMode === "points"
      lapdownPointsWin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      lapdownPointsLoss: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      // Punkte für die Platzierungen (Punkterennen, Temporennen)
      pointsFirst: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      pointsSecond: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      pointsThird: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      pointsFourth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    },
  );

  race.associate = (models) => {
    // Rennmodus
    race.belongsTo(models.raceMode, {
      foreignKey: "raceModeId",
      as: "raceMode",
    });

    // Rennklassen (many-to-many)
    race.belongsToMany(models.raceClass, {
      through: "raceRaceClasses",
      as: "raceClasses",
    });

    // Athleten (many-to-many, über eigene Pivot-Tabelle)
    race.belongsToMany(models.athlete, {
      through: models.raceAthlete,
      as: "athletes",
    });

    // Dänische Punkterennen Wertungsrunden
    race.hasMany(models.danishScoringRound, {
      foreignKey: "raceId",
      as: "danishScoringRounds",
    });

    // Rohe Rennsession-Einträge
    race.hasMany(models.raceEntry, {
      foreignKey: "raceId",
      as: "raceEntries",
    });
  };

  return race;
};
