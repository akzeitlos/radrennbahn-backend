export default (sequelize, DataTypes) => {
  const raceMode = sequelize.define(
    "raceMode",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
    }
  );

  raceMode.associate = (models) => {
    raceMode.hasMany(models.race, {
      foreignKey: "raceModeId",
      as: "races",
    });
  };

  return raceMode;
};