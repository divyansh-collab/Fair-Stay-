const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const aiController = require('../controllers/ai');

// Smart natural language search
router.post('/smart-search', wrapAsync(aiController.smartSearch));
router.get('/smart-search', wrapAsync(aiController.smartSearch));

// Travel concierge AI chatbot
router.post('/chat', wrapAsync(aiController.chat));

// AI Festival Price Prediction & Percentage Impact Engine
router.get('/predict-festival-price', wrapAsync(aiController.predictFestivalPrice));
router.post('/predict-festival-price', wrapAsync(aiController.predictFestivalPrice));

module.exports = router;
