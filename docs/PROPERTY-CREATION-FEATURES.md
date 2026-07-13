# Enhanced Property Creation System

## Overview
The property creation system has been significantly enhanced with comprehensive features for managing property listings, images, SEO, and publishing schedules.

## New Features Implemented

### 1. Image Upload & Management
**Location:** Property Edit Modal → Images Tab

**Features:**
- **Multi-image upload**: Upload multiple property images at once
- **Drag & drop support**: User-friendly image upload interface
- **Image preview**: View all uploaded images in a grid layout
- **Main image selection**: Click the star icon to set which image appears first
- **Image removal**: Delete unwanted images with a single click
- **Visual indicators**: Main image is highlighted with a yellow border and "Main Image" badge

**Technical Implementation:**
- Images are uploaded to Sanity CMS asset storage via `/api/upload-image`
- Each image is stored with its asset reference and URL
- Main image index is tracked separately for quick access

### 2. Rich Text Description
**Location:** Property Edit Modal → Description Tab

**Features:**
- **Bilingual support**: Separate description fields for English and Italian
- **Character counter**: Real-time character count for both languages
- **Large text area**: 8 rows with vertical resize capability
- **Placeholder text**: Helpful prompts in both languages

### 3. SEO Optimization
**Location:** Property Edit Modal → SEO & Publishing Tab

**Features:**
- **SEO Title**: Optimized title tags for search engines (60 character limit)
  - Separate fields for English and Italian
  - Character counter with optimal length guidance (50-60 chars)
  
- **Meta Description**: Search result snippets (160 character limit)
  - Bilingual support
  - Character counter with optimal length guidance (150-160 chars)
  
- **Keywords Manager**:
  - Add keywords dynamically by typing and pressing Enter or clicking "Add"
  - Visual keyword tags with easy removal
  - Helpful for SEO and content categorization

### 4. Scheduled Publishing
**Location:** Property Edit Modal → SEO & Publishing Tab

**Features:**
- **Schedule toggle**: Enable/disable scheduled publishing
- **Date & time picker**: Select exact publication date and time
- **Automatic publishing**: Property will be automatically published at the scheduled time
- **Draft mode**: Properties can be saved as drafts and published later

**Use Cases:**
- Plan property launches in advance
- Coordinate marketing campaigns
- Stage content for future release
- Manage seasonal property listings

### 5. Property Detail Page Link
**Location:** Content Management → Properties List

**Features:**
- **External link button**: Opens property detail page in a new tab
- **Quick preview**: View how the property looks to end users
- **Easy access**: Located next to Edit and Delete buttons
- **Icon indicator**: Uses ExternalLink icon for clarity

## Updated Property Structure

Properties now support the following fields:

```javascript
{
  // Basic Information
  title: { en: '', it: '' },
  propertyType: 'villa',
  price: { amount: 0, currency: 'EUR' },
  specifications: { bedrooms: 0, bathrooms: 0, squareFootage: 0 },
  location: { city: { name: { en: '', it: '' } } },
  status: 'available', // available, reserved, sold, draft
  featured: false,
  
  // New: Images
  images: [
    {
      _type: 'image',
      asset: { _type: 'reference', _ref: 'asset-id' },
      url: 'https://...'
    }
  ],
  mainImage: 0, // index of main image
  
  // New: Content
  description: { en: '', it: '' },
  
  // New: SEO
  seoTitle: { en: '', it: '' },
  seoDescription: { en: '', it: '' },
  keywords: ['keyword1', 'keyword2'],
  
  // New: Publishing
  publishAt: '2024-12-31T10:00',
  scheduledPublish: false
}
```

## User Interface Improvements

### Tabbed Interface
The property edit modal now uses a 4-tab interface for better organization:

1. **Basic Info**: Essential property details (title, type, price, specs)
2. **Images**: Image upload, management, and main image selection
3. **Description**: Detailed property descriptions in multiple languages
4. **SEO & Publishing**: Search optimization and publication scheduling

### Visual Feedback
- Loading states for image uploads
- Character counters for text fields
- Success/error messages
- Disabled states when Sanity is not configured
- Validation indicators

### Responsive Design
- Modal adapts to screen size (max-width: 4xl)
- Scrollable content area (max-height: 90vh)
- Grid layouts for efficient space usage
- Mobile-friendly touch targets

## API Endpoints

### 1. Image Upload
**Endpoint:** `POST /api/upload-image`
- Accepts: FormData with 'file' field
- Returns: Asset ID, URL, and metadata
- Handles: Single or multiple image uploads

### 2. Content Management
**Endpoint:** `POST /api/content` (Create)
- Accepts: Property data with all new fields
- Returns: Created property with Sanity document ID

**Endpoint:** `PUT /api/content` (Update)
- Accepts: Property ID and updated data
- Returns: Updated property

**Endpoint:** `DELETE /api/content` (Delete)
- Accepts: Property ID as query parameter
- Returns: Success confirmation

## How to Use

### Creating a New Property

1. **Click "Add Property"** in the Content Management page
2. **Fill Basic Info** (Tab 1):
   - Enter titles in English and Italian
   - Select property type and status
   - Set price and specifications
   - Add location information
   - Optionally mark as featured

3. **Upload Images** (Tab 2):
   - Click the upload area or drag & drop images
   - Wait for upload to complete
   - Click star icon on the image you want as main image
   - Remove any unwanted images

4. **Add Description** (Tab 3):
   - Write detailed descriptions in English and Italian
   - Use the character counter to gauge length

5. **Optimize for SEO** (Tab 4):
   - Add SEO-friendly titles (50-60 characters)
   - Write compelling meta descriptions (150-160 characters)
   - Add relevant keywords by typing and pressing Enter

6. **Schedule Publishing** (Tab 4, optional):
   - Check "Schedule publication date"
   - Select date and time for automatic publishing

7. **Save**: Click "Create Property" to save

### Viewing a Property
- In the property list, click the external link icon (🔗) to view the property detail page in a new tab

### Editing a Property
- Click the Edit button (pencil icon) to open the property in the modal
- Make changes across any tabs
- Click "Save Changes" to update

## Technical Notes

### Image Storage
- Images are stored in Sanity's asset storage
- Original URLs are preserved for quick access
- Asset references ensure proper cleanup when properties are deleted

### SEO Implementation
- SEO fields are separate from display content for flexibility
- Keywords are stored as an array for easy querying
- Meta descriptions can be auto-generated or manually specified

### Scheduled Publishing
- `publishAt` field stores ISO 8601 datetime string
- `scheduledPublish` boolean flag enables/disables scheduling
- Actual publishing automation requires a cron job or scheduled function (to be implemented)

### Validation
- Required fields: Title (EN), Property Type, Status, Price
- Optional but recommended: Images, Description, SEO fields
- System prevents saving without Sanity configuration

## Future Enhancements

Potential additions for future versions:
- Rich text editor (WYSIWYG) for descriptions
- Video upload support
- Floor plan management
- Virtual tour integration
- Bulk image operations
- Image ordering/drag-to-reorder
- Auto-generate SEO content from description
- Scheduled publish automation via cron job
- Image optimization and CDN integration
- Multi-language support beyond English/Italian

## Environment Variables Required

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-write-token
```

Without these, the system will show configuration warnings and prevent write operations.

