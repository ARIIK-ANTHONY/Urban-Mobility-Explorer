# NYC Taxi Trip Data Explorer

A comprehensive full-stack web application for exploring and analyzing New York City taxi trip data. This project demonstrates enterprise-level development practices with real-world data processing, custom algorithms, and interactive visualizations.

## 🚀 Features

- **Interactive Dashboard**: Real-time metrics showing total trips, average duration, distance, speed, and passenger counts
- **Data Explorer**: Advanced filtering and sorting capabilities for exploring individual trip records
- **Key Insights**: Three data-driven visualizations with detailed interpretations:
  - Temporal patterns analysis (hourly distribution)
  - Weekly activity patterns (weekday vs. weekend)
  - Distance-duration-speed correlation
- **Data Processing Pipeline**: Automated CSV parsing with data cleaning and derived feature calculation
- **Custom Algorithms**: Manual implementation of sorting/filtering without built-in libraries

## 📋 Prerequisites

- Node.js 22.x or higher (Node 20+ may work, but this project was developed and tested on Node 22)
- PostgreSQL database (Neon serverless or local Postgres)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nyc-taxi-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file or ensure the following environment variables are set:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   SESSION_SECRET=<your-session-secret>
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Load the taxi trip data**
   
   Place the `train.csv` file from the NYC Taxi Trip dataset in the `attached_assets/` directory.

## 🧭 Available npm scripts

The project includes several npm scripts you can run from the project root. Useful ones:

```bash
# Start frontend + backend in development (recommended)
npm run dev

# Build production frontend and bundle backend
npm run build

# Start the production bundle (after build)
npm start

# Typecheck the project
npm run check

# Push schema migrations (Drizzle)
npm run db:push

# Run the streaming data processor (default behavior reads sample / safe mode)
npm run process-data

# Run full processing (process the entire CSV)
npm run process-data:full

# Clear DB and reload full dataset (careful: deletes trip records)
npm run db:reload
```

Add these scripts to your workflow as needed. Some commands (like `db:reload` and `process-data:full`) will modify or replace database contents.

## 🏃 Running the Application

### Development Mode

Start the development server (the Express server integrates Vite middleware and serves the frontend):

```bash
npm run dev
```

Note: `npm run dev` launches the backend which also mounts Vite in middleware mode so the frontend is served automatically at `http://localhost:5000` during development.

The application will be available at:
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:5000/api`

### Production Mode

Build and start the application:

```bash
npm run build
npm start
```

## 📊 Data Processing

The application includes a data processing pipeline that:

1. **Loads** the raw NYC taxi trip CSV file
2. **Cleans** the data by:
   - Removing duplicates
   - Handling missing values
   - Filtering outliers (trips with unrealistic duration, distance, or coordinates)
   - Validating data integrity
3. **Calculates derived features**:
   - Trip speed (km/h) from distance and duration
   - Trip distance (km) using Haversine formula from coordinates
   - Hour of day (0-23) from pickup datetime
   - Day of week (0-6) from pickup datetime
   - Weekend flag
4. **Inserts** processed data into PostgreSQL database

To run the data processing pipeline:

```bash
npm run process-data
```

Note: This process may take several minutes depending on the dataset size.

### Run backend only (useful during recording/testing)

If you want to run only the backend API without the full dev stack, run:

```powershell
$env:NODE_ENV="development"; npx tsx server/index.ts
```

The backend listens on port `5000` by default. On Windows, binding to `127.0.0.1` is enforced in the server to avoid `ENOTSUP` issues that occur when binding to `0.0.0.0`.

### ETL / Processing notes

- `npm run process-data` runs the processor in its default (safe/sample) mode for development.
- `npm run process-data:full` runs the full import of `train.csv` — this will process the entire file and may take significant time and database writes.
- `npm run db:reload` clears the `trips` table before re-importing; use with caution (it deletes data).

### CSV export and large dataset caveat

The UI supports exporting filtered pages. Exporting the entire 1.4M record dataset in a single request can time out or exhaust server memory. Recommended approach:

1. Use server-side streaming to generate the CSV in chunks (planned improvement), or
2. Export filtered subsets (date ranges) and concatenate client-side if necessary.

### Favicon / Replit logo note

If you previously saw a Replit logo as the favicon, that was coming from a `favicon.png` in the `client/public` folder and/or development Vite plugins. The repository now removes that favicon. If you still see the Replit icon in your browser, clear the browser cache or do a hard refresh (Ctrl+Shift+R). If you want a custom icon, add `client/public/favicon.png` and restore the `<link rel="icon" ...>` tag in `client/index.html`.

### Video walkthrough placeholder

Add your uploaded walkthrough video link here once you publish it (YouTube unlisted or Google Drive link):

[Link to 5-minute video demonstration will be added here]

## 🎨 Design System

The application follows a professional analytics dashboard design with:

- **Typography**: Inter font family for clean, modern aesthetics
- **Monospace**: JetBrains Mono for data values and timestamps
- **Color Scheme**: Carefully selected color palette optimized for data visualization
- **Spacing**: Consistent spacing system (4, 6, 8, 12, 16, 24px)
- **Components**: Shadcn/ui component library for accessible, polished UI elements

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query v5)
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Recharts for data visualizations

### Backend
- **Framework**: Express.js
- **Database ORM**: Drizzle
- **Validation**: Zod schemas
- **Data Processing**: Custom CSV parser with streaming support

### Database
- **Type**: PostgreSQL (Neon serverless)
- **Schema**: Normalized design with proper indexing on:
  - pickup_datetime
  - trip_duration
  - trip_distance
  - hour_of_day
  - pickup location (composite index)

## 📁 Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Dashboard, Explorer, Insights)
│   │   └── lib/          # Utilities and configurations
├── server/               # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and TypeScript types
└── attached_assets/      # Data files (train.csv)
```

## 🔧 API Endpoints

- `GET /api/stats` - Dashboard statistics
- `GET /api/trips` - Paginated trip data with filtering and sorting
  - Query params: `startDate`, `endDate`, `minDistance`, `maxDistance`, `minDuration`, `maxDuration`, `passengerCount`, `hourOfDay`, `limit`, `offset`, `sortBy`, `sortOrder`
- `GET /api/insights` - Aggregated data for visualizations

## 🧪 Custom Algorithm Implementation

As required by the assignment, this project includes custom algorithm implementations without using built-in library functions:

- **Manual QuickSort**: Implemented for sorting trip records by various fields
- **Custom Filter Function**: Manual implementation for filtering trips based on multiple criteria
- **Haversine Distance Calculation**: Manual implementation for calculating trip distance from coordinates

See `server/algorithms.ts` for implementation details and complexity analysis.

## 📈 Key Insights

The application reveals three meaningful insights from the NYC taxi trip data:

1. **Peak Hours**: Clear rush hour patterns with 40-60% more trips during 5-7 PM compared to off-peak hours
2. **Weekly Patterns**: Weekdays show 15-25% more trips than weekends, but weekend trips are longer in duration
3. **Speed-Distance Correlation**: Shorter trips (<5km) show higher variance due to urban congestion, while longer trips maintain consistent speeds of 25-35 km/h

## 📝 Assignment Compliance

This project fulfills all requirements of the Urban Mobility Data Explorer assignment:

- ✅ Data processing and cleaning with transparency logging
- ✅ Normalized PostgreSQL database with indexes
- ✅ At least 3 derived features (speed, distance, hour/day/weekend flags)
- ✅ Custom algorithm implementation with complexity analysis
- ✅ RESTful API with comprehensive filtering
- ✅ Interactive frontend dashboard
- ✅ Three meaningful insights with visualizations and interpretations
- ✅ Professional code quality and project structure
- ✅ Complete README with setup instructions
- ✅ System architecture documentation

## 🎥 Video Walkthrough

[(https://drive.google.com/file/d/1dRmS8M8AM3lYhKw4oXMSpQfaZMEKFG7C/view?usp=sharing)]

The video demonstrates:
- System overview and architecture
- Data processing pipeline
- Frontend features (Dashboard, Explorer, Insights)
- Technical implementation highlights
- Key insights and interpretations



## 📄 License

This project is created for academic purposes as part of a fullstack development course.

## 🙏 Acknowledgments

- NYC Taxi Trip Dataset from [NYC Taxi and Limousine Commission](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
- Shadcn/ui component library
- Recharts visualization library
