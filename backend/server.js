const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
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
// Updated schema: Only name and quantity are required
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: false },  // Optional
  company: { type: String, required: false },  // Optional
  type: { type: String, required: false },  // Optional
  description: { type: String, default: '' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' }  // 'admin', 'user', or 'viewer'
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-3q0brq2h6-amtiwari9425-3482s-projects.vercel.app',
];

// Auth Middleware - Verify JWT token
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

// Role-based authorization middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: No role found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
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

    // Generate token with role
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
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

// Get all products (all authenticated users can view)
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product (all authenticated users can view)
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

// Add new product (only admin and user roles, NOT viewer)
app.post('/api/products', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
  try {
    const { name, quantity, price, company, type, description } = req.body;
    
    // Only name and quantity are required
    if (!name || quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Product name and quantity are required' });
    }
    
    const newProduct = new Product({
      name,
      quantity: parseInt(quantity),
      price: price ? parseFloat(price) : undefined,
      company: company || undefined,
      type: type || undefined,
      description: description || ''
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product (only admin and user roles, NOT viewer)
app.put('/api/products/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
  try {
    const { name, quantity, price, company, type, description } = req.body;
    
    // Only name and quantity are required
    if (!name || quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Product name and quantity are required' });
    }
    
    const updateData = {
      name,
      quantity: parseInt(quantity),
      description: description || ''
    };

    // Only add optional fields if they are provided
    if (price !== undefined && price !== null && price !== '') {
      updateData.price = parseFloat(price);
    }
    if (company !== undefined && company !== null && company !== '') {
      updateData.company = company;
    }
    if (type !== undefined && type !== null && type !== '') {
      updateData.type = type;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Update quantity (only admin and user roles, NOT viewer)
app.patch('/api/products/:id/quantity', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
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

// Delete product (only admin and user roles, NOT viewer)
app.delete('/api/products/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
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

// Export to Excel (all authenticated users can export - including viewer)
app.post('/api/export', authenticateToken, async (req, res) => {
  try {
    const { company } = req.body;
    
    // Filter products by company if specified
    const query = company ? { company } : {};
    const productsToExport = await Product.find(query);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
    
    // Add headers (removed ID column as requested)
    worksheet.columns = [
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Price (₹)', key: 'price', width: 15 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Product Type', key: 'type', width: 20 },
      { header: 'Description', key: 'description', width: 40 }
    ];
    
    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add data (removed ID, handle optional fields)
    productsToExport.forEach(product => {
      worksheet.addRow({
        name: product.name,
        quantity: product.quantity,
        price: product.price || '-',
        company: product.company || '-',
        type: product.type || '-',
        description: product.description || '-'
      });
    });
    
    // Auto-fit columns and add borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle' };
        }
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Inventory API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('✅ Role-based authorization enabled');
  console.log('✅ Viewer role: Can only view and export');
  console.log('✅ User/Admin roles: Full access');
});