import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient({port: 6379, host: 'localhost'});

    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  isAlive() {
    return new Promise((resolve) => {
      this.client.ping('CHECK', (err, result) => {
        if (err || result !== 'CHECK') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
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
module.exports = redisClient;
