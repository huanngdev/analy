import argon2 from 'argon2'

export const password = {
  hash: (password: string) => {
    return argon2.hash(password)
  },
  verify: (password: string, hash: string) => {
    return argon2.verify(hash, password)
  },
}
