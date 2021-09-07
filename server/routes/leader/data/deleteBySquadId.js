const fs = require( 'fs' );
const path = require( 'path' );

module.exports = ( { database } ) => variables => {
  const sql = fs.readFileSync( path.join( __dirname, './sql/delete.sql' )).toString();

  return new Promise(( res, rej ) => {
    database.query( sql, variables, ( error, results ) => {
      if ( error ) { rej( error ); }

      if ( results.affectedRows === 0 ) {
        rej( new Error( 'Leader squad does not exist.' ));
      }

      return res( 'ok' );
    } );
  } ).catch( e => {
    throw e;
  } );
};
