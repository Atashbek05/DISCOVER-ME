'use strict';

const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    country: { type: String, required: true, default: 'Uzbekistan' },
    coordinates: coordinatesSchema,
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['historical', 'city', 'nature', 'museum', 'mosque', 'bazaar'],
    },
    location: { type: locationSchema, required: true },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

placeSchema.index({ name: 'text', description: 'text', tags: 'text' });
placeSchema.index({ category: 1 });
placeSchema.index({ isPopular: 1 });

module.exports = mongoose.model('Place', placeSchema);
