const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

module.exports = async ({ database }, {
  name,
  description,
  counterStrategy,
  toon1Id,
  toon2Id,
  toon3Id,
  toon4Id,
  toon5Id,
}) => {
  const versionSql = fs.readFileSync(path.join(__dirname, './sql/createVersion.sql')).toString();
  const sql = fs.readFileSync(path.join(__dirname, './sql/create.sql')).toString();
  const versionId = nanoid();
  const squadId = nanoid();

  const versionVariables = [
    versionId,
    squadId,
    description,
    counterStrategy,
    toon1Id,
    toon2Id,
    toon3Id,
    toon4Id,
    toon5Id,
    new Date().toISOString(),
    'user1',
  ];

  const variables = [
    squadId,
    name,
    versionId,
  ];

  const response = new Promise((res, rej) => {
    database.getConnection((databaseConnectionError, connection) => {
      if (databaseConnectionError) {
        connection.release();
        rej(databaseConnectionError);
      }

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          connection.release();
          rej(transactionError);
        }

        connection.query(versionSql, versionVariables, (versionError, versionResults) => {
          if (versionError) {
            return connection.rollback(() => {
              connection.release();
              rej(versionError);
            });
          }

          connection.query(sql, variables, (sqlError, sqlResults) => {
            if (sqlError) {
              return connection.rollback(() => {
                connection.release();
                rej(sqlError);
              });
            }

            connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  connection.release();
                  rej(commitError);
                });
              }

              return console.info(`Squad for ${squadId} successfully updated.`);
            });

            return '';
          });

          console.info(`Squad Version for ${squadId} successfully created.`);
          connection.release();
          return res('ok');
        });
      });
    });
  });

  try {
    const res = await response;
    return { res, squadId };
  } catch (err) {
    return new Error(err);
  }
};
