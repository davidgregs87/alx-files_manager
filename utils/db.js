import { MongoClient, ObjectId } from 'mongodb';

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

  async findUserbyEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  async findUserbyId(userID) {
    return this.db.collection('users').findOne({ _id: new ObjectId(userID) });
  }

  async findFileById(fileId) {
    const objectId = new ObjectId(fileId);
    return this.db.collection('files').findOne({ _id: objectId });
  }

  async createUser(email, password) {
    return this.db.collection('users').insertOne({ email, password });
  }

  async createFile(data) {
    return this.db.collection('files').insertOne(data);
  }

  async getFilesByParentId(idParent = 0) {
    return this.db.collection('files').find({ idParent }).toArray();
  }

  async aggregateFiles(pipeline) {
    return this.db.collection('files').aggregate(pipeline).toArray();
  }
}

const dbClient = new DBClient();
export default dbClient;
