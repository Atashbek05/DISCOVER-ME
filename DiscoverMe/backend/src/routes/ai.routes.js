'use strict';

const { Router } = require('express');
const { chat } = require('../controllers/ai.controller');

const router = Router();

// POST /api/ai/chat
router.post('/chat', chat);

module.exports = router;
