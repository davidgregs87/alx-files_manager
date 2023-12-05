import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}`;
    this.db = null;
    MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(this.database);
      } else {
        this.db = false;
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async findUser(email) {
    return this.db.collection('users').findOne(email);
  }

  async createUser(email, password) {
    return this.db.collection('users').insertOne({ email, password });
  }
}

const dbClient = new DBClient();
export default dbClient;
