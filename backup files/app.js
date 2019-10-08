const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const port = 5000;

// Handlebar middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride('_method'));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
//MongoDB
// to remove the warning
mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost/vidjot-dev', {})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

require('./model/idea');
const Idea = mongoose.model('ideas');

//sample middleware
app.use(function(req, res, next) {
  req.name = 'brad traversy';
  next();
});

//index routing
const tittle = 'Welcome';
app.get('/', (req, res) => {
  res.render('index', { tittle: tittle });
});
//about routing
app.get('/about', (req, res) => {
  res.render('about');
});

//Add idea routing
app.get('/ideas/add', (req, res) => {
  res.render('ideas/edit');
});

//Edit idea form routing
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render('ideas/edit', { idea: idea });
  });
});
//Edit idea form processing
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    idea.tittle = req.body.tittle;
    idea.details = req.body.details;
    idea.save().then(idea => {
      res.redirect('/ideas');
    });
  });
});

//Dete idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({ _id: req.params.id }).then(() => {
    res.redirect('/ideas');
  });
});

//post request of ideas, post request is comming from the add page
app.post('/ideas', (req, res) => {
  let errors = [];
  if (!req.body.tittle) {
    errors.push({ text: 'please add a tittle' });
  }
  if (!req.body.details) {
    errors.push({ text: 'please add details..' });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      tittle: req.body.tittle,
      details: req.body.details
    });
  } else {
    const NewUser = {
      tittle: req.body.tittle,
      details: req.body.details
    };
    new Idea(NewUser).save().then(Idea => {
      res.redirect('/ideas');
    });
  }
});

// render all ideas
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });
    });
});
