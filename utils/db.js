#!/usr/bin/node

const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
const { pwdHashed } = require('./utils');

/**
 * A class for managing MongoDB operations.
 */
class DBClient {
  constructor() {
    // MongoDB connection details
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const dbUrl = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(dbUrl, { useUnifiedTopology: true });

    // Connect to the database
    this.client.connect()
      .then(() => {
        this.connected = true;
      })
      .catch((err) => console.log(err.message));
  }

  /**
   * Checks if the database connection is active.
   * @returns {boolean} Connection status.
   */
  isAlive() {
    return this.connected;
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<number>} Number of users.
   */
  async nbUsers() {
    await this.client.connect();
    return this.client.db(this.database).collection('users').countDocuments();
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<number>} Number of files.
   */
  async nbFiles() {
    await this.client.connect();
    return this.client.db(this.database).collection('files').countDocuments();
  }

  /**
   * Creates a new user in the database.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} The result of the insertion operation.
   */
  async createUser(email, password) {
    const hashedPwd = pwdHashed(password);
    await this.client.connect();
    return this.client.db(this.database).collection('users').insertOne({ email, password: hashedPwd });
  }

  /**
   * Retrieves a user by email.
   * @param {string} email - The user's email.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  async getUser(email) {
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    return user.length ? user[0] : null;
  }

  /**
   * Retrieves a user by ID.
   * @param {string} id - The user's ID.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  async getUserById(id) {
    const _id = new mongo.ObjectID(id);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ _id }).toArray();
    return user.length ? user[0] : null;
  }

  /**
   * Checks if a user exists by email.
   * @param {string} email - The user's email.
   * @returns {Promise<boolean>} True if the user exists, otherwise false.
   */
  async userExist(email) {
    return Boolean(await this.getUser(email));
  }
}

// Export the database client instance
const dbClient = new DBClient();
module.exports = dbClient;
