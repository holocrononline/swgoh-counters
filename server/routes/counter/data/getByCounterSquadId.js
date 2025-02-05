const fs = require('fs');
const path = require('path');

module.exports = ({ database, log }) => counterSquadId => {
  const sql = fs.readFileSync(path.join(__dirname, './sql/getByCounterSquadId.sql')).toString();

  return new Promise((res, rej) => {
    database.query(sql, counterSquadId, (error, results) => {
      if (error) { rej(error); }

      if (!results || (results && !results.length)) {
        log.warn(`Counters don't exist for counterSquadId: ${counterSquadId}`);
        return res({});
      }

      return res(JSON.parse(JSON.stringify(results)));
    });
  }).catch(err => {
    throw err;
  });
};
