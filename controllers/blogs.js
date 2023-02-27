const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});
  
blogRouter.post('/', async (request, response) => {
    const body = request.body;
    const user = await User.findById(body.userId);

    if (!(request.body.likes)) {
      request.body.likes = 0;
    };

    const blog = new Blog({
      ...request.body,
      user: user,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
  });

blogRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findById(request.params.id)

    if (!result) {
      response.status(404).send({ error: 'blog not found' });
    }

    await Blog.findByIdAndRemove(result);
    response.status(204).end();
  });

blogRouter.put('/:id', async (request, response) => {
  const result = await Blog.findByIdAndUpdate(request.params.id, request.body);

  if (!result) {
    response.status(404).send({ error: 'blog not found' });
  };

  response.json(result);
});

  module.exports = blogRouter;