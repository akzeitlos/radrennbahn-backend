export default (sequelize) => {
  const athleteRaceClass = sequelize.define(
    "athleteRaceClass",
    {},
    {
      timestamps: false,
      tableName: "athlete_race_classes",
    }
  );

  return athleteRaceClass;
};