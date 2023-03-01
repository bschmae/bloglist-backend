const User = require('../models/user')

const initialUsers = [
	{
		username: 'testUser1',
		password: 'password',
		name: 'Test User 1'
	},
	{
		username: 'testUser2',
		password: 'password',
		name: 'Test User 2'
	},
	{
		username: 'testUser3',
		password: 'password',
		name: 'Test User 3'
	}
];

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }

module.exports = {
    usersInDb,
    initialUsers: initialUsers,
};