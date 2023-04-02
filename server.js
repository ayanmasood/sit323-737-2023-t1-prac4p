const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your_jwt_secret",
};


passport.use(new JWTStrategy(jwtOptions, (jwt_payload, done) => {
  const user = getUserByUsername(jwt_payload.username);
  if(user) {
    done(null, user);
  } else {
    done(null, false);
  }
}));

const authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};


const users = [
  { id: 1, username: 'jane', password: 'password123', isAdmin: true },
  { id: 2, username: 'john', password: 'password456', isAdmin: true}
];

function getUserByUsername(username) {
  return users.find(user => user.username === username);
}

function passwordMatches(user, password) {
  return user.password === password;
}



app.get("/login", (req, res) => {
  const { username, password } = req.query;
  const user = getUserByUsername(username);

  if (!user || !passwordMatches(user, password)) {
    res.status(401).send("Invalid username or password");
    return;
  }

  const payload = { id: user.id, username: user.username };
  const token = jwt.sign(payload, jwtOptions.secretOrKey);

  res.json({ message: "Login successful", token });
});


const add = (n1,n2) => n1 + n2;
app.get ("/add", authenticate, (req,res) => {
  try {
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    if(isNaN(n1) || isNaN(n2)) {
      throw new Error("n1 or n2 incorrectly defined");
    }
    const result = add(n1, n2);
    res.status(200).json({ status: 200, data: result });
  } catch(error) {
    console.error(error);
    res.status(500).json({ status: 500, msg: error.toString() });
  }
});

const subtract = (n1,n2) => n1 - n2;
app.get ("/subtract", authenticate, (req,res) => {
  try {
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    if(isNaN(n1) || isNaN(n2)) {
      throw new Error("n1 or n2 incorrectly defined");
    }
    const result = subtract(n1, n2);
    res.status(200).json({ status: 200, data: result });
  } catch(error) {
    console.error(error);
    res.status(500).json({statuscocde:500, msg: error.toString()})
}
});


const port =3040;
app.listen(port,()=>{
console.log("hello on port " +port);
})
