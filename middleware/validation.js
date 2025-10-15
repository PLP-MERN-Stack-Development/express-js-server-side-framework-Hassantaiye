// middleware/validation.js
const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('./errors');

// Product creation validation
const validateProductCreate = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  console.log('🔍 Validating product creation data:', req.body);
  
  // Name validation
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else if (name.trim().length === 0) {
    errors.push('Name cannot be empty');
  } else if (name.length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }
  
  // Description validation
  if (!description) {
    errors.push('Description is required');
  } else if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }
  
  // Price validation
  if (price === undefined || price === null) {
    errors.push('Price is required');
  } else if (typeof price !== 'number') {
    errors.push('Price must be a number');
  } else if (price < 0) {
    errors.push('Price cannot be negative');
  } else if (price > 1000000) {
    errors.push('Price cannot exceed 1,000,000');
  } else if (!Number.isFinite(price)) {
    errors.push('Price must be a finite number');
  }
  
  // Category validation
  if (!category) {
    errors.push('Category is required');
  } else if (typeof category !== 'string') {
    errors.push('Category must be a string');
  } else if (category.trim().length === 0) {
    errors.push('Category cannot be empty');
  } else if (category.length > 50) {
    errors.push('Category cannot exceed 50 characters');
  }
  
  // inStock validation
  if (inStock === undefined || inStock === null) {
    errors.push('inStock is required');
  } else if (typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean');
  }
  
  // If there are errors, throw ValidationError
  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
    return next(new ValidationError(errors));
  }
  
  // Sanitize the data
  req.body.name = name.trim();
  req.body.description = description.trim();
  req.body.category = category.trim();
  req.body.price = parseFloat(price.toFixed(2)); // Ensure 2 decimal places
  
  console.log('✅ Product data validation passed');
  next();
};

// Product update validation (all fields optional, but must be valid if provided)
const validateProductUpdate = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  console.log('🔍 Validating product update data:', req.body);
  
  // Check if at least one field is provided
  const hasUpdates = name !== undefined || description !== undefined || 
                    price !== undefined || category !== undefined || 
                    inStock !== undefined;
  
  if (!hasUpdates) {
    errors.push('At least one field must be provided for update');
  }
  
  // Name validation (if provided)
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
  }
  
  // Description validation (if provided)
  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.trim().length === 0) {
      errors.push('Description cannot be empty');
    } else if (description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }
  }
  
  // Price validation (if provided)
  if (price !== undefined) {
    if (typeof price !== 'number') {
      errors.push('Price must be a number');
    } else if (price < 0) {
      errors.push('Price cannot be negative');
    } else if (price > 1000000) {
      errors.push('Price cannot exceed 1,000,000');
    } else if (!Number.isFinite(price)) {
      errors.push('Price must be a finite number');
    }
  }
  
  // Category validation (if provided)
  if (category !== undefined) {
    if (typeof category !== 'string') {
      errors.push('Category must be a string');
    } else if (category.trim().length === 0) {
      errors.push('Category cannot be empty');
    } else if (category.length > 50) {
      errors.push('Category cannot exceed 50 characters');
    }
  }
  
  // inStock validation (if provided)
  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean');
  }
  
  // If there are errors, throw ValidationError
  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
    return next(new ValidationError(errors));
  }
  
  // Sanitize the data (only for provided fields)
  if (name !== undefined) req.body.name = name.trim();
  if (description !== undefined) req.body.description = description.trim();
  if (category !== undefined) req.body.category = category.trim();
  if (price !== undefined) req.body.price = parseFloat(price.toFixed(2));
  
  console.log('✅ Product update validation passed');
  next();
};

// ID validation middleware
const validateProductId = (req, res, next) => {
  const productId = req.params.id;
  
  // Basic UUID validation (simplified)
  if (!productId || typeof productId !== 'string') {
    return next(new ValidationError(['Product ID is required and must be a string']));
  }
  
  if (productId.length < 10) {
    return next(new ValidationError(['Invalid product ID format']));
  }
  
  next();
};

module.exports = {
  validateProductCreate,
  validateProductUpdate,
  validateProductId,
  ValidationError
};