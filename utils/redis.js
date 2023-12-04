import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
