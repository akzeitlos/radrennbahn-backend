// Pivot-Tabelle: Rennen ↔ Athleten
// Hier können später noch Felder ergänzt werden,
// z.B. Startnummer im Rennen, Status (DNS/DNF), Endergebnis etc.
export default (sequelize, DataTypes) => {
  const raceAthlete = sequelize.define(
    "raceAthlete",
    {
      // Platzhalter für spätere Rennablauf-Daten
      // z.B. finalPosition, dnf, dns ...
    },
    {
      timestamps: true,
    }
  );

  // Keine eigenen Associations nötig —
  // wird von race und athlete über belongsToMany verwaltet

  return raceAthlete;
};