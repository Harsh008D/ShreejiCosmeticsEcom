# MVC Architecture Implementation

This document describes the Model-View-Controller (MVC) architecture implementation for the Shreeji Cosmetics application.

## Overview

The application has been refactored to follow the MVC pattern, providing clear separation of concerns, improved maintainability, and better testability.

## Architecture Layers

### 1. Models (`src/models/`)

Models represent the data and business logic of the application. They are responsible for:
- Data structure definitions
- Business logic validation
- Data manipulation and calculations
- State management

#### Available Models:

- **ProductModel** (`ProductModel.ts`)
  - Manages product data and operations
  - Handles filtering, sorting, and search functionality
  - Provides product categorization and pricing logic

- **UserModel** (`UserModel.ts`)
  - Manages user authentication state
  - Handles user data validation
  - Provides authentication-related business logic

- **CartModel** (`CartModel.ts`)
  - Manages shopping cart state and operations
  - Handles cart item calculations
  - Provides cart-related business logic

### 2. Controllers (`src/controllers/`)

Controllers act as intermediaries between Models and Views. They are responsible for:
- Coordinating between Models and Views
- Handling user input and business logic
- Managing application state
- API communication

#### Available Controllers:

- **AppController** (`AppController.ts`)
  - Main application controller
  - Coordinates all other controllers
  - Manages application initialization and state

- **ProductController** (`ProductController.ts`)
  - Handles product-related operations
  - Manages product data loading and manipulation
  - Coordinates with ProductModel and API service

- **AuthController** (`AuthController.ts`)
  - Handles authentication operations
  - Manages user login/logout/registration
  - Coordinates with UserModel and API service

- **CartController** (`CartController.ts`)
  - Handles cart-related operations
  - Manages cart state and synchronization
  - Coordinates with CartModel and API service

### 3. Views (`src/views/`)

Views represent the user interface components. They are responsible for:
- Rendering UI components
- Handling user interactions
- Displaying data from controllers
- Managing component state

#### Available Views:

- **ProductListView** (`ProductListView.tsx`)
  - Displays product listings with filtering and sorting
  - Uses ProductController for data management
  - Provides search and filter functionality

- **AuthView** (`AuthView.tsx`)
  - Handles login and registration forms
  - Uses AuthController for authentication
  - Provides form validation and error handling

### 4. Services (`src/services/`)

Services handle external communication and provide utility functions. They are responsible for:
- API communication
- Data transformation
- External service integration

#### Available Services:

- **ApiService** (`ApiService.ts`)
  - Centralized API communication
  - Handles HTTP requests and responses
  - Manages authentication tokens
  - Provides error handling and retry logic

## Data Flow

```
User Interaction → View → Controller → Model → Service → API
                ↑                                    ↓
                ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

1. **User Interaction**: User interacts with a View component
2. **View**: View component calls appropriate Controller method
3. **Controller**: Controller processes the request and updates Model
4. **Model**: Model updates its state and provides data
5. **Service**: Service communicates with external APIs if needed
6. **Response**: Data flows back through the chain to update the UI

## Key Benefits

### 1. Separation of Concerns
- **Models**: Focus on data and business logic
- **Controllers**: Handle coordination and state management
- **Views**: Manage UI presentation and user interactions
- **Services**: Handle external communication

### 2. Maintainability
- Clear structure makes code easier to understand and modify
- Changes in one layer don't affect others
- Business logic is centralized in models

### 3. Testability
- Each layer can be tested independently
- Controllers can be mocked for view testing
- Models can be tested without UI dependencies

### 4. Reusability
- Models can be reused across different views
- Controllers can handle multiple related operations
- Services can be shared across the application

### 5. Scalability
- Easy to add new features by extending existing layers
- Clear patterns for new developers to follow
- Consistent structure across the application

## Usage Examples

### Using ProductController in a View

```typescript
import { ProductController } from '../controllers/ProductController';

const ProductPage = () => {
  const [productController] = useState(() => new ProductController());
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      await productController.loadProducts();
      setProducts(productController.getAllProducts());
    };
    loadProducts();
  }, []);

  const handleSearch = (query: string) => {
    const results = productController.searchProducts(query);
    setProducts(results);
  };

  return (
    <div>
      {/* UI components */}
    </div>
  );
};
```

### Using AuthController for Authentication

```typescript
import { AuthController } from '../controllers/AuthController';

const LoginPage = () => {
  const [authController] = useState(() => new AuthController());

  const handleLogin = async (credentials) => {
    const result = await authController.login(credentials);
    if (result.success) {
      // Handle successful login
    } else {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
};
```

## Migration Guide

### From Old Structure to MVC

1. **Move business logic to Models**
   - Extract data manipulation logic from components
   - Create model classes for each data type
   - Add validation and business rules

2. **Create Controllers**
   - Move API calls from components to controllers
   - Create controller methods for each operation
   - Handle coordination between models and services

3. **Refactor Views**
   - Remove business logic from components
   - Use controllers for data operations
   - Focus on UI presentation and user interactions

4. **Update Services**
   - Centralize API communication
   - Add proper error handling
   - Implement consistent response formats

## Best Practices

### 1. Model Design
- Keep models focused on single responsibility
- Include validation logic in models
- Use TypeScript interfaces for type safety

### 2. Controller Design
- Keep controllers thin and focused
- Handle coordination, not business logic
- Use async/await for API calls

### 3. View Design
- Keep views focused on presentation
- Use controllers for data operations
- Implement proper error handling

### 4. Service Design
- Centralize API communication
- Implement proper error handling
- Use consistent response formats

## File Structure

```
src/
├── models/           # Data models and business logic
│   ├── ProductModel.ts
│   ├── UserModel.ts
│   └── CartModel.ts
├── controllers/      # Business logic coordination
│   ├── AppController.ts
│   ├── ProductController.ts
│   ├── AuthController.ts
│   └── CartController.ts
├── views/           # UI components (MVC Views)
│   ├── ProductListView.tsx
│   └── AuthView.tsx
├── services/        # External communication
│   ├── ApiService.ts
│   └── api.ts
├── components/      # Reusable UI components
├── pages/          # Page components
└── context/        # React context providers
```

## Conclusion

The MVC architecture provides a solid foundation for the application, making it more maintainable, testable, and scalable. The clear separation of concerns allows for easier development and debugging, while the consistent patterns make it easier for new developers to understand and contribute to the codebase. 