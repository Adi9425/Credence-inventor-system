import React, { useState, useEffect } from 'react';
import Login from './Login.jsx';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    company: '',
    type: '',
    description: ''
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch products when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Filter products
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (searchCompany) {
      filtered = filtered.filter(p => 
        p.company.toLowerCase().includes(searchCompany.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, searchCompany, products]);

  // Extract unique companies
  useEffect(() => {
    const uniqueCompanies = [...new Set(products.map(p => p.company))].sort();
    setCompanies(uniqueCompanies);
  }, [products]);

  // Filter companies for autocomplete
  useEffect(() => {
    if (formData.company) {
      const filtered = companies.filter(c => 
        c.toLowerCase().includes(formData.company.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [formData.company, companies]);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUser(JSON.parse(userStr));
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setProducts([]);
    setFilteredProducts([]);
  };

  // Handle API errors
  const handleApiError = (error, response) => {
    if (response && response.status === 401) {
      alert('Session expired. Please login again.');
      handleLogout();
    } else {
      console.error('API Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        handleApiError(null, response);
        return;
      }

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Check if product name already exists
  const isProductNameUnique = (name, excludeId = null) => {
    return !products.some(p => 
      p.name.toLowerCase() === name.toLowerCase() && 
      (!excludeId || p._id !== excludeId)
    );
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Check for unique product name
    if (!isProductNameUnique(formData.name)) {
      alert('A product with this name already exists. Please use a unique product name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        handleApiError(null, response);
        return;
      }

      await fetchProducts();
      setShowAddModal(false);
      resetForm();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    // Check for unique product name (excluding current product)
    if (!isProductNameUnique(formData.name, selectedProduct._id)) {
      alert('A product with this name already exists. Please use a unique product name.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        handleApiError(null, response);
        return;
      }

      await fetchProducts();
      setShowEditModal(false);
      resetForm();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleQuantityUpdate = async (newQuantity) => {
    try {
      const response = await fetch(`${API_URL}/products/${selectedProduct._id}/quantity`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) {
        handleApiError(null, response);
        return;
      }

      await fetchProducts();
      setShowQuantityModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          handleApiError(null, response);
          return;
        }

        await fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleExport = async (company = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company })
      });
      
      if (!response.ok) {
        handleApiError(null, response);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${company || 'all'}_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error exporting data');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      company: product.company,
      type: product.type,
      description: product.description
    });
    setShowEditModal(true);
  };

  const openQuantityModal = (product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      price: '',
      company: '',
      type: '',
      description: ''
    });
    setSelectedProduct(null);
    setShowCompanySuggestions(false);
  };

  const selectCompany = (company) => {
    setFormData({ ...formData, company });
    setShowCompanySuggestions(false);
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1>📦 Credence Inventory System</h1>
            <div className="user-info">
              <span className="user-name">👤 {user?.name || user?.username}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="🔍 Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="🏢 Search by company..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add Product
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleExport()}
            >
              📊 Export All
            </button>
            {companies.length > 0 && (
              <select 
                className="company-select"
                onChange={(e) => e.target.value && handleExport(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Export by Company</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-value">{filteredProducts.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Companies</h3>
            <p className="stat-value">{companies.length}</p>
          </div>
        </div>

        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Company</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No products found</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td className="product-name">{product.name}</td>
                    <td>
                      <span className={`quantity ${product.quantity < 10 ? 'low-stock' : ''}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="price">₹{product.price.toLocaleString()}</td>
                    <td>{product.company}</td>
                    <td><span className="type-badge">{product.type}</span></td>
                    <td className="description">{product.description || '-'}</td>
                    <td className="actions">
                      <button
                        className="btn btn-icon"
                        onClick={() => openQuantityModal(product)}
                        title="Update Quantity"
                      >
                        📦
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => openEditModal(product)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDeleteProduct(product._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetForm(); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Product</h2>
                <button className="close-btn" onClick={() => { setShowAddModal(false); resetForm(); }}>×</button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label>Product Name * <span className="hint">(Must be unique)</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter unique product name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group autocomplete-container">
                    <label>Company * <span className="hint">(Type to see suggestions)</span></label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      onFocus={() => setShowCompanySuggestions(true)}
                      required
                      placeholder="Enter or select company"
                      autoComplete="off"
                    />
                    {showCompanySuggestions && filteredCompanies.length > 0 && (
                      <div className="suggestions-dropdown">
                        {filteredCompanies.map((company, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => selectCompany(company)}
                          >
                            {company}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Product Type *</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Electronics"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional product description"
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => { setShowEditModal(false); resetForm(); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Product</h2>
                <button className="close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
              </div>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label>Product Name * <span className="hint">(Must be unique)</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter unique product name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group autocomplete-container">
                    <label>Company * <span className="hint">(Type to see suggestions)</span></label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      onFocus={() => setShowCompanySuggestions(true)}
                      required
                      autoComplete="off"
                    />
                    {showCompanySuggestions && filteredCompanies.length > 0 && (
                      <div className="suggestions-dropdown">
                        {filteredCompanies.map((company, index) => (
                          <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => selectCompany(company)}
                          >
                            {company}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Product Type *</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quantity Update Modal */}
        {showQuantityModal && selectedProduct && (
          <div className="modal-overlay" onClick={() => setShowQuantityModal(false)}>
            <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Quantity</h2>
                <button className="close-btn" onClick={() => setShowQuantityModal(false)}>×</button>
              </div>
              <div className="quantity-update">
                <h3>{selectedProduct.name}</h3>
                <p>Current Quantity: <strong>{selectedProduct.quantity}</strong></p>
                <div className="quantity-controls">
                  <button
                    className="btn btn-icon-large"
                    onClick={() => handleQuantityUpdate(Math.max(0, selectedProduct.quantity - 10))}
                  >
                    -10
                  </button>
                  <button
                    className="btn btn-icon-large"
                    onClick={() => handleQuantityUpdate(Math.max(0, selectedProduct.quantity - 1))}
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={selectedProduct.quantity}
                    onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <button
                    className="btn btn-icon-large"
                    onClick={() => handleQuantityUpdate(selectedProduct.quantity + 1)}
                  >
                    +1
                  </button>
                  <button
                    className="btn btn-icon-large"
                    onClick={() => handleQuantityUpdate(selectedProduct.quantity + 10)}
                  >
                    +10
                  </button>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowQuantityModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleQuantityUpdate(selectedProduct.quantity)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;