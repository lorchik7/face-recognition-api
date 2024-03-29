const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
  }
});

const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT || 3000, ()=> {
	console.log(`app is running on port ${process.env.PORT}`);
});

app.get('/', (req, res)=> {
	res.send('success');
})

//implement signin endpoint
app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})
//implement registration endpoint
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)});
//implement profile endpoint
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
//implemet an endpoint to increase count of detected images per user 
app.put('/image', (req, res) => { image.handleImage(req, res, db)});
app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})