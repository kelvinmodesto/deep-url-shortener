import Random from './Random.js';

export default function createId() {
  const r =  new Random();
  return r.string(Math.floor((Math.random() * 6) + 5), Random.UNAMBIGOUS_ALPHA_NUMERICS);
}
