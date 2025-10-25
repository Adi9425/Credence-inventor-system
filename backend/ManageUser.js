const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main menu
async function showMenu() {
  console.log('\n=== User Management ===');
  console.log('1. Add new user');
  console.log('2. List all users');
  console.log('3. Delete user');
  console.log('4. Change password');
  console.log('5. Exit');
  
  const choice = await question('\nEnter your choice (1-5): ');
  
  switch(choice.trim()) {
    case '1':
      await addUser();
      break;
    case '2':
      await listUsers();
      break;
    case '3':
      await deleteUser();
      break;
    case '4':
      await changePassword();
      break;
    case '5':
      console.log('Goodbye!');
      rl.close();
      mongoose.connection.close();
      return;
    default:
      console.log('Invalid choice!');
  }
  
  await showMenu();
}

// Add user
async function addUser() {
  try {
    console.log('\n--- Add New User ---');
    const username = await question('Username: ');
    const password = await question('Password: ');
    const name = await question('Full Name: ');
    const role = await question('Role (admin/user) [user]: ') || 'user';
    
    // Validate
    if (!username || !password || !name) {
      console.log('❌ All fields are required!');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: role.toLowerCase()
    });
    
    await user.save();
    console.log(`✅ User "${username}" added successfully!`);
    
  } catch (error) {
    if (error.code === 11000) {
      console.error(`❌ Username "${username}" already exists!`);
    } else {
      console.error('❌ Error adding user:', error.message);
    }
  }
}

// List users
async function listUsers() {
  try {
    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('\n📋 No users found.');
      return;
    }
    
    console.log('\n📋 All Users:');
    console.log('─'.repeat(80));
    console.log('USERNAME'.padEnd(20) + 'NAME'.padEnd(30) + 'ROLE'.padEnd(15) + 'CREATED');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      console.log(
        user.username.padEnd(20) + 
        user.name.padEnd(30) + 
        user.role.padEnd(15) + 
        user.createdAt.toLocaleDateString()
      );
    });
    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

// Delete user
async function deleteUser() {
  try {
    console.log('\n--- Delete User ---');
    const username = await question('Username to delete: ');
    
    if (!username) {
      console.log('❌ Username is required!');
      return;
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ User "${username}" not found!`);
      return;
    }
    
    const confirm = await question(`Are you sure you want to delete "${username}"? (yes/no): `);
    
    if (confirm.toLowerCase() === 'yes') {
      await User.deleteOne({ username });
      console.log(`✅ User "${username}" deleted successfully!`);
    } else {
      console.log('❌ Deletion cancelled.');
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  }
}

// Change password
async function changePassword() {
  try {
    console.log('\n--- Change Password ---');
    const username = await question('Username: ');
    const newPassword = await question('New Password: ');
    
    if (!username || !newPassword) {
      console.log('❌ All fields are required!');
      return;
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ User "${username}" not found!`);
      return;
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`✅ Password for "${username}" updated successfully!`);
    
  } catch (error) {
    console.error('❌ Error changing password:', error.message);
  }
}

// Start the application
console.log('╔════════════════════════════════════════╗');
console.log('║   Inventory Management User Manager    ║');
console.log('╚════════════════════════════════════════╝');

showMenu();