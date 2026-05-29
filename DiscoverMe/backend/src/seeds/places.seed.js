'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

const places = [
  {
    name: 'Регистан',
    slug: 'registan',
    description:
      'Регистан — центральная площадь Самарканда, один из самых грандиозных архитектурных ансамблей мира. Три величественных медресе XIV–XVII веков образуют уникальный ансамбль исламской архитектуры, украшенный изысканными мозаиками и золотыми куполами.',
    category: 'historical',
    location: {
      city: 'Самарканд',
      country: 'Узбекистан',
      coordinates: { lat: 39.6542, lng: 66.9758 },
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Samarkand_Registan_Crop.jpg/1280px-Samarkand_Registan_Crop.jpg',
    ],
    rating: 4.9,
    reviewsCount: 3241,
    isPopular: true,
    tags: ['самарканд', 'юнеско', 'медресе', 'архитектура', 'шёлковый путь'],
  },
  {
    name: 'Ичан-Кала',
    slug: 'ichan-kala',
    description:
      'Ичан-Кала — внутренний город Хивы, первый объект Средней Азии, включённый в список Всемирного наследия ЮНЕСКО. Окружённый крепостными стенами высотой до 10 метров, он хранит более 60 исторических памятников, мечетей и медресе.',
    category: 'historical',
    location: {
      city: 'Хива',
      country: 'Узбекистан',
      coordinates: { lat: 41.3782, lng: 60.3619 },
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Khiva_Ichan-Kala.jpg/1280px-Khiva_Ichan-Kala.jpg',
    ],
    rating: 4.8,
    reviewsCount: 2187,
    isPopular: true,
    tags: ['хива', 'юнеско', 'крепость', 'старый город', 'хорезм'],
  },
  {
    name: 'Старая Бухара',
    slug: 'bukhara-old-town',
    description:
      'Бухара — один из древнейших городов мира с историей более 2500 лет. Исторический центр включает мавзолей Саманидов, минарет Калян, торговые купольные павильоны и цитадель Арк. Бухара входит в список Всемирного наследия ЮНЕСКО.',
    category: 'city',
    location: {
      city: 'Бухара',
      country: 'Узбекистан',
      coordinates: { lat: 39.7747, lng: 64.4286 },
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Bukhara_Kalon_Minaret.jpg/1280px-Bukhara_Kalon_Minaret.jpg',
    ],
    rating: 4.8,
    reviewsCount: 2954,
    isPopular: true,
    tags: ['бухара', 'юнеско', 'мавзолей', 'минарет', 'древний город'],
  },
  {
    name: 'Ташкент Сити',
    slug: 'tashkent-city',
    description:
      'Ташкент Сити — современный деловой и торгово-развлекательный комплекс в сердце столицы Узбекистана. Небоскрёбы, торговый центр, парки и фонтаны создают контраст с историческими памятниками города. Символ новой, динамичной столицы.',
    category: 'city',
    location: {
      city: 'Ташкент',
      country: 'Узбекистан',
      coordinates: { lat: 41.2995, lng: 69.2401 },
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Tashkent_City_2022.jpg/1280px-Tashkent_City_2022.jpg',
    ],
    rating: 4.5,
    reviewsCount: 1876,
    isPopular: true,
    tags: ['ташкент', 'столица', 'современный', 'небоскрёбы', 'шоппинг'],
  },
];

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discover_me';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Place.deleteMany({});
  console.log('Cleared existing places');

  const inserted = await Place.insertMany(places);
  console.log(`Seeded ${inserted.length} places:`);
  inserted.forEach((p) => console.log(`  - ${p.name} (${p.slug})`));

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
