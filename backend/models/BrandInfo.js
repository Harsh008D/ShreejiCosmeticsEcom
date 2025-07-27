import mongoose from 'mongoose';

const brandInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  tagline: {
    type: String,
    required: [true, 'Brand tagline is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Brand description is required']
  },
  email: {
    type: String,
    required: [true, 'Brand email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Brand phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Brand address is required']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  businessHours: {
    mondayToFriday: String,
    saturday: String,
    sunday: String
  },
  policies: {
    shipping: String,
    returns: String,
    privacy: String,
    terms: String
  }
}, {
  timestamps: true
});

// Ensure only one brand info document exists
brandInfoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error('Only one brand info document can exist');
    }
  }
  next();
});

const BrandInfo = mongoose.model('BrandInfo', brandInfoSchema);

export default BrandInfo; 