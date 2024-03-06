const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const MongoStore = require('connect-mongo');
var cors = require('cors')
const pug = require("pug");
const db = require("./models");
const Role = db.role;
const dbConfig = require("./db.config");
var User = require('./models/user.model');
var Order = require('./models/order.model');

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


const app = express();
app.use(cors());
app.set("view engine", "pug");
const PORT = 3000;

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost/test-app' }),
    cookie: { maxAge: oneDay },
    resave: false
}));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
// app.use(express.static('views'));
// app.use(express.static("/views"));
app.use(express.static(__dirname));

// cookie parser middleware
app.use(cookieParser());

//username and password
const myusername = 'user1'
const mypassword = 'mypassword'

app.get('/',(req,res) => {
    session=req.session;
    console.log(session)
    if(session.userId){
      res.render("index", {name: session.name, userId:session.userId});
    }else
      res.render("index", {});
});

app.get('/order',(req,res) => {
  session=req.session;
  console.log(session)
  if(session.userId){
    res.render("orderform", {name:session.name});
  }else
    res.render("index", {});
});

app.get('/orders', async(req,res) => {
    session=req.session;
    console.log(session)
    if(session.userId){
      var orders = await Order.find({}).exec();
      var orders_transformeds = [];
      for (const element of orders) {
        var user = await User.findOne({'username':element.userName});
        if ((user && !user.privacy) || session.name === element.userName) {
          var orders_transformed = {};
          orders_transformed.restaurantID = element.restaurantID;
          orders_transformed.restaurantName = element.restaurantName;
          orders_transformed.subtotal = element.subtotal;
          orders_transformed.total = element.total;
          orders_transformed.fee = element.fee;
          orders_transformed.tax = element.tax;
          orders_transformed.userName = element.userName;
          orders_transformed.order = JSON.stringify(element.order);
          
          orders_transformeds.push(orders_transformed);
        }
      };
      console.log(orders_transformeds);
      res.render("order_list", {name:session.name, orders: orders_transformeds});
    }else
      res.render("index", {});
});


app.get('/sign_in',(req,res) => {
    session=req.session;
    console.log(session)
    if(session.userId){
      res.redirect('/');
    }else
      res.render("signin", {});
});

app.get('/sign_up',(req,res) => {
    session=req.session;
    console.log(session)
    if(session.userId){
      res.redirect('/');
    }else
      res.render("signup", {});
});

app.get('/users',(req,res) => {
  session=req.session;
  let users = [];
  User.find({}, function (err, docs) {
    docs.forEach(element => {
      var tempJson = JSON.parse(JSON.stringify(element));
      if (!tempJson["privacy"]) {
        users.push({'name': element.username, 'privacy': tempJson["privacy"], 'id': tempJson["_id"]});
      }
    });
    
    res.render('user_list', {users: users, name: session? session.name:null});
    // console.log(docs);
  });
});

app.get('/profile/:id', async (req,res) => {
  var id = req.params.id;
  let user = await User.findOne({"_id":id}).exec();
  var userProfile = {};
  if (user) {
    console.log(user);
    var tempJson = JSON.parse(JSON.stringify(user));
    if (req.session.name !== tempJson.username && tempJson["privacy"]) {
      res.status(403, "Sorry, this user has activated the private mode");
      res.render('profile', {"error_message":"Sorry, this user has activated the private mode"});
      return
    }
      userProfile = {'name': tempJson.username, 'privacy': tempJson["privacy"], 'id': tempJson["_id"]};
      if(req.session.name === tempJson.username) {
        userProfile['isEditable'] = true;
      }
      if (req.session) {
        userProfile['authenticated'] = true;
      }
      
      if (req.session && !userProfile.privacy) {
        if(session.userId){
          var orders = await Order.find({"userId":req.session.userId}).exec();
          var orders_transformeds = [];
          for (const element of orders) {
            var orders_transformed = {};
            orders_transformed.id = element["_id"];
            orders_transformed.restaurantID = element.restaurantID;
            orders_transformed.restaurantName = element.restaurantName;
            orders_transformed.subtotal = element.subtotal;
            orders_transformed.total = element.total;
            orders_transformed.fee = element.fee;
            orders_transformed.tax = element.tax;
            orders_transformed.userName = element.userName;
            orders_transformed.order = JSON.stringify(element.order);
            orders_transformeds.push(orders_transformed);
            
          };
          userProfile['orders'] = orders_transformeds;
        }
      }
  }
  console.log(userProfile);
    res.render('profile', userProfile);

});

app.get('/order/:id', async (req,res) => {
  session=req.session;
  console.log(session)
  if(session.userId){
    var order = await Order.findOne({"_id":req.params.id}).exec();
    if (!order) {
      res.render("order_detail", {"error_message": "Order Not Found"});
      return;
    }
    console.log('Order', order)
    var orders_transformed = {};
    orders_transformed.id = order["_id"];
    orders_transformed.restaurantID = order.restaurantID;
    orders_transformed.restaurantName = order.restaurantName;
    orders_transformed.subtotal = order.subtotal;
    orders_transformed.total = order.total;
    orders_transformed.fee = order.fee;
    orders_transformed.tax = order.tax;
    orders_transformed.userName = order.userName;
    orders_transformed.order = JSON.stringify(order.order);
    console.log(orders_transformed)
    res.render("order_detail", {authenticated:true, name:session.name, order:orders_transformed});
  }else
    res.render("index", {});
});


app.get('/user/:name',async (req,res) => {
  var name = req.params.name.toLowerCase();
  let doc = await User.findOne({"username":name}).exec();
  var userProfile = {};
  if (doc) {
    console.log(doc);
    var tempJson = JSON.parse(JSON.stringify(doc));
    if (req.session.name !== tempJson.username && tempJson["privacy"]) {
      res.status(403, "Sorry, this user has activated the private mode");
      res.render('profile', {"error_message":"Sorry, this user has activated the private mode"});
      return
    }
    userProfile = {'name': tempJson.username, 'privacy': tempJson["privacy"], 'id': tempJson["_id"]};
    if(req.session.name === tempJson.username) {
      userProfile['isEditable'] = true;
    }
    console.log('session', req.session)
    if (req.session && req.session.name) {
      userProfile['authenticated'] = true;
    }
    if (req.session && !userProfile.privacy) {
      if(req.session.userId){
        var orders = await Order.find({"userId":req.session.userId}).exec();
        var orders_transformeds = [];
        for (const element of orders) {
          var orders_transformed = {};
          orders_transformed.id = element["_id"];
          orders_transformed.restaurantID = element.restaurantID;
          orders_transformed.restaurantName = element.restaurantName;
          orders_transformed.subtotal = element.subtotal;
          orders_transformed.total = element.total;
          orders_transformed.fee = element.fee;
          orders_transformed.tax = element.tax;
          orders_transformed.userName = element.userName;
          orders_transformed.order = JSON.stringify(element.order);
          orders_transformeds.push(orders_transformed);
          
        };
        userProfile['orders'] = orders_transformeds;
      }
    }
    console.log(userProfile);
    res.render('profile', userProfile);
  } else {
    console.log(userProfile);
    res.render('profile',  {"error_message":"User is not found sorry"});
  }
});

app.get('/profile',(req,res) => {
  res.redirect('/user/' + req.session.name);
});


app.post('/sign_in',(req,res, next) => {
  console.log(req.body.username)
  if(req.session.userId){
    res.redirect('/');
    return
  }
  if (!req.body.username || !req.body.password) {
    res.redirect("sign_in", {});
    return;
  }
  User.authenticate(req.body.username.toLowerCase(), req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        req.session.name = user.username;
        res.redirect("/")
        // return res.redirect('/profile');
      }
    });
})

app.post('/sign_up', async(req,res, next) => {
  console.log(req.body.username, req.body.password)
  if (!req.body.username || !req.body.password) {
    res.render("index", {});
    return;
  }
  console.log("Signing Up")
  var username = req.body.username.toLowerCase();
  var password = req.body.password;
  var similarUser = await User.find({username:username}).exec();
  console.log(similarUser)
  if (similarUser && similarUser.length > 0) {
    res.render("signup", {error_message: "User [" + req.body.username+ "] is exist already"});
    return;
  }
  try {
    // storing our user data into database
    const response = await User.create({
        username:username,
        password:password,
        "privacy":false
    });
    User.authenticate(username, password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        console.log('Finish Authenticating')
        req.session.userId = user._id;
        req.session.name = user.username;
        res.redirect('/profile/'+response.id)
        // return res.redirect('/profile');
      }
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    if(error.code === 11000){
      return res.send({status:'error',error:'email already exists'})
    }
    throw error
  }
})

app.post('/user_update', async(req,res, next) => {
  console.log(req.body.username, req.body.password)
  var session = req.session;
  console.log("Updating User Profile", req.body)
  console.log("Updating User Profile", session)
  try {
    // storing our user data into database
    const response = await User.findOne({
      "_id":session.userId
    });
    if (response) {
      response["privacy"] = req.body.isPrivate && req.body.isPrivate === 'on' ? true: false;
      let updateResponse = await response.save();
      if (updateResponse.privacy === response.privacy) {
        res.render('profile', {'success_message': 'Success Update'});
        return;
      }
    }
    res.render('profile', {'error_message': 'Failed Update'});
    return;
  } catch (error) {
    console.log(JSON.stringify(error));
    res.render('profile', {'error_message': error});
    return;
  }
})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect("/");
});

app.post('/orders',async(req,res, next) => {
  console.log(req.body);
  var session = req.session;
  var userName = req.session.name;
  var userId = req.session.userId;
  var order = req.body;
  order.userName = userName;
  order.userId = userId;
  console.log(order);
  const response = await Order.create(order);
  console.log('Response', response);
  if (response) {
    res.send({'status':true});
    return;
  }
  res.send({'status':false});

})


app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));
