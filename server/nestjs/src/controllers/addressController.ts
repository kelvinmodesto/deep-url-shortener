import { Request, Response, RouteParams } from 'https://deno.land/x/oak/mod.ts';
import createId from '../utils/createId.js';

export class AddressController {
  public router: any;
  public context: any;
  constructor(router: any, context: any) {
    this.router = router;
    this.context = context;
  }
  init() {
    // list all routes
    this.createAddress();
    this.readAddress();
    this.readAddresses();
    this.updateAddress();
    this.deleteAddress();
  }
  createAddress() {
    this.router.post(
      'address',
      async ({
        request,
        response,
      }: {
        request: Request;
        response: Response;
      }) => {
        if (!request.hasBody) {
          response.status = 400;
          response.body = { msg: 'Invalid url data' };
          return;
        }

        const {
          value: { url },
        } = await request.body();

        if (!url) {
          response.status = 422;
          response.body = { msg: 'Incorrect address data. url are required' };
          return;
        }

        const addressId = await this.context.create({
          url,
          encodedUrl: createId(),
        });

        response.body = { msg: 'Address created', addressId };
      },
    );
  }
  readAddress() {
    this.router.get(
      '/address:id',
      async ({
        params,
        response,
      }: {
        params: RouteParams;
        response: Response;
      }) => {
        const { id: addressId } = params;

        if (!addressId) {
          response.status = 400;
          response.body = { msg: 'Invalid address id' };
          return;
        }

        const foundAddress = await this.context.read(addressId, false);
        if (!foundAddress) {
          response.status = 404;
          response.body = { msg: `Address with ID ${addressId} not found` };
          return;
        }

        response.body = foundAddress;
      },
    );
  }
  readAddresses() {
    this.router.get(
      '/address',
      async ({ response }: { response: Response }) => {
        response.body = await this.context.read(true);
      },
    );
  }
  updateAddress() {
    this.router.put(
      '/address:id',
      async ({
        params,
        request,
        response,
      }: {
        params: any;
        request: Request;
        response: Response;
      }) => {
        const { id: addressId } = params;

        if (!addressId) {
          response.status = 400;
          response.body = { msg: 'Invalid address id' };
          return;
        }

        if (!request.hasBody) {
          response.status = 400;
          response.body = { msg: 'Invalid user data' };
          return;
        }

        const {
          value: { url },
        } = await request.body();

        await this.context.update(addressId, { url });

        response.body = { msg: 'url updated' };
      },
    );
  }
  deleteAddress() {
    this.router.delete(
      '/address:id',
      async ({
        params,
        response,
      }: {
        params: RouteParams;
        response: Response;
      }) => {
        const { id: addressId } = params;

        if (!addressId) {
          response.status = 400;
          response.body = { msg: 'Invalid address id' };
          return;
        }

        const foundAddress = await this.context.read(addressId);
        if (!foundAddress) {
          response.status = 404;
          response.body = { msg: `Address with ID ${addressId} not found` };
          return;
        }

        await this.context.remove(addressId);
        response.body = { msg: 'Address deleted' };
      },
    );
  }
}
