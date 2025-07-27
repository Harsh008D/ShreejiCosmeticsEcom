import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import BrandInfo from '../models/BrandInfo.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Review from '../models/Review.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Initial data from frontend
const initialProducts = [
  {
    name: 'Neem & Tulsi Face Wash',
    price: 299,
    image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'A gentle yet effective face wash infused with the goodness of neem and tulsi. Perfect for daily cleansing and maintaining healthy, glowing skin.',
    ingredients: ['Neem Extract', 'Tulsi Oil', 'Aloe Vera', 'Coconut Oil', 'Glycerin', 'Natural Fragrances'],
    usage: 'Apply a small amount to wet face, gently massage in circular motions, and rinse with lukewarm water. Use twice daily for best results.',
    category: 'Face Care',
    inStock: true,
    featured: true,
    stockQuantity: 50
  },
  {
    name: 'Rose & Honey Moisturizer',
    price: 449,
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4041279/pexels-photo-4041279.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Luxurious moisturizer enriched with rose water and pure honey to deeply hydrate and nourish your skin, leaving it soft and radiant.',
    ingredients: ['Rose Water', 'Pure Honey', 'Shea Butter', 'Jojoba Oil', 'Vitamin E', 'Natural Preservatives'],
    usage: 'Apply evenly on clean face and neck. Gently massage until absorbed. Use daily for hydrated, glowing skin.',
    category: 'Face Care',
    inStock: true,
    featured: true,
    stockQuantity: 30
  },
  {
    name: 'Turmeric & Sandalwood Scrub',
    price: 349,
    image: 'https://images.pexels.com/photos/4041298/pexels-photo-4041298.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4041298/pexels-photo-4041298.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4465421/pexels-photo-4465421.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Natural exfoliating scrub with turmeric and sandalwood powder to remove dead skin cells and reveal bright, smooth skin.',
    ingredients: ['Turmeric Powder', 'Sandalwood Powder', 'Oatmeal', 'Almond Oil', 'Sugar Crystals', 'Rose Water'],
    usage: 'Apply on damp skin, gently scrub in circular motions for 2-3 minutes, then rinse with water. Use 2-3 times a week.',
    category: 'Face Care',
    inStock: true,
    featured: false,
    stockQuantity: 25
  },
  {
    name: 'Coconut & Almond Hair Oil',
    price: 399,
    image: 'https://images.pexels.com/photos/4465832/pexels-photo-4465832.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4465832/pexels-photo-4465832.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4465834/pexels-photo-4465834.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Nourishing hair oil blend of coconut and almond oils to strengthen hair, reduce hair fall, and add natural shine.',
    ingredients: ['Virgin Coconut Oil', 'Sweet Almond Oil', 'Curry Leaves', 'Fenugreek Seeds', 'Amla Extract', 'Bhringraj'],
    usage: 'Massage gently into scalp and hair. Leave for at least 1 hour or overnight. Wash with a mild shampoo.',
    category: 'Hair Care',
    inStock: true,
    featured: true,
    stockQuantity: 40
  },
  {
    name: 'Lavender Body Butter',
    price: 549,
    image: 'https://images.pexels.com/photos/4465421/pexels-photo-4465421.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4465421/pexels-photo-4465421.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4041385/pexels-photo-4041385.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Rich and creamy body butter infused with lavender essential oil for deep moisturization and relaxation.',
    ingredients: ['Shea Butter', 'Cocoa Butter', 'Lavender Essential Oil', 'Coconut Oil', 'Vitamin E', 'Beeswax'],
    usage: 'Apply generously on clean, dry skin. Massage until absorbed. Best used after shower for optimal hydration.',
    category: 'Body Care',
    inStock: true,
    featured: false,
    stockQuantity: 35
  },
  {
    name: 'Green Tea & Mint Lip Balm',
    price: 199,
    image: 'https://images.pexels.com/photos/4041290/pexels-photo-4041290.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/4041290/pexels-photo-4041290.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4041276/pexels-photo-4041276.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Refreshing lip balm with green tea extract and mint oil to keep lips soft, smooth, and naturally tinted.',
    ingredients: ['Green Tea Extract', 'Mint Essential Oil', 'Beeswax', 'Coconut Oil', 'Shea Butter', 'Natural Colorants'],
    usage: 'Apply evenly on lips as needed throughout the day. Perfect for daily use and protection.',
    category: 'Lip Care',
    inStock: true,
    featured: false,
    stockQuantity: 60
  }
];

const initialBrandInfo = {
  name: 'Shreeji Cosmetics',
  tagline: 'Pure. Natural. Beautiful.',
  description: 'Handcrafted with love using traditional recipes and the finest natural ingredients. Our products are made in small batches to ensure freshness and quality.',
  email: 'contact@shreejicosmetics.com',
  phone: '+91 98765 43210',
  address: '123, Green Valley, Wellness Street, Ahmedabad, Gujarat - 380001',
  whatsapp: '+919876543210'
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await BrandInfo.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Seed products
    const products = await Product.insertMany(initialProducts);
    console.log(`✅ Seeded ${products.length} products`);

    // Seed brand info
    const brandInfo = await BrandInfo.create(initialBrandInfo);
    console.log('✅ Seeded brand info');

    // Create only the requested admin user
    const adminUser = new User({
      name: 'Demo Admin',
      email: 'demoadmin@gmail.com',
      password: await bcrypt.hash('hello123', 10),
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ Created demo admin user');

    // Add sample reviews
    const sampleReviews = [
      {
        product: products[0]._id,
        user: adminUser._id,
        rating: 5,
        comment: 'Amazing product! Highly recommend.'
      },
      {
        product: products[1]._id,
        user: adminUser._id,
        rating: 4,
        comment: 'Very good, but could be cheaper.'
      }
    ];
    await Review.insertMany(sampleReviews);
    console.log('✅ Seeded sample reviews');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: demoadmin@gmail.com / hello123');
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedData(); 