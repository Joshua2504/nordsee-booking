# Nordsee Booking Platform - Development Documentation

**Airbnb/Booking.com replica for the German northern coast**

## Overview

A full-stack booking platform where users can list properties or rent apartments along the German northern coast (Nordsee). Built with Node.js, Vue.js, and MariaDB in a production-ready Docker stack.

---

## Tech Stack

### Backend
- **Runtime**: Node.js 24 LTS
- **Framework**: Express.js
- **Database**: MariaDB 12.3
- **Database Client**: mysql2 (Promise-based)
- **Query Builder/Migrations**: Knex.js
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **File Uploads**: Multer
- **Image Processing**: Sharp (thumbnails, compression)
- **Validation**: Joi
- **Security**: helmet, cors, express-rate-limit
- **Date Handling**: date-fns
- **Environment**: dotenv
- **Internationalization**: i18next, i18next-http-middleware, i18next-fs-backend

### Frontend
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Router**: Vue Router
- **HTTP Client**: Axios
- **Calendar/Date Picker**: v-calendar
- **Form Validation**: vee-validate + yup
- **Map**: Leaflet + vue-leaflet + leaflet.markercluster
- **Notifications**: vue-toastification
- **Date Utilities**: date-fns
- **Image Lazy Loading**: vue-lazyload or native loading="lazy"
- **Internationalization**: vue-i18n

### DevOps
- **Containerization**: Docker + Docker Compose
- **Geocoding**: Nominatim API (OpenStreetMap, free)

### Deployment
- Simple Docker Compose setup
- Single container architecture (Node.js serves built Vue.js app)
- Serves on port 8080
- Data persistence via volume mounts
- Local file storage for images

---

## Architecture

### Monorepo Structure

```
nordsee-booking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MariaDB connection pool
│   │   │   └── jwt.js               # JWT configuration
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── roleCheck.js         # Host/Guest role validation
│   │   │   ├── upload.js            # Multer configuration
│   │   │   ├── validator.js         # Request validation
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Register, login, logout
│   │   │   ├── user.routes.js       # User profile
│   │   │   ├── property.routes.js   # Property CRUD
│   │   │   ├── booking.routes.js    # Booking management
│   │   │   ├── availability.routes.js # Calendar management
│   │   │   ├── search.routes.js     # Property search
│   │   │   └── amenity.routes.js    # Amenity list
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── property.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── availability.controller.js
│   │   │   ├── search.controller.js
│   │   │   └── amenity.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── property.model.js
│   │   │   ├── booking.model.js
│   │   │   ├── availability.model.js
│   │   │   ├── image.model.js
│   │   │   └── amenity.model.js
│   │   ├── services/
│   │   │   ├── imageProcessor.js    # Sharp image processing
│   │   │   ├── geocoding.js         # Nominatim API integration
│   │   │   ├── availabilityService.js # Calendar generation logic
│   │   │   ├── bookingService.js    # Booking logic & conflict checks
│   │   │   └── searchService.js     # Search with filters
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   ├── locales/                 # Translation files
│   │   │   ├── de/
│   │   │   │   └── translation.json
│   │   │   └── en/
│   │   │       └── translation.json
│   │   └── index.js                 # Express app entry point
│   ├── migrations/                  # Knex database migrations
│   ├── seeds/                       # Seed data (amenities, test users)
│   ├── package.json
│   ├── knexfile.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/                  # Images, styles
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   └── LoadingSpinner.vue
│   │   │   ├── property/
│   │   │   │   ├── PropertyCard.vue
│   │   │   │   ├── PropertyGallery.vue
│   │   │   │   ├── PropertyForm.vue
│   │   │   │   ├── ImageUploader.vue
│   │   │   │   └── AmenitySelector.vue
│   │   │   ├── booking/
│   │   │   │   ├── BookingCalendar.vue
│   │   │   │   ├── BookingForm.vue
│   │   │   │   └── BookingSummary.vue
│   │   │   ├── search/
│   │   │   │   ├── SearchFilters.vue
│   │   │   │   ├── PriceRangeSlider.vue
│   │   │   │   └── AmenityFilter.vue
│   │   │   └── map/
│   │   │       ├── PropertyMap.vue
│   │   │       └── MapMarker.vue
│   │   ├── views/
│   │   │   ├── Home.vue
│   │   │   ├── SearchResults.vue
│   │   │   ├── PropertyDetail.vue
│   │   │   ├── BookingCheckout.vue
│   │   │   ├── auth/
│   │   │   │   ├── Login.vue
│   │   │   │   └── Register.vue
│   │   │   ├── host/
│   │   │   │   ├── HostDashboard.vue
│   │   │   │   ├── CreateProperty.vue
│   │   │   │   ├── EditProperty.vue
│   │   │   │   ├── ManageAvailability.vue
│   │   │   │   └── HostBookings.vue
│   │   │   └── guest/
│   │   │       ├── GuestDashboard.vue
│   │   │       └── MyBookings.vue
│   │   ├── composables/
│   │   │   ├── useAuth.js           # Authentication composable
│   │   │   ├── useBooking.js        # Booking logic
│   │   │   ├── useCalendar.js       # Calendar state
│   │   │   └── useMap.js            # Map interactions
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── propertyService.js
│   │   │   ├── bookingService.js
│   │   │   └── searchService.js
│   │   ├── stores/
│   │   │   ├── auth.js              # Pinia auth store
│   │   │   ├── property.js
│   │   │   └── booking.js
│   │   ├── router/
│   │   │   └── index.js             # Vue Router configuration
│   │   ├── locales/                 # Translation files
│   │   │   ├── de.json              # German translations
│   │   │   └── en.json              # English translations
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   │   └── favicon.ico
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── data/                            # Volume mount directory
│   ├── uploads/
│   │   └── properties/              # Property images (auto-created)
│   └── mysql/                       # MariaDB data (auto-created)
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json                     # Root workspace package.json
├── README.md
└── DEVELOPMENT.md                   # This file
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('host', 'guest', 'both') DEFAULT 'guest',
    avatar_url VARCHAR(500),
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Properties Table

```sql
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    host_id INT NOT NULL,
    title VARCHAR(255) NOT NULL COMMENT 'Primary language title',
    description TEXT NOT NULL COMMENT 'Primary language description',
    property_type ENUM('house', 'apartment', 'cottage', 'villa', 'room', 'other') NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Germany',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    guest_capacity INT NOT NULL,
    bedrooms INT NOT NULL,
    beds INT NOT NULL,
    bathrooms DECIMAL(3, 1) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Default daily price',
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    status ENUM('draft', 'published', 'unpublished', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_host (host_id),
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    INDEX idx_guest_capacity (guest_capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Property Translations Table

```sql
CREATE TABLE property_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    language_code VARCHAR(5) NOT NULL COMMENT 'ISO 639-1 code: de, en, fr, nl, etc.',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_property_language (property_id, language_code),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_language (language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Property Images Table

```sql
CREATE TABLE property_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL COMMENT 'Path relative to /data/uploads/',
    thumbnail_path VARCHAR(500) COMMENT 'Small thumbnail (300x200)',
    medium_path VARCHAR(500) COMMENT 'Medium size (800x600)',
    file_size INT NOT NULL COMMENT 'File size in bytes',
    mime_type VARCHAR(50) NOT NULL,
    width INT,
    height INT,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_order (property_id, display_order),
    INDEX idx_property_primary (property_id, is_primary),
    CONSTRAINT chk_file_size CHECK (file_size <= 20971520),
    CONSTRAINT chk_display_order CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger to enforce max 100 images per property
DELIMITER $$
CREATE TRIGGER before_property_image_insert 
BEFORE INSERT ON property_images
FOR EACH ROW
BEGIN
    DECLARE img_count INT;
    SELECT COUNT(*) INTO img_count FROM property_images WHERE property_id = NEW.property_id;
    IF img_count >= 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum 100 images per property';
    END IF;
END$$
DELIMITER ;
```

### Amenities Table

```sql
CREATE TABLE amenities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Translation key (e.g., amenity.wifi)',
    icon VARCHAR(50) COMMENT 'Icon class or emoji',
    category ENUM('essentials', 'features', 'location', 'safety', 'accessibility') DEFAULT 'features',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-populate amenities (using translation keys)
INSERT INTO amenities (name, icon, category) VALUES
-- Essentials
('amenity.wifi', '📶', 'essentials'),
('amenity.heating', '🔥', 'essentials'),
('amenity.air_conditioning', '❄️', 'essentials'),
('amenity.hot_water', '💧', 'essentials'),
('amenity.kitchen', '🍳', 'essentials'),
('amenity.towels', '🧻', 'essentials'),
('amenity.bed_linens', '🛏️', 'essentials'),
('amenity.soap', '🧼', 'essentials'),
('amenity.toilet_paper', '🧻', 'essentials'),

-- Features
('amenity.tv', '📺', 'features'),
('amenity.washing_machine', '🧺', 'features'),
('amenity.dryer', '👕', 'features'),
('amenity.dishwasher', '🍽️', 'features'),
('amenity.coffee_maker', '☕', 'features'),
('amenity.microwave', '📻', 'features'),
('amenity.refrigerator', '🧊', 'features'),
('amenity.oven', '🔥', 'features'),
('amenity.iron', '👔', 'features'),
('amenity.hair_dryer', '💨', 'features'),
('amenity.desk_workspace', '💼', 'features'),
('amenity.bbq_grill', '🍖', 'features'),
('amenity.fireplace', '🔥', 'features'),
('amenity.piano', '🎹', 'features'),
('amenity.pool_table', '🎱', 'features'),

-- Location Features
('amenity.free_parking', '🅿️', 'location'),
('amenity.paid_parking', '🅿️', 'location'),
('amenity.gym', '🏋️', 'location'),
('amenity.pool', '🏊', 'location'),
('amenity.hot_tub', '🛁', 'location'),
('amenity.sauna', '🧖', 'location'),
('amenity.beach_access', '🏖️', 'location'),
('amenity.waterfront', '🌊', 'location'),
('amenity.garden', '🌳', 'location'),
('amenity.patio_balcony', '🏡', 'location'),
('amenity.sea_view', '🌅', 'location'),

-- Safety
('amenity.smoke_detector', '🔔', 'safety'),
('amenity.carbon_monoxide_detector', '⚠️', 'safety'),
('amenity.fire_extinguisher', '🧯', 'safety'),
('amenity.first_aid_kit', '🏥', 'safety'),
('amenity.security_cameras', '📹', 'safety'),
('amenity.lock_on_bedroom_door', '🔐', 'safety'),

-- Accessibility
('amenity.wheelchair_accessible', '♿', 'accessibility'),
('amenity.elevator', '🛗', 'accessibility'),
('amenity.ground_floor_access', '🏠', 'accessibility'),
('amenity.wide_doorways', '🚪', 'accessibility'),
('amenity.accessible_bathroom', '🚽', 'accessibility'),

-- Pet Friendly
('amenity.pets_allowed', '🐕', 'features'),
('amenity.pet_bowls', '🥣', 'features'),

-- Family Friendly
('amenity.baby_cot', '👶', 'features'),
('amenity.high_chair', '🪑', 'features'),
('amenity.children_books_toys', '🧸', 'features'),
('amenity.board_games', '🎲', 'features'),

-- Outdoor
('amenity.outdoor_furniture', '🪑', 'location'),
('amenity.outdoor_dining', '🍽️', 'location'),
('amenity.sun_loungers', '🏖️', 'location'),
('amenity.hammock', '🌴', 'location'),

-- Entertainment
('amenity.netflix', '📺', 'features'),
('amenity.sound_system', '🔊', 'features'),
('amenity.books', '📚', 'features'),
('amenity.bicycle', '🚲', 'features'),
('amenity.kayak', '🚣', 'features'),
('amenity.surfboard', '🏄', 'features');
```

### Property Amenities Junction Table

```sql
CREATE TABLE property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    INDEX idx_amenity (amenity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Availability Calendar Table

```sql
CREATE TABLE availability_calendar (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2) NOT NULL COMMENT 'Daily price for this date',
    requires_approval BOOLEAN DEFAULT FALSE COMMENT 'Host approval required for this date',
    status ENUM('available', 'booked', 'blocked', 'pending') DEFAULT 'available',
    notes VARCHAR(500) COMMENT 'Internal notes for host',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_property_date (property_id, date),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_date (property_id, date),
    INDEX idx_date_status (date, status),
    INDEX idx_date_available (date, is_available, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Bookings Table

```sql
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    guest_id INT NOT NULL,
    host_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    nights INT NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    cleaning_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Platform fee',
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    payment_method VARCHAR(50) COMMENT 'Mock payment: credit_card, paypal, etc.',
    special_requests TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_property (property_id),
    INDEX idx_guest (guest_id),
    INDEX idx_host (host_id),
    INDEX idx_check_in (check_in),
    INDEX idx_status (status),
    INDEX idx_dates (check_in, check_out),
    CONSTRAINT chk_dates CHECK (check_out > check_in)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Reviews Table (Optional Enhancement)

```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL UNIQUE,
    property_id INT NOT NULL,
    guest_id INT NOT NULL,
    host_id INT NOT NULL,
    rating INT NOT NULL COMMENT '1-5 stars',
    cleanliness_rating INT,
    communication_rating INT,
    checkin_rating INT,
    accuracy_rating INT,
    location_rating INT,
    value_rating INT,
    comment TEXT,
    host_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_rating (rating),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Key Features

### 1. Authentication & Authorization

**User Registration**
- Email/password registration
- Password hashing with bcrypt (10 rounds)
- Email validation
- Role selection: host, guest, or both

**User Login**
- JWT token generation (expires in 7 days)
- Token stored in HTTP-only cookie or localStorage
- Refresh token mechanism (optional)

**Role-Based Access Control**
- Hosts: Can create listings, manage availability, handle bookings
- Guests: Can search properties, make bookings
- Both: Access to both feature sets

### 2. Property Management (Host)

**Create Property**
- Basic info: title, description, property type
- Location: address, city, postal code (auto-geocode to lat/lng via Nominatim)
- Capacity: guests, bedrooms, beds, bathrooms
- Pricing: base daily price, cleaning fee
- Amenities: multi-select from 60+ options
- Images: upload up to 100 images (20MB each)
  - Auto-generate thumbnails (300x200px)
  - Auto-generate medium (800x600px)
  - Set primary image
  - Drag-drop reordering
  - Lazy-load images on frontend

**Edit Property**
- Update all property details
- Add/remove/reorder images
- Publish/unpublish listing

**Manage Availability & Pricing**
- Calendar view (12 months ahead)
- Pre-generate 12 months of availability on property creation
- Set availability per day (available/blocked)
- Set custom price per day (override base_price)
- Set approval requirement per day (instant book vs. approval)
- Bulk operations: set price/availability for date ranges
- Visual indicators: booked dates, blocked dates, custom pricing

**Booking Requests**
- View incoming booking requests
- Approve/reject pending bookings (for dates requiring approval)
- Automatic confirmation for instant book dates
- View booking calendar with guest details

### 3. Property Search & Discovery (Guest)

**Search Interface**
- Location search (city, region)
- Date range picker (check-in, check-out)
- Guest count selector
- Real-time availability filtering

**Advanced Filters**
- **Price Range**: Min/max daily price (slider)
- **Guest Capacity**: Number of guests
- **Property Type**: House, apartment, cottage, villa, room
- **Amenities**: Multi-select checkboxes by category
  - Essentials: WiFi, heating, kitchen
  - Features: washing machine, TV, hair dryer
  - Location: parking, beach access, sea view, pool
  - Safety: smoke detector, fire extinguisher
  - Accessibility: wheelchair accessible, elevator
- **Instant Book**: Show only properties with instant booking
- **Bedrooms/Bathrooms**: Min count filters

**Search Results**
- Grid/list view of properties
- Property cards with:
  - Primary image (lazy-loaded)
  - Title, location, guest capacity
  - Price per night
  - Average rating (if reviews implemented)
  - Instant book badge
- Pagination or infinite scroll
- Sort by: price (low/high), rating, newest

**Map View**
- Leaflet map with OpenStreetMap tiles
- Property markers with clustering (leaflet.markercluster)
- Click marker to show property popup
- Hover to highlight property card
- Map bounds update filters
- Zoom to fit search results

### 4. Property Detail Page

**Property Information**
- Image gallery with lightbox (100 images max, lazy-loaded)
- Title, description, property type
- Location (city, map with pin)
- Host profile (name, avatar, member since)
- Capacity details (guests, bedrooms, beds, bathrooms)
- Amenities grouped by category with icons
- House rules, cancellation policy

**Booking Widget**
- Date picker with calendar (v-calendar)
- Guest count selector
- Price breakdown:
  - Nightly rate × nights
  - Cleaning fee
  - Service fee (5% of base amount)
  - Total amount
- Check availability button
- Show if instant book or requires approval
- Book now / Request to book button

**Mock Payment Flow**
- Payment method selection (credit card, PayPal, etc.)
- Mock card input (no real processing)
- Confirmation screen
- Booking confirmation email (mock)

### 5. Booking Management

**Guest Dashboard**
- Upcoming bookings
- Past bookings
- Cancelled bookings
- Booking details: property, dates, price, status
- Cancel booking (with cancellation policy check)
- Leave review after checkout

**Host Dashboard**
- Pending booking requests (approve/reject)
- Upcoming bookings
- Past bookings
- Booking calendar overview
- Guest details and special requests
- Cancellation management

**Booking Conflict Prevention**
- Check availability_calendar for date range
- Ensure all dates are 'available' status
- Lock dates on booking confirmation (set status to 'booked')
- Handle cancellations (revert dates to 'available')

### 6. Calendar System

**12 Months Ahead Pre-Generation**
- On property creation, generate availability_calendar rows for next 12 months
- Use property.base_price as default daily price
- Set all dates as available by default
- Set requires_approval to false by default

**Daily Control**
- Host can edit any day: price, availability, approval requirement
- Bulk edit ranges: "Set July to €150/night, instant book"
- Visual calendar UI with color coding:
  - Green: available
  - Red: booked
  - Grey: blocked
  - Yellow: pending approval
  - Blue: custom price

**Automatic Updates**
- When booking confirmed: set dates to 'booked'
- When booking cancelled: revert to 'available'
- When date passes: archive or keep historical data

### 7. Image Handling

**Upload Process**
1. Frontend: User selects images (drag-drop or file picker)
2. Validation: Check file size (max 20MB), file type (JPEG, PNG, WebP), count (max 100)
3. Backend: Multer receives upload
4. Processing with Sharp:
   - Save original to `/data/uploads/properties/{property_id}/original/image_{property_id}_{seq}_{hash}.jpg`
   - Generate thumbnail (300x200, cover fit): `/thumbnails/thumb_{...}.jpg`
   - Generate medium (800x600, cover fit): `/medium/medium_{...}.jpg`
   - Optimize compression (JPEG quality 85)
5. Database: Insert into property_images with all paths
6. Response: Return image ID and paths

**Display Strategy**
- Thumbnail on property cards (fast loading)
- Medium on detail page gallery (lazy-loaded)
- Original on lightbox click (lazy-loaded)
- Use `loading="lazy"` attribute or vue-lazyload
- Serve via static file route: `/uploads/properties/{property_id}/...`

**Image Management**
- Drag-drop reordering in frontend (update display_order)
- Set primary image (is_primary flag, enforce only one)
- Delete images (remove files from disk + database row)
- Alt text for accessibility

### 8. Search Implementation

**SQL-Based Search**

Use indexed MariaDB queries with filters:

```sql
-- Find properties with full availability in date range
SELECT DISTINCT p.* 
FROM properties p
WHERE p.status = 'published'
  AND p.guest_capacity >= ?  -- guest count
  AND p.id IN (
    SELECT property_id 
    FROM availability_calendar
    WHERE date BETWEEN ? AND ?
      AND status = 'available'
    GROUP BY property_id
    HAVING COUNT(*) = ?  -- number of nights
  )
  -- Price range filter (check average price in range)
  AND p.id IN (
    SELECT property_id
    FROM availability_calendar
    WHERE date BETWEEN ? AND ?
      AND price BETWEEN ? AND ?
    GROUP BY property_id
    HAVING COUNT(*) = ?
  )
  -- Amenities filter (all selected amenities)
  AND (? IS NULL OR p.id IN (
    SELECT property_id 
    FROM property_amenities
    WHERE amenity_id IN (?)
    GROUP BY property_id
    HAVING COUNT(DISTINCT amenity_id) = ?
  ))
  -- Location bounding box (for map view)
  AND (? IS NULL OR (p.latitude BETWEEN ? AND ? AND p.longitude BETWEEN ? AND ?))
  -- Instant book filter
  AND (? IS NULL OR p.id IN (
    SELECT property_id
    FROM availability_calendar
    WHERE date BETWEEN ? AND ?
      AND requires_approval = FALSE
    GROUP BY property_id
    HAVING COUNT(*) = ?
  ))
ORDER BY p.base_price ASC
LIMIT ? OFFSET ?;
```

**Note:** MariaDB with proper indexes handles this workload efficiently for thousands of properties.

---

## Implementation Steps

### Phase 1: Infrastructure Setup

1. **Docker Configuration**
   - Create [docker-compose.yml](docker-compose.yml)
     - MariaDB 11.2 service
     - App service (Node.js)
     - Volume mounts: /data/uploads/, /data/mysql/
     - Environment variables
     - Port 8080 exposed
   - Create [Dockerfile](Dockerfile)
     - Multi-stage build (Vue build + Node runtime)
     - Install dependencies
     - Copy source code
     - Serve static files from backend
   - Create [.dockerignore](.dockerignore)
   - Test with `docker-compose up --build`

2. **Backend Initialization**
   - `cd backend && npm init`
   - Install dependencies:
     ```bash
     npm install express mysql2 knex bcrypt jsonwebtoken dotenv multer sharp cors helmet express-rate-limit joi date-fns i18next i18next-http-middleware i18next-fs-backend
     ```
   - Setup [knexfile.js](backend/knexfile.js)
   - Create database connection pool
   - Setup Express app with middleware
   - Health check endpoint: `GET /api/health`

3. **Frontend Initialization**
   - `cd frontend && npm create vite@latest . -- --template vue`
   - Install dependencies:
     ```bash
     npm install vue-router pinia axios vee-validate yup date-fns v-calendar leaflet @vue-leaflet/vue-leaflet leaflet.markercluster vue-toastification vue-lazyload vue-i18n
     ```
   - Setup Vite config with proxy for API
   - Setup Vue Router with routes
   - Setup Pinia stores
   - Create axios instance with interceptors

### Phase 2: Database Setup

4. **Create Migrations**
   - Migration 001: Create users table
   - Migration 002: Create properties table
   - Migration 003: Create property_translations table
   - Migration 004: Create property_images table
   - Migration 005: Create amenities table
   - Migration 006: Create property_amenities table
   - Migration 007: Create availability_calendar table
   - Migration 008: Create bookings table
   - Migration 009: Create reviews table (optional)
   - Migration 010: Create image count trigger

5. **Seed Database**
   - Seed amenities (60+ options)
   - Seed test users (1 host, 1 guest, 1 both)
   - Seed test properties (5-10 properties in northern coast)
   - Seed availability calendar (12 months ahead)
   - Seed test bookings

6. **Run Migrations**
   ```bash
   cd backend
   npx knex migrate:latest
   npx knex seed:run
   ```

### Phase 3: Authentication System

7. **Backend Auth**
   - Implement auth.controller.js
     - POST /api/auth/register
     - POST /api/auth/login
     - POST /api/auth/logout
     - GET /api/auth/me
   - JWT middleware for protected routes
   - Password hashing/validation with bcrypt
   - Input validation with Joi

8. **Frontend Auth**
   - Create auth store (Pinia)
   - Create Login.vue and Register.vue
   - Create auth service (authService.js)
   - Setup axios interceptors for token
   - Route guards for protected pages
   - Persistent login (localStorage)

### Phase 3.5: Internationalization Setup

9. **Backend i18n Configuration**
   - Setup i18next in Express app
   - Create translation files (de, en)
   - Middleware for language detection
     - Accept-Language header
     - Query parameter (?lang=de)
     - Cookie preference
   - Translation structure:
     - Common messages (errors, validation)
     - Amenity names
     - Email templates
     - System notifications

10. **Frontend i18n Configuration**
    - Setup vue-i18n in main.js
    - Create translation files (de, en)
    - Language switcher component
    - Persist language preference (localStorage)
    - Default language: German (de)
    - Supported languages: German (de), English (en)
    - Date/time formatting per locale
    - Number/currency formatting (€)

11. **Property Translations**
    - Add translation management to PropertyForm
    - Tab interface for different languages
    - Title and description per language
    - Fallback to primary language if translation missing
    - API endpoints for property translations

### Phase 4: Property Management

12. **Property CRUD Backend**
   - property.controller.js
     - POST /api/properties (create)
     - GET /api/properties/:id (read)
     - PUT /api/properties/:id (update)
     - DELETE /api/properties/:id (delete)
     - GET /api/properties/host/:hostId (list host properties)
   - Property validation rules
   - Host authorization checks

13. **Geocoding Service**
    - Implement geocoding.js service
    - Nominatim API integration
    - Rate limiting (1 req/sec)
    - Cache geocoding results
    - Auto-geocode on property create/update

14. **Image Upload Backend**
    - Setup Multer middleware
      - Destination: /data/uploads/properties/{property_id}/
      - File size limit: 20MB
      - File type: JPEG, PNG, WebP
    - Implement imageProcessor.js service
      - Sharp thumbnail generation
      - Sharp medium size generation
      - Compression optimization
      - File naming strategy
    - Image endpoints:
      - POST /api/properties/:id/images (upload)
      - PUT /api/properties/:id/images/:imageId (update order/primary)
      - DELETE /api/properties/:id/images/:imageId (delete)
      - GET /uploads/* (static file serving)

15. **Property Frontend**
    - Create PropertyForm.vue (create/edit)
    - Create ImageUploader.vue
      - Drag-drop interface
      - Multi-file selection
      - Preview thumbnails
      - Upload progress bars
      - Reorder by drag-drop
      - Set primary image
      - Delete images
    - Create AmenitySelector.vue
      - Grouped by category
      - Checkbox selection
      - Search/filter amenities
    - Create CreateProperty.vue and EditProperty.vue views
    - Create HostDashboard.vue

### Phase 5: Availability & Pricing

16. **Availability Calendar Backend**
    - availabilityService.js
      - generateCalendar(propertyId, months=12)
      - checkAvailability(propertyId, checkIn, checkOut)
      - updateDailyPrice(propertyId, date, price)
      - updateDailyAvailability(propertyId, date, isAvailable)
      - updateDailyApproval(propertyId, date, requiresApproval)
      - bulkUpdate(propertyId, dateRange, updates)
    - availability.controller.js
      - GET /api/availability/:propertyId (get calendar)
      - PUT /api/availability/:propertyId/bulk (bulk update)
      - PUT /api/availability/:propertyId/day (single day update)

17. **Calendar Frontend**
    - Create ManageAvailability.vue
    - Integrate v-calendar
    - Calendar UI with color coding
    - Click day to edit (modal):
      - Price input
      - Available toggle
      - Requires approval toggle
      - Notes textarea
    - Bulk edit mode:
      - Select date range
      - Apply same settings to all
    - Legend for status colors

### Phase 6: Search & Discovery

18. **Search Backend**
    - searchService.js
      - buildSearchQuery(filters)
      - executeSearch(filters, page, limit)
      - getSearchFilters() (return available amenities, price range, etc.)
    - search.controller.js
      - POST /api/search (main search endpoint)
      - GET /api/search/filters (get filter options)
    - Implement SQL-based search with all filters
    - Add pagination

19. **Search Frontend**
    - Create SearchResults.vue
    - Create SearchFilters.vue
      - Location input with autocomplete
      - Date range picker (v-calendar)
      - Guest count selector
      - Price range slider
      - Property type checkboxes
      - Amenities filter (grouped checkboxes)
      - Instant book toggle
      - Bedroom/bathroom count
    - Create PropertyCard.vue
      - Lazy-loaded thumbnail
      - Property info
      - Price per night
      - Instant book badge
    - Grid/list view toggle
    - Sort options
    - Pagination

20. **Map View**
    - Create PropertyMap.vue
    - Integrate Leaflet + OpenStreetMap
    - Add property markers
    - Implement leaflet.markercluster
    - Marker click → show popup with PropertyCard
    - Map bounds → update search filters
    - Sync map with search results

### Phase 7: Booking System

21. **Booking Backend**
    - bookingService.js
      - checkAvailability(propertyId, checkIn, checkOut)
      - calculatePrice(propertyId, checkIn, checkOut)
      - createBooking(bookingData)
      - updateBookingStatus(bookingId, status)
      - handleCancellation(bookingId)
      - lockDates(propertyId, checkIn, checkOut)
      - unlockDates(propertyId, checkIn, checkOut)
    - booking.controller.js
      - POST /api/bookings (create booking)
      - GET /api/bookings/:id (get booking details)
      - GET /api/bookings/guest/:guestId (guest bookings)
      - GET /api/bookings/host/:hostId (host bookings)
      - PUT /api/bookings/:id/approve (approve booking)
      - PUT /api/bookings/:id/reject (reject booking)
      - PUT /api/bookings/:id/cancel (cancel booking)
    - Conflict prevention logic
    - Transactional booking creation

22. **Booking Frontend**
    - Create BookingCalendar.vue
      - Show availability
      - Select date range
      - Highlight booked/blocked dates
      - Show pricing tooltip on hover
    - Create BookingForm.vue
      - Guest count input
      - Special requests textarea
      - Price breakdown display
      - Payment method selector (mock)
    - Create BookingSummary.vue
    - Create BookingCheckout.vue
      - Mock payment interface
      - Credit card form (no processing)
      - Confirmation screen
    - Create MyBookings.vue (guest)
    - Create HostBookings.vue (host)
      - Pending requests
      - Approve/reject buttons
      - Upcoming bookings

### Phase 8: Property Detail Page

23. **Property Detail**
    - Create PropertyDetail.vue
    - Create PropertyGallery.vue
      - Image grid with lazy loading
      - Lightbox on click
      - Show all 100 images
      - Thumbnail navigation
    - Host profile section
    - Amenities display (grouped)
    - Location map with pin
    - Booking widget integration
    - Reviews section (if implemented)

### Phase 9: Reviews (Optional)

24. **Reviews System**
    - review.controller.js
      - POST /api/reviews (create review)
      - GET /api/reviews/property/:propertyId
      - PUT /api/reviews/:id/response (host response)
    - Review form (guest only, after checkout)
    - Display reviews on property page
    - Average rating calculation
    - Rating categories

### Phase 10: Polish & Production

25. **Error Handling**
    - Global error handler middleware
    - Frontend error boundaries
    - User-friendly error messages
    - Toast notifications for actions

26. **Loading States**
    - LoadingSpinner component
    - Skeleton loaders for cards
    - Progress indicators for uploads

27. **Responsive Design**
    - Mobile-first CSS
    - Responsive grid layouts
    - Mobile navigation
    - Touch-friendly calendars

28. **Security**
    - Helmet middleware (security headers)
    - Rate limiting (express-rate-limit)
    - CORS configuration
    - Input sanitization
    - SQL injection prevention (parameterized queries)
    - XSS prevention
    - CSRF tokens (if using cookies)

29. **Performance**
    - Image optimization (Sharp)
    - Lazy loading images
    - Database query optimization (indexes)
    - Frontend code splitting
    - Gzip compression
    - CDN for static assets (optional)

30. **Testing**
    - Backend unit tests (Jest)
    - API integration tests
    - Frontend component tests (Vitest)
    - E2E tests (Playwright/Cypress)

31. **Documentation**
    - API documentation (Swagger/OpenAPI)
    - README.md
    - Environment variables documentation
    - Deployment guide

---

## Development Workflow

### Local Development

1. **Start Docker Stack**
   ```bash
   docker-compose up --build
   ```

2. **Access Application**
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api
   - Database: localhost:3306

3. **Development with Hot Reload**
   - Option A: Separate dev setup
     ```bash
     # Terminal 1: Backend
     cd backend && npm run dev  # nodemon on port 3000
     
     # Terminal 2: Frontend
     cd frontend && npm run dev  # vite dev server on port 5173
     ```
   - Option B: Docker with volumes
     - Mount source code as volumes
     - Use nodemon in container
     - Vite HMR through Docker

### Database Management

```bash
# Run migrations
docker-compose exec app npx knex migrate:latest

# Rollback migration
docker-compose exec app npx knex migrate:rollback

# Run seeds
docker-compose exec app npx knex seed:run

# Access MariaDB CLI
docker-compose exec db mysql -u root -p
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/property-search

# Commit changes
git add .
git commit -m "Add property search with filters"

# Push and create PR
git push origin feature/property-search
```

---

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=8080
API_BASE_URL=/api

# Database
DB_HOST=db
DB_PORT=3306
DB_USER=nordsee_user
DB_PASSWORD=secure_password_here
DB_NAME=nordsee_booking

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=/data/uploads
MAX_FILE_SIZE=20971520
MAX_FILES_PER_PROPERTY=100

# External APIs
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=your@email.com

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_UPLOAD_BASE_URL=http://localhost:8080/uploads
```

---

## Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: nordsee-booking-app
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: nordsee_user
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: nordsee_booking
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./data/uploads:/data/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mariadb:12.3
    container_name: nordsee-booking-db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: nordsee_booking
      MYSQL_USER: nordsee_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/mysql:/var/lib/mysql
    ports:
      - "3306:3306"
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: unless-stopped

volumes:
  mysql_data:
```

### Dockerfile

```dockerfile
# Stage 1: Build Vue.js frontend
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Node.js backend
FROM node:24-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Copy built Vue.js app from stage 1
COPY --from=frontend-build /app/frontend/dist ./public

# Create uploads directory
RUN mkdir -p /data/uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| POST | /api/auth/logout | Logout user | Yes |
| GET | /api/auth/me | Get current user | Yes |
| PUT | /api/auth/profile | Update profile | Yes |

### Properties

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/properties | Create property | Yes | Host |
| GET | /api/properties/:id | Get property details | No | - |
| PUT | /api/properties/:id | Update property | Yes | Host (owner) |
| DELETE | /api/properties/:id | Delete property | Yes | Host (owner) |
| GET | /api/properties/host/:hostId | List host properties | Yes | Host |

### Property Images

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/properties/:id/images | Upload images | Yes | Host (owner) |
| PUT | /api/properties/:id/images/:imageId | Update image | Yes | Host (owner) |
| DELETE | /api/properties/:id/images/:imageId | Delete image | Yes | Host (owner) |
| GET | /uploads/properties/:id/* | Serve static images | No | - |

### Availability

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /api/availability/:propertyId | Get calendar | No | - |
| PUT | /api/availability/:propertyId/day | Update single day | Yes | Host (owner) |
| PUT | /api/availability/:propertyId/bulk | Bulk update dates | Yes | Host (owner) |

### Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/search | Search properties | No |
| GET | /api/search/filters | Get filter options | No |

### Bookings

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/bookings | Create booking | Yes | Guest |
| GET | /api/bookings/:id | Get booking | Yes | Guest/Host (own) |
| GET | /api/bookings/guest/:guestId | Guest bookings | Yes | Guest |
| GET | /api/bookings/host/:hostId | Host bookings | Yes | Host |
| PUT | /api/bookings/:id/approve | Approve booking | Yes | Host (owner) |
| PUT | /api/bookings/:id/reject | Reject booking | Yes | Host (owner) |
| PUT | /api/bookings/:id/cancel | Cancel booking | Yes | Guest/Host |

### Amenities

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/amenities | List all amenities | No |
| GET | /api/amenities/categories | Group by category | No |

### Reviews (Optional)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /api/reviews | Create review | Yes | Guest |
| GET | /api/reviews/property/:id | Get property reviews | No | - |
| PUT | /api/reviews/:id/response | Host response | Yes | Host (owner) |

---

## Frontend Routes

```javascript
const routes = [
  { path: '/', component: Home, name: 'home' },
  { path: '/search', component: SearchResults, name: 'search' },
  { path: '/properties/:id', component: PropertyDetail, name: 'property-detail' },
  { path: '/booking/:id/checkout', component: BookingCheckout, name: 'booking-checkout', meta: { requiresAuth: true } },
  
  // Auth
  { path: '/login', component: Login, name: 'login' },
  { path: '/register', component: Register, name: 'register' },
  
  // Host
  { path: '/host/dashboard', component: HostDashboard, name: 'host-dashboard', meta: { requiresAuth: true, role: 'host' } },
  { path: '/host/properties/create', component: CreateProperty, name: 'create-property', meta: { requiresAuth: true, role: 'host' } },
  { path: '/host/properties/:id/edit', component: EditProperty, name: 'edit-property', meta: { requiresAuth: true, role: 'host' } },
  { path: '/host/properties/:id/availability', component: ManageAvailability, name: 'manage-availability', meta: { requiresAuth: true, role: 'host' } },
  { path: '/host/bookings', component: HostBookings, name: 'host-bookings', meta: { requiresAuth: true, role: 'host' } },
  
  // Guest
  { path: '/guest/dashboard', component: GuestDashboard, name: 'guest-dashboard', meta: { requiresAuth: true, role: 'guest' } },
  { path: '/guest/bookings', component: MyBookings, name: 'my-bookings', meta: { requiresAuth: true, role: 'guest' } },
]
```

---

## Deployment

### Production Deployment

1. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and Start**
   ```bash
   docker-compose up -d --build
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec app npx knex migrate:latest
   ```

4. **Seed Amenities**
   ```bash
   docker-compose exec app npx knex seed:run
   ```

5. **Access Application**
   - Open http://your-domain.com:8080
   - For HTTPS, use a simple reverse proxy like Caddy or nginx-proxy

---

## Future Enhancements

### Phase 11: Nice-to-Have Features

- [ ] Email notifications (SendGrid/Mailgun)
- [ ] PDF invoice generation
- [ ] iCal sync for calendar
- [ ] Additional languages (French, Dutch, Danish, Polish)
- [ ] Social login (Google, Facebook)
- [ ] Host verification badges
- [ ] Admin dashboard
- [ ] Basic analytics and reporting
- [ ] SEO optimization
- [ ] Promotions and discounts
- [ ] Real-time chat between host and guest

---

## Troubleshooting

### Docker Issues

**Problem**: Container won't start
```bash
# Check logs
docker-compose logs -f app

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

**Problem**: Database connection failed
- Check DB_HOST matches service name in docker-compose.yml
- Verify credentials in .env
- Wait for database to be ready (health check)

### Image Upload Issues

**Problem**: Images not saving
- Check /data/uploads permissions
- Verify UPLOAD_PATH in .env
- Check Multer configuration
- Ensure Sharp is installed correctly

**Problem**: Images too large
- Verify MAX_FILE_SIZE limit
- Check client-side validation
- Implement compression before upload

### Search Performance

**Problem**: Slow search queries
- Add database indexes (check INDEX section in schema)
- Limit date range searches (max 1 year)
- Implement pagination (50 results per page)
- Use EXPLAIN to optimize queries

### Geocoding Issues

**Problem**: Nominatim rate limits
- Implement rate limiting (1 req/sec)
- Cache geocoding results
- Batch geocode during off-peak
- Consider paid geocoding service (Google, Mapbox)

---

## Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (if using cookies)
- [ ] Rate limiting on auth endpoints
- [ ] File upload validation (size, type)
- [ ] Authorization checks on all protected routes
- [ ] HTTPS in production (reverse proxy)
- [ ] Environment variables not committed
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Security headers (helmet)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive data

---

## Performance Checklist

- [ ] Database indexes on frequently queried columns
- [ ] Image optimization (Sharp compression)
- [ ] Lazy loading for images
- [ ] Frontend code splitting
- [ ] Gzip compression
- [ ] Database connection pooling
- [ ] Basic query optimization

---

## Testing Strategy

### Backend Tests

```bash
cd backend
npm run test
```

**Test Coverage:**
- Unit tests for services (booking logic, availability, pricing)
- API integration tests (all endpoints)
- Database tests (migrations, constraints)
- Authentication tests (JWT, bcrypt)
- Authorization tests (role-based access)
- File upload tests (Multer, Sharp)

### Frontend Tests

```bash
cd frontend
npm run test:unit
npm run test:e2e
```

**Test Coverage:**
- Component tests (Vue Test Utils)
- Store tests (Pinia)
- Router tests
- E2E tests (user flows):
  - Registration → Login → Create property → Book property
  - Search → Filter → View details → Checkout
  - Host approval workflow

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

For questions or issues:
- Open GitHub issue
- Email: support@nordsee-booking.com
- Discord: https://discord.gg/nordsee-booking

---

**Ready to build!** Start with Phase 1 and work through each phase systematically. This documentation will be your guide throughout the development process.
