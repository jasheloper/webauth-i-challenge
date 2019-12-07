const express = require('express');

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
   res.send(` 
   
   <h1> Authentication  </h1>
   <p>Jashele Tillman </p>
   
   `);
});


module.exports = server; 