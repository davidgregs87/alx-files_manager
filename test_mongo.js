const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

const dbName = 'mydb';

async function main() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('documents');
    const insertMany = await collection.insertMany([
        { a: 1 }, { a: 2 }, { a: 3 }
    ]);
    console.log('Inserted documents =>', insertMany);
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);
    const updateResult = await collection.updateOne({ a: 1 }, { $set: { b: 1 } });
    console.log('Updated documents =>', updateResult);
    const deleteResult = await collection.deleteOne({ a: 3 });
    console.log('Deleted documents =>', deleteResult);
    console.log('Found documents =>', await collection.find({}).toArray());
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());