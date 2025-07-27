const fetch = require('node-fetch');

async function testDeleteProduct() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@shreeji.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Get products to find one to delete
    console.log('📦 Getting products...');
    const productsResponse = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!productsResponse.ok) {
      const error = await productsResponse.text();
      console.error('❌ Failed to get products:', error);
      return;
    }

    const productsData = await productsResponse.json();
    const products = productsData.products || [];
    
    if (products.length === 0) {
      console.log('❌ No products found to delete');
      return;
    }

    const productToDelete = products[0];
    console.log(`🎯 Found product to delete: ${productToDelete.name} (ID: ${productToDelete._id})`);

    // Delete the product
    console.log('🗑️  Deleting product...');
    const deleteResponse = await fetch(`http://localhost:3001/api/products/${productToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.text();
      console.error('❌ Delete failed:', error);
      return;
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Delete successful:', deleteResult);

    // Verify the product is deleted
    console.log('🔍 Verifying deletion...');
    const verifyResponse = await fetch(`http://localhost:3001/api/products/${productToDelete._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.status === 404) {
      console.log('✅ Product successfully deleted (404 as expected)');
    } else {
      console.log('⚠️  Product might still exist:', verifyResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeleteProduct(); 