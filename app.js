var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const cron = require("node-cron");


// import functions
var task = require('./controllers/CronController');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var nurseryRouter = require('./routes/nursery');
var sensorsRouter = require('./routes/sensors');
var downloadsRouter = require('./routes/downloads');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set Templating Engine
app.use(expressLayouts)
// app.set('layout', './layouts/full-width')


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/nursery', nurseryRouter);
app.use('/sensors', sensorsRouter);
app.use('/downloads', downloadsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
  next(createError(500));
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

// Cron Job every 1 minute
cron.schedule("*/60 * * * *", function () {
  console.log("Checking database every hour");
  task.updatePlantJob();
});


const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


module.exports = app;
