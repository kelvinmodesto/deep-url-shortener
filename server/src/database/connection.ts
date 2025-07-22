import { MongoClient, Db } from 'mongodb';
import { databaseConfig } from '../config';

class DatabaseConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      if (this.isConnected && this.client && this.db) {
        return;
      }

      console.log('Connecting to MongoDB...');

      this.client = new MongoClient(databaseConfig.uri, databaseConfig.options);
      await this.client.connect();

      this.db = this.client.db(databaseConfig.dbName);
      this.isConnected = true;

      console.log(`Connected to MongoDB database: ${databaseConfig.dbName}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.isConnected = false;
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getClient(): MongoClient {
    if (!this.client || !this.isConnected) {
      throw new Error('Database client not connected. Call connect() first.');
    }
    return this.client;
  }

  isDbConnected(): boolean {
    return this.isConnected && this.client !== null && this.db !== null;
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.db) {
        return false;
      }
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }

  async createIndexes(): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }

      const urlsCollection = this.db.collection('urls');

      // Create indexes for better performance
      await urlsCollection.createIndex({ shortCode: 1 }, { unique: true });
      await urlsCollection.createIndex({ originalUrl: 1 });
      await urlsCollection.createIndex({ createdAt: 1 });
      await urlsCollection.createIndex({ userId: 1 });
      await urlsCollection.createIndex({ isActive: 1 });
      await urlsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await urlsCollection.createIndex({ tags: 1 });

      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Failed to create database indexes:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const databaseConnection = new DatabaseConnection();

export { databaseConnection };
export default databaseConnection;
