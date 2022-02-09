const express = require('express');

const app = express();

app.use(express.json());

app.listen(3000, ()=> {
	console.log("app is running on port 300");
});

//mock a database for now
//TODO: connect to real db
const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookie',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Lora',
			email: 'lora@gmail.com',
			password: 'fruits',
			entries: 0,
			joined: new Date()
		}
	]
};

app.get('/', (req, res)=> {
	res.send('this is working');
})

//implement signin endpoint
app.post('/signin', (req, res)=> {
	if(req.body.email === database.users[0].email && 
			req.body.password === database.users[0].password) {
		res.json('success');
	} else {
		res.status(400).json('error logging in');
	}
})

//implement registration endpoint
app.post('/register', (req, res)=> {
	const { email, name, password } = req.body;
	database.users.push({
		id: '125',
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	});
	res.json(database.users[database.users.length - 1]);
});

//implement profile endpoint
app.get('/profile/:id', (req, res)=> {
	const { id } = req.params;
	let found = false;

	//TODO extract in a function
	database.users.forEach(user => {
		if(user.id === id){
			found = true;
			return res.json(user);
		}
	});
	if(!found) {
		res.status(404).json('No such user');
	}
})

//implemet an endpoint to increase count of detected images per user 
app.put('/image', (req, res)=> {
	const { id } = req.body;
	let found = false;

	database.users.forEach(user => {
		if(user.id === id){
			found = true;
			user.entries++;
			return res.json(user.entries);
		}
	});
	if(!found) {
		res.status(404).json('No such user');
	}
});