export default (sequelize, DataTypes) => {
  const raceClass = sequelize.define(
    "raceClass",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  raceClass.associate = (models) => {
    raceClass.belongsToMany(models.athlete, {
      through: models.athleteRaceClass,
      as: "athletes",
    });
  };

  return raceClass;
};