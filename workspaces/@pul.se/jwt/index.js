import jwt from 'jsonwebtoken';

export const sign = function(payload) {
  return jwt.sign(payload, atob(process.env.JWT_PRIVATE_KEY), { algorithm: 'RS256' });
};

export const verify= function(payload) {
  return jwt.verify(payload, atob(process.env.JWT_PUBLIC_KEY));
};

