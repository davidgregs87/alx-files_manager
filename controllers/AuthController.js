import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findUserbyEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashPassword = sha1(password);
    if (hashPassword !== user.password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const randomToken = uuidv4();
    const key = `auth_${randomToken}`;
    await redisClient.set(key, user._id.toString(), 86400);
    return res.status(200).json({ token: randomToken });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
}

export default AuthController;
