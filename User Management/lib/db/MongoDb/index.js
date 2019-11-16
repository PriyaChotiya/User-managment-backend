
const mongoose = require('mongoose');

const CONFIG_CONSTANTS = require('../../../constants/ConfigConstants');

mongoose.connect(CONFIG_CONSTANTS.CONFIG.dbUrl, CONFIG_CONSTANTS.CONFIG.option);
const db = mongoose.connection;

db.on('error', (error) => {
  console.log('Error while connecting to mongodb database:', error);
});

db.once('open', () => {
  console.log('Successfully connected to mongodb database');
});

db.on('disconnected', () => {
  // Reconnect on timeout
  // mongoose.connect(CONFIG_CONSTANTS.CONFIG.dbUrl, CONFIG_CONSTANTS.CONFIG.option)
  // db = mongoose.connection

  console.log('database diconnect');
});
