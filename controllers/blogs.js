const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});
  
blogRouter.post('/', async (request, response) => {
    if (!(request.body.likes)) {
      request.body.likes = 0;
    };

    const blog = new Blog(request.body);
    const result = await blog.save();
    response.status(201).json(result);
  });

blogRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findById(request.params.id)

    if (!result) {
      response.status(404).send({ error: 'blog not found' });
    }

    await Blog.findByIdAndRemove(result);
    response.status(204).end();
  });

  module.exports = blogRouter;