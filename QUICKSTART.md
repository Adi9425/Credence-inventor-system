# 🚀 QUICK START GUIDE

## 📦 What's Included

This package contains a complete Inventory Management System with:
- React Frontend (Single Page Application)
- Node.js Backend (REST API)
- Excel Export Feature
- Search & Filter Functionality
- Modal-based Updates

## ⚡ Quick Installation

### Option 1: Automatic Setup (Recommended)

**For Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```bash
setup.bat
```

### Option 2: Manual Setup

**Install Backend:**
```bash
cd backend
npm install
```

**Install Frontend:**
```bash
cd frontend
npm install
```

## 🎯 Running the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```
✅ Backend runs on: http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
✅ Frontend opens at: http://localhost:3000

## 📱 Using the Application

### Add Product
1. Click "➕ Add Product"
2. Fill the form
3. Click "Add Product"

### Update Quantity
1. Click ✏️ icon next to quantity
2. Use +1, -1, +10, -10 buttons
3. Click "Save"

### Search
- Use search boxes at the top
- Search by product name
- Search by company name

### Export to Excel
1. Click "📊 Export to Excel"
2. Select "All Products" or a company
3. File downloads automatically

## 🎨 Features

✅ Add, Edit, Delete Products
✅ Quantity Management (+1, -1, +10, -10)
✅ Search by Name & Company
✅ Excel Export (All or by Company)
✅ Modal Popups for Updates
✅ Responsive Design
✅ Beautiful UI with Animations

## 📋 Product Fields

- Product Name
- Quantity
- Price (₹)
- Company
- Product Type
- Description

## 🔧 Troubleshooting

**Port Already in Use?**
```bash
# Kill port 5000 (backend)
npx kill-port 5000

# Kill port 3000 (frontend)
npx kill-port 3000
```

**CORS Error?**
- Make sure backend is running
- Check API URL in frontend (App.js line 3)

**Dependencies Issue?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Full Documentation

See README.md for complete documentation.

## 💡 Tips

- Keep both terminals running
- Backend must start before frontend
- Use Ctrl+C to stop servers
- Check console for errors

---

**Happy Inventory Management! 🎉**
