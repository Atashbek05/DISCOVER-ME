'use strict';

const Place = require('../models/Place');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

// GET /api/v1/places
const getAllPlaces = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (category) filter.category = category;

  const skip = (Number(page) - 1) * Number(limit);

  const [places, total] = await Promise.all([
    Place.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Place.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message: 'Places retrieved successfully',
    data: {
      places,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// GET /api/v1/places/popular
const getPopularPlaces = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const places = await Place.find({ isPopular: true })
    .limit(Number(limit))
    .sort({ rating: -1 });

  sendSuccess(res, {
    message: 'Popular places retrieved successfully',
    data: { places },
  });
});

// GET /api/v1/places/search?q=
const searchPlaces = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const places = await Place.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  sendSuccess(res, {
    message: 'Search results retrieved successfully',
    data: { places, query: q },
  });
});

// GET /api/v1/places/categories
const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Place.distinct('category');

  sendSuccess(res, {
    message: 'Categories retrieved successfully',
    data: { categories },
  });
});

// GET /api/v1/places/:id
const getPlaceById = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    throw new AppError('Place not found', 404);
  }

  sendSuccess(res, {
    message: 'Place retrieved successfully',
    data: { place },
  });
});

module.exports = {
  getAllPlaces,
  getPopularPlaces,
  searchPlaces,
  getCategories,
  getPlaceById,
};
