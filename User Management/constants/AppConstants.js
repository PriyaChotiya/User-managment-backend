const ROOT_PATH = process.cwd();
// const CONFIG_CONSTANT = require('./ConfigConstants');

exports.EMAIL_TEMPLATE = {
  VERIFY_ACCOUNT: `${ROOT_PATH}/constants/template/email/verifyAccount.html`,
  RESET_PASSWORD: `${ROOT_PATH}/constants/template/email/resetPassword.html`,
};
