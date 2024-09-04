#!/usr/bin/node

const sha1 = require('sha1');

/**
 * Hashes a password using SHA-1.
 * @param {string} pwd - The password to hash.
 * @returns {string} - The hashed password.
 */
export const pwdHashed = (pwd) => sha1(pwd);

/**
 * Retrieves the Authorization header from the request.
 * @param {Object} req - The request object.
 * @returns {string|null} - The Authorization header or null if not present.
 */
export const getAuthzHeader = (req) => {
  const header = req.headers.authorization;
  return header || null;
};

/**
 * Extracts the token from the Authorization header.
 * @param {string} authzHeader - The Authorization header.
 * @returns {string|null} - The extracted token or null if not in the expected format.
 */
export const getToken = (authzHeader) => {
  const tokenType = authzHeader.substring(0, 6);
  return tokenType === 'Basic ' ? authzHeader.substring(6) : null;
};

/**
 * Decodes a base64-encoded token.
 * @param {string} token - The base64-encoded token.
 * @returns {string|null} - The decoded token or null if invalid.
 */
export const decodeToken = (token) => {
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  return decodedToken.includes(':') ? decodedToken : null;
};

/**
 * Extracts email and password from a decoded token.
 * @param {string} decodedToken - The decoded token.
 * @returns {Object|null} - An object containing email and password or null if invalid.
 */
export const getCredentials = (decodedToken) => {
  const [email, password] = decodedToken.split(':');
  return email && password ? { email, password } : null;
};
