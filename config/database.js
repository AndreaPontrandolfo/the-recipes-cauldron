if (process.env.NODE_ENV === 'production') {
    module.exports = {mongoURI: 'mongodb://Andrea:SuperSecret1!@ds247310.mlab.com:47310/recipes-prod'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/vidjot-dev'}
}