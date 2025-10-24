# NYC Taxi Trip Data Explorer

## Project Overview
A full-stack web application for exploring and analyzing NYC taxi trip data with interactive visualizations, advanced filtering, and data-driven insights. Built as part of an enterprise-level fullstack development assignment.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **Data Visualization**: Recharts
- **Data Processing**: Custom algorithms for CSV parsing and data cleaning

## Features
- **Dashboard**: Overview with key metrics (total trips, average duration, distance, speed, passengers)
- **Data Explorer**: Interactive table with advanced filtering (date range, distance, duration, passengers, hour) and sorting
- **Insights**: Three data-driven visualizations with interpretations:
  1. Temporal patterns (hourly distribution)
  2. Weekly activity patterns (day of week analysis)
  3. Distance-duration-speed correlation
- **Data Processing**: Custom CSV parsing with data cleaning, outlier handling, and derived feature calculation
- **Custom Algorithm**: Manual implementation of sorting/filtering algorithms without built-in libraries (DSA requirement)

## Data Schema
The application processes NYC taxi trip data with the following fields:
- **Raw Data**: ID, vendor_id, pickup/dropoff datetime, passenger count, pickup/dropoff coordinates, trip duration
- **Derived Features** (calculated during processing):
  - `trip_speed`: km/h - calculated from distance and duration
  - `trip_distance`: km - calculated using Haversine formula from coordinates
  - `hour_of_day`: 0-23 - extracted from pickup datetime
  - `day_of_week`: 0-6 - extracted from pickup datetime
  - `is_weekend`: boolean flag

## Architecture
```
┌─────────────────┐
│   React SPA     │
│  (Frontend)     │
│  - Dashboard    │
│  - Explorer     │
│  - Insights     │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Express.js     │
│  (Backend)      │
│  - API Routes   │
│  - Data Processing
│  - Custom Algorithms
└────────┬────────┘
         │ Drizzle ORM
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  (Database)     │
│  - Trip Data    │
│  - Indexes      │
└─────────────────┘
```

## Development Notes
- Using PostgreSQL with Drizzle ORM for type-safe database operations
- Implemented custom sorting algorithm to meet DSA requirements
- Data cleaning pipeline handles missing values, duplicates, and outliers
- Responsive design following modern analytics dashboard patterns
- Professional UI with consistent spacing, typography, and color scheme

## Assignment Compliance
- ✅ Data processing and cleaning with transparency logging
- ✅ Normalized PostgreSQL database with proper indexing
- ✅ At least 3 derived features calculated
- ✅ Custom algorithm implementation (manual sorting)
- ✅ RESTful API with comprehensive filtering
- ✅ Interactive dashboard with visualizations
- ✅ Three meaningful insights with visual charts and interpretations
- ✅ Professional UI suitable for academic presentation
