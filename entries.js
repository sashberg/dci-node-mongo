var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

mongoose.connect('mongodb://admin:05112016Cm@ds163700.mlab.com:63700/portfolio');

const db = mongoose.connection;

//check connection
db.once('open', function() {
  console.log('connected to MongoDB');
});

//check for db errors
db.on('error', function (err) {
  console.log(err);
});

require('./models/article');
//bring in Models
const Article = mongoose.model('Article');

//home route
router.get('/', function (req, res) {
  // console.log(Article);
  Article.find({}, function (err, articles) {
    if (!err) {
      res.render('index', {
        title: 'Entries',
        articles: articles
      });
    } else {
      console.log('Error rendering: ' + err);
    }
  });
});

// define the about route
router.get('/about', function (req, res) {
  res.send('About birds')
});

module.exports = router
