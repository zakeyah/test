'use strict';
const exprees= require('express');
const pg = require('pg');
const superagent = require('superagent');
const metodOverride= require('method-override');


require('dotenv').config();


const app = exprees();

const PORT = process.env.PORT || 3008;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);

app.get('/',(req,res)=>{
  res.send('hiiiiiiii');
});


client.connect().then(()=>{
  app.listen(PORT,()=>console.log(`listen to port :${PORT}`));
}).catch(error=>console.log(error));
