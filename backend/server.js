const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET ;
const PORT = process.env.PORT;

const app = express();

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Models
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  company: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());
const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-3q0brq2h6-amtiwari9425-3482s-projects.vercel.app',  // ADD THIS
];

// JWT Secret (use environment variable in production)

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Get all products (protected)
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product (protected)
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Add new product (protected)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, quantity, price, company, type, description } = req.body;
    
    if (!name || !quantity || !price || !company || !type) {
      return res.status(400).json({ message: 'All fields except description are required' });
    }
    
    const newProduct = new Product({
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      company,
      type,
      description: description || ''
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product (protected)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, quantity, price, company, type, description } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        company,
        type,
        description
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Update quantity (protected)
app.patch('/api/products/:id/quantity', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: parseInt(quantity) },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// Delete product (protected)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Export to Excel (protected)
app.post('/api/export', authenticateToken, async (req, res) => {
  try {
    const { company } = req.body;
    
    // Filter products by company if specified
    const query = company ? { company } : {};
    const productsToExport = await Product.find(query);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    
    // Add headers
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Product Name', key: 'name', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Product Type', key: 'type', width: 20 },
      { header: 'Description', key: 'description', width: 35 }
    ];
    
    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    
    // Add data
    productsToExport.forEach(product => {
      worksheet.addRow({
        _id: product._id.toString(),
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        company: product.company,
        type: product.type,
        description: product.description
      });
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set headers and send
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=inventory_${company || 'all'}_${Date.now()}.xlsx`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});