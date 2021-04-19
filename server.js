'use strict';
const express= require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride= require('method-override');


require('dotenv').config();


const app = express();
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

const PORT = process.env.PORT || 3008;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);

app.get('/character/create',renderCreatePage);
app.get('/mycharacter',rendermycharacter);
app.post('/character/my-characters',creatNew);
app.get('/home',renderHome);
app.post('/favorite-character',saveToDatabase);
app.get('/myfavorite-character', rendermyfavorite);
app.get('/character/:character_id',renderCharacterPage);
app.delete('/character/:character_id',renderDelete);
app.put('/character/:character_id',updateCharacter);
function rendermycharacter(req,res){
  const sql = 'SELECT * FROM characters WHERE  created_by=$1;';
  client.query(sql,['user'])
    .then(data=>{
      res.render('my-favorite',{fromapi:data.rows});
    })
    .catch(error=>console.log('this is the catch error',error));
}

function creatNew (req,res){
  const {name,house,patronus,is_alive}=req.body;
  const sql = 'INSERT INTO characters (name,house,patronus,is_alive,created_by) VALUES($1,$2,$3,$4,$5);';
  const values=[name,house,patronus,is_alive,'user'];
  client.query(sql,values)
    .then(()=>{
      res.redirect('/mycharacter');
    })
    .catch(error=>console.log('this is the catch error',error));
}
function renderCreatePage(req,res){
  res.render('create');
}

function updateCharacter(req,res){
  const id = req.params.character_id;
  const sql = 'UPDATE characters SET name=$1,house=$2,patronus=$3,is_alive=$4 WHERE id=$5;';
  const {name,house,patronus,is_alive}=req.body;
  const values=[name,house,patronus,is_alive,id];
  client.query(sql,values)
    .then(()=>{
      res.redirect(`/character/${id}`);
    })
    .catch(error=>console.log('this is the catch error',error));
}

function renderDelete(req,res){
  const id = req.params.character_id;
  const sql = 'DELETE FROM characters WHERE id=$1;';
  client.query(sql,[id])
    .then(()=>{
      res.redirect('/myfavorite-character');
    })
    .catch(error=>console.log('this is the catch error',error));
}

function renderCharacterPage(req,res){
  const id = req.params.character_id;
  const sql= 'SELECT * FROM characters WHERE id=$1;';
  client.query(sql,[id])
    .then(data=>{
      res.render('edits',{selcted:data.rows});
    })
    .catch(error=>console.log('this is the catch error',error));
}

function rendermyfavorite(req,res){
  const sql = 'SELECT * FROM characters WHERE  created_by=$1;';
  client.query(sql,['api'])
    .then(data=>{
      res.render('my-favorite',{fromapi:data.rows});
    })
    .catch(error=>console.log('this is the catch error',error));
}

function saveToDatabase(req,res){
  const {name,house,patronus,is_alive}=req.body;
  const sql = 'INSERT INTO characters (name,house,patronus,is_alive,created_by) VALUES($1,$2,$3,$4,$5);';
  const values=[name,house,patronus,is_alive,'api'];
  client.query(sql,values)
    .then(()=>{
      res.redirect('/myfavorite-character');
    })
    .catch(error=>console.log('this is the catch error',error));
}


function renderHome(req,res){
  const url= 'http://hp-api.herokuapp.com/api/characters';
  superagent.get(url)
    .then(data=>{
      const array = data.body.map(character=>new Character(character) );
      res.render('index',{allData:array});
    })
    .catch(error=>console.log('this is the catch error',error));
}

function Character (data){
  this.name=data.name;
  this.house=data.house;
  this.patronus=data.patronus;
  this.is_alive=data.alive;
}


client.connect().then(()=>{
  app.listen(PORT,()=>console.log(`listen to port :${PORT}`));
}).catch(error=>console.log(error));
