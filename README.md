# 📦 Inventory Management System

A full-stack inventory management system built with React and Node.js featuring product management, real-time updates, search functionality, and Excel export capabilities.

## ✨ Features

- ✅ **Product Management**: Add, edit, and delete products
- 🔢 **Quantity Control**: Increment/decrement quantities with +1, -1, +10, -10 buttons
- 🔍 **Search Functionality**: Search by product name and company
- 📊 **Excel Export**: Export all products or filter by company
- 🎯 **Modal Popups**: User-friendly modals for all updates
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## 🛠️ Technology Stack

### Frontend
- React 18
- CSS3 with modern animations
- Fetch API for HTTP requests

### Backend
- Node.js
- Express.js
- ExcelJS for Excel generation
- CORS enabled

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## 🚀 Installation & Setup

### Step 1: Create Project Folders

```bash
# Create main project directory
mkdir inventory-management-system
cd inventory-management-system

# Create frontend and backend folders
mkdir frontend backend
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Copy server.js and backend-package.json to this folder
# Rename backend-package.json to package.json

# Install dependencies
npm install

# Start the server
npm start
```

The backend server will run on `http://localhost:5000`

### Step 3: Setup Frontend

Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Copy the following files to this folder:
# - App.jsx (rename to App.js)
# - App.css
# - index.js
# - index.css
# - index.html (place in public folder)
# - frontend-package.json (rename to package.json)

# Create public folder
mkdir public

# Install dependencies
npm install

# Start the React app
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
inventory-management-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── node_modules/
```

## 🎯 Usage Guide

### Adding a Product
1. Click the "➕ Add Product" button
2. Fill in all required fields:
   - Product Name
   - Quantity
   - Price
   - Company
   - Product Type
   - Description (optional)
3. Click "Add Product"

### Updating Quantity
1. Click the ✏️ icon next to the quantity
2. Use the +1, -1, +10, -10 buttons
3. Or manually enter the quantity
4. Click "Save"

### Editing a Product
1. Click the "Edit" button in the Actions column
2. Update the fields as needed
3. Click "Update Product"

### Deleting a Product
1. Click the "Delete" button
2. Confirm the deletion

### Searching
- Type in the "Search by product name" field to filter by name
- Type in the "Search by company" field to filter by company
- Both searches work together

### Exporting to Excel
1. Click "📊 Export to Excel"
2. Choose "All Products" or select a specific company
3. The Excel file will download automatically

## 🎨 Features Details

### Product Fields
- **ID**: Auto-generated unique identifier
- **Product Name**: Name of the product
- **Quantity**: Available stock quantity
- **Price**: Product price in ₹ (Rupees)
- **Company**: Manufacturer/supplier name
- **Product Type**: Category/type of product
- **Description**: Additional product information

### Excel Export Format
The exported Excel file includes:
- Professional formatting with colored headers
- All product information in columns
- Company-specific filtering option
- Timestamped filename

## 🔧 Configuration

### Changing Port Numbers

**Backend (server.js):**
```javascript
const PORT = 5000; // Change this line
```

**Frontend (App.js):**
```javascript
const API_URL = 'http://localhost:5000/api'; // Update port if changed
```

### Adding Database
To persist data, replace the in-memory array with a database:
- MongoDB (with Mongoose)
- PostgreSQL (with Sequelize)
- MySQL (with Sequelize)

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Add new product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/quantity` | Update quantity only |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/export` | Export to Excel |

## 🐛 Troubleshooting

### CORS Error
If you see CORS errors, ensure:
1. Backend server is running
2. CORS is enabled in server.js
3. Frontend is using correct API URL

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Cannot Find Module
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Product images
- [ ] Low stock alerts
- [ ] Sales tracking
- [ ] Multiple currencies
- [ ] Barcode scanning
- [ ] Print invoices
- [ ] Dashboard analytics

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Development

### Running in Development Mode

**Backend:**
```bash
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
npm start  # Hot reload enabled by default
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Enjoy managing your inventory! 🎉**
