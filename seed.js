const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mini_social_app';

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => { console.error(err); process.exit(1); });

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

(async () => {
  try {
    // Check if already seeded
    const existing = await User.findOne({ username: 'alice' });
    if (existing) {
      console.log('Database already has demo data — aborting seed.');
      process.exit(0);
    }

    // Create users
    const users = await User.create([
      { username: 'alice', display_name: 'Alice Johnson', bio: 'Loves travel and coffee.' },
      { username: 'bob', display_name: 'Bob Kumar', bio: 'Frontend dev & gamer.' },
      { username: 'carol', display_name: 'Carol M', bio: 'Photographer and creator.' }
    ]);

    // Create posts
    const posts = await Post.create([
      { user_id: users[0]._id, content: 'Hello world! This is my first post.', created_at: new Date() },
      { user_id: users[1]._id, content: 'Built a small app today — feels great.', created_at: new Date() },
      { user_id: users[2]._id, content: 'Sharing some photos from my trip.', created_at: new Date() }
    ]);

    // Add comments
    posts[0].comments.push({ user_id: users[1]._id, content: 'Welcome!', created_at: new Date() });
    posts[1].comments.push({ user_id: users[0]._id, content: 'Nice work!', created_at: new Date() });
    await posts[0].save();
    await posts[1].save();

    // Add follows
    await Follow.create([
      { follower_id: users[0]._id, followee_id: users[1]._id },
      { follower_id: users[1]._id, followee_id: users[0]._id },
      { follower_id: users[2]._id, followee_id: users[0]._id }
    ]);

    console.log('✅ Demo users, posts, comments, and follows added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
