const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/HelloMongoose';

const theport = process.env.PORT || 5000;

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('Error connecting to: ' + uristring + '.' + err);
  } else {
    console.log('Succeedded connecting to: ' + uristring);
  }
});

const userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: { type: String, trim: true }
  },
  age: { type: Number, min: 0 }
});

const faveUser = mongoose.model('FavouriteUsers', userSchema);

const userOne = new faveUser ({
  name: { first: 'Sash Seurat', last: 'Samson' },
  age: 32
});

userOne.save(function (err) {
  if (err) {
    console.log('Error on save!');
  } else {
    console.log('Saved!');
  }
});

userOne.find({}).exec(function (err, result) {
  if (!err) {

  } else {
    console.log(err);
  }
});

function createWebpage (req, res) {
  userOne.find({}).exec(function (err, result) {
    if (!err) {
      res.write(html1 + JSON.stringify(result, undefined, 2) + html2 + result.length + html3);
      let query = userOne.find({'name.last': 'Samson'});
      query.where('age').gt(64);
      query.exec(function(err, result) {
        if (!err) {
          res.end(html4 + JSON.stringify(result, undefined, 2) + html5 + result.length + html6);
        } else {
          res.end('error in second query' + err);
        }
      });
    } else {
      res.end('err in firt query' + err)
    }
  });
}
