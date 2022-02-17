const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'macbookair',
    password : '',
    database : 'face-recognition'
  }
});

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3000, ()=> {
	console.log("app is running on port 300");
});

app.get('/', (req, res)=> {
	res.send('success');
})

//implement signin endpoint
app.post('/signin', (req, res)=> {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if(isValid){
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0]);
					})
					.catch(err => res.status(400).json('Unable to get user'));
			} else {
				res.status(400).json('Wrong credentials');
			}
		})
		.catch(err => res.status(400).json('Wrong credentials'));
})

//implement registration endpoint
app.post('/register', (req, res)=> {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0].email,
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to register'));
});

//implement profile endpoint
app.get('/profile/:id', (req, res)=> {
	const { id } = req.params;

	db.select('*').from('users').where({id})
	.then(user => {
		if(user.length){
			res.json(user[0]);
		} else {
			res.status(400).json('User not found'); 
		}
	})
	.catch(err => res.status(400).json('Error'));
	
})

//implemet an endpoint to increase count of detected images per user 
app.put('/image', (req, res)=> {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0].entries);
	})
	.catch(err => res.status(400).json('Unable to get count for entries'));
});