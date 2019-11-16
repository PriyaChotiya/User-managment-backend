const ENVIRONMENT = require('./Environment');

exports.CONFIG = {
  nodeEnv: ENVIRONMENT.ENV,
  uiAdminUrl: ENVIRONMENT.APIURL,
  apiUrl: ENVIRONMENT.APIURL,
  dbUrl: ENVIRONMENT.DBURL,
  option: {
    reconnectTries: 5000,
    reconnectInterval: 0,
    socketTimeoutMS: 100000,
    connectTimeoutMS: 100000,
    useNewUrlParser: true,
  },
};
