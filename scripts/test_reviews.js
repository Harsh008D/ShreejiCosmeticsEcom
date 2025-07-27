import fetch from 'node-fetch';

async function testReviewFunctionality() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demoadmin@gmail.com',
        password: 'hello123'
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

    // Get products to find one to review
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
      console.log('❌ No products found to review');
      return;
    }

    const productToReview = products[0];
    console.log(`🎯 Found product to review: ${productToReview.name} (ID: ${productToReview._id})`);

    // Get existing reviews
    console.log('📝 Getting existing reviews...');
    const reviewsResponse = await fetch(`http://localhost:3001/api/reviews/product/${productToReview._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!reviewsResponse.ok) {
      const error = await reviewsResponse.text();
      console.error('❌ Failed to get reviews:', error);
      return;
    }

    const reviews = await reviewsResponse.json();
    console.log(`📊 Found ${reviews.length} existing reviews`);

    // Add a new review
    console.log('✍️  Adding new review...');
    const addReviewResponse = await fetch('http://localhost:3001/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productToReview._id,
        rating: 5,
        comment: 'This is a test review from the automated test script!'
      })
    });

    if (!addReviewResponse.ok) {
      const error = await addReviewResponse.text();
      console.error('❌ Failed to add review:', error);
      return;
    }

    const newReview = await addReviewResponse.json();
    console.log('✅ Review added successfully:', newReview._id);

    // Get reviews again to see the new one
    console.log('📝 Getting updated reviews...');
    const updatedReviewsResponse = await fetch(`http://localhost:3001/api/reviews/product/${productToReview._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!updatedReviewsResponse.ok) {
      const error = await updatedReviewsResponse.text();
      console.error('❌ Failed to get updated reviews:', error);
      return;
    }

    const updatedReviews = await updatedReviewsResponse.json();
    console.log(`📊 Now have ${updatedReviews.length} reviews`);

    // Update the review
    console.log('✏️  Updating review...');
    const updateReviewResponse = await fetch(`http://localhost:3001/api/reviews/${newReview._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'This is an updated test review from the automated test script!'
      })
    });

    if (!updateReviewResponse.ok) {
      const error = await updateReviewResponse.text();
      console.error('❌ Failed to update review:', error);
      return;
    }

    const updatedReview = await updateReviewResponse.json();
    console.log('✅ Review updated successfully');

    // Delete the review
    console.log('🗑️  Deleting review...');
    const deleteReviewResponse = await fetch(`http://localhost:3001/api/reviews/${newReview._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteReviewResponse.ok) {
      const error = await deleteReviewResponse.text();
      console.error('❌ Failed to delete review:', error);
      return;
    }

    console.log('✅ Review deleted successfully');

    // Verify the review is deleted
    console.log('🔍 Verifying deletion...');
    const finalReviewsResponse = await fetch(`http://localhost:3001/api/reviews/product/${productToReview._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!finalReviewsResponse.ok) {
      const error = await finalReviewsResponse.text();
      console.error('❌ Failed to get final reviews:', error);
      return;
    }

    const finalReviews = await finalReviewsResponse.json();
    console.log(`📊 Final review count: ${finalReviews.length}`);

    console.log('\n🎉 All review functionality tests passed!');
    console.log('✅ Add review: Working');
    console.log('✅ Update review: Working');
    console.log('✅ Delete review: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testReviewFunctionality(); 