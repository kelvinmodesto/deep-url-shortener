import { MongoClient, ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import IDb from '../base/db.interface';
import { getEnvironmentValues } from '../../config/environment.config.js';

@Injectable()
export default class MongoDBStrategy implements IDb {
  public model: any;
  public modelName: string;
  public client: MongoClient;
  public database: any;
  public dbURL: string;
  public dbName: string;

  constructor(modelName: string) {
    this.client = {} as MongoClient;
    this.modelName = modelName;
    this.dbURL = this.buildConnectionString();
    this.dbName = this.getDatabase();
  }

  changeModel(newModel: string): void {
    this.modelName = newModel;
    if (this.client && this.database) {
      this.model = this.database.collection(this.modelName);
    }
  }

  getDatabase(): string {
    const {
      mongo: { DB_NAME_MONGO: name },
    } = getEnvironmentValues();
    return name;
  }

  buildConnectionString(): string {
    const {
      mongo: {
        DB_MONGO: db,
        DB_USER_MONGO: user,
        DB_PASS_MONGO: pass,
        DB_HOST_MONGO: host,
        DB_NAME_MONGO: name,
        DB_PORT_MONGO: port,
      },
    } = getEnvironmentValues();

    // Build connection string with or without authentication
    if (user && pass) {
      return `${db}://${user}:${pass}@${host}:${port}/${name}`;
    } else {
      return `${db}://${host}:${port}/${name}`;
    }
  }

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.dbURL);
      await this.client.connect();
      this.database = this.client.db(this.dbName);
      this.model = this.database.collection(this.modelName);
      console.log(`Connected to MongoDB: ${this.dbName}/${this.modelName}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  getClient(): MongoClient {
    return this.client;
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.db('admin').admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection check failed:', error);
      return false;
    }
  }

  async create(item: any = {}): Promise<ObjectId> {
    try {
      const result = await this.model.insertOne(item);
      return result.insertedId;
    } catch (error) {
      console.error('MongoDB create error:', error);
      throw error;
    }
  }

  async read(query: any = {}, many: boolean = false): Promise<any> {
    try {
      if (many) {
        return await this.model.find(query).toArray();
      } else {
        return await this.model.findOne(query);
      }
    } catch (error) {
      console.error('MongoDB read error:', error);
      throw error;
    }
  }

  async update(id: string, item: any = {}): Promise<any> {
    try {
      const objectId = new ObjectId(id);
      return await this.model.updateOne({ _id: objectId }, { $set: item });
    } catch (error) {
      console.error('MongoDB update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const objectId = new ObjectId(id);
      return await this.model.deleteOne({ _id: objectId });
    } catch (error) {
      console.error('MongoDB delete error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}
