import { MongoClient } from 'mongodb';

// ... (other methods)
class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.db = null;

    // Return a promise
    this.connectionPromise = MongoClient.connect(url, {
      useNewUrlParser: true, useUnifiedTopology: true,
    })
      .then((client) => {
        this.db = client.db(database);
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        this.db = false;
      });
  }

  async isAlive() {
    await this.connectionPromise; // Wait for the connection to be established
    return !!this.db;
  }

  // ... (other methods)
  async nbUsers() {
    const nbUsers = await this.db.collection('users').countDocuments();
    return nbUsers;
  }

  async nbFiles() {
    const nbFiles = await this.db.collection('files').countDocuments();
    return nbFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;
