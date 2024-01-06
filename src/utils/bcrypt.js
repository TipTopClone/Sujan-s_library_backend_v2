import bcrypt from 'bcryptjs';
const salt = 15;

export const hashPassword = (plaintext) => {
  return bcrypt.hashSync(plaintext, salt);
};

export const comparePassword = (plaintext, hashPass) => {
  return bcrypt.compareSync(plaintext, hashPass);
};
