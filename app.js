  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var expressValidator = require('express-validator');

  //Authentication Pagckage
  var session = require('express-session');
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var MySQLStore = require('express-mysql-session')(session);


  const index = require('./routes/index');
  const users = require('./routes/users');
  const student_panel = require('./routes/student_panel');
  //const add = require('./routes/add');

  var app = express();
  // DATABASE WIll not work without this. DONT DELETE IT
  require('dotenv').config();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
  	extended: false
  }));
  app.use(expressValidator());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  //Database for sessions
  var options = {
  	host: 'localhost',
  	user: 'root',
  	password: 'root',
  	database: 'college',
  	socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  };
  var sessionStore = new MySQLStore(options);

  app.use(session({
  	secret: 'ihvhjdshfdfjfgs',
  	resave: false,
  	store: sessionStore,
  	saveUninitialized: false,
  	//cookie: { secure: true }
  }))
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', index);
  app.use('/users', users);
  app.use('/student_panel', student_panel);
  //app.use('/add', add);


  passport.use(new LocalStrategy(
  	function(username, password, done) {
  		console.log(username);
  		console.log(password);

  		const db = require('./db');

  		db.query('SELECT password FROM user WHERE username = ?', [username], function(err, results, fields) {
  			if (err) {
  				done(err)
  			};

  			if (results.length === 0) {
  				done(null, false);
  			}
  			return done(null, 'sdjvnds');

  		})
  	}
  ));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
  	var err = new Error('Not Found');
  	err.status = 404;
  	next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
  	// set locals, only providing error in development
  	res.locals.message = err.message;
  	res.locals.error = req.app.get('env') === 'development' ? err : {};

  	// render the error page
  	res.status(err.status || 500);
  	res.render('error');
  });


  // Handlebars default config
  const hbs = require('hbs');
  const fs = require('fs');

  const partialsDir = __dirname + '/views/partials';

  const filenames = fs.readdirSync(partialsDir);

  filenames.forEach(function(filename) {
  	const matches = /^([^.]+).hbs$/.exec(filename);
  	if (!matches) {
  		return;
  	}
  	const name = matches[1];
  	const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  	hbs.registerPartial(name, template);
  });

  hbs.registerHelper('json', function(context) {
  	return JSON.stringify(context, null, 2);
  });


  module.exports = app;