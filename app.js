const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars');
const passport = require('passport');
const mongoose = require('mongoose');
const { check, validationResult  } = require('express-validator/check');
const flash = require('connect-flash'); 
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override'); 
const helmet = require('helmet'); 
const compression = require('compression');


/* const passport = require('passport');
const User = require('./models/user');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose'); */

const app = express();
app.use(express.urlencoded({extended: true}));

// Load Router
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Configs:
    // Passport
    require('./config/passport')(passport);
    // Database
    const db = require('./config/database');


// Faccio il setup della cartella di file statici usando il "path" middleware
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname + '/public')));

// Inizializzo e configuro Helmet
app.use(helmet());
app.use(helmet({
    dnsPrefetchControl: { allow: true },
    frameguard: {
        action: 'deny'
    }
}));   

// Implement Strict-Transport-Security // DA ABILITARE SE IL SITO GIRA SU HTTPS
app.use(helmet.hsts({
    maxAge: 7776000000,
    includeSubdomains: true
}));  

// compress responses
app.use(compression());

// method override middleware
app.use(methodOverride("_method"));

// inizializzo il middleware di validazione campi
//app.use(expressValidator());

// cookie-parser middleware
app.use(cookieParser());

// session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// inizializzo passport
app.use(passport.initialize());
app.use(passport.session());

// flash middleware
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');  
    res.locals.error_msg = req.flash('error_msg');  
    res.locals.ValidationErrorsMessagesString_msg = req.flash('ValidationErrorsMessagesString_msg');  
    res.locals.error = req.flash('error');  
    res.locals.user = req.user || null;  // Se siamo loggati, res.locals.user si setta su req.user. altrimenti si setta su null.
    next();
});

// Connetto l'app al database
mongoose.connect(db.mongoURI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

    
// Inizializzo l'handlebars middleware
app.engine('handlebars', exphbs({defaultLayout:"main"}));
app.set("view engine", "handlebars");

//index route
app.get("/", (req, res) => {
    res.render("index");
});

//about route
app.get("/about", (req, res) => {
    res.render("about");
});

// use routes
app.use('/ideas', ideas);
app.use('/users', users);


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log((`Server started on port ${port}`));
});


