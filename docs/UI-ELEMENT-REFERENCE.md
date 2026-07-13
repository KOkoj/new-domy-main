# 🎨 UI Element Reference Guide

This guide provides a comprehensive list of all data attributes added to every UI element in the Italian Property Platform. Use these for styling, testing, and development.

## 📋 Data Attribute Naming Convention

- **Format**: `data-testid="element-name"`
- **Hierarchy**: Parent elements contain child elements
- **Descriptive**: Names clearly indicate the element's purpose
- **Consistent**: Similar elements use similar naming patterns

---

## 🏠 Homepage Elements

### Main Container
```html
<div data-testid="homepage-container">
```

### Navigation
```html
<nav data-testid="main-navigation">
  <div data-testid="nav-container">
    <div data-testid="nav-content">
      <div data-testid="nav-brand-links">
        <a data-testid="nav-brand-link">
          <h1 data-testid="nav-brand-title">Domy v Itálii</h1>
        </a>
        <div data-testid="nav-desktop-links">
          <a data-testid="nav-properties-link">Properties</a>
          <a data-testid="nav-regions-link">Regions</a>
          <a data-testid="nav-about-link">About</a>
          <a data-testid="nav-contact-link">Contact</a>
        </div>
      </div>
      <div data-testid="nav-user-controls">
        <div data-testid="language-selector">
          <div>
            <div data-testid="language-selector-trigger">EN</div>
          </div>
          <div data-testid="language-selector-content">
            <div data-testid="language-option-en">EN</div>
            <div data-testid="language-option-cs">CS</div>
            <div data-testid="language-option-it">IT</div>
          </div>
        </div>
        <button data-testid="login-button">Login</button>
        <!-- OR when authenticated -->
        <div data-testid="user-authenticated-section">
          <div data-testid="user-info">
            <span data-testid="user-name">User Name</span>
          </div>
          <button data-testid="logout-button">Logout</button>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### Mobile Navigation
```html
<button data-testid="mobile-menu-button">Menu</button>
<div data-testid="mobile-menu">
  <div data-testid="mobile-menu-links">
    <a data-testid="mobile-properties-link">Properties</a>
    <a data-testid="mobile-regions-link">Regions</a>
    <a data-testid="mobile-about-link">About</a>
    <a data-testid="mobile-contact-link">Contact</a>
  </div>
</div>
```

### Hero Section
```html
<section data-testid="hero-section">
  <div data-testid="hero-content-container">
    <div data-testid="hero-content">
      <h2 data-testid="hero-title">Find Your Dream Property in Italy</h2>
      <p data-testid="hero-subtitle">Discover luxury villas...</p>
      <div data-testid="hero-search-container">
        <input data-testid="hero-search-input" />
        <button data-testid="hero-search-button">Search</button>
      </div>
    </div>
  </div>
</section>
```

### Search Filters
```html
<div data-testid="search-filters-section">
  <div data-testid="search-filters-card">
    <div data-testid="search-filters-grid">
      <div data-testid="location-filter-container">
        <label data-testid="location-filter-label">Location</label>
        <input data-testid="location-filter-input" data-filter-type="location" />
      </div>
      <div data-testid="property-type-filter-container">
        <label data-testid="property-type-filter-label">Property Type</label>
        <div data-testid="property-type-select">
          <div>
            <div data-testid="property-type-select-trigger">Any type</div>
          </div>
          <div data-testid="property-type-select-content">
            <div data-testid="property-type-option-all">Any type</div>
            <div data-testid="property-type-option-villa">Villa</div>
            <div data-testid="property-type-option-house">House</div>
            <div data-testid="property-type-option-apartment">Apartment</div>
            <div data-testid="property-type-option-commercial">Commercial</div>
          </div>
        </div>
      </div>
      <div data-testid="min-price-filter-container">
        <label data-testid="min-price-filter-label">Min Price (€)</label>
        <input data-testid="min-price-filter-input" data-filter-type="minPrice" />
      </div>
      <div data-testid="max-price-filter-container">
        <label data-testid="max-price-filter-label">Max Price (€)</label>
        <input data-testid="max-price-filter-input" data-filter-type="maxPrice" />
      </div>
    </div>
  </div>
</div>
```

### Results Section
```html
<div data-testid="main-content-container">
  <div data-testid="results-header">
    <h3 data-testid="results-count">
      <span data-testid="results-count-number">4</span> Properties Found
    </h3>
    <div data-testid="sort-selector">
      <div>
        <div data-testid="sort-selector-trigger">Newest First</div>
      </div>
      <div data-testid="sort-selector-content">
        <div data-testid="sort-option-newest">Newest First</div>
        <div data-testid="sort-option-price-low">Price: Low to High</div>
        <div data-testid="sort-option-price-high">Price: High to Low</div>
        <div data-testid="sort-option-featured">Featured First</div>
      </div>
    </div>
  </div>
  
  <div data-testid="properties-grid">
    <!-- Property cards will be here -->
  </div>
</div>
```

### Property Cards
```html
<div data-testid="property-card" data-property-id="1" data-property-type="villa" data-property-featured="true">
  <div data-testid="property-image-container">
    <img data-testid="property-image" />
    <div data-testid="featured-badge">Featured</div>
    <button data-testid="favorite-button" data-property-id="1" data-favorited="false">
      <Heart />
    </button>
    <div data-testid="property-type-badge">villa</div>
  </div>
  <div data-testid="property-header">
    <div data-testid="property-title-price">
      <h3 data-testid="property-title">Luxury Villa with Lake Como Views</h3>
      <span data-testid="property-price" data-price="2500000" data-currency="EUR">€2,500,000</span>
    </div>
    <div data-testid="property-location">
      <span data-testid="property-city">Como</span>
      <span data-testid="property-region">, Lombardy</span>
    </div>
  </div>
  <div data-testid="property-content">
    <p data-testid="property-description">Stunning lakefront villa...</p>
    <div data-testid="property-specifications">
      <div data-testid="bedrooms-spec">
        <span data-testid="bedrooms-count">4</span> beds
      </div>
      <div data-testid="bathrooms-spec">
        <span data-testid="bathrooms-count">3</span> baths
      </div>
      <div data-testid="square-footage-spec">
        <span data-testid="square-footage-count">350</span>m²
      </div>
    </div>
  </div>
  <div data-testid="property-footer">
    <button data-testid="view-details-button" data-property-id="1">
      <span data-testid="view-details-text">View Details</span>
    </button>
  </div>
</div>
```

### No Results Message
```html
<div data-testid="no-results-message">
  <p data-testid="no-results-text">No properties found matching your criteria.</p>
  <p data-testid="no-results-suggestion">Try adjusting your search filters.</p>
</div>
```

### Footer
```html
<footer data-testid="main-footer">
  <div data-testid="footer-container">
    <div data-testid="footer-content">
      <div data-testid="footer-brand-section">
        <h4 data-testid="footer-brand-title">Domy v Itálii</h4>
        <p data-testid="footer-brand-description">Your trusted partner...</p>
      </div>
      <div data-testid="footer-properties-section">
        <h5 data-testid="footer-properties-title">Properties</h5>
        <ul data-testid="footer-properties-links">
          <li><a data-testid="footer-luxury-villas-link">Luxury Villas</a></li>
          <li><a data-testid="footer-apartments-link">Apartments</a></li>
          <li><a data-testid="footer-farmhouses-link">Farmhouses</a></li>
          <li><a data-testid="footer-commercial-link">Commercial</a></li>
        </ul>
      </div>
      <div data-testid="footer-regions-section">
        <h5 data-testid="footer-regions-title">Regions</h5>
        <ul data-testid="footer-regions-links">
          <li><a data-testid="footer-tuscany-link">Tuscany</a></li>
          <li><a data-testid="footer-lake-como-link">Lake Como</a></li>
          <li><a data-testid="footer-amalfi-coast-link">Amalfi Coast</a></li>
          <li><a data-testid="footer-sicily-link">Sicily</a></li>
        </ul>
      </div>
      <div data-testid="footer-support-section">
        <h5 data-testid="footer-support-title">Support</h5>
        <ul data-testid="footer-support-links">
          <li><a data-testid="footer-contact-link">Contact Us</a></li>
          <li><a data-testid="footer-buying-guide-link">Buying Guide</a></li>
          <li><a data-testid="footer-legal-services-link">Legal Services</a></li>
          <li><a data-testid="footer-faq-link">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div data-testid="footer-copyright">
      <p data-testid="footer-copyright-text">© 2024 Domy v Itálii. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## 🔐 Authentication Modal

### Modal Container
```html
<div data-testid="auth-modal">
  <div data-testid="auth-modal-content">
    <div data-testid="auth-modal-header">
      <h2 data-testid="auth-modal-title">Welcome to Domy v Itálii</h2>
    </div>
    
    <div data-testid="auth-tabs">
      <div data-testid="auth-tabs-list">
        <button data-testid="login-tab">Login</button>
        <button data-testid="signup-tab">Sign Up</button>
      </div>
    </div>
  </div>
</div>
```

### Login Form
```html
<div data-testid="login-tab-content">
  <form data-testid="login-form">
    <div data-testid="login-email-field">
      <label data-testid="login-email-label">Email</label>
      <div data-testid="login-email-input-container">
        <input data-testid="login-email-input" />
      </div>
    </div>
    <div data-testid="login-password-field">
      <label data-testid="login-password-label">Password</label>
      <div data-testid="login-password-input-container">
        <input data-testid="login-password-input" />
        <button data-testid="login-password-toggle">Show/Hide</button>
      </div>
    </div>
    <button data-testid="login-submit-button">Sign In</button>
  </form>
</div>
```

### Signup Form
```html
<div data-testid="signup-tab-content">
  <form data-testid="signup-form">
    <div data-testid="signup-name-field">
      <label data-testid="signup-name-label">Full Name</label>
      <input data-testid="signup-name-input" />
    </div>
    <div data-testid="signup-email-field">
      <label data-testid="signup-email-label">Email</label>
      <input data-testid="signup-email-input" />
    </div>
    <div data-testid="signup-password-field">
      <label data-testid="signup-password-label">Password</label>
      <input data-testid="signup-password-input" />
    </div>
    <div data-testid="signup-confirm-password-field">
      <label data-testid="signup-confirm-password-label">Confirm Password</label>
      <input data-testid="signup-confirm-password-input" />
    </div>
    <button data-testid="signup-submit-button">Create Account</button>
  </form>
</div>
```

---

## 🎯 Usage Examples

### CSS Targeting
```css
/* Target all property cards */
[data-testid="property-card"] {
  border: 2px solid blue;
}

/* Target featured properties */
[data-testid="property-card"][data-property-featured="true"] {
  border-color: gold;
}

/* Target specific property types */
[data-testid="property-card"][data-property-type="villa"] {
  background: lightblue;
}
```

### JavaScript Testing
```javascript
// Get all property cards
const propertyCards = document.querySelectorAll('[data-testid="property-card"]');

// Get featured properties
const featuredProperties = document.querySelectorAll('[data-testid="property-card"][data-property-featured="true"]');

// Get specific property by ID
const property = document.querySelector('[data-testid="property-card"][data-property-id="1"]');

// Get user authentication status
const isAuthenticated = document.querySelector('[data-user-authenticated="true"]') !== null;
```

### Testing Framework (Jest/Testing Library)
```javascript
// Test property card rendering
expect(screen.getByTestId('property-card')).toBeInTheDocument();

// Test authentication state
expect(screen.getByTestId('login-button')).toBeInTheDocument();
expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();

// Test property filtering
const locationInput = screen.getByTestId('location-filter-input');
fireEvent.change(locationInput, { target: { value: 'Como' } });
```

---

## 📝 Notes

- **All elements** have been tagged with descriptive `data-testid` attributes
- **Property cards** include additional data attributes for type, ID, and featured status
- **Form elements** include field-specific identifiers for easy targeting
- **Navigation elements** distinguish between desktop and mobile versions
- **User state** is reflected in authentication-related elements

This comprehensive tagging system makes it easy to:
- Target specific elements for styling
- Write reliable tests
- Debug UI issues
- Implement dynamic styling based on data attributes
- Create consistent user experiences

---

**Happy styling! 🎨✨**
