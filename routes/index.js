const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');

router.route('/status').get(AppController.getStatus);
router.route('/stats').get(AppController.getStats);

module.exports = router;
