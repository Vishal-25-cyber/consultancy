import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SuperstoreOrder from '../models/SuperstoreOrder.js';
import User from '../models/User.js';

dotenv.config();

// Company product categories - Packaging, Plastic, Textile, Accessories
const categories = {
  'Packaging Materials': ['Bale Tape', 'Brown Tape', 'Cardboard Box', 'Stretch Film', 'Bubble Wrap'],
  'Plastic Products': ['HM Plastic', 'PP Cover', 'LD Plastic', 'Touch Film', 'Plastic Rolls'],
  'Textile Products': ['Woven Fabric', 'PP Woven Bag', 'HDPE Fabric', 'Laminated Fabric'],
  'Accessories': ['Clip', 'Marker Ink', 'Staple Pin', 'Packing Rope', 'Corner Guard']
};

const products = {
  'Bale Tape': [
    'Bale Tape 48mm x 50m',
    'Bale Tape 72mm x 65m',
    'Bale Tape 48mm x 100m Heavy Duty',
    'Bale Tape 60mm x 50m Industrial'
  ],
  'Brown Tape': [
    'Brown Tape 2 inch x 50m',
    'Brown Tape 3 inch x 65m',
    'Brown Tape 2 inch x 100m',
    'Brown Tape 4 inch x 50m Heavy Duty',
    'Brown Tape Self Adhesive 48mm'
  ],
  'Cardboard Box': [
    'Cardboard Box 12x10x8 inch 3 Ply',
    'Cardboard Box 18x14x12 inch 5 Ply',
    'Cardboard Box 24x18x18 inch 7 Ply',
    'Cardboard Box 9x6x4 inch 3 Ply',
    'Cardboard Box Heavy Duty 20x16x14 inch'
  ],
  'Stretch Film': [
    'Stretch Film 500mm x 300m',
    'Stretch Film 400mm x 200m',
    'Stretch Film Pre-Stretch 500mm',
    'Hand Stretch Film 100mm x 300m'
  ],
  'Bubble Wrap': [
    'Bubble Wrap Roll 50cm x 50m',
    'Bubble Wrap Roll 100cm x 50m',
    'Anti-Static Bubble Wrap 50cm x 50m',
    'Large Bubble Wrap 1m x 50m'
  ],
  'HM Plastic': [
    'HM Plastic Bag 12x16 inch 50 Micron',
    'HM Plastic Bag 16x20 inch 60 Micron',
    'HM Plastic Bag 20x24 inch 80 Micron',
    'HM Plastic Roll 48 inch 100 Micron',
    'HM Plastic Bag 10x14 inch 40 Micron'
  ],
  'PP Cover': [
    'PP Cover Transparent 12x18 inch',
    'PP Cover Frosted 16x22 inch',
    'PP Cover Heavy Duty 20x28 inch',
    'PP Cover 24x32 inch Industrial Grade'
  ],
  'LD Plastic': [
    'LD Plastic Bag 12x18 inch 40 Micron',
    'LD Plastic Bag 18x24 inch 50 Micron',
    'LD Plastic Roll 50cm 60 Micron',
    'LD Plastic Bag Zip Lock 10x15 inch'
  ],
  'Touch Film': [
    'Touch Film Gloss 1m x 100m',
    'Touch Film Matte 1m x 100m',
    'Touch Film Soft 750mm x 100m',
    'Touch Film Premium Gloss 1.2m x 100m'
  ],
  'Plastic Rolls': [
    'Plastic Roll Clear 48 inch 80 Micron',
    'Plastic Roll Black 36 inch 100 Micron',
    'Plastic Roll Colored 24 inch 60 Micron',
    'Plastic Roll Industrial 60 inch 120 Micron'
  ],
  'Woven Fabric': [
    'PP Woven Fabric 60 GSM Natural',
    'PP Woven Fabric 80 GSM White',
    'PP Woven Fabric 100 GSM Colored',
    'HDPE Woven Fabric 90 GSM',
    'Laminated Woven Fabric 120 GSM'
  ],
  'PP Woven Bag': [
    'PP Woven Bag 25kg Capacity',
    'PP Woven Bag 50kg Capacity',
    'PP Woven Bag with Liner 25kg',
    'PP Woven Bag HDPE 50kg',
    'PP Woven Bag Printed 25kg'
  ],
  'HDPE Fabric': [
    'HDPE Fabric 90 GSM Natural',
    'HDPE Fabric 120 GSM UV Stabilized',
    'HDPE Woven Fabric 150 GSM Industrial',
    'HDPE Shade Net Fabric 75%'
  ],
  'Laminated Fabric': [
    'Laminated PP Fabric 90 GSM',
    'Laminated HDPE Fabric 120 GSM',
    'Laminated Woven Fabric Waterproof 100 GSM',
    'Bopp Laminated Woven Bag 25kg'
  ],
  'Clip': [
    'Binder Clip 19mm Small Pack of 100',
    'Binder Clip 32mm Medium Pack of 50',
    'Binder Clip 51mm Large Pack of 12',
    'Foldback Clip Heavy Duty 41mm',
    'Spring Clip Stainless Steel 25mm'
  ],
  'Marker Ink': [
    'Marker Ink Black 500ml',
    'Marker Ink Blue 500ml',
    'Marker Ink Red 500ml',
    'Industrial Marker Ink 1 Litre',
    'Permanent Marker Ink 250ml'
  ],
  'Staple Pin': [
    'Staple Pin 24/6 Box of 5000',
    'Staple Pin 26/6 Box of 5000',
    'Heavy Duty Staple Pin 23/13',
    'Staple Pin 26/8 Box of 2000'
  ],
  'Packing Rope': [
    'Packing Rope PP 2mm 100m',
    'Packing Rope Jute 5mm 50m',
    'Packing Rope HDPE 4mm 200m',
    'Nylon Packing Rope 3mm 100m'
  ],
  'Corner Guard': [
    'Corner Guard L-Type 50x50x5mm 1m',
    'Corner Guard L-Type 75x75x5mm 1m',
    'Corner Guard Foam 35x35mm 1m',
    'Corner Guard Cardboard 50x50mm 2m'
  ],
  'Accessories': [
    'Logitech Wireless Gaming Headset',
    'Kingston Digital USB Flash Drive',
    'Belkin Surge Protector',
    'Logitech Wireless Mouse',
    'HP Wireless Keyboard and Mouse'
  ],
  'Copiers': [
    'Canon imageCLASS 2200 Advanced Copier',
    'Xerox WorkCentre 3315',
    'Canon PC1080F Personal Copier',
    'Sharp AL-1530CS Digital Copier'
  ],
  'Machines': [
    'Fellowes PB300 Plastic Comb Binding Machine',
    'GBC DocuBind P400 Electric Binding System',
    'Ibico EPK-21 Electric Binding Machine',
    'Fellowes Powershred Shredder'
  ],
  'Phones': [
    'Cisco SPA 501G IP Phone',
    'AT&T CL83451 Cordless Phone',
    'Motorola MA351 TurboDECT Cordless Phone',
    'Polycom ViewStation ISDN Videoconferencing Unit'
  ]
};

const shipModes = ['Standard Delivery', 'Express Delivery', 'Same Day', 'Economy'];
const segments = ['Wholesale', 'Retail', 'Industrial', 'Corporate'];
const regions = ['North India', 'South India', 'East India', 'West India'];

const statesByRegion = {
  'North India': ['Delhi', 'Uttar Pradesh', 'Haryana', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Himachal Pradesh'],
  'South India': ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
  'East India': ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
  'West India': ['Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Goa', 'Chhattisgarh']
};

const cities = {
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Laxmi Nagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad', 'Meerut'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruppur', 'Erode'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'],
  'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Thane'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg']
};

const companyNames = [
  'Raj Packaging Industries', 'Sri Lakshmi Plastics', 'Ganesh Textile Traders',
  'Shree Ram Packaging', 'National Poly Pack', 'Bharat Plastics Co',
  'Vinayak Industries', 'Sunrise Packaging Pvt Ltd', 'Anand Poly Products',
  'Mahavir Plastic Works', 'Balaji Packaging Solutions', 'Sai Industries',
  'Triveni Poly Pack', 'Om Shakthi Packaging', 'Krishna Packaging Works',
  'Indus Packaging Pvt Ltd', 'Premier Poly Products', 'Elite Packaging Co',
  'Reliable Plastics', 'Star Packaging Industries', 'Global Poly Pack',
  'Surya Packaging', 'Durga Plastik', 'Shanthi Packaging Solutions',
  'Apex Poly Industries', 'Sree Venkateshwara Traders', 'Prime Packaging Co',
  'Unity Packing Materials', 'Excel Industries', 'Mahalakshmi Plastics'
];

const firstNames = [
  'Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Dinesh', 'Ganesh', 'Naresh',
  'Priya', 'Anita', 'Sunita', 'Kavita', 'Rekha', 'Meena', 'Geeta',
  'Arun', 'Vijay', 'Ajay', 'Sanjay', 'Ravi', 'Sunil', 'Anil', 'Mukesh',
  'Amit', 'Sumit', 'Rohit', 'Mohit', 'Deepak', 'Prakash', 'Rakesh', 'Vikas'
];
const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Joshi',
  'Mehta', 'Nair', 'Pillai', 'Reddy', 'Rao', 'Iyer', 'Naidu', 'Agarwal',
  'Malhotra', 'Khanna', 'Bhatia', 'Kapoor', 'Chopra', 'Saxena', 'Mishra'
];

// Utility functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateCustomerId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `CUST-${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${randomNumber(1000, 9999)}`;
};

const generateCustomerName = () => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const company = randomElement(companyNames);
  return Math.random() > 0.5 ? `${firstName} ${lastName}` : `${firstName} ${company}`;
};

const generateProductId = (category, subCategory) => {
  const catCode = category.substring(0, 3).toUpperCase();
  const subCode = subCategory.substring(0, 3).toUpperCase();
  return `${catCode}-${subCode}-${randomNumber(1000, 9999)}`;
};

const generateOrderId = (i) => {
  const year = randomNumber(2021, 2025);
  return `ORD-${year}-${String(i).padStart(7, '0')}`;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Company Product database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await SuperstoreOrder.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Database cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const users = [
      {
        name: 'Admin User',
        email: 'admin@superstore.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Regular User',
        email: 'user@superstore.com',
        password: 'user123',
        role: 'staff'
      }
    ];

    await User.create(users);
    console.log('✅ Created 2 users\n');

    // Generate 100,000+ orders with company products
    console.log('📦 Creating 100,000+ orders for company products (this may take a few minutes)...');
    const TOTAL_ORDERS = 100000;
    const BATCH_SIZE = 1000;
    
    let createdCount = 0;
    const startDate = new Date('2021-01-01');
    const endDate = new Date('2025-12-31');

    // Generate unique customers (companies and individuals)
    const customers = {};
    for (let i = 0; i < 3000; i++) {
      const customerId = generateCustomerId();
      customers[customerId] = generateCustomerName();
    }
    const customerIds = Object.keys(customers);

    for (let batch = 0; batch < TOTAL_ORDERS / BATCH_SIZE; batch++) {
      const orders = [];
      
      for (let i = 0; i < BATCH_SIZE; i++) {
        const category = randomElement(Object.keys(categories));
        const subCategory = randomElement(categories[category]);
        const productName = randomElement(products[subCategory]);
        const region = randomElement(regions);
        const state = randomElement(statesByRegion[region]);
        const cityList = cities[state] || [state + ' City'];
        const city = randomElement(cityList);
        const customerId = randomElement(customerIds);
        
        const orderDate = generateRandomDate(startDate, endDate);
        const shipDays = randomNumber(1, 7);
        const shipDate = new Date(orderDate.getTime() + shipDays * 24 * 60 * 60 * 1000);
        
        // Adjust quantity and pricing based on product type
        let quantity, basePrice;
        
        if (category === 'Packaging Materials') {
          quantity = randomNumber(100, 5000); // Bulk quantities
          basePrice = randomFloat(5, 50, 2); // Per unit price
        } else if (category === 'Plastic Products') {
          quantity = randomNumber(50, 2000);
          basePrice = randomFloat(10, 100, 2);
        } else if (category === 'Textile Products') {
          quantity = randomNumber(20, 1000);
          basePrice = randomFloat(50, 500, 2);
        } else { // Accessories
          quantity = randomNumber(100, 3000);
          basePrice = randomFloat(2, 20, 2);
        }
        
        const sales = parseFloat((quantity * basePrice).toFixed(2));
        const discountRate = randomElement([0, 0, 0, 0.05, 0.10, 0.15, 0.20]); // 50% chance of no discount
        const discount = discountRate;
        const profit = parseFloat((sales * randomFloat(0.15, 0.35, 2)).toFixed(2));
        
        orders.push({
          orderId: generateOrderId(createdCount + i + 1),
          orderDate: orderDate,
          shipDate: shipDate,
          shipMode: randomElement(shipModes),
          customerId: customerId,
          customerName: customers[customerId],
          segment: randomElement(segments),
          country: 'India',
          city: city,
          state: state,
          postalCode: String(randomNumber(110001, 799999)),
          region: region,
          productId: generateProductId(category, subCategory),
          category: category,
          subCategory: subCategory,
          productName: productName,
          sales: sales,
          quantity: quantity,
          discount: discount,
          profit: profit
        });
      }
      
      await SuperstoreOrder.insertMany(orders);
      createdCount += BATCH_SIZE;
      const progress = ((createdCount / TOTAL_ORDERS) * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${progress}% (${createdCount} orders created)`);
    }
    
    console.log('\n✅ Created 100000 orders\n');

    // Summary
    console.log('\n✅ Company Product database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   Users: 2');
    console.log('   Orders: 100000');
    console.log(`   Product Categories: ${Object.keys(categories).length}`);
    console.log(`   Regions: ${regions.length} (North India, South India, East India, West India)`);
    console.log('   Date Range: 2021-2025');
    console.log('   Country: India (21 States, 100+ Cities)');
    console.log('\n📦 Product Categories:');
    console.log('   - Packaging Materials (Bale Tape, Brown Tape, Cardboard Box, Stretch Film, Bubble Wrap)');
    console.log('   - Plastic Products (HM Plastic, PP Cover, LD Plastic, Touch Film, Plastic Rolls)');
    console.log('   - Textile Products (Woven Fabric, PP Woven Bag, HDPE Fabric, Laminated Fabric)');
    console.log('   - Accessories (Clip, Marker Ink, Staple Pin, Packing Rope, Corner Guard)');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin - Email: admin@superstore.com, Password: admin123');
    console.log('   User  - Email: user@superstore.com,  Password: user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
