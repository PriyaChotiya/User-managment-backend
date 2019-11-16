/* eslint-disable consistent-return ,no-underscore-dangle, no-shadow, no-param-reassign */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const juice = require('juice');
const _ = require('lodash');
const async = require('async');
const crypto = require('crypto');
const Boom = require('boom');
const APP_CONSTANTS = require('../constants/AppConstants');
const CONFIG_CONSTANTS = require('../constants/ConfigConstants');
// const nodemailer = require('nodemailer')
const User = require('../models/User');
const { sendSimpleMail } = require('../lib/utils/Utils');

mongoose.model('User');

module.exports = {
  // register user
  registerUSer(req, res, next) {
    const token = jwt.sign({
      user: req.body,
    }, 'secretkey');
    const {
      name,
      email,
      password,
      password2,
    } = req.body;
    // check required fields
    if (!name || !email || !password || !password2) {
      res.json({
        msg: 'Please fill in all fields',
        status: '400',
      });
    }
    // check password length
    if (password.length < 6) {
      res.json({
        msg: 'Password should be at least 6 characters',
        status: '400',
      });
    }
    // check passwords match
    if (password !== password2) {
      res.json({
        msg: 'Passwords do not match',
        status: '400',
      });
    }
    // Match User
    User.findOne({
      email,
    }).then((user) => {
      if (user) {
        // res.status(400).json({
        //   message: 'User already register',
        // });

        return next(Boom.badRequest('User already register'));
      }
      bcrypt.genSalt(10, (_err, salt) => bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) {
          throw err;
        }
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = hash;
        newUser.data = Date.now;
        newUser.token = token;
        // eslint-disable-next-line no-shadow
        newUser.save(() => {
          res.status(200).json({
            message: 'New user created successfully',
            obj: newUser,
          });
        });

        fs.readFile(APP_CONSTANTS.EMAIL_TEMPLATE.VERIFY_ACCOUNT, 'utf8', (error, fileData) => {
          if (error) {
            return console.log('Something goes wrong! Please try again.');
          }
          let compiledTemplate = _.template(fileData);
          const emailData = {
            username: req.body.name,
            loginURL: `${CONFIG_CONSTANTS.CONFIG.uiAdminUrl}/user/verify/${token}`,
          };
          compiledTemplate = compiledTemplate(emailData);
          const htmlData = juice(compiledTemplate);
          const linkToVerifyEmail = `${CONFIG_CONSTANTS.CONFIG.uiAdminUrl}/user/verify/${token}`;
          const mailOptions = {
            html: htmlData,
            from: 'developer.patoliya@gmail.com', // sender address
            to: req.body.email,
            subject: 'Please Verify Your Email Address', // Subject line
            text: `Verify your email address, please follow this link: ${linkToVerifyEmail}.`,
          };
          sendSimpleMail(mailOptions, (errorMail) => {
            if (errorMail) {
              console.log('Somehing went wrong');
              return next(Boom.badRequest('Mail not found'));
            }
            res.json({
              msg: 'User Successfully register',
              status: '200',
              token,
            });
          });
        });
      }));
    })
      .catch(() =>
        // res.status(400).json({
        //   message: 'There was an error creating the user',
        //   errorType: 2,
        //   data: 'user',
        //   error: err,
        // });
        // eslint-disable-next-line implicit-arrow-linebreak
        next(Boom.badRequest('There was an error creating the user')));
  },
  // login user
  loginUser(req, res, next) {
    // Match User
    User.findOne({
      email: req.body.email,
      confirmed: true,
    }).then((user) => {
      // Match Password
      bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        if (err) {
          throw err;
        }
        const newUser = new User();
        newUser._id = user._id;
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.data = Date.now;
        newUser.token = user.token;

        if (isMatch) {
          res.status(200).json({
            message: 'Users retrieved successfully',
            obj: newUser,
          });
        } else {
          // res.status(400).json({
          //   title: 'There was an error retrieving users',
          //   errorType: 1,
          //   data: 'user',
          // });
          return next(Boom.badRequest('There was an error retrieving the user'));
        }
      });
    }).catch(() => next(Boom.badRequest('User not found')));
    // .catch((err) => res.status(400).json({
    //   title: 'There was an error retrieving users',
    //   errorType: 1,
    //   data: 'user',
    //   err,
    //   // error: err.stack,
    // }));
    // .then((user) => {
    //   if (!user) {
    //     res.json({
    //       msg: 'That email is not register',
    //       status: '400',
    //     });
    //   } else {
    //     // Match Password
    //     bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
    //       if (err) {
    //         throw err;
    //       }

    //       const newUser = new User();
    //       newUser._id = user._id;
    //       newUser.name = req.body.name;
    //       newUser.email = req.body.email;
    //       newUser.data = Date.now;
    //       newUser.token = user.token;

    //       if (isMatch) {
    //         res.json({
    //           msg: 'Succuess',
    //           data: newUser,
    //           // token,
    //           status: '200',
    //         });
    //       } else {
    //         res.json({
    //           msg: 'Password is incorrect',
    //           status: '400',
    //         });
    //       }
    //     });
    //   }
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  },
  // forgot password
  forgotPassword(req, res, next) {
    User.findOne({
      email: req.body.email,
    }, (_err, user) => {
      if (!user) {
        // res.json({
        //   msg: 'No account with that email address exists.',
        //   status: '400',
        // });
        next(Boom.badRequest('No account with that emaill address exists'));
      } else {
        // user.resetPasswordToken = token;
        // user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        // user.save(() => {
        //   // done(err, token, user)
        // });
        console.log('Please check email addre');
        // eslint-disable-next-line handle-callback-err
        fs.readFile(APP_CONSTANTS.EMAIL_TEMPLATE.RESET_PASSWORD, 'utf8', (error, fileData) => {
          if (error) {
            return console.log('Something goes wrong! Please try again.');
          }
          let compiledTemplate = _.template(fileData);
          const emailData = {
            username: user.name,
            loginURL: `${CONFIG_CONSTANTS.CONFIG.uiAdminUrl}/user/reset`,
          };
          compiledTemplate = compiledTemplate(emailData);
          const htmlData = juice(compiledTemplate);
          const linkToVerifyEmail = `${CONFIG_CONSTANTS.CONFIG.uiAdminUrl}/user/reset/${user._id}`;
          const mailOptions = {
            html: htmlData,
            from: 'developer.patoliya@gmail.com', // sender address
            to: user.email,
            subject: 'Please Verify Your Email Address for change password', // Subject line
            text: `Verify your email address, please follow this link: ${linkToVerifyEmail}.`,
          };
          sendSimpleMail(mailOptions, (errorMail) => {
            if (errorMail) {
              // console.log('Somehing went wrong');
              next(Boom.badRequest('No account with that emaill address exists'));
            } else {
              // res.json({
              //   msg: 'Please check email address',
              //   status: '200',
              // });

              res.status(200).json({
                message: 'Please check email address',
                obj:user
              });
            }
          });
        });
      }
    });
  },
  // get reset password
  // getResetPassword(req, res) {
  //   User.findOne({
  //     resetPasswordToken: req.params.token,
  //     resetPasswordExpires: {
  //       $gt: Date.now(),
  //     },
  //   }, (_err, user) => {
  //     if (!user) {
  //       console.log('error', 'Password reset token is invalid or has expired.');
  //       res.json({
  //         msg: 'User not Found',
  //         status: '400',
  //       });
  //     } else {
  //       res.json({
  //         msg: 'Reset Password',
  //         status: '200',
  //       });
  //     }
  //   });
  // },
  // set reset password
  setResetPassword(req, res, next) {
    // User.findOne({
    //   // resetPasswordToken: req.params.token,
    //   // resetPasswordExpires: {
    //   //   $gt: Date.now(),
    //   // },
    //   email: req.email,
    // }, (_err, user) => {
    //   if (!user) {
    //     console.log('error', 'Password reset token is invalid or has expired.');
    //     res.json({
    //       msg: 'Password reset token is invalid or has expired',
    //       status: '400',
    //     });
    //   }
    //   if (req.body.password === req.body.confirm) {
    //     // Hash Password
    //     bcrypt.genSalt(10, (_err, salt) => bcrypt.hash(req.body.password, salt, (err, hash) => {
    //       if (err) {
    //         throw err;
    //       }
    //       user.password = hash;
    //       user.resetPasswordToken = undefined;
    //       user.resetPasswordExpires = undefined;
    //       user.save((err) => {
    //         if (err) {
    //           console.log('error', 'Password not changed.');
    //           res.json({
    //             msg: 'User not Found',
    //             status: '400',
    //           });
    //         } else {
    //           res.json({
    //             msg: 'Reset Password done',
    //             status: '200',
    //           });
    //         }
    //       });
    //     }));
    //     // resetPasswordEmail(req, user)
    //     // done(user, done)
    //   } else {
    //     res.json({
    //       msg: 'Password does not match',
    //       status: '400',
    //     });
    //   }
    // });

    User.findOne({
      _id: req.params.id,
    }).then((user) => {
      if (req.body.password === req.body.confirm) {
        // Hash Password

        bcrypt.genSalt(10, (_err, salt) => bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }          
          user.password = hash;
          user.save((err) => {
            if (err) {
              next(Boom.badRequest('Password does not change'));
            } else {
              res.status(200).json({
                message: 'Password change please login',
              });
            }
          });
        }));
      }
    })
      .catch(() => next(Boom.badRequest('Password not changed')));
  },
  // verify user
  verifyUser(req, res, next) {
    // User.findOne({
    //   token: req.params.token,
    // }, (_err, user) => {
    //   console.log(user, req.params.token);
    //   if (user) {
    //     user.confirmed = true;
    //     user.save((err) => {
    //       if (err) {
    //         res.json({
    //           msg: 'User not Found',
    //           status: '400',
    //         });
    //       } else {
    //         res.json({
    //           msg: 'User verify',
    //           status: '200',
    //           data: user,
    //         });
    //       }
    //     });
    //   }
    // });

    User.findOne({
      token: req.params.token,
    }).then((user) => {
      user.confirmed = true;
      user.save(() => res.status(200).json({
        message: 'Users Platform Manager link matches',
        status: true,
      }));
    }).catch(() => next(Boom.badRequest('Error in verify user')));
    // .catch((error) => res.status(400).json({
    //   title: 'Error retrieving platform manager',
    //   errorType: 1,
    //   data: 'platform manager',
    //   error: error.stack,
    // }));
  },
  // profile
  getUserProfile(req, res, next) {
    // User.findById(req.params.id, (err, doc) => {
    //   if (err) {
    //     res.status(400).json({
    //       message: 'Not user found',
    //     });
    //   }
    //   res.status(200).json({
    //     data: doc,
    //   });
    // });
    User.findById(req.params.id).then((users) => res.status(200).json({
      message: 'Users retrieved successfully',
      obj: users,
    }))
      .catch(() => next(Boom.badRequest('Error in retrieved user')));
    // .catch((err) => res.status(400).json({
    //   title: 'There was an error retrieving users',
    //   errorType: 1,
    //   data: 'user',
    //   error: err.stack,
    // }));
  },
  getAllUser(req, res, next) {
    // User.find({}, (err, doc) => {
    //   if (err) {
    //     res.status(400).json({
    //       message: 'No users found',
    //     });
    //   }
    //   res.status(200).json({
    //     data: doc,
    //   });
    // });
    User.find({}).then((users) => res.status(200).json({
      message: 'Users retrieved successfully',
      obj: users,
    }))
      .catch(() => next(Boom.badRequest('Error in retrieved user')));
    // .catch((err) => res.status(400).json({
    //   title: 'There was an error retrieving users',
    //   errorType: 1,
    //   data: 'user',
    //   error: err.stack,
    // }));
  },
  // update
  update(req, res, next) {
    User.findOneAndUpdate({ _id: req.body._id }).then((users) => res.status(200).json({
      message: 'User updated successfully',
      obj: users,
    }))
      .catch(() => next(Boom.badRequest('Error in retrieved user')));
    // .catch((err) => res.status(400).json({
    //   title: 'Error Updating user',
    //   errorType: 1,
    //   data: 'user',
    //   error: err.stack,
    // }));
    // User.findOneAndUpdate({
    //   _id: req.body._id,
    // }, req.body, {
    //   new: true,
    // }, (err, doc) => {
    //   if (err) {
    //     res.status(400).json({
    //       message: 'Not user found',
    //     });
    //   } else {
    //     res.status(200).json({
    //       message: 'User Sucuessfully Updated',
    //       data: doc,
    //     });
    //   }
    // });
  },
  // delete
  deleteUser(req, res, next) {
    // User.findByIdAndRemove(req.params.id, (err) => {
    //   if (!err) {
    //     res.status(200).json({
    //       message: 'User Scucessfully Deleted',
    //     });
    //   } else {
    //     res.status(400).json({
    //       message: 'Not user found',
    //     });
    //   }
    // });

    User.findByIdAndRemove(req.params.id).then((user) => res.status(200).json({
      message: 'User successfully delete',
    }))
      .catch(() => next(Boom.badRequest('Error in delete user')));
  },
};
