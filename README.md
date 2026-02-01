# Nordsee Booking Platform

An Airbnb/Booking.com replica for the German northern coast (Nordsee). Built with Node.js, Vue.js, and MariaDB.

## Project Status

🚧 **In Active Development** - Core property management system implemented

### ✅ Completed Features

#### Backend API
- **Authentication System**
  - JWT-based authentication (7-day token expiration)
  - User registration and login
  - Role-based access control (guest/host/both)
  - Secure password hashing with bcrypt

- **Property Management**
  - Full CRUD operations for properties
  - 15+ model methods (create, update, delete, search, availability)
  - Automatic 12-month availability calendar generation
  - Image upload with multiple image support
  - Set primary image functionality
  - Complex search with filters (location, dates, guests, price, amenities)
  - Host property listing and management

- **Amenity System**
  - 62 pre-seeded amenities across 5 categories
  - Category-based organization (essentials, features, location, safety, accessibility)
  - Property-amenity associations

- **Booking System (Backend)**
  - Booking creation with conflict checking
  - Status management (pending/confirmed/cancelled/rejected)
  - Price calculation (base + cleaning + 5% service fee)
  - Approval workflow for hosts
  - Availability calendar integration

#### Frontend Application
- **Authentication UI**
  - Login and registration forms
  - Protected routes with navigation guards
  - User session management with Pinia

- **Property Management Dashboard**
  - Create new properties with comprehensive form
  - Edit existing properties
  - View all properties in grid layout
  - Publish/unpublish properties
  - Delete properties with confirmation
  - Status badges (draft/published/unpublished)

- **Property Forms**
  - Multi-section form (basic info, location, details, pricing, amenities)
  - Amenity selector with category grouping
  - Form validation (title, description, capacity, pricing)
  - Image uploader with drag & drop
  - Image preview grid with primary image selection
  - Progress bar for uploads

- **Image Management**
  - Drag-and-drop file upload
  - Multiple image upload support
  - Image preview thumbnails
  - Set/change primary image
  - Delete images with confirmation
  - File type and size validation (20MB max)

- **Internationalization**
  - German language support (primary)
  - 50+ translation keys for property management
  - Ready for English expansion

#### Database
- **10 Migrations** covering:
  - Users, properties, bookings, amenities
  - Property images and amenity associations
  - Availability calendar
  - Reviews (structure ready)

- **Seed Data**:
  - Test users (host@nordsee.com / guest@nordsee.com)
  - 62 amenities with categories
  - Sample properties with images and availability

### 🚧 In Progress / Next Steps

- Image processing on backend (multer + sharp integration)
- Guest search interface with filters
- Property detail page with gallery
- Booking form for guests with date picker
- Guest booking management
- Host booking approval dashboard
- Review and rating system
- Advanced search with map view

### 📋 Planned Features

- Real-time availability updates
- Payment integration
- Email notifications
- Messaging system between hosts and guests
- Review moderation
- Analytics dashboard for hosts
- Mobile app

## Tech Stack

### Backend
- **Runtime**: Node.js 24
- **Framework**: Express.js 4.21
- **Database**: MariaDB 11.2
- **Query Builder**: Knex.js 3.1
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Upload**: Multer (configured, sharp ready for image processing)
- **Security**: bcrypt, CORS, helmet

### Frontend
- **Framework**: Vue 3.5 (Composition API)
- **State Management**: Pinia 2.3
- **Router**: Vue Router 4.5
- **Build Tool**: Vite 6.0
- **HTTP Client**: Axios
- **UI Components**: Custom components with responsive design
- **Notifications**: vue-toastification
- **Internationalization**: vue-i18n
- **Icons**: Material Design Icons (mdi)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: MariaDB container with persistent volumes
- **Reverse Proxy**: Nginx (production ready)
- **File Storage**: Docker volumes for uploads

### Development Tools
- **Migration Management**: Knex migrations
- **Seeding**: Knex seeds with test data
- **Hot Reload**: Vite HMR, nodemon for backend

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 24+ (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nordsee-booking
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d --build
   ```
   
   **Note**: The `--build` flag rebuilds the container but preserves data in volumes (`data/mysql` for database, `data/uploads` for images). Migrations and seeds run automatically on startup. To completely reset the database, run:
   ```bash
   docker-compose down -v  # ⚠️ This deletes ALL data including volumes
   rm -rf data/mysql data/uploads
   docker-compose up -d --build
   ```

4. **Run database migrations** (if not using docker-entrypoint.sh auto-run)
   ```bash
   docker-compose exec app npx knex migrate:latest
   ```
   
   **Note**: Migrations and seeds run automatically via the docker-entrypoint.sh script. Only run manually if needed.

5. **Seed database** (if not using docker-entrypoint.sh auto-run)
   ```bash
   docker-compose exec app npx knex seed:run
   ```

6. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

### Test Accounts

After seeding the database, use these test accounts:

- **Host Account**
  - Email: `host@nordsee.com`
  - Password: `password123`
  - Can create and manage properties

- **Guest Account**
  - Email: `guest@nordsee.com`
  - Password: `password123`
  - Can search and book properties

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Setup database**
   - Install MariaDB 11.2+
   - Create database: `nordsee_booking`
   - Update .env with local DB credentials

3. **Run migrations and seeds**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend (port 3000)
   npm run dev:backend
   
   # Terminal 2: Frontend (port 5173)
   npm run dev:frontend
   ```

## Project Structure

```
nordsee-booking/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT config
│   │   ├── models/          # PropertyModel, BookingModel, AmenityModel
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes with validation
│   │   ├── middleware/      # Auth, error handling
│   │   └── server.js        # Express app entry point
│   ├── migrations/          # 10 database migrations
│   ├── seeds/               # Test data seeds
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── property/    # PropertyForm, ImageUploader, AmenitySelector
│   │   ├── views/
│   │   │   ├── auth/        # Login, Register
│   │   │   └── host/        # CreateProperty, EditProperty, MyProperties
│   │   ├── services/        # API wrappers (property, booking, amenity)
│   │   ├── stores/          # Pinia stores (auth)
│   │   ├── locales/         # i18n translations (de.json)
│   │   ├── router/          # Vue Router with guards
│   │   └── main.js
│   └── package.json
├── data/
│   ├── uploads/             # Property images (Docker volume)
│   └── mysql/               # Database files (Docker volume)
├── docker-compose.yml       # Container orchestration
├── Dockerfile               # Multi-stage Node.js build
├── DEVELOPMENT.md           # Detailed documentation
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties/search` - Search properties (public)
- `GET /api/properties/host/my-properties` - List host's properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (host)
- `PUT /api/properties/:id` - Update property (host)
- `DELETE /api/properties/:id` - Delete property (host)
- `POST /api/properties/:id/images` - Upload image (host)
- `DELETE /api/properties/:id/images/:imageId` - Delete image (host)
- `PUT /api/properties/:id/images/:imageId/primary` - Set primary image (host)
- `GET /api/properties/:id/availability` - Check availability
- `PUT /api/properties/:id/availability` - Update availability calendar (host)

### Bookings
- `POST /api/bookings` - Create booking (guest)
- `GET /api/bookings/guest/my-bookings` - List guest's bookings
- `GET /api/bookings/host/my-bookings` - List host's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/approve` - Approve booking (host)
- `PUT /api/bookings/:id/reject` - Reject booking (host)
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/property/:propertyId/calendar` - Get booking calendar

### Amenities
- `GET /api/amenities` - List all amenities
- `GET /api/amenities/category/:category` - List amenities by category

## Key Features Walkthrough

### For Hosts

1. **Register/Login** as a host at http://localhost:8080
2. **Navigate to Host Dashboard** after login
3. **Create a Property**:
   - Fill out property details (title, description, location)
   - Set capacity, bedrooms, beds, bathrooms
   - Configure pricing (base price, cleaning fee)
   - Select amenities from 62 options across 5 categories
   - Upload property images with drag & drop
   - Set primary image for listings
4. **Manage Properties**:
   - View all properties in grid layout
   - Edit property details and images
   - Publish/unpublish listings
   - Delete properties
   - Track property status

### For Guests (Coming Soon)

1. Search properties by location, dates, guests
2. View property details with image gallery
3. Check availability and pricing
4. Make booking requests
5. Manage bookings

## Development

### Database Migrations

Create a new migration:
```bash
docker-compose exec app npx knex migrate:make migration_name
```

Run migrations:
```bash
docker-compose exec app npx knex migrate:latest
```

Rollback:
```bash
docker-compose exec app npx knex migrate:rollback
```

### Adding Seeds

Create seed:
```bash
docker-compose exec app npx knex seed:make seed_name
```

Run seeds:
```bash
docker-compose exec app npx knex seed:run
```

### Environment Variables

Key configuration in `.env`:
```env
# Database
DB_HOST=db
DB_PORT=3306
DB_NAME=nordsee_booking
DB_USER=nordsee_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRATION=7d

# Server
NODE_ENV=development
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

See [DEVELOPMENT.md](DEVELOPMENT.md) for comprehensive development documentation including:
- Architecture overview
- Database schema
- API endpoints
- Implementation steps
- Security guidelines
- Deployment instructions

## License

MIT License
