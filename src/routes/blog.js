import { Router } from 'express';
import { listPosts, findPostBySlug, formatPostDate } from '../lib/posts.js';

export const blogRouter = Router();

blogRouter.get('/blog', async (req, res) => {
  const posts = await listPosts();
  res.render('blog/index', {
    posts,
    formatPostDate,
    pageTitle: 'Blog',
    pageDescription: 'Evidence-based looks at popular claims, from the Greater Lowell Area Science-based Skeptics.',
  });
});

blogRouter.get('/blog/:slug', async (req, res) => {
  const post = await findPostBySlug(req.params.slug);
  if (!post) return res.status(404).send('Post not found.');

  res.render('blog/post', { post, formatPostDate, pageTitle: post.title, pageDescription: post.summary });
});
