export default (sequelize, DataTypes) => {
  const danishScoringRound = sequelize.define(
    "danishScoringRound",
    {
      // Welche Wertungsrunde (1., 2., 3., ...)
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Punkte pro Platz als JSON-Array, z.B. [5, 3, 2, 1]
      // Länge des Arrays bestimmt, wieviele Plätze gewertet werden
      pointsDistribution: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  danishScoringRound.associate = (models) => {
    danishScoringRound.belongsTo(models.race, {
      foreignKey: "raceId",
      as: "race",
    });
  };

  return danishScoringRound;
};