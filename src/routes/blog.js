import { Router } from 'express';
import { listPosts, findPostBySlug, formatPostDate } from '../lib/posts.js';
import { claimPictures } from '../lib/claimPictures.js';

// The same archival picture the homepage shows beside each claim, by topic.
const pictureFor = (post) => claimPictures[post.topic] ?? null;

export const blogRouter = Router();

blogRouter.get('/blog', async (req, res) => {
  const posts = await listPosts();
  res.render('blog/index', {
    posts: posts.map((post) => ({ ...post, picture: pictureFor(post) })),
    formatPostDate,
    pageTitle: 'Blog',
    pageDescription: 'Evidence-based looks at popular claims, from the Greater Lowell Area Science-based Skeptics.',
  });
});

blogRouter.get('/blog/:slug', async (req, res) => {
  const post = await findPostBySlug(req.params.slug);
  if (!post) return res.status(404).send('Post not found.');

  res.render('blog/post', {
    post,
    picture: pictureFor(post),
    formatPostDate,
    pageTitle: post.title,
    pageDescription: post.summary,
  });
});
