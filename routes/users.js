const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult  } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

//Load user model
require('../models/User');
const User = mongoose.model('users');

// user login route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// user register route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login Form Post
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
    })(req, res, next);
});

// user register form post
router.post('/register', [
    check('name').isLength({ min: 1 }).withMessage('Your name must contain atleast 1 character'),
    check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
          User.findOne({email:req.body.email}, (err, user) => {
            if(err) {
              reject(new Error('Server Error'))
            }
            if(Boolean(user)) {
              reject(new Error('E-mail already in use'))
            }
            resolve(true)
          });
        });
      }),
    /* .normalizeEmail()
    .custom(value => {
      return findUserByEmail(value).then(user => {
        throw new Error('this email is already in use');
      })
    }),
     check('email').custom(email => {
        return findUserByEmail(email).then(user => {
          throw new Error('This email is already in use');
        })
      }) */
    check('password').isLength({ min: 5 }).matches(/\d/).withMessage('Password must be at least 5 chars long and contain one number'),
    check('password_confirmed', 'Passwords do not match')
          .exists()
          .custom((value, { req }) => value === req.body.password)
], (req, res, next) => {
    let name = req.body.name;  
    let email = req.body.email;  
    let password = req.body.password;  
    let password_confirmed = req.body.password_confirmed;  
    let validationErrors = validationResult(req);
    validationErrorsArray = validationErrors.array();
     /* if (password_confirmed != password) {            
         validationErrorsArray.push({
            location: 'body',
            param: 'password_confirmed',
            value: 'password_confirmed',
            msg: 'Passwords must match' 
        });
            req.flash('ValidationErrorsMessagesString_msg', validationErrorsArray);
            res.redirect('/users/register');
    }  
    else */ if (!validationErrors.isEmpty()) {
        req.flash('ValidationErrorsMessagesString_msg', validationErrorsArray);
        res.redirect('/users/register');
      }  
      else {
          const newUser = new User ({
              name: req.body.name,
              email: req.body.email,
              password: req.body.password
          });
          // bcrypt: prima generiamo il salt
         bcrypt.genSalt(10, (error, salt) => {
             bcrypt.hash(newUser.password, salt, (error, hash) => {
                 //si potrebbe fare meglio
                if (error) throw error;
                //cambiamo la password dentro l'oggetto newUser con la versione hashata
                newUser.password = hash;
                newUser.save()
                .then(user => {
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/users/login');
                })
                .catch(error => {
                    console.log(error);
                    return;
                })
             })
         });
    }
}); 

// Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;