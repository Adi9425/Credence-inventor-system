const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
mongoose.connect('mongodb+srv://AbhayDB:abhaybhai@cluster0.anvjley.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Function to add a user
async function addUser(username, password, name, role = 'user') {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role
    });
    
    await user.save();
    console.log(`User "${username}" added successfully!`);
    console.log(`Username: ${username}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);
    
  } catch (error) {
    if (error.code === 11000) {
      console.error(`User "${username}" already exists!`);
    } else {
      console.error('Error adding user:', error);
    }
  } finally {
    mongoose.connection.close();
  }
}

// Add default admin user
// Change these credentials as needed
// addUser('admin', 'abhaybhai', 'Administrator', 'admin');
addUser('user', 'user', 'View User', 'viewer');

// You can add more users by uncommenting and modifying below:
// addUser('user1', 'password123', 'John Doe', 'user');