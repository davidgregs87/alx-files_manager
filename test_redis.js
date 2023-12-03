import { createClient } from 'redis';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

// No need for client.connect() in the redis library

// Example of setting a key-value pair
client.set('example_key', 'example_value', (err, reply) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Set key 'example_key' with value 'example_value': ${reply}`);

        // Retrieve the value
        client.get('example_key', (err, value) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Retrieved value for 'example_key': ${value}`);

                // Close the connection when done
                client.quit();
            }
        });
    }
});
