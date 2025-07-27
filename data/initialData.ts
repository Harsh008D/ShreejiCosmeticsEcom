import { Product, BrandInfo } from '../types';

export const initialProducts: Product[] = [
  {
    id: '1',
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
    featured: true
  },
  {
    id: '2',
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
    featured: true
  },
  {
    id: '3',
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
    featured: false
  },
  {
    id: '4',
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
    featured: true
  },
  {
    id: '5',
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
    featured: false
  },
  {
    id: '6',
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
    featured: false
  }
];

export const initialBrandInfo: BrandInfo = {
  name: 'Shreeji Cosmetics',
  tagline: 'Pure. Natural. Beautiful.',
  description: 'Handcrafted with love using traditional recipes and the finest natural ingredients. Our products are made in small batches to ensure freshness and quality.',
  email: 'contact@shreejicosmetics.com',
  phone: '+91 98765 43210',
  address: '123, Green Valley, Wellness Street, Ahmedabad, Gujarat - 380001',
  whatsapp: '+919876543210'
};

// Initialize data in localStorage if not exists
export const initializeData = () => {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem('brandInfo')) {
    localStorage.setItem('brandInfo', JSON.stringify(initialBrandInfo));
  }
};