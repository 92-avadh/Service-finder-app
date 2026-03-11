const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const seedProviders = async () => {

try {

console.log("Connecting to MongoDB...");

await mongoose.connect(
process.env.MONGO_URI || "mongodb://127.0.0.1:27017/servicefinder"
);

console.log("MongoDB Connected");

await User.deleteMany({ role: "provider" });

const password = await bcrypt.hash("123456", 10);

const providers = [

{
name: "Rajesh Patel",
email: "rajesh@servicefinder.com",
phone: "9876500001",
password,
role: "provider",
serviceType: "Plumbing",
location: "Surat",
price: 500,
unit: "hr",
experience: "6 years",
about: "Expert plumber for leak fixing and pipe installation.",
image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Amit Sharma",
email: "amit@servicefinder.com",
phone: "9876500002",
password,
role: "provider",
serviceType: "Electrical",
location: "Ahmedabad",
price: 600,
unit: "hr",
experience: "8 years",
about: "Professional electrician for wiring and electrical repair.",
image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Priya Desai",
email: "priya@servicefinder.com",
phone: "9876500003",
password,
role: "provider",
serviceType: "Cleaning",
location: "Surat",
price: 700,
unit: "hr",
experience: "5 years",
about: "Deep home cleaning specialist.",
image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Vikram Singh",
email: "vikram@servicefinder.com",
phone: "9876500004",
password,
role: "provider",
serviceType: "AC Repair",
location: "Vadodara",
price: 800,
unit: "hr",
experience: "7 years",
about: "AC installation and maintenance expert.",
image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Ravi Kumar",
email: "ravi@servicefinder.com",
phone: "9876500005",
password,
role: "provider",
serviceType: "Carpentry",
location: "Ahmedabad",
price: 550,
unit: "hr",
experience: "10 years",
about: "Furniture repair and custom carpentry.",
image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Sneha Mehta",
email: "sneha@servicefinder.com",
phone: "9876500006",
password,
role: "provider",
serviceType: "Painting",
location: "Rajkot",
price: 25,
unit: "sq",
experience: "6 years",
about: "Interior and exterior painting services.",
image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Deepak Chauhan",
email: "deepak@servicefinder.com",
phone: "9876500007",
password,
role: "provider",
serviceType: "Pest Control",
location: "Surat",
price: 1200,
unit: "hr",
experience: "8 years",
about: "Professional pest and termite removal.",
image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Ankit Verma",
email: "ankit@servicefinder.com",
phone: "9876500008",
password,
role: "provider",
serviceType: "Appliance Repair",
location: "Ahmedabad",
price: 700,
unit: "hr",
experience: "5 years",
about: "Washing machine and refrigerator repair expert.",
image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Mehul Shah",
email: "mehul@servicefinder.com",
phone: "9876500009",
password,
role: "provider",
serviceType: "Laptop Repair",
location: "Vadodara",
price: 900,
unit: "hr",
experience: "7 years",
about: "Laptop hardware repair specialist.",
image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Neha Patel",
email: "neha@servicefinder.com",
phone: "9876500010",
password,
role: "provider",
serviceType: "Beauty Services",
location: "Surat",
price: 1000,
unit: "hr",
experience: "4 years",
about: "Home salon and beauty services.",
image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Karan Joshi",
email: "karan@servicefinder.com",
phone: "9876500011",
password,
role: "provider",
serviceType: "Gardening",
location: "Rajkot",
price: 400,
unit: "hr",
experience: "5 years",
about: "Garden maintenance and landscaping.",
image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Harsh Patel",
email: "harsh@servicefinder.com",
phone: "9876500012",
password,
role: "provider",
serviceType: "Mobile Repair",
location: "Ahmedabad",
price: 500,
unit: "hr",
experience: "6 years",
about: "Mobile repair and screen replacement.",
image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Riya Shah",
email: "riya@servicefinder.com",
phone: "9876500013",
password,
role: "provider",
serviceType: "Home Tutor",
location: "Surat",
price: 800,
unit: "hr",
experience: "5 years",
about: "Experienced home tutor for school students.",
image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Manoj Gupta",
email: "manoj@servicefinder.com",
phone: "9876500014",
password,
role: "provider",
serviceType: "CCTV Installation",
location: "Vadodara",
price: 1500,
unit: "hr",
experience: "9 years",
about: "Security camera installation specialist.",
image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Pooja Jain",
email: "pooja@servicefinder.com",
phone: "9876500015",
password,
role: "provider",
serviceType: "Interior Design",
location: "Ahmedabad",
price: 3000,
unit: "sq",
experience: "8 years",
about: "Interior designer for homes and offices.",
image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Arjun Nair",
email: "arjun@servicefinder.com",
phone: "9876500016",
password,
role: "provider",
serviceType: "Packers & Movers",
location: "Surat",
price: 2000,
unit: "hr",
experience: "7 years",
about: "Safe and reliable moving services.",
image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Rahul Yadav",
email: "rahul@servicefinder.com",
phone: "9876500017",
password,
role: "provider",
serviceType: "Driver Service",
location: "Ahmedabad",
price: 900,
unit: "hr",
experience: "6 years",
about: "Professional driver for city travel.",
image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Kavita Verma",
email: "kavita@servicefinder.com",
phone: "9876500018",
password,
role: "provider",
serviceType: "Tailoring",
location: "Rajkot",
price: 350,
unit: "hr",
experience: "10 years",
about: "Clothing alterations and custom tailoring.",
image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Sanjay Joshi",
email: "sanjay@servicefinder.com",
phone: "9876500019",
password,
role: "provider",
serviceType: "Water Purifier Repair",
location: "Surat",
price: 450,
unit: "hr",
experience: "6 years",
about: "RO and water purifier repair specialist.",
image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
},

{
name: "Alok Verma",
email: "alok@servicefinder.com",
phone: "9876500020",
password,
role: "provider",
serviceType: "TV Repair",
location: "Ahmedabad",
price: 650,
unit: "hr",
experience: "7 years",
about: "LED and Smart TV repair expert.",
image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop&crop=face",
isProfileComplete: true
}

];

await User.insertMany(providers);

console.log("Providers seeded successfully!");
console.log("All provider login password: 123456");

mongoose.connection.close();

} catch (error) {

console.error(error);
process.exit(1);

}

};

seedProviders();