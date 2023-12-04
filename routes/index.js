const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

router.route('/status').get(AppController.getStatus);
router.route('/stats').get(AppController.getStats);
router.route('/users').post(UsersController.getUsers);

module.exports = router;
