import { Router } from 'https://deno.land/x/oak/mod.ts'

import { AddressController } from '../controllers/addressController.ts';
import MongoDBStrategy from '../db/mongoDBStrategy.ts';

const mongoDBStrategy = new MongoDBStrategy('address');
const addressRouter = () => {
  const addressController = new AddressController(new Router(), mongoDBStrategy);
  addressController.init();
  return addressController.router;
};

export default addressRouter;
