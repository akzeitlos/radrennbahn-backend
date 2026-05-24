// Pivot-Tabelle: Rennen ↔ Athleten
// Enthält das Endergebnis eines Athleten in einem Rennen.
export default (sequelize, DataTypes) => {
  const raceAthlete = sequelize.define(
    "raceAthlete",
    {
      // Endplatzierung (1, 2, 3 ...)
      finalPosition: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      // Gesamtpunkte (für Punktemodi)
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      // Rundendifferenz (lapdownMode === "lapped")
      laps: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      // DNF-Flag
      dnf: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // Ausgeschieden (Ausscheidungsrennen)
      eliminated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return raceAthlete;
};
