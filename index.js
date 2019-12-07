const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// ----------------------------------
// this is where we add bcryptjs for our
// use...
const bcrypt = require("bcryptjs");
// ----------------------------------

const db = require("./data/dbConfig.js");
const Users = require("./users/users-model.js");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Jashele Tillman - Authentication Project");
});

server.post("/api/register", (req, res) => {
  console.log(req)
  let user = req.body;

  console.log(user)

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



server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      console.log("sss",user)
      console.log("password",user.password)
      console.log("password2",password)
      if( user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: 'Logged In' });
      } else {
        res.status(401).json({ message: 'You shall not pass!' });
      }
    })
    .catch(error => {
      console.log(username, "in catch ")
      res.status(500).json(error);
    });
});


server.get('/api/users', validate, (req, res) => {
  let { username, password } = req.headers;

  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});




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





const port = process.env.PORT || 5003;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
