#!/usr/bin/node

const { createClient } = require('redis');
const { promisify } = require('util');

/**
 * A class for managing Redis client operations.
 */
class RedisClient {
  constructor() {
    // Initialize Redis client
    this.client = createClient();
    
    // Track connection status
    this.connected = false;
    this.client.on('error', (err) => console.log(err));
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} Connection status.
   */
  isAlive() {
    return this.connected;
  }

  /**
   * Gets a value from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string>} The value associated with the key.
   */
  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return await getAsync(key);
  }

  /**
   * Sets a value in Redis with expiration.
   * @param {string} key - The key to set.
   * @param {string} val - The value to set.
   * @param {number} dur - Expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, val, dur) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, val, 'EX', dur);
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>}
   */
  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

// Export Redis client instance
const redisClient = new RedisClient();
module.exports = redisClient;
