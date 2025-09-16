module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'yourSecretKey',
  expiresIn: '10y', // JWT valid for 10 years
};
