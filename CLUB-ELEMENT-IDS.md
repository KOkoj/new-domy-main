# Premium Club Element IDs Reference

This document lists all `data-testid` attributes in the Premium Club for easy reference when making changes.

## Layout (`/club/layout.js`)

### Main Container
- `club-layout-container` - Main layout wrapper
- `club-layout-wrapper` - Content wrapper
- `club-layout-main-wrapper` - Main content area wrapper
- `club-layout-main-content` - Where page content renders

### Sidebar
- `club-layout-sidebar` - Entire sidebar
- `club-sidebar-inner` - Sidebar inner container
- `club-sidebar-header` - Sidebar header area
- `club-sidebar-logo-link` - Logo clickable link
- `club-sidebar-logo-icon` - Crown icon container
- `club-sidebar-logo-text` - "Premium Club" text
- `club-sidebar-close-button` - Mobile close button
- `club-sidebar-badge-container` - Premium badge container
- `club-sidebar-premium-badge` - "Premium Member" badge
- `club-sidebar-navigation` - Navigation menu container

### Sidebar Menu Items
Each menu item has:
- `club-sidebar-menu-{page}` - Menu item link (e.g., `club-sidebar-menu-overview`, `club-sidebar-menu-webinars`)
- `club-sidebar-menu-{page}-icon` - Menu item icon
- `club-sidebar-menu-{page}-content` - Menu item text container
- `club-sidebar-menu-{page}-title` - Menu item title
- `club-sidebar-menu-{page}-description` - Menu item description

### Sidebar User Section
- `club-sidebar-user-section` - User info section
- `club-sidebar-user-info` - User details container
- `club-sidebar-user-avatar` - User avatar circle
- `club-sidebar-user-details` - Name/email container
- `club-sidebar-user-name` - User name
- `club-sidebar-user-email` - User email
- `club-sidebar-user-actions` - Action buttons container
- `club-sidebar-browse-button` - Browse Properties button
- `club-sidebar-logout-button` - Logout button

### Mobile Header
- `club-layout-mobile-header` - Mobile header bar
- `club-mobile-menu-button` - Mobile menu toggle button
- `club-mobile-title` - Mobile header title
- `club-mobile-spacer` - Mobile header spacer
- `club-layout-mobile-backdrop` - Mobile sidebar backdrop

---

## Dashboard (`/club/page.js`) ✅

### Main Container
- `dashboard-container` - Main page container

### Header Section
- `dashboard-header` - Header container
- `dashboard-header-content` - Header text content
- `dashboard-welcome-title` - "Welcome to Premium Club" heading
- `dashboard-subtitle` - Subtitle text
- `dashboard-notifications-button` - Notifications button

### Stats Cards
- `dashboard-stats-grid` - Stats cards grid container

**Webinars Card:**
- `dashboard-stat-webinars` - Webinars stat card
- `dashboard-stat-webinars-label` - "Webinars Attended" label
- `dashboard-stat-webinars-value` - Number value
- `dashboard-stat-webinars-trend` - Trend indicator (+2 this month)
- `dashboard-stat-webinars-icon` - Icon container

**Documents Card:**
- `dashboard-stat-documents` - Documents stat card
- `dashboard-stat-documents-label` - "Documents" label
- `dashboard-stat-documents-value` - Number value
- `dashboard-stat-documents-subtitle` - "Files accessed" text
- `dashboard-stat-documents-icon` - Icon container

**Concierge Card:**
- `dashboard-stat-concierge` - Concierge stat card
- `dashboard-stat-concierge-label` - "Concierge Support" label
- `dashboard-stat-concierge-value` - Number value
- `dashboard-stat-concierge-subtitle` - "Active tickets" text
- `dashboard-stat-concierge-icon` - Icon container

**Membership Card:**
- `dashboard-stat-membership` - Membership stat card
- `dashboard-stat-membership-label` - "Membership" label
- `dashboard-stat-membership-value` - Days number
- `dashboard-stat-membership-subtitle` - "Days as member" text
- `dashboard-stat-membership-icon` - Icon container

### Main Content Grid
- `dashboard-main-grid` - Main content grid container

### Webinars Section
- `dashboard-webinars-section` - Webinars section container
- `dashboard-webinars-title` - "Upcoming Webinars" title
- `dashboard-webinars-viewall` - "View All" button
- `dashboard-webinars-list` - Webinars list container
- `dashboard-webinar-{id}` - Individual webinar card (e.g., `dashboard-webinar-1`)
- `dashboard-webinar-{id}-title` - Webinar title
- `dashboard-webinar-{id}-register` - Register button

### Recent Activity Section
- `dashboard-activity-section` - Activity section container
- `dashboard-activity-title` - "Recent Activity" title
- `dashboard-activity-list` - Activity list container
- `dashboard-activity-{id}` - Individual activity item
- `dashboard-activity-{id}-title` - Activity title

### Quick Actions Section
- `dashboard-quickactions` - Quick actions card
- `dashboard-quickactions-title` - "Quick Actions" title
- `dashboard-quickactions-grid` - Actions grid
- `dashboard-quickaction-intakeform` - Intake form action card
- `dashboard-quickaction-concierge` - Concierge action card
- `dashboard-quickaction-content` - Content library action card

---

## Intake Form (`/club/intake-form/page.js`) ✅

### Main Container
- `intake-form-container` - Main form wrapper
- `intake-form-header` - Header section
- `intake-form-title` - Form title with icon
- `intake-form-title-icon` - File icon
- `intake-form-title-text` - Title text
- `intake-form-subtitle` - Form subtitle

### Message Alert
- `intake-form-alert-{type}` - Alert container (success/error)
- `intake-form-alert-success-icon` - Success check icon
- `intake-form-alert-error-icon` - Error alert icon
- `intake-form-alert-{type}-message` - Alert message text

### Personal Information Section
- `intake-form-personal-card` - Personal info card
- `intake-form-personal-header` - Card header
- `intake-form-personal-title` - Section title
- `intake-form-personal-icon` - User icon
- `intake-form-personal-title-text` - Title text
- `intake-form-personal-content` - Card content
- `intake-form-personal-row1` - First row of fields
- `intake-form-personal-row2` - Second row of fields

### Personal Information Fields
- `intake-form-fullname-field` - Full name field container
- `intake-form-fullname-label` - Full name label
- `intake-form-fullname-input` - Full name input
- `intake-form-email-field` - Email field container
- `intake-form-email-label` - Email label
- `intake-form-email-input` - Email input
- `intake-form-phone-field` - Phone field container
- `intake-form-phone-label` - Phone label
- `intake-form-phone-input` - Phone input
- `intake-form-nationality-field` - Nationality field container
- `intake-form-nationality-label` - Nationality label
- `intake-form-nationality-input` - Nationality input
- `intake-form-location-field` - Location field container
- `intake-form-location-label` - Location label
- `intake-form-location-input` - Location input

### Property Preferences Section
- `intake-form-property-card` - Property preferences card
- `intake-form-property-header` - Card header
- `intake-form-property-title` - Section title
- `intake-form-property-icon` - Home icon
- `intake-form-property-title-text` - Title text
- `intake-form-property-content` - Card content

### Property Types
- `intake-form-property-types-section` - Property types section
- `intake-form-property-types-label` - Property types label
- `intake-form-property-types-description` - Description text
- `intake-form-property-types-grid` - Property types grid
- `intake-form-property-type-{type}` - Individual property type buttons (villa, house, apartment, etc.)

### Preferred Regions
- `intake-form-regions-section` - Regions section
- `intake-form-regions-label` - Regions label
- `intake-form-regions-description` - Description text
- `intake-form-regions-grid` - Regions grid
- `intake-form-region-{region}` - Individual region buttons (toscana, lombardia, etc.)

### Budget & Specifications
- `intake-form-budget-section` - Budget section
- `intake-form-budget-label` - Budget label
- `intake-form-budget-select` - Budget dropdown
- `intake-form-budget-placeholder` - Budget placeholder option
- `intake-form-budget-{range}` - Budget range options
- `intake-form-specs-section` - Specifications section
- `intake-form-bedrooms-field` - Bedrooms field
- `intake-form-bedrooms-label` - Bedrooms label
- `intake-form-bedrooms-input` - Bedrooms input
- `intake-form-bathrooms-field` - Bathrooms field
- `intake-form-bathrooms-label` - Bathrooms label
- `intake-form-bathrooms-input` - Bathrooms input
- `intake-form-size-field` - Size field
- `intake-form-size-label` - Size label
- `intake-form-size-input` - Size input

### Purchase Details Section
- `intake-form-purchase-card` - Purchase details card
- `intake-form-purchase-header` - Card header
- `intake-form-purchase-title` - Section title
- `intake-form-purchase-icon` - Calendar icon
- `intake-form-purchase-title-text` - Title text
- `intake-form-purchase-content` - Card content

### Purchase Fields
- `intake-form-timeline-field` - Timeline field
- `intake-form-timeline-label` - Timeline label
- `intake-form-timeline-select` - Timeline dropdown
- `intake-form-timeline-placeholder` - Timeline placeholder
- `intake-form-timeline-{option}` - Timeline options
- `intake-form-purpose-field` - Purpose field
- `intake-form-purpose-label` - Purpose label
- `intake-form-purpose-textarea` - Purpose textarea
- `intake-form-financing-field` - Financing field
- `intake-form-financing-label` - Financing label
- `intake-form-financing-textarea` - Financing textarea
- `intake-form-requirements-field` - Requirements field
- `intake-form-requirements-label` - Requirements label
- `intake-form-requirements-textarea` - Requirements textarea

### Additional Information Section
- `intake-form-additional-card` - Additional info card
- `intake-form-additional-header` - Card header
- `intake-form-additional-title` - Section title
- `intake-form-additional-icon` - Globe icon
- `intake-form-additional-title-text` - Title text
- `intake-form-additional-content` - Card content

### Additional Fields
- `intake-form-lifestyle-field` - Lifestyle field
- `intake-form-lifestyle-label` - Lifestyle label
- `intake-form-lifestyle-textarea` - Lifestyle textarea
- `intake-form-referral-field` - Referral field
- `intake-form-referral-label` - Referral label
- `intake-form-referral-input` - Referral input
- `intake-form-notes-field` - Notes field
- `intake-form-notes-label` - Notes label
- `intake-form-notes-textarea` - Notes textarea

### Form Actions
- `intake-form-actions` - Actions container
- `intake-form-save-button` - Save button
- `intake-form-save-icon` - Save icon
- `intake-form-save-text` - Save button text

## Webinars (`/club/webinars/page.js`) ✅

### Main Container
- `webinars-container` - Main webinars page wrapper
- `webinars-header` - Header section
- `webinars-title` - Page title with calendar icon
- `webinars-title-icon` - Calendar icon
- `webinars-title-text` - Title text
- `webinars-subtitle` - Page subtitle

### Tabs Navigation
- `webinars-tabs` - Tabs container
- `webinars-tabs-list` - Tabs navigation list
- `webinars-tab-upcoming` - Upcoming webinars tab
- `webinars-tab-past` - Past recordings tab

### Upcoming Webinars
- `webinars-upcoming-content` - Upcoming webinars content area
- `webinar-upcoming-{id}` - Individual upcoming webinar card
- `webinar-upcoming-{id}-content` - Webinar card content
- `webinar-upcoming-{id}-layout` - Webinar layout container

#### Webinar Date Badge
- `webinar-upcoming-{id}-date-container` - Date badge container
- `webinar-upcoming-{id}-date-badge` - Date badge element
- `webinar-upcoming-{id}-date-month` - Month display
- `webinar-upcoming-{id}-date-day` - Day display

#### Webinar Information
- `webinar-upcoming-{id}-content-area` - Main content area
- `webinar-upcoming-{id}-header` - Webinar header section
- `webinar-upcoming-{id}-info` - Webinar info container
- `webinar-upcoming-{id}-category` - Category badge
- `webinar-upcoming-{id}-title` - Webinar title
- `webinar-upcoming-{id}-description` - Webinar description

#### Webinar Details
- `webinar-upcoming-{id}-details` - Details container
- `webinar-upcoming-{id}-date-info` - Date information
- `webinar-upcoming-{id}-date-icon` - Date icon
- `webinar-upcoming-{id}-time-info` - Time information
- `webinar-upcoming-{id}-time-icon` - Time icon
- `webinar-upcoming-{id}-duration-info` - Duration information
- `webinar-upcoming-{id}-duration-icon` - Duration icon
- `webinar-upcoming-{id}-spots-info` - Available spots info
- `webinar-upcoming-{id}-spots-icon` - Spots icon

#### Speaker Information
- `webinar-upcoming-{id}-footer` - Webinar footer
- `webinar-upcoming-{id}-speaker` - Speaker container
- `webinar-upcoming-{id}-speaker-avatar` - Speaker avatar
- `webinar-upcoming-{id}-speaker-info` - Speaker info container
- `webinar-upcoming-{id}-speaker-name` - Speaker name
- `webinar-upcoming-{id}-speaker-title` - Speaker title

#### Registration Actions
- `webinar-upcoming-{id}-actions` - Actions container
- `webinar-upcoming-{id}-register` - Register button (when not registered)
- `webinar-upcoming-{id}-register-icon` - Register icon
- `webinar-upcoming-{id}-add-calendar` - Add to calendar button (when registered)
- `webinar-upcoming-{id}-add-calendar-icon` - Calendar icon
- `webinar-upcoming-{id}-cancel` - Cancel registration button (when registered)

#### Registration Status
- `webinar-upcoming-{id}-registered-status` - Registration status container
- `webinar-upcoming-{id}-registered-message` - Registration message
- `webinar-upcoming-{id}-registered-icon` - Registration check icon

### Past Webinars/Recordings
- `webinars-past-content` - Past webinars content area
- `webinar-past-{id}` - Individual past webinar card
- `webinar-past-{id}-content` - Webinar card content
- `webinar-past-{id}-layout` - Webinar layout container

#### Video Thumbnail
- `webinar-past-{id}-thumbnail-container` - Thumbnail container
- `webinar-past-{id}-thumbnail` - Video thumbnail
- `webinar-past-{id}-play-icon` - Play button icon
- `webinar-past-{id}-duration-badge` - Duration badge

#### Webinar Information
- `webinar-past-{id}-content-area` - Main content area
- `webinar-past-{id}-header` - Webinar header section
- `webinar-past-{id}-info` - Webinar info container
- `webinar-past-{id}-category` - Category badge
- `webinar-past-{id}-title` - Webinar title
- `webinar-past-{id}-description` - Webinar description

#### Webinar Details
- `webinar-past-{id}-details` - Details container
- `webinar-past-{id}-date-info` - Date information
- `webinar-past-{id}-date-icon` - Date icon
- `webinar-past-{id}-views-info` - Views information
- `webinar-past-{id}-views-icon` - Views icon

#### Speaker Information
- `webinar-past-{id}-footer` - Webinar footer
- `webinar-past-{id}-speaker` - Speaker container
- `webinar-past-{id}-speaker-avatar` - Speaker avatar
- `webinar-past-{id}-speaker-info` - Speaker info container
- `webinar-past-{id}-speaker-name` - Speaker name
- `webinar-past-{id}-speaker-title` - Speaker title

#### Recording Actions
- `webinar-past-{id}-actions` - Actions container
- `webinar-past-{id}-download` - Download button
- `webinar-past-{id}-download-icon` - Download icon
- `webinar-past-{id}-watch` - Watch recording button
- `webinar-past-{id}-watch-icon` - Watch icon

## Documents (`/club/documents/page.js`) ✅

### Main Container
- `documents-container` - Main documents page wrapper
- `documents-header` - Header section
- `documents-title` - Page title with folder icon
- `documents-title-icon` - Folder icon
- `documents-title-text` - Title text
- `documents-subtitle` - Page subtitle

### Search and Filters
- `documents-search-card` - Search and filters card
- `documents-search-content` - Card content
- `documents-search-layout` - Search layout container
- `documents-search-field` - Search field container
- `documents-search-icon` - Search icon
- `documents-search-input` - Search input field
- `documents-category-filters` - Category filter buttons container
- `documents-category-{category}` - Individual category filter buttons (all-documents, legal-documents, etc.)

### Document Stats
- `documents-stats-grid` - Stats cards grid
- `documents-stat-total` - Total documents stat card
- `documents-stat-total-content` - Card content
- `documents-stat-total-layout` - Layout container
- `documents-stat-total-info` - Info container
- `documents-stat-total-label` - "Total Documents" label
- `documents-stat-total-value` - Document count value
- `documents-stat-total-icon` - Icon container

#### Categories Stat
- `documents-stat-categories` - Categories stat card
- `documents-stat-categories-content` - Card content
- `documents-stat-categories-layout` - Layout container
- `documents-stat-categories-info` - Info container
- `documents-stat-categories-label` - "Categories" label
- `documents-stat-categories-value` - Category count value
- `documents-stat-categories-icon` - Icon container

#### Downloads Stat
- `documents-stat-downloads` - Downloads stat card
- `documents-stat-downloads-content` - Card content
- `documents-stat-downloads-layout` - Layout container
- `documents-stat-downloads-info` - Info container
- `documents-stat-downloads-label` - "Downloads" label
- `documents-stat-downloads-value` - Download count value
- `documents-stat-downloads-icon` - Icon container

### Documents List
- `documents-list` - Documents list container
- `document-{id}` - Individual document card
- `document-{id}-content` - Document card content
- `document-{id}-layout` - Document layout container

#### Document Elements
- `document-{id}-icon-container` - Icon container
- `document-{id}-icon` - Document type icon
- `document-{id}-details` - Document details container
- `document-{id}-name` - Document name
- `document-{id}-description` - Document description
- `document-{id}-metadata` - Metadata container
- `document-{id}-category` - Category badge
- `document-{id}-type` - File type
- `document-{id}-size` - File size
- `document-{id}-date` - Upload date
- `document-{id}-date-icon` - Date icon

#### Document Actions
- `document-{id}-actions` - Actions container
- `document-{id}-preview` - Preview button
- `document-{id}-preview-icon` - Preview icon
- `document-{id}-download` - Download button
- `document-{id}-download-icon` - Download icon

### Empty State
- `documents-empty-state` - Empty state card
- `documents-empty-content` - Empty state content
- `documents-empty-icon` - Empty state icon
- `documents-empty-message` - Empty state message

## Concierge (`/club/concierge/page.js`)

Coming next...

## Content Library (`/club/content/page.js`)

Coming next...

---

## How to Use This Reference

When you want to change something, you can:

1. **Find the element** in this list
2. **Tell me the ID** - e.g., "Change `club-sidebar-logo-text` color to blue"
3. **I'll know exactly** which element to modify

### Example Change Request:
```
WHERE: club-sidebar-premium-badge
WHAT: Background color
HOW: Change from amber gradient to blue gradient
```

This is much clearer than "change the premium badge color in the sidebar"!

---

**Status:** Layout complete ✅ | Adding more pages now...

