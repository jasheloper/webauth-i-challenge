const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
// ----------------------------------
// this is where we add bcryptjs for our
// use...
const bcrypt = require("bcryptjs");
// ----------------------------------

const db = require("./data/dbConfig.js");
const Users = require("./users/users-model.js");

const server = express();

//  S E S S I O N * C O N F I G
const sessionConfig = {
  name: "monkey", // default "sid", if no name

  secret: "keep it secret, keep it safe!", //used in order to encrypt/decrypt cookie

  cookie: {
    maxAge: 1000 * 30, // how long is the session going to be valid in milliseconds; after that it will be considered expired

    secure: false, // can I send the cookie over an unencrypted connection (http) ? ; should be true in production

    httpOnly: true // this cookie cannot be accessed from javascript ; no javascript code on the client will ever get access to the cookies
  },
  resave: false, // do we want to re-create a session even though it hasn't changed? ; false = if the cookie or the session has not changed, don’t recreate it, keep the one that was there.
  saveUninitialized: false // GDPR laws against setting cookies automatically
};

///////////

server.use(helmet());
server.use(express.json());
server.use(cors());
//Session Configuration
server.use(session(sessionConfig));

server.get("/", (req, res) => {
  res.send("Jashele Tillman - Auth Project");
});

server.post("/api/register", (req, res) => {
  console.log(req);
  let user = req.body;

  console.log(user);

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // console.log("sss", user);
      // console.log("password", user.password);
      // console.log("password2", password);
      if (user && bcrypt.compareSync(password, user.password)) {
        // saving some info about the user of session, save it & send cookie with that user info
        req.session.user = user;

        res.status(200).json({ message: "Logged In" });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(error => {
      console.log(username, "in catch ");
      res.status(500).json(error);
    });
});

server.get("/api/users", validate, (req, res) => {
  let { username, password } = req.headers;

  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

function validate(req, res, next) {
  // const { username, password } = req.headers;

  // refactored to modify make use of the information stored in the session //

  if (req.session && req.session.user ) {
    next();
  // if (username && password) {
    // Users.findBy({ username })
    //   .first()
    //   .then(user => {
    //     if (user && bcrypt.compareSync(password, user.password)) {
    //       next();
    //     } else {
    //       res.status(401).json({ message: "Invalid credentials" });
    //     }
    //   })

    //   .catch(err => {
    //     res.status(500).json({ message: "unexpected error" });
    //   });

  } else {
    //if nothing there:
    res.status(401).json({ message: 'You shall not pass!'})
    // res.status(400).json({ message: "no credentials provided" });
  }
}

const port = process.env.PORT || 5003;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
