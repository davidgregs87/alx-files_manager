import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('newKey'));
    await redisClient.set('newKey', 12, 5);
    console.log(await redisClient.get('newKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('newKey'));
    }, 1000*10)
})();