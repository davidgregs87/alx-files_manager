/* eslint-disable import/no-import-module-exports */
// controllers/AppController.js
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = await dbClient.isAlive();

    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();

    res.status(200).json({ users: nbUsers, files: nbFiles });
  }
}

module.exports = AppController;
