import { hash, verify } from "@node-rs/argon2";

const hashOptions = {
  memoryCost: 19_456,
  parallelism: 1,
  timeCost: 2,
};

export async function hashPassword(password: string) {
  return hash(password, hashOptions);
}

export async function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
