export default () => ({
  env: {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    dbServiceUrl: process.env.DB_SERVICE_URL || 'http://localhost:3000',
  },
});
