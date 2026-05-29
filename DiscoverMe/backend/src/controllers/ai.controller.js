'use strict';

const OpenAI = require('openai');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and knowledgeable tourist guide for Uzbekistan.
You help travelers discover amazing places, build routes, and get practical travel tips.
You know everything about Uzbekistan's cities (Samarkand, Bukhara, Tashkent, Khiva, Fergana, Nukus, Shakhrisabz),
historical landmarks, local cuisine, culture, traditions, transport, and accommodation.

Guidelines:
- Be concise — keep answers short and easy to read
- Be warm and enthusiastic about Uzbekistan
- Give specific, actionable advice
- Recommend real places, dishes, and experiences
- If asked about routes, suggest a logical sequence of stops
- If asked about a place, mention highlights and practical tips (best time to visit, how to get there)
- Answer in the same language the user writes in`;

// POST /api/ai/chat
const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new AppError('Message is required', 400);
  }

  if (message.trim().length > 1000) {
    throw new AppError('Message is too long (max 1000 characters)', 400);
  }

  if (!Array.isArray(history)) {
    throw new AppError('History must be an array', 400);
  }

  // Build message list: system + previous turns + current user message
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Accept up to 10 previous messages to keep context window reasonable
    ...history.slice(-10).map(({ role, content }) => ({ role, content })),
    { role: 'user', content: message.trim() },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 600,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new AppError('No response from AI', 502);
  }

  sendSuccess(res, {
    message: 'AI response received',
    data: {
      reply,
      usage: completion.usage,
    },
  });
});

module.exports = { chat };
