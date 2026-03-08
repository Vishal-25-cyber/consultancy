import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SuperstoreOrder from '../models/SuperstoreOrder.js';
import User from '../models/User.js';

dotenv.config();

// Real Superstore retail dataset configuration
const categories = {
  'Furniture': ['Bookcases', 'Chairs', 'Furnishings', 'Tables'],
  'Office Supplies': ['Appliances', 'Art', 'Binders', 'Envelopes', 'Fasteners', 'Labels', 'Paper', 'Storage', 'Supplies'],
  'Technology': ['Accessories', 'Copiers', 'Machines', 'Phones']
};

const products = {
  'Bookcases': [
    'Bush Somerset Collection Bookcase',
    'Atlantic Metals Mobile 3-Shelf Bookcases',
    'O\'Sullivan Living Dimensions 3-Shelf Bookcases',
    'Hon 8-Shelf Metal Bookcase',
    'Sauder Camden County Barrister Bookcase'
  ],
  'Chairs': [
    'Hon 5400 Series Task Chairs',
    'Global Troy Executive Leather Low-Back Tilter',
    'Novimex Executive Leather Armchair',
    'Hon Pagoda Stacking Chairs',
    'Bush Westfield Collection Leather Guest Chair',
    'Chromcraft Bull-Nose Wood Oval Conference Tables & Chairs',
    'Hon Executive Leather Chairs'
  ],
  'Furnishings': [
    'Eldon Wave Desk Accessories',
    'Tenex Traditional Chairmats',
    'Howard Miller 13-3/4" Diameter Brentwood Wall Clock',
    'Artistic Insta-Cover Pool Table Cover'
  ],
  'Tables': [
    'Bretford CR4500 Series Slim Rectangular Table',
    'Chromcraft Rectangular Conference Tables',
    'Bretford Rectangular Conference Room Tables',
    'Lesro Sheffield Collection Coffee Table'
  ],
  'Appliances': [
    'Cuisinart Toaster Oven',
    'Hamilton Beach RefrigeratorOven',
    'Hoover Upright Vacuum',
    'Holmes HEPA Air Purifier'
  ],
  'Art': [
    'Eldon Executive Woodline II Desk Accessories',
    'Bretford Rectangular Shaped Conference Tables',
    'Chromcraft Rectangular Conference Tables'
  ],
  'Binders': [
    'Wilson Jones Hanging View Binder',
    'GBC Standard Plastic Binding Systems Combs',
    'Acco Pressboard Covers with Storage Hooks',
    'Wilson Jones Active Use Binders'
  ],
  'Envelopes': [
    'Recycled Interoffice Envelopes with String',
    'Security-Tint Envelopes',
    'Airmail Envelopes',
    'Poly String Tie Envelopes'
  ],
  'Fasteners': [
    'Advantus Panel Wall Clips',
    'Acco7 Prong Paper Fasteners',
    'Staples',
    'Rubber Bands'
  ],
  'Labels': [
    'Avery Durable Slant Ring Binders',
    'Self-Adhesive Address Labels',
    'Avery Hi-Liter EverBold Pen Style Fluorescent Highlighters',
    'Avery Round Ring Label Protectors'
  ],
  'Paper': [
    'Xerox 1967',
    'Xerox 1980',
    'Xerox 1952',
    'Southworth 25% Cotton Premium Laser Paper',
    'Hammermill CopyPlus Copy Paper',
    'Rediform S.O.S. Phone Message Books'
  ],
  'Storage': [
    'Fellowes PB500 Electric Punch Plastic Comb Binding Machine',
    'Eldon File Cart',
    'Fellowes Bankers Box Stor/Drawer',
    'Hon Every-Day File Sorter',
    'Sterilite File Boxes'
  ],
  'Supplies': [
    'Eldon Jumbo ProFile Portable File Box',
    'Dixon Ticonderoga Woodcase Pencils',
    'Newell 318',
    'Sanford Liquid Accent Tank-Style Highlighters',
    'Wirebound Service Call Books'
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

const shipModes = ['Standard Class', 'Second Class', 'First Class', 'Same Day'];
const segments = ['Consumer', 'Corporate', 'Home Office'];
const regions = ['East', 'West', 'Central', 'South'];

const statesByRegion = {
  'East': ['New York', 'Pennsylvania', 'New Jersey', 'Massachusetts', 'Connecticut', 'Rhode Island', 'Vermont'],
  'West': ['California', 'Washington', 'Oregon', 'Nevada', 'Arizona', 'Colorado', 'Utah'],
  'Central': ['Illinois', 'Ohio', 'Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Iowa'],
  'South': ['Texas', 'Florida', 'Georgia', 'North Carolina', 'Virginia', 'Tennessee', 'Louisiana']
};

const cities = {
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
  'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  'Illinois': ['Chicago', 'Springfield', 'Naperville', 'Aurora', 'Rockford'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  'Georgia': ['Atlanta', 'Augusta', 'Savannah', 'Athens', 'Macon'],
  'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
  'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge']
};

const companyNames = [
  'Office Solutions', 'Business Supplies Inc', 'Corporate Furnishings', 'Tech Enterprises',
  'Modern Office Co', 'Supply Depot', 'Office Essentials', 'Business Plus',
  'Executive Offices', 'Tech Solutions Ltd', 'Office Pro', 'Workspace Inc'
];

const firstNames = ['Aaron', 'Adam', 'Alex', 'Alice', 'Anna', 'Ben', 'Brian', 'Carlos', 'Chris', 'David', 'Emma', 'Frank', 'Grace', 'Helen', 'Jack'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

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
          postalCode: String(randomNumber(100000, 999999)),
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
    console.log(`   Regions: ${regions.length}`);
    console.log('   Date Range: 2021-2025');
    console.log('\n📦 Product Categories:');
    console.log('   - Packaging Materials (Bale Tape, Brown Tape, Cardboard Box, etc.)');
    console.log('   - Plastic Products (HM Plastic, PP Cover, LD Plastic, Touch Film)');
    console.log('   - Textile Products (Woven Fabric)');
    console.log('   - Accessories (Clip, Marker Ink)');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin - Email: admin@superstore.com, Password: admin123');
    console.log('   User - Email: user@superstore.com, Password: user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
