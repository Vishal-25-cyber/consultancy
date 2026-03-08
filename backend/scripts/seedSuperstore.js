import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SuperstoreOrder from '../models/SuperstoreOrder.js';
import User from '../models/User.js';

dotenv.config();

// Superstore dataset configuration
const categories = {
  'Furniture': ['Bookcases', 'Chairs', 'Furnishings', 'Tables'],
  'Office Supplies': ['Appliances', 'Art', 'Binders', 'Envelopes', 'Fasteners', 'Labels', 'Paper', 'Storage', 'Supplies'],
  'Technology': ['Accessories', 'Copiers', 'Machines', 'Phones']
};

const products = {
  'Bookcases': ['Bush Somerset Collection Bookcase', 'Atlantic Metals Mobile 3-Shelf Bookcases', 'O\'Sullivan Livingston County Bookcase'],
  'Chairs': ['HON 5400 Series Task Chairs', 'Global Troy Executive Leather Low-Back Tilter', 'Novimex Executive Leather Armchair'],
  'Furnishings': ['Eldon Fold \'N Roll Cart System', 'Bretford CR4500 Series Slim Rectangular Table', 'Chromcraft Rectangular Conference Tables'],
  'Tables': ['Bretford CR4500 Series Slim Rectangular Table', 'Chromcraft Rectangular Conference Tables', 'Hon Deluxe Fabric Upholstered Stacking Chairs'],
  'Appliances': ['Belkin 325VA UPS Surge Protector', 'Hoover Replacement Belt for Commercial Guardsman Heavy-Duty Upright Vacuum'],
  'Art': ['Newell 341', 'Avery 510', 'Eldon Jumbo ProFile Portable File Box'],
  'Binders': ['Wilson Jones Active Use Binders', 'GBC Standard Plastic Binding Systems', 'Cardinal Slant-D Ring Binder'],
  'Envelopes': ['#10- 4 1/8" x 9 1/2" Premium Diagonal Seam Envelopes', 'Poly String Tie Envelopes', 'Cashier\'s Tape'],
  'Fasteners': ['OIC Bulk Pack Metal Binder Clips', 'Advantus Push Pins', 'Acme Design Punch 3 Hole'],
  'Labels': ['Avery 508', 'Avery 49', 'Avery Hole Reinforcements'],
  'Paper': ['Xerox 1967', 'Xerox 1952', 'Xerox 1980'],
  'Storage': ['Akro Stacking Bins', 'Eldon File Cart', 'Fellowes Bankers Box Staxonsteel Storage System'],
  'Supplies': ['BIC Cristal Stic Rollerball Pen', 'Pilot Precise Grip Roller Ball Pens', 'Staples'],
  'Accessories': ['Imation 3.5" DS/HD IBM Formatted Diskettes', 'Verbatim DVD-R', 'Maxell 4.7Gb DVD-RW'],
  'Copiers': ['Canon imageCLASS 2200 Advanced Copier', 'Hewlett Packard LaserJet 3310 Copier', 'Canon PC1080F Personal Copier'],
  'Machines': ['Acco 7-Outlet Masterpiece Power Center', 'Belkin F5C206VTEL 6 Outlet Surge', 'Fellowes PB500 Electric Punch Plastic Comb Binding Machine'],
  'Phones': ['AT&T CL83451 4-Handset Telephone', 'Cisco SPA 501G IP Phone', 'Polycom CX600 IP Phone VoIP']
};

const shipModes = ['Standard Class', 'Second Class', 'First Class', 'Same Day'];
const segments = ['Consumer', 'Corporate', 'Home Office'];
const regions = ['East', 'West', 'Central', 'South'];

const statesByRegion = {
  'East': ['New York', 'Pennsylvania', 'Florida', 'Massachusetts', 'New Jersey', 'Virginia', 'North Carolina', 'Maryland'],
  'West': ['California', 'Washington', 'Arizona', 'Oregon', 'Colorado', 'Nevada', 'Utah', 'New Mexico'],
  'Central': ['Texas', 'Illinois', 'Ohio', 'Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Missouri'],
  'South': ['Georgia', 'Tennessee', 'Louisiana', 'Alabama', 'South Carolina', 'Kentucky', 'Arkansas', 'Oklahoma']
};

const cities = {
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
  'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
  'Illinois': ['Chicago', 'Springfield', 'Naperville', 'Rockford'],
  'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie'],
  'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
  'Georgia': ['Atlanta', 'Augusta', 'Savannah', 'Athens'],
  'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver'],
  'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Ann Arbor']
};

const firstNames = ['John', 'Mary', 'Michael', 'Jennifer', 'David', 'Linda', 'James', 'Patricia', 'Robert', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

// Utility functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateCustomerId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}-${randomNumber(10000, 99999)}`;
};

const generateProductId = (category, subCategory) => {
  const catCode = category.substring(0, 3).toUpperCase();
  const subCode = subCategory.substring(0, 3).toUpperCase();
  return `${catCode}-${subCode}-${randomNumber(1000, 9999)}`;
};

const generateOrderId = (i) => {
  const year = randomNumber(2020, 2024);
  return `US-${year}-${String(i).padStart(7, '0')}`;
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Superstore database seeding...\n');

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

    // Generate 100,000+ Superstore orders
    console.log('📦 Creating 100,000+ Superstore orders (this may take a few minutes)...');
    const TOTAL_ORDERS = 100000;
    const BATCH_SIZE = 1000;
    
    let createdCount = 0;
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2024-12-31');

    // Generate unique customers
    const customers = {};
    for (let i = 0; i < 5000; i++) {
      const customerId = generateCustomerId();
      customers[customerId] = `${randomElement(firstNames)} ${randomElement(lastNames)}`;
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
        const shipDays = randomNumber(1, 10);
        const shipDate = new Date(orderDate.getTime() + shipDays * 24 * 60 * 60 * 1000);
        
        const quantity = randomNumber(1, 10);
        const sales = randomFloat(10, 2000, 2);
        const discountRate = randomElement([0, 0, 0, 0.1, 0.15, 0.2, 0.25]); // 50% chance of no discount
        const discount = parseFloat((sales * discountRate).toFixed(2));
        const profit = parseFloat((sales * randomFloat(0.1, 0.4, 2)).toFixed(2));
        
        orders.push({
          orderId: generateOrderId(createdCount + i + 1),
          orderDate: orderDate,
          shipDate: shipDate,
          shipMode: randomElement(shipModes),
          customerId: customerId,
          customerName: customers[customerId],
          segment: randomElement(segments),
          country: 'United States',
          city: city,
          state: state,
          postalCode: String(randomNumber(10000, 99999)),
          region: region,
          productId: generateProductId(category, subCategory),
          category: category,
          subCategory: subCategory,
          productName: productName,
          sales: sales,
          quantity: quantity,
          discount: discountRate,
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
    console.log('\n✅ Superstore database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   Users: 2');
    console.log('   Orders: 100000');
    console.log(`   Categories: ${Object.keys(categories).length}`);
    console.log(`   Regions: ${regions.length}`);
    console.log('   Date Range: 2020-2024\n');
    console.log('🔑 Login Credentials:');
    console.log('   Admin - Email: admin@superstore.com, Password: admin123');
    console.log('   User - Email: user@superstore.com, Password: user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
