import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/inventory_analytics')
  .then(async () => {
    const db = mongoose.connection.db;
    const categories = await db.collection('superstoreorders').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n✅ Categories in database:');
    categories.forEach(c => console.log(`   ${c._id}: ${c.count.toLocaleString()} orders`));
    
    const sampleOrder = await db.collection('superstoreorders').findOne();
    console.log('\n📦 Sample Order:');
    console.log(`   Product: ${sampleOrder.productName}`);
    console.log(`   Category: ${sampleOrder.category}`);
    console.log(`   SubCategory: ${sampleOrder.subCategory}`);
    console.log(`   Region: ${sampleOrder.region}`);
    console.log(`   Segment: ${sampleOrder.segment}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
