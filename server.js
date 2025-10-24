// server.js - Express backend for mini social media app using MongoDB

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mini_social_app';

// Connect to MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  display_name: String,
  bio: String
});

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: Date,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    created_at: Date
  }]
});

const followSchema = new mongoose.Schema({
  follower_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Models
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Follow = mongoose.model('Follow', followSchema);

// ---------------- ROUTES ----------------

// Fetch all users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Fetch all posts (with user + comment users populated)
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find()
    .populate({ path: 'user_id', select: 'display_name username' })
    .populate({ path: 'comments.user_id', select: 'display_name username' })
    .sort({ created_at: -1 });
  res.json(posts);
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) return res.status(400).json({ error: 'Missing fields' });

  const post = new Post({ user_id, content, created_at: new Date() });
  await post.save();
  const populated = await Post.findById(post._id)
    .populate('user_id', 'display_name username');
  res.json(populated);
});

// Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  const { user_id } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(user_id)) {
    post.likes.push(user_id);
    await post.save();
  }
  const updated = await Post.findById(req.params.id)
    .populate('user_id', 'display_name username')
    .populate('comments.user_id', 'display_name username');
  res.json(updated);
});

// Add comment
app.post('/api/posts/:id/comment', async (req, res) => {
  const { user_id, content } = req.body;
  const post = await Post.findById(req.params.id);
  post.comments.push({ user_id, content, created_at: new Date() });
  await post.save();

  const updated = await Post.findById(req.params.id)
    .populate('user_id', 'display_name username')
    .populate('comments.user_id', 'display_name username');
  res.json(updated);
});

// Follow a user
app.post('/api/follow', async (req, res) => {
  const { follower_id, followee_id } = req.body;
  if (follower_id === followee_id) return res.status(400).json({ error: "Can't follow yourself" });

  const existing = await Follow.findOne({ follower_id, followee_id });
  if (!existing) await Follow.create({ follower_id, followee_id });

  res.json({ message: 'Followed successfully' });
});

// Unfollow
app.post('/api/unfollow', async (req, res) => {
  const { follower_id, followee_id } = req.body;
  await Follow.deleteOne({ follower_id, followee_id });
  res.json({ message: 'Unfollowed successfully' });
});

// -----------------------------------------

// Start server
mongoose.connection.once('open', () => {
  app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
});
