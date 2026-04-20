import jwt from 'jsonwebtoken';

export const sign = function(payload) {
  return jwt.sign(payload, atob(process.env.JWT_PRIVATE_KEY), { algorithm: 'RS256' });
};

export const verify = function(request, response, next) {
  try {
    request.user = jwt.verify(request.cookies.ACCESS_TOKEN, atob(process.env.JWT_PUBLIC_KEY));

    next();
  } catch(error) {
    throw new Error('Unauthorized');
  }
};

