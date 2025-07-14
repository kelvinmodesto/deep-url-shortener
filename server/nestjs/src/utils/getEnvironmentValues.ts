import { config } from 'https://deno.land/x/dotenv/mod.ts';

export default function getEnvironmentValues() {

  const {
    DB_MONGO,
    DB_USER_MONGO,
    DB_PASS_MONGO,
    DB_NAME_MONGO,
    DB_HOST_MONGO,
    DB_PORT_MONGO,
    PORT,
  } = config();

  return {
    mongo: {
      DB_MONGO,
      DB_HOST_MONGO,
      DB_NAME_MONGO,
      DB_PASS_MONGO,
      DB_USER_MONGO,
      DB_PORT_MONGO
    },
    PORT,
    URL
  }
}
