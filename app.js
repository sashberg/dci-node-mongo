require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const nodemailer = require('nodemailer');

const port = 3000;
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

//Init app
const app = express();

//bring in Models
const Article = mongoose.model('Article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
app.use(session({
  secret: 'Keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookies: {secure:true}
}));

//express messaes middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namepace.shift()
    , formParam = root;

    while(namespace.length) {
      formParan += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//home route
app.get('/', function (req, res) {
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

//add route
app.get('/articles/add', function (req ,res) {
  res.render('add_article', {
    title: 'Add Entry'
  });
});

//add submit post route
app.post('/articles/add', function (req, res) {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err) {
    if (err) {
      console.log(err);
      return
    } else {
      console.log('Successfully added article');
      res.redirect('/');
    }
  })
});

//get single article
app.get('/articles/:id', function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    res.render('article', {
      article: article
    });
  });
})

//load edit form
app.get('/article/edit/:id', function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    });
  });
})

//update submit post route
app.post('/article/edit/:id', function (req, res) {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function (err) {
    if (err) {
      console.log(err);
      return
    } else {
      console.log('Successfully edited entry', article);
      res.redirect('/');
    }
  });
});

//delete route
app.delete('/article/:id', function (req, res) {
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if (err) {
      console.log(err);
    } else {
      res.send('Success');
    }
  });
});

//Contact route
app.get('/contact', function (req, res) {
  res.render('contact', {title: 'Contact'});
});

app.post('/send', function(req, res){
  const output = `
  <p>New Contact</p>
  <h3>Details</h3>
  <ul>
    <li>Name: ${req.body.name}</li>
    <li>Email: ${req.body.email}</li>
    <li>Subject: ${req.body.subject}</li>
  </ul>
  <h3>Message: ${req.body.message}</h3>
  `;
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: process.env.MAILER_MAIL, // generated ethereal user
          pass: process.env.MAILER_PW  // generated ethereal password
      },
      tls:{
        rejectUnauthorized: false
      }
    });
    let mailOptions = {
        from: req.body.email, // sender address
        to: 'sash.samson@gmail.com', // list of receivers
        subject: 'Contct Form Submission', // Subject line
        text: 'Hello World', // plain text body
        html: output // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Message Sent, with ID: ' + info.messageId);
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        res.render('contact', {msg: 'Message successfully sent!'})
      }
    });
    // console.log(req.body);
});

app.listen(port, () => {
  console.log('App listening on port:', port);
});
