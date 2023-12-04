import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.dbHost || 'localhost';
    this.port = process.env.dbPort || 27017;
    this.database = process.env.dbDatabase || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}`;
    MongoClient.connect(
      this.url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err, client) => {
        if (err) {
          this.db = false;
        } else {
          this.db = client.db(this.database);
        }
      },
    );
  }
}

const dbClient = new DBClient();
export default dbClient;
