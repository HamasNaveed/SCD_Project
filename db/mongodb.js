const { MongoClient, ObjectId } = require('mongodb');

class MongoDB {
  constructor() {
    this.connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
    this.dbName = process.env.MONGODB_DATABASE_NAME || "nodevault";
    this.collectionName = process.env.MONGODB_COLLECTION_NAME || "records";
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async addRecord(record) {
    const collection = this.db.collection(this.collectionName);
    const result = await collection.insertOne({
      ...record,
      createdAt: new Date()
    });
    return result.insertedId;
  }

  async listRecords() {
    const collection = this.db.collection(this.collectionName);
    const records = await collection.find({}).toArray();
    // Convert to match existing format
    return records.map(record => ({
      id: record._id.toString(),
      name: record.name,
      value: record.value,
      createdAt: record.createdAt
    }));
  }

  async updateRecord(id, newName, newValue) {
    const collection = this.db.collection(this.collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: newName, value: newValue, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async deleteRecord(id) {
    const collection = this.db.collection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async searchRecords(searchTerm) {
    const collection = this.db.collection(this.collectionName);
    const term = searchTerm.toLowerCase();
    
    const records = await collection.find({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { value: { $regex: term, $options: 'i' } }
      ]
    }).toArray();
    
    return records.map(record => ({
      id: record._id.toString(),
      name: record.name,
      value: record.value,
      createdAt: record.createdAt
    }));
  }

  async getVaultStatistics() {
    const collection = this.db.collection(this.collectionName);
    const records = await collection.find({}).toArray();
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        message: "No records in vault"
      };
    }
    
    // Find longest name
    const longestNameRecord = records.reduce((longest, current) => 
      current.name.length > longest.name.length ? current : longest
    , { name: '', value: '' });
    
    // Find creation dates
    const creationDates = records.map(record => new Date(record.createdAt));
    const earliestDate = new Date(Math.min(...creationDates));
    const latestDate = new Date(Math.max(...creationDates));
    
    return {
      totalRecords: records.length,
      lastModified: new Date().toLocaleString(),
      longestName: `${longestNameRecord.name} (${longestNameRecord.name.length} characters)`,
      earliestRecord: earliestDate.toLocaleDateString(),
      latestRecord: latestDate.toLocaleDateString()
    };
  }
}

module.exports = new MongoDB();
