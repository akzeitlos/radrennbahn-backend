export default (sequelize, DataTypes) => {
  const athlete = sequelize.define(
    "athlete",
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      raceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      gender: {
        type: DataTypes.ENUM("male", "female", "diverse"),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    },
  );

  athlete.associate = (models) => {
    // ==============================
    // Verein
    // ==============================
    athlete.belongsTo(models.club, {
      foreignKey: "clubId",
      as: "club",
    });

    // ==============================
    // Rennklassen
    // ==============================
    athlete.belongsToMany(models.raceClass, {
      through: models.athleteRaceClass,
      as: "raceClasses",
    });

    // ==============================
    // Rennen
    // ==============================
    athlete.belongsToMany(models.race, {
      through: models.raceAthlete,
      as: "races",
    });
  };

  return athlete;
};
