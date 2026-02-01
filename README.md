# Nordsee Booking Platform

An Airbnb/Booking.com replica for the German northern coast (Nordsee). Built with Node.js, Vue.js, and MariaDB.

## Features

- **Property Listings**: Hosts can create and manage rental properties
- **Advanced Search**: Search with filters (location, dates, price, amenities)
- **Interactive Maps**: Leaflet maps with property markers
- **Booking System**: Complete booking workflow with availability management
- **Calendar Management**: Dynamic pricing and availability calendar
- **Image Gallery**: Upload and manage property images
- **Multilingual**: German and English support
- **Responsive Design**: Mobile-first approach

## Tech Stack

- **Backend**: Node.js 24, Express.js, MariaDB 11.2, Knex.js
- **Frontend**: Vue 3, Pinia, Vue Router, Vite
- **DevOps**: Docker, Docker Compose

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

4. **Run database migrations**
   ```bash
   docker-compose exec app npx knex migrate:latest
   ```

5. **Seed database**
   ```bash
   docker-compose exec app npx knex seed:run
   ```

6. **Access the application**
   - Open http://localhost:8080

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
├── backend/           # Node.js/Express API
├── frontend/          # Vue 3 application
├── data/             # Docker volumes (uploads, database)
├── docker-compose.yml
├── Dockerfile
└── DEVELOPMENT.md    # Detailed documentation
```

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
