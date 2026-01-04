const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://achus2710_db_user:medece123@hft.h7axldb.mongodb.net/medeasedb?retryWrites=true&w=majority&appName=HFT";

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== Collections in Database ===');
    console.log(`Total collections: ${collections.length}\n`);
    
    for (const col of collections) {
      console.log(`- ${col.name}`);
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  Documents: ${count}`);
      
      // Show sample data from each collection
      if (count > 0) {
        const sample = await mongoose.connection.db.collection(col.name).findOne();
        console.log(`  Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...\n');
      } else {
        console.log('');
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
