const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not configured in environment variables.');
  process.exit(1);
}

/**
 * Express middleware to protect routes.
 * It expects a header of the form: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  // 1. Retrieve the authorization header from the incoming HTTP request.
  // The header name is case-insensitive, but Express standardizes it to lowercase.
  const authHeader = req.headers['authorization'];
  
  // 2. Extract the token from the header.
  // The standard format is: "Bearer TOKEN_STRING".
  // If the header exists, we split it by space and take the second element (the token).
  // If the header does not exist, 'token' remains undefined.
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Reject the request if no token is present.
  // If token is missing, the client has not logged in or failed to send the credential.
  // We return HTTP Status code 401 (Unauthorized) along with a clear error message.
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. Authorization token missing in request headers.' 
    });
  }

  // 4. Verify the integrity and validity of the JSON Web Token.
  // jwt.verify() checks:
  //   a. That the token was signed with our specific server-side JWT_SECRET.
  //   b. That the token signature is valid (not tampered with).
  //   c. That the expiration time ('exp' claim) has not passed.
  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    
    // 5. Handle verification failures.
    // If the signature is invalid, tampered with, or expired, 'err' will be defined.
    // In this case, we return HTTP Status code 403 (Forbidden) indicating the token is invalid.
    if (err) {
      return res.status(403).json({ 
        error: 'Access denied. The provided token is invalid or has expired.' 
      });
    }

    // 6. Inject the decrypted user information into the request object.
    // When the user signed up/logged in, we encoded their unique database ID ('id') and 'email' in the JWT payload.
    // 'decodedUser' contains this original payload. By attaching it to 'req.user', we make these details
    // easily accessible to any subsequent route controllers (e.g. knowing who is making the request).
    req.user = {
      id: decodedUser.id,
      email: decodedUser.email
    };

    // 7. Pass control to the next middleware or route handler in the pipeline.
    // This is crucial in Express; without calling next(), the request would hang indefinitely.
    next();
  });
};

module.exports = authenticateToken;
