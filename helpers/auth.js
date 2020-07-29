// Proteggo le routes

module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            // fa un check se l'utente è loggato o no. Se lo è, può passare
            return next();
        }
        // altrimenti se non sei loggato viene triggerato questo messaggio di errore e torni al login screen
        req.flash('error_msg', 'Not Authorized');
        res.redirect('/users/login');
    }
}