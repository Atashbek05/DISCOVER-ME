'use strict';

const { Router } = require('express');
const {
  getAllPlaces,
  getPopularPlaces,
  searchPlaces,
  getCategories,
  getPlaceById,
} = require('../controllers/places.controller');

const router = Router();

// GET /api/v1/places
router.get('/', getAllPlaces);

// GET /api/v1/places/popular
router.get('/popular', getPopularPlaces);

// GET /api/v1/places/search?q=...
router.get('/search', searchPlaces);

// GET /api/v1/places/categories
router.get('/categories', getCategories);

// GET /api/v1/places/:id
router.get('/:id', getPlaceById);

module.exports = router;
