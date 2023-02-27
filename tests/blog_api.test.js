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

describe('returns correct data', () => {
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
});

describe('addition of blog', () => {
    test('correclty add new blog', async () => {
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
    
    test('missing url or title property', async () => {
        const newBlog = {
            title: "Biden vs Trump - Continued",
            author: "Nate Silver",
        };
    
        await api.post('/api/blogs').send(newBlog).expect(400);
    });    
});

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogResponse = await api.get('/api/blogs');
        const blogsAtStart = blogResponse.body;

        const blogToDelete = blogsAtStart[0];
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204);

        const newBlogResponse = await api.get('/api/blogs');
        const blogsAtEnd = newBlogResponse.body;

        expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);

        const contents = blogsAtEnd.map(r => r.title);

        expect(contents).not.toContain(blogToDelete.title);
    });

    test('fails with status code 404 if id is invalid', async () => {
        const invalidId = '5fa64876e60b7b4be14a2d37';
        await api.delete(`/api/blogs/${invalidId}`).expect(404);
    });
});

describe('updating a blog', () => {
    test('succeeds with status cood 200 if id is valid', async () => {
        const blogResponse = await api.get('/api/blogs');
        const blogToUpdate = blogResponse.body[0];
        const newLikes = 0;
        blogToUpdate.likes = newLikes;

        await api.put(`/api/blogs/${blogToUpdate.id}`).send(blogToUpdate).expect(200);

        const newBlogResponse = await api.get('/api/blogs');

        const check = newBlogResponse.body.find(r => r.id === blogToUpdate.id);

        expect(check.likes).toBe(0);
    });

    test('fails with status code 404 if id is invalid', async () => {
		const invalidBlogId = "5fa64876e60b7b4be14a2d37";		
		await api.put(`/api/blogs/${invalidBlogId}`).send({likes: 0}).expect(404);
	});
});

afterAll(async () => {
    await mongoose.connection.close();
});