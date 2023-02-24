const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const initialBlogs = require('../utils/blog_api_test_helper');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
    await Blog.deleteMany({});
    const newBlogs = initialBlogs.map(blog => new Blog(blog));
    const promiseArray = newBlogs.map(blog => blog.save());
    await Promise.all(promiseArray);
});

test('there are three blogs', async () => {
	const response = await api.get('/api/blogs');	
	expect(response.body).toHaveLength(3);
});

test('notes are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
});

test('there exists an id property', async () => {
    const response = await api.get('/api/blogs');
    const blogs = response.body;
    expect(blogs[0].id).toBeDefined();
});

test('add new blog', async () => {
    const newBlog = {
        title: "Biden vs Trump - Continued",
        author: "Nate Silver",
        url: "https://fivethirtyeight.com",
        likes: 200
    };

    await api.post('/api/blogs').send(newBlog).expect(201);

    const response = await api.get('/api/blogs');

    const contents = response.body.map(r => r.title);

    expect(response.body).toHaveLength(initialBlogs.length + 1);

    expect(contents).toContain("Biden vs Trump - Continued");
});

test('if likes property missing, likes default to zero', async () => {
    const newBlog = {
        title: "Biden vs Trump - Continued",
        author: "Nate Silver",
        url: "https://fivethirtyeight.com",
    };

    await api.post('/api/blogs').send(newBlog).expect(201);

    const response = await api.get('/api/blogs');

    const blog = response.body.find(blog => blog.title === "Biden vs Trump - Continued");
    console.log(blog);
    expect(blog.likes).toBe(0);
});

afterAll(async () => {
    await mongoose.connection.close();
});