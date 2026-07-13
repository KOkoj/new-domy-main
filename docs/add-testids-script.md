# Adding Test IDs - Strategy

## ✅ Completed:
- **Layout** (`app/club/layout.js`) - Fully tagged with data-testid

## 🎯 To Do - Add testids to MAJOR elements only:

### Dashboard (`/club/page.js`)
- Page container
- Header section
- Welcome message
- Stats cards (4 cards)
- Upcoming webinars section
- Recent activity section
- Quick actions section

### Intake Form (`/club/intake-form/page.js`)
- Page container
- Form sections (Personal, Property, Purchase, Additional)
- All form fields
- Submit button

### Webinars (`/club/webinars/page.js`)
- Page container
- Tabs (Upcoming/Past)
- Webinar cards
- Registration buttons

### Documents (`/club/documents/page.js`)
- Page container
- Search bar
- Category filters
- Document cards
- Download buttons

### Concierge (`/club/concierge/page.js`)
- Page container
- Tabs (New Request/My Tickets)
- Form fields
- Ticket cards

### Content (`/club/content/page.js`)
- Page container
- Tabs (Videos/Guides/Articles)
- Content cards

---

## Strategy:
Instead of 500+ individual testids, I'll add:
- **~50-80 strategic testids** covering all major UI elements
- **Clear naming convention** so you can predict IDs
- **Documentation** showing all available IDs

Then we can add more granular IDs as needed!

**Shall I proceed with this approach?** It will be much faster and you'll still be able to precisely identify any element you want to change!

