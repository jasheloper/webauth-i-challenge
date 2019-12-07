const express = require("express");

const server = express();

// bcrypt hashing
const bcrypt = require("bcryptjs");
const db = require("./data/dbConfig.js");
const Users = require("./users/users-model.js");

server.use(express.json());

server.get("/", (req, res) => {
  res.send(` 
   
   <h1> Authentication  </h1>
   <p>Jashele Tillman </p>
   
   `);
});

// * * /api/register
// * * Creates a user using the information sent inside the body of the request. Hash the password before saving the user to the database.

server.post("/api/register", (req, res) => {
  let user = req.body;
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

// * * /api/login
// Use the credentials sent inside the body to authenticate the user. On successful login, create a new session for the user and send back a 'Logged in' message and a cookie that contains the user id. If login fails, respond with the correct status code and the message: 'You shall not pass!'
server.post("/api/login", validate, (req, res) => {
  let { username } = req.headers;
  res.status(200).json({ message: `Welcome ${user.username}!` });
});

// * * /api/users
// 	If the user is logged in, respond with an array of all the users contained in the database. If the user is not logged in repond with the correct status code and the message: 'You shall not pass!'.

server.get("/api/users", validate, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});


// validates credentials passed in headers

function validate(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      })

      .catch(err => {
        res.status(500).json({ message: "unexpected error" });
      });
  } else {
    res.status(400).json({ message: "no credentials provided" });
  }
}

module.exports = server;
