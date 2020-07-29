const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult  } = require('express-validator/check');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth'); // usiamo il destructuring per estrarre solamente delle funzioni specifiche. In questo caso: ensureAuthenticated.

// Importo il modello di Idea. Non creo un'istanza di questo import perchè Idea non è un middleware
require('../models/Idea');

// Creo un'istanza del modello Idea
const Idea = mongoose.model('ideas');

//idea index page
router.get('/', (req, res) => {
    Idea.find({user: req.user.id})                                // faccio il fetch degli item provenienti da Mongodb. In questo caso sono le idee dell'utente loggato.
        .sort({date: 'desc'})                    // metto in ordine di data gli item provenienti da Mongodb
        .then(ideas => {                         // qui inizia la promise
            res.render('ideas/index', {          // in conseguenza al then faccio apparire la lista di item sul sito   
                ideas
            });
        });
});

//add idea route
router.get("/add", ensureAuthenticated, (req, res) => {
    res.render("ideas/add");
});

//edit route
router.get("/edit/:id", (req, res) => {
    Idea.findOne({           // nell'altra webapp ho messo findByID
        _id: req.params.id
    })
    .then(idea => {
        // qui controlliamo che il proprietario dell'idea e l'utente collegato alla webapp al momento coincidano effettivamente
        if (idea.user != req.user.id) {
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/ideas');
        } else {
        res.render('ideas/edit', {
            idea
        });
    }
    });
 });

//process route
router.post("/", [
    check('title').isLength({ min: 3 }).withMessage('Please enter a title longer than 3 characters'),
    check('details').isLength({ min: 6 }).withMessage('Please enter some more details')
], (req, res, next) => {
    let title = req.body.title;  
    let details = req.body.details;  
    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        //return res.status(422).json({ validationErrors: validationErrors.array() });
        /* let ValidationErrorsMessages = res.json({ validationErrors: validationErrors.array() });
        let ValidationErrorsMessagesString = JSON.stringify(ValidationErrorsMessages);
        return ValidationErrorsMessagesString;  */
        //let ValidationErrorsMessagesToString = JSON.stringify({ validationErrors: validationErrors.array() });
        req.flash('ValidationErrorsMessagesString_msg', validationErrors.array());
        res.redirect('/ideas/add');
      } 

/*     if(errors){
       req.session.errors = errors;
       req.session.success = false;
       req.flash('error_msg', 'Please enter a title');
       res.redirect('/ideas/add');
    } */

    else{
       req.session.success = true;
       // se la post va a buon fine questi dati vengono convertiti in un oggetto e vengono mandati a mongodb
       const newUser = {
           title: req.body.title,
           details: req.body.details,
           user: req.user.id
       }
       new Idea(newUser)
        .save()
        .then(idea => {
            req.flash('success_msg', 'Recipe added');
            res.redirect('/ideas')
        })
    }
});

router.get('/index', (req, res) => {
    res.render('/', { success: req.session.success, errors: req.session.errors });
    req.session.errors = null;
    req.session.success = null;
 });

//update route
router.put("/:id", (req, res) => {
    Idea.findByIdAndUpdate(req.params.id)
            .then(idea => {
                idea.title   = req.body.title,
                idea.details = req.body.details;

                idea.save()                      // salvo i cambiamenti sul DB 
            .then(idea => {
                req.flash('success_msg', 'Recipe updated');
                res.redirect('/ideas')          // alla fine riportami alla pagina con la lista di items
                })
        });
});

//remove route
router.delete("/:id", (req, res) => {
    Idea.findByIdAndRemove(req.params.id)
            .then(() => {
                req.flash('success_msg', 'Recipe removed');
                res.redirect('/ideas');
        });
});  

module.exports = router;