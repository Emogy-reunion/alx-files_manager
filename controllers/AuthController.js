#!/usr/bin/node

const { v4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { getAuthzHeader, getToken, pwdHashed } = require('../utils/utils');
const { decodeToken, getCredentials } = require('../utils/utils');

class AuthController {
  /**
   * Authenticates user and returns an access token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getConnect(req, res) {
    const authzHeader = getAuthzHeader(req);
    if (!authzHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = getToken(authzHeader);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decodedToken = decodeToken(token);
    if (!decodedToken) return res.status(401).json({ error: 'Unauthorized' });

    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user || user.password !== pwdHashed(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const accessToken = v4();
    await redisClient.set(`auth_${accessToken}`, user._id.toString('utf8'), 60 * 60 * 24);
    res.json({ token: accessToken });
  }

  /**
   * Logs out the user by invalidating the token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const id = await redisClient.get(`auth_${token}`);
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.getUserById(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }

  /**
   * Returns the user's details based on the token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const id = await redisClient.get(`auth_${token}`);
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.getUserById(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    res.json({ id: user._id, email: user.email });
  }
}

module.exports = AuthController;
