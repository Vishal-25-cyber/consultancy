import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Vehicle from '../models/Vehicle.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

// Helper function to generate random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Sample data
const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vijay', 'Anjali', 'Ravi', 'Pooja', 'Suresh', 'Kavita', 'Anil', 'Deepa', 'Sanjay', 'Meera', 'Rajesh', 'Nisha', 'Manoj', 'Sunita', 'Ashok', 'Radha'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Rao', 'Mehta', 'Joshi', 'Verma', 'Shah', 'Desai', 'Agarwal', 'Pandey', 'Mishra'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'];

const categoryNames = ['Electronics', 'Groceries', 'Hardware', 'Stationery', 'Textiles', 'Pharmaceuticals', 'Automotive Parts', 'Building Materials', 'Furniture', 'Sports Equipment'];
const vehicleTypes = ['truck', 'van', 'mini-truck', 'tempo'];
const customerTypes = ['wholesale', 'retail', 'distributor'];
const orderStatuses = ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'];
const paymentStatuses = ['pending', 'partial', 'paid', 'overdue'];
const paymentMethods = ['cash', 'card', 'upi', 'bank-transfer', 'cheque'];
const deliveryStatuses = ['pending', 'assigned', 'in-transit', 'delivered', 'failed'];

console.log('🌱 Starting database seeding...\n');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Vehicle.deleteMany({});
    await Order.deleteMany({});
    await Delivery.deleteMany({});
    await Inventory.deleteMany({});
    console.log('✅ Database cleared\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    console.log('👥 Creating users...');
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        address: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        }
      },
      {
        name: 'Staff User',
        email: 'staff@inventory.com',
        password: 'staff123',
        role: 'staff',
        phone: '9876543211',
        address: {
          street: '456 Staff Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002'
        }
      },
      {
        name: 'Customer User',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543212',
        address: {
          street: '789 Customer Lane',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400003'
        }
      }
    ];
    
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    console.log('📁 Creating categories...');
    
    const categories = categoryNames.map(name => ({
      name,
      description: `${name} products and supplies`,
      status: 'active'
    }));
    
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    process.exit(1);
  }
};

const seedSuppliers = async () => {
  try {
    console.log('🏭 Creating suppliers...');
    
    const suppliers = [];
    for (let i = 0; i < 50; i++) {
      suppliers.push({
        name: `${randomChoice(firstNames)} ${randomChoice(lastNames)} Suppliers`,
        email: `supplier${i}@example.com`,
        phone: `98765${randomInt(10000, 99999)}`,
        address: {
          street: `${randomInt(1, 999)} ${randomChoice(['Main', 'Park', 'Lake', 'Hill'])} Street`,
          city: randomChoice(cities),
          state: randomChoice(states),
          pincode: `${randomInt(100000, 999999)}`
        },
        gstNumber: `${randomInt(10, 99)}ABCDE${randomInt(1000, 9999)}F1Z${randomInt(1, 9)}`,
        contactPerson: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        status: 'active',
        rating: randomFloat(3, 5)
      });
    }
    
    const createdSuppliers = await Supplier.create(suppliers);
    console.log(`✅ Created ${createdSuppliers.length} suppliers\n`);
    return createdSuppliers;
  } catch (error) {
    console.error('❌ Error creating suppliers:', error);
    process.exit(1);
  }
};

const seedCustomers = async () => {
  try {
    console.log('👤 Creating customers...');
    
    const customers = [];
    for (let i = 0; i < 1000; i++) {
      customers.push({
        name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        email: `customer${i}@example.com`,
        phone: `98765${randomInt(10000, 99999)}`,
        address: {
          street: `${randomInt(1, 999)} ${randomChoice(['Main', 'Park', 'Lake', 'Hill'])} Road`,
          city: cities[i % cities.length],
          state: states[i % states.length],
          pincode: `${randomInt(100000, 999999)}`
        },
        customerType: randomChoice(customerTypes),
        gstNumber: Math.random() > 0.5 ? `${randomInt(10, 99)}ABCDE${randomInt(1000, 9999)}F1Z${randomInt(1, 9)}` : undefined,
        status: 'active',
        creditLimit: randomInt(10000, 100000),
        outstandingAmount: 0
      });
    }
    
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`✅ Created ${createdCustomers.length} customers\n`);
    return createdCustomers;
  } catch (error) {
    console.error('❌ Error creating customers:', error);
    process.exit(1);
  }
};

const seedProducts = async (categories, suppliers) => {
  try {
    console.log('📦 Creating products...');
    
    const productPrefixes = ['Premium', 'Standard', 'Economy', 'Deluxe', 'Pro', 'Ultra', 'Super', 'Mega', 'Power', 'Smart'];
    const products = [];
    
    for (let i = 0; i < 500; i++) {
      const costPrice = parseFloat(randomFloat(50, 5000));
      const markup = parseFloat(randomFloat(1.2, 2.5));
      const sellingPrice = parseFloat((costPrice * markup).toFixed(2));
      
      products.push({
        name: `${randomChoice(productPrefixes)} Product ${i + 1}`,
        sku: `SKU-${randomInt(1000, 9999)}-${i}`,
        category: randomChoice(categories)._id,
        supplier: randomChoice(suppliers)._id,
        description: `High quality product ${i + 1}`,
        costPrice,
        sellingPrice,
        unit: randomChoice(['piece', 'kg', 'liter', 'box', 'meter', 'dozen']),
        currentStock: randomInt(10, 1000),
        reorderLevel: randomInt(10, 50),
        warehouse: randomChoice(['Main Warehouse', 'Warehouse A', 'Warehouse B']),
        status: 'active'
      });
    }
    
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);
    return createdProducts;
  } catch (error) {
    console.error('❌ Error creating products:', error);
    process.exit(1);
  }
};

const seedVehicles = async () => {
  try {
    console.log('🚚 Creating vehicles...');
    
    const vehicles = [];
    for (let i = 0; i < 30; i++) {
      vehicles.push({
        vehicleNumber: `MH${randomInt(10, 99)}${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(1000, 9999)}`,
        vehicleType: randomChoice(vehicleTypes),
        model: `Model ${randomInt(2018, 2024)}`,
        capacity: randomInt(500, 5000),
        driver: {
          name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
          phone: `98765${randomInt(10000, 99999)}`,
          license: `DL${randomInt(10, 99)}${randomInt(100000000000, 999999999999)}`
        },
        status: randomChoice(['available', 'in-transit', 'maintenance']),
        fuelType: randomChoice(['petrol', 'diesel', 'cng'])
      });
    }
    
    const createdVehicles = await Vehicle.create(vehicles);
    console.log(`✅ Created ${createdVehicles.length} vehicles\n`);
    return createdVehicles;
  } catch (error) {
    console.error('❌ Error creating vehicles:', error);
    process.exit(1);
  }
};

const seedOrders = async (customers, products, users) => {
  try {
    console.log('📝 Creating 100,000+ orders (this may take a few minutes)...');
    
    const totalOrders = 100000;
    const batchSize = 1000;
    const batches = Math.ceil(totalOrders / batchSize);
    
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2024-03-07');
    
    let ordersCreated = 0;
    
    for (let batch = 0; batch < batches; batch++) {
      const orders = [];
      
      for (let i = 0; i < batchSize; i++) {
        const orderDate = randomDate(startDate, endDate);
        const numItems = randomInt(1, 5);
        const items = [];
        let subtotal = 0;
        
        for (let j = 0; j < numItems; j++) {
          const product = randomChoice(products);
          const quantity = randomInt(1, 20);
          const discount = parseFloat(randomFloat(0, product.sellingPrice * quantity * 0.1));
          const total = (product.sellingPrice * quantity) - discount;
          subtotal += total;
          
          items.push({
            product: product._id,
            productName: product.name,
            quantity,
            unitPrice: product.sellingPrice,
            costPrice: product.costPrice,
            discount,
            total
          });
        }
        
        const orderDiscount = parseFloat(randomFloat(0, subtotal * 0.05));
        const tax = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
        const totalAmount = subtotal - orderDiscount + tax;
        
        const orderStatus = randomChoice(orderStatuses);
        const paymentStatus = orderStatus === 'completed' ? 'paid' : randomChoice(paymentStatuses);
        const paidAmount = paymentStatus === 'paid' ? totalAmount : parseFloat(randomFloat(0, totalAmount));
        
        orders.push({
          orderNumber: `ORD-${orderDate.getTime()}-${batch * batchSize + i}`,
          customer: randomChoice(customers)._id,
          items,
          subtotal,
          discount: orderDiscount,
          tax,
          totalAmount,
          paymentStatus,
          paymentMethod: randomChoice(paymentMethods),
          paidAmount,
          orderStatus,
          orderDate,
          deliveryDate: orderStatus === 'completed' ? new Date(orderDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000) : null,
          createdBy: randomChoice(users.filter(u => u.role !== 'customer'))._id
        });
      }
      
      await Order.insertMany(orders);
      ordersCreated += orders.length;
      
      // Progress indicator
      const progress = ((batch + 1) / batches * 100).toFixed(1);
      process.stdout.write(`\r   Progress: ${progress}% (${ordersCreated} orders created)`);
    }
    
    console.log(`\n✅ Created ${ordersCreated} orders\n`);
    
    // Return sample for delivery creation
    const sampleOrders = await Order.find().limit(5000);
    return sampleOrders;
  } catch (error) {
    console.error('\n❌ Error creating orders:', error);
    process.exit(1);
  }
};

const seedDeliveries = async (orders, vehicles, users) => {
  try {
    console.log('🚛 Creating deliveries...');
    
    const deliveries = [];
    
    // Create deliveries for completed and processing orders
    const deliveryOrders = orders.filter(o => ['completed', 'processing', 'ready'].includes(o.orderStatus));
    
    for (const order of deliveryOrders) {
      const scheduledDate = new Date(order.orderDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
      const deliveryStatus = order.orderStatus === 'completed' ? 'delivered' : randomChoice(deliveryStatuses);
      
      const customer = await Customer.findById(order.customer);
      
      deliveries.push({
        order: order._id,
        deliveryNumber: `DEL-${order.orderDate.getTime()}-${randomInt(1000, 9999)}`,
        vehicle: randomChoice(vehicles)._id,
        driver: {
          name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
          phone: `98765${randomInt(10000, 99999)}`
        },
        deliveryAddress: customer.address,
        scheduledDate,
        actualDeliveryDate: deliveryStatus === 'delivered' ? new Date(scheduledDate.getTime() + randomInt(0, 2) * 24 * 60 * 60 * 1000) : null,
        deliveryStatus,
        priority: randomChoice(['low', 'normal', 'high', 'urgent']),
        deliveryProof: deliveryStatus === 'delivered' ? `PROOF-${randomInt(10000, 99999)}` : undefined,
        failureReason: deliveryStatus === 'failed' ? randomChoice(['Customer not available', 'Wrong address', 'Refused delivery']) : undefined,
        assignedBy: randomChoice(users.filter(u => u.role !== 'customer'))._id
      });
    }
    
    const createdDeliveries = await Delivery.insertMany(deliveries);
    console.log(`✅ Created ${createdDeliveries.length} deliveries\n`);
    return createdDeliveries;
  } catch (error) {
    console.error('❌ Error creating deliveries:', error);
    process.exit(1);
  }
};

const seedInventoryTransactions = async (products, users) => {
  try {
    console.log('📊 Creating inventory transactions...');
    
    const transactions = [];
    
    // Create some stock-in and stock-out transactions for random products
    for (let i = 0; i < 1000; i++) {
      const product = randomChoice(products);
      const transactionType = randomChoice(['stock-in', 'stock-out', 'adjustment']);
      const quantity = randomInt(10, 100);
      const stockBefore = randomInt(50, 500);
      const stockAfter = transactionType === 'stock-in' ? stockBefore + quantity : stockBefore - quantity;
      
      transactions.push({
        product: product._id,
        transactionType,
        quantity,
        stockBefore,
        stockAfter,
        reason: transactionType === 'stock-in' ? 'Purchase' : transactionType === 'stock-out' ? 'Sale' : 'Adjustment',
        referenceType: transactionType === 'stock-in' ? 'purchase' : transactionType === 'stock-out' ? 'sale' : 'adjustment',
        warehouse: randomChoice(['Main Warehouse', 'Warehouse A', 'Warehouse B']),
        performedBy: randomChoice(users.filter(u => u.role !== 'customer'))._id,
        createdAt: randomDate(new Date('2022-01-01'), new Date())
      });
    }
    
    const createdTransactions = await Inventory.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} inventory transactions\n`);
    return createdTransactions;
  } catch (error) {
    console.error('❌ Error creating inventory transactions:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await clearDatabase();
  
  const users = await seedUsers();
  const categories = await seedCategories();
  const suppliers = await seedSuppliers();
  const customers = await seedCustomers();
  const products = await seedProducts(categories, suppliers);
  const vehicles = await seedVehicles();
  const orders = await seedOrders(customers, products, users);
  await seedDeliveries(orders, vehicles, users);
  await seedInventoryTransactions(products, users);
  
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${await User.countDocuments()}`);
  console.log(`   Categories: ${await Category.countDocuments()}`);
  console.log(`   Suppliers: ${await Supplier.countDocuments()}`);
  console.log(`   Customers: ${await Customer.countDocuments()}`);
  console.log(`   Products: ${await Product.countDocuments()}`);
  console.log(`   Vehicles: ${await Vehicle.countDocuments()}`);
  console.log(`   Orders: ${await Order.countDocuments()}`);
  console.log(`   Deliveries: ${await Delivery.countDocuments()}`);
  console.log(`   Inventory Transactions: ${await Inventory.countDocuments()}`);
  
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin - Email: admin@inventory.com, Password: admin123');
  console.log('   Staff - Email: staff@inventory.com, Password: staff123');
  console.log('   Customer - Email: customer@example.com, Password: customer123\n');
  
  process.exit(0);
};

seedDatabase();
