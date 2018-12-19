const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));

const users = [
	{
		id: 1,
		email: 'user1@gamil.com',
		name: 'Phong',
		password: 'abc123',
		gender: 'male'
	},
	{
		id: 2,
		email: 'user1@gamil.com',
		name: 'Phong',
		password: 'abc123',
		gender: 'male'
	}
];

function writeFileSync(filePath, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, data, (err) => {
			if (err) {
				return reject(err);
			}
			return resolve({ message: 'Write file successful' });
		});
	});
}


function readFileSync(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (err, data) => {
			if (err) {
				return reject(err);
			}
			const fileContent = JSON.parse(data);
			return resolve(fileContent);
		});
	});
}

app.get('/write-file', async (req, res) => {
	try {
		const message = await writeFileSync('data/users.txt', JSON.stringify(users));
		return res.json({ message });
	} catch (e) {
		return res.status(447).json({ message: 'Cannot write file!', error: e.message });
	}
});

app.get('/read-file', async (req, res) => {
	try {
		const data = fs.readFileSync('data/message.txt');
		return res.json({ message: 'Successful', data });
	} catch (e) {
		console.error(e);
		return res.status(447).json({ message: 'Cannot read file!', error: e.message });
	}
});

// Get list user api

// Get one user api

// app.post('/users/:userId', async (req, res) => {
// 	// Read file to get user data
// 	// Loop to find user
// 	// Get user by id in params
// 	// Return to client.
// 	try {
// 		const users = await readFileSync('data/users.txt');
// 		const userId = parseInt(req.params.userId); // get from client
// 		for (const item of users) {
// 			if (item.id === userId) {
// 				return res.status(200).json({ user: item });
// 			}
// 		}
// 		return res.status(400).json({ message: 'User is not found' });
// 	} catch (e) {
// 		return res.status(400).json({ message: 'Cannot read user file', error: e.message });
// 	}
// });

// app.get('/users/write', function (req, res) {
// 	try {
// 		// write users to file.
// 	} catch (e) {

// 	}

// });

app.get('/users/read', async (req, res) => {
	try {
		// read all users from file.
		const users = await readFileSync('data/users.txt');
		console.log(users);
		return res.status(200).json(users);
	} catch (e) {
		return res.status(400).json({ message: 'User is not found', error: e.message });
	}
});

function getIndexOfUserById(users, id) {
	const userId = parseInt(id);
	for (let i = 0; i < users.length; i++) {
		if (users[i].id === userId) {
			return i;
		}
	}
}

function getIndexOfUserByName(users, name) {
	let userFiltered = [];
	for (let i = 0; i < users.length; i++) {
		if (users[i].name === name) {
			userFiltered.push(users[i]);
		}
	}
	return userFiltered;
}

function getIndexOfUserByApproximateName(users, name) {
	let userFiltered = [];
	for (let i = 0; i < users.length; i++) {
		if (new RegExp("["+name+"]").test(users[i].name)) {
			userFiltered.push(users[i]);
		} 
	}
	return userFiltered;
}

// Update one user api
app.put('/users/update/:id', async (req, res) => {
	const body = req.body;
	const userId = req.params.id;
	try {
		const users = await readFileSync('data/users.txt');
		let index = getIndexOfUserById(users, userId);
		if (index !== undefined) {
			let id = users[index].id;
			let name = users[index].name;
			let email = users[index].email;
			let password = users[index].password;
			let gender = users[index].gender;
			if (body.id) {
				id = parseInt(body.id);
			}
			if (body.name) {
				name = body.name;
			}
			if (body.email) {
				email = body.email;
			}
			if (body.password) {
				password = body.password;
			}
			if (body.gender) {
				gender = body.gender;
			}
			const dataUpdate = {
				id: id,
				name: name,
				email: email,
				password: password,
				gender: gender
			}
			console.log(dataUpdate);
			users[index] = dataUpdate
			await writeFileSync('data/users.txt', JSON.stringify(users));
			return res.status(200).json({ message: 'Update file successfuly', user: body });
		}
		return res.status(404).json({ error: 'User is not exited' });
	} catch (e) {
		console.log(e);
		return res.status(400).json({ message: 'Cant update file!', error: e.message });
	}
});

// Create one user api

app.post('/users/post', async (req, res) => {
	const body = req.body;
	try {
		if (!body.id) {
			return res.status(400).json({ error: 'Id is required field!' });
		}
		if (!body.name) {
			return res.status(400).json({ error: 'Name is required field!' });
		}
		if (!body.email) {
			return res.status(400).json({ error: 'Email is required field!' });
		}
		if (!body.password) {
			return res.status(400).json({ error: 'Password is required field!' });
		}
		if (!body.gender) {
			return res.status(400).json({ error: 'Gender is required field!' });
		}
		const users = await readFileSync('data/users.txt');
		let index = getIndexOfUserById(users, body.id);
		if (index === undefined) {
			users.push({
				id: parseInt(body.id),
				name: body.name,
				password: body.password
			});
			await writeFileSync('data/users.txt', JSON.stringify(users));
			return res.status(200).json({ message: 'Write file successfuly', user: body });
		}
		return res.status(404).json({ error: 'User is exited' });
	} catch (e) {
		return res.status(400).json({ message: 'Cant write file!', error: e.message });
	}
});

// Delete one user api
app.delete('/users/delete/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		if (!id) {
			return res.status(400).json({ error: 'Id is required field!' });
		}
		const users = await readFileSync('data/users.txt');
		let index = getIndexOfUserById(users, id);
		if (index !== undefined) {
			users.splice(index, 1);
			await writeFileSync('data/users.txt', JSON.stringify(users));
			return res.status(200).json({ message: 'Delete user successfuly', });
		}
		return res.status(404).json({ error: 'User is not exited' });
	} catch (e) {
		console.log(e);
		return res.status(400).json({ message: 'Cant delete user!', error: e.message });
	}
});

//Get user by name
app.get('/users/search/:name', async (req, res) =>{
	try {
		const userName = req.params.name;
		const users = await readFileSync('data/users.txt');
		const userFiltered = await getIndexOfUserByName(users, userName);
		if (userFiltered.length === 0) {
			return res.status(400).json({ message: 'User is not found'});
		}
		return res.status(200).json({ message: 'User is found', users: userFiltered });
	} catch (e) {
		return res.status(400).json({ message: 'User is not found', error: e.message });
	}
});

app.get('/users/search/regex/:name', async (req, res) =>{
	try {
		const userName = req.params.name;
		const users = await readFileSync('data/users.txt');
		const userFiltered = await getIndexOfUserByApproximateName(users, userName);
		if (userFiltered.length === 0) {
			return res.status(400).json({ message: 'User is not found'});
		}
		return res.status(200).json({ message: 'User is found', users: userFiltered });
	} catch (e) {
		console.log(e);
		return res.status(400).json({ message: 'User is not found', error: e.message });
	}
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
