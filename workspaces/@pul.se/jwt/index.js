import jwt from 'jsonwebtoken';

export const sign = function(payload) {
  return jwt.sign(payload, atob(process.env.JWT_PRIVATE_KEY), { algorithm: 'RS256' });
};

export const verify = function(payload) {
  try {
    return jwt.verify(payload, atob(process.env.JWT_PUBLIC_KEY));
  } catch(error) {
    throw new Error('Unauthorized');
  }
};

