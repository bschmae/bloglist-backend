const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/user');

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body;
    
    if (!password || password.length < 3) {
        return response.status(400).json({ error: 'must enter password with 3 characters or more' });
    };

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username,
        name,
        passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);

});

userRouter.get('/', async (request, response) => {
    const user = await User.find({}).populate('blogs', { title: 1, url: 1});
    response.json(user);
})

module.exports = userRouter;