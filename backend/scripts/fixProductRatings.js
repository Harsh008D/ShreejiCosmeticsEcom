import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/config.env
const envPath = path.resolve(__dirname, '../config.env');
dotenv.config({ path: envPath });

async function updateAllProductRatings() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const products = await Product.find({});
  for (const product of products) {
    const reviews = await Review.find({ product: product._id });
    const numReviews = reviews.length;
    const rating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 0;
    product.numReviews = numReviews;
    product.rating = rating;
    await product.save();
    console.log(`Updated ${product.name}: rating=${rating}, numReviews=${numReviews}`);
  }

  await mongoose.disconnect();
  console.log('All products updated!');
}

updateAllProductRatings().catch(err => {
  console.error(err);
  process.exit(1);
}); 