export default interface IDb {
  create(item: any): any;

  read(item: any, many: boolean): any;

  update(id: string, item: any): any;

  delete(id: string, item: any): any;

  isConnected(): Promise<boolean>;
}
