const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

const servicesData = [
  {
    name: "Michael Foster",
    category: "Electrician",
    rating: 4.9,
    reviews: 120,
    price: "₹499/hr",
    location: "Mumbai, MH",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
    about: "Expert electrician with 10+ years of experience in residential wiring and repairs.",
    isFeatured: true
  },
  {
    name: "Sarah Jenkins",
    category: "Cleaning", // Changed from "House Cleaning" to match filters
    rating: 4.8,
    reviews: 85,
    price: "₹299/hr",
    location: "Bangalore, KA",
    image: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=400",
    about: "Professional home cleaner known for attention to detail and eco-friendly products.",
    isFeatured: true
  },
  {
    name: "David Ross",
    category: "Plumbing",
    rating: 5.0,
    reviews: 210,
    price: "₹599/hr",
    location: "Delhi, DL",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=400",
    about: "Licensed plumber specializing in leak detection and pipe fitting.",
    isFeatured: true
  },
  {
    name: "Emma Wilson",
    category: "Painting",
    rating: 4.7,
    reviews: 45,
    price: "₹399/hr",
    location: "Pune, MH",
    image: "https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&q=80&w=400",
    about: "Creative painter offering interior and exterior painting services.",
    isFeatured: true
  },
  {
    name: "James Carter",
    category: "Carpentry",
    rating: 4.6,
    reviews: 32,
    price: "₹450/hr",
    location: "Hyderabad, TS",
    image: "https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&q=80&w=400",
    about: "Custom furniture maker and wood repair specialist.",
    isFeatured: false
  },
  {
    name: "Linda Martinez",
    category: "Gardening",
    rating: 4.9,
    reviews: 150,
    price: "₹350/hr",
    location: "Chennai, TN",
    image: "https://images.unsplash.com/photo-1622383563227-044011358d16?auto=format&fit=crop&q=80&w=400",
    about: "Landscape designer and garden maintenance expert.",
    isFeatured: false
  }
];

const seedDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🧹 Clearing old services...');
    await Service.deleteMany({}); // Clear existing services
    
    console.log('🌱 Seeding new services...');
    await Service.insertMany(servicesData);
    
    console.log('✅ Services seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
