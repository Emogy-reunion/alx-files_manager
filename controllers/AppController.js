#!/usr/bin/node

const redisClient = require('../utils/redis'); // Import Redis client for checking Redis status
const dbClient = require('../utils/db'); // Import database client for checking database status

class AppController {
  /**
   * Handles GET requests to /status and responds with the status of Redis and the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      res.json({ redis: true, db: true }); // Send JSON response indicating that both Redis and DB are alive
      res.end(); // End the response
    }
  }

  /**
   * Handles GET requests to /stats and responds with the number of users and files in the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getStats(req, res) {
    const users = await dbClient.nbUsers(); // Fetch the number of users from the database
    const files = await dbClient.nbFiles(); // Fetch the number of files from the database
    res.json({ users, files }); // Send JSON response with user and file counts
    res.end(); // End the response
  }
}

module.exports = AppController; // Export the AppController class for use in other modules
