export default (sequelize, DataTypes) => {
  const club = sequelize.define(
    "club",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
    }
  );

  club.associate = (models) => {
    // ==============================
    // Verein hat viele Athleten
    // ==============================
    club.hasMany(models.athlete, {
      foreignKey: "clubId",
      as: "athletes",
    });
  };

  return club;
};