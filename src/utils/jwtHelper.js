import jwt from 'jsonwebtoken';
import { createSession } from '../models/session/SessionModel.js';
import { updateRefreshJWT } from '../models/user/UserModel.js';

//access jwt: session table, exp:15min

export const signAccessJWT = (obj) => {
  const token = jwt.sign(obj, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
  createSession({ token });
  return token;
};

//refresh jwt: user table, exp: 30 days

export const signRefreshJWT = (email) => {
  try {
    const token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });
    updateRefreshJWT(email, token);
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const signJWTs = (email) => {
  return {
    accessJWT: signAccessJWT({ email }),
    refreshJWT: signRefreshJWT(email),
  };
};
