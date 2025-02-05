const admin = require( 'firebase-admin' );

module.exports = async ( request, reply ) => {
  const { authorization } = request.headers;
  const authScheme = authorization && authorization.split( ' ' )[ 0 ];

  if ( authorization && authScheme === 'Bearer' ) {
    const token = authorization.split( ' ' )[ 1 ];
    request.authToken = token;
  } else {
    request.authToken = null;
  }
  const { authToken } = request;

  try {
    const userInfo = await admin.auth().verifyIdToken( authToken );
    request.authId = userInfo.uid;
  } catch ( err ) {
    console.error( 'Firebase Auth Error', err );
    throw err;
  }
};
