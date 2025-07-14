import { MongoClient } from 'mongodb';
import IDb from '@db/base/db.interface.js';
import getEnvironmentValues from '@utils/getEnvironmentValues';

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
    this.connect();
  }

  changeModel(newModel: string): void {
    this.model = this.client.database(this.dbName).collection(this.modelName);
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
    return `${db}://${user}:${pass}@${host}:${port}/${name}`;
  }

  connect() {
    const client = new MongoClient();

    client.connectWithUri(this.dbURL);
    this.client = client;
    this.model = this.client.database(this.dbName).collection(this.modelName);
  }

  getClient(): MongoClient {
    return this.client;
  }

  async isConnected(): Promise<boolean> {
    const names = await this.client.listDatabases();
    return names.length > 0;
  }

  async create(item: any = {}) {
    return await this.model.insertOne(item);
  }

  async read(item: any = {}, many: boolean = false) {
    if (many) {
      return await this.model.find(item);
    } else {
      return await this.model.findOne(item);
    }
  }

  async update(id: string, item: any = {}) {
    return await this.model.updateOne({ _id: { $oid: id } }, { $set: item });
  }

  async delete(id: string, item = {}) {
    return await this.model.deleteOne({ _id: id });
  }
}
