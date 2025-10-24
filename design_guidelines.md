# NYC Taxi Trip Data Explorer - Design Guidelines

## Design Approach

**Selected Approach**: Modern Analytics Dashboard System
**Inspiration**: Linear (typography/hierarchy) + Vercel Analytics (data presentation) + Notion (content organization)
**Rationale**: This is a data-heavy, utility-focused application requiring clarity, efficiency, and professional polish for academic evaluation. The design must facilitate data exploration while showcasing technical sophistication.

## Core Design Principles

1. **Data-First Hierarchy**: Information architecture prioritizes data accessibility and insight discovery
2. **Analytical Clarity**: Clean, uncluttered layouts that let data visualizations breathe
3. **Professional Polish**: Academic presentation quality with modern web standards
4. **Functional Elegance**: Beauty through purposeful design, not decoration

## Typography System

**Font Stack**:
- Primary: Inter (via Google Fonts) - clean, modern, excellent for data
- Monospace: JetBrains Mono - for data values, timestamps, coordinates

**Hierarchy**:
- Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Data Labels: text-sm font-medium (14px)
- Metrics/Stats: text-3xl font-bold tabular-nums (30px)
- Small Data: text-xs text-gray-600 (12px)

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6 to p-8
- Section spacing: space-y-8 to space-y-12
- Card gaps: gap-6
- Page margins: px-8 to px-16

**Grid System**:
- Dashboard: 12-column grid (grid-cols-12)
- Metrics: 3-4 column layout on desktop (grid-cols-1 md:grid-cols-3 lg:grid-cols-4)
- Data cards: 2-column on tablet, single on mobile (grid-cols-1 md:grid-cols-2)

**Container Strategy**:
- Max width: max-w-7xl mx-auto
- Full-bleed sections for charts: w-full
- Nested containers: max-w-4xl for text content within wider layouts

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with subtle border-bottom
- Logo/title left-aligned
- Navigation links center or right-aligned (Dashboard, Insights, Architecture, Data Explorer)
- Height: h-16
- Background: Subtle with backdrop-blur-sm

**Sidebar Navigation** (optional for dashboard):
- w-64 fixed sidebar on desktop
- Collapsible hamburger on mobile
- Filter controls and quick stats

### Dashboard Components

**Metric Cards**:
- Border with rounded-lg (8px radius)
- Padding: p-6
- Structure: Label (text-sm text-gray-600) + Large Number (text-3xl font-bold) + Trend indicator or subtext
- Grid layout for 3-4 cards across desktop

**Data Table**:
- Striped rows for readability (even:bg-gray-50)
- Sticky header: sticky top-0
- Cell padding: px-4 py-3
- Sortable columns with indicator icons
- Responsive: horizontal scroll on mobile with fixed first column

**Chart Containers**:
- White background with border
- Generous padding: p-8
- Chart title with text-lg font-semibold mb-6
- Minimum height: min-h-[400px] for readability
- Use Chart.js or D3.js for visualizations

**Filter Panel**:
- Grouped filter sections with labels
- Inputs: rounded-md border with focus:ring states
- Date range pickers, dropdowns, range sliders
- Apply/Reset buttons at bottom
- Sticky positioning on scroll: sticky top-20

**Insight Cards**:
- Larger format: p-8
- Title + Visualization + Interpretation text
- Visual hierarchy: Chart first, explanation below
- Border-left accent: border-l-4 for emphasis

### Forms & Inputs

**Filter Controls**:
- Input fields: h-10 px-3 rounded-md border
- Select dropdowns: Styled with chevron icon
- Range sliders: Custom styled track and thumb
- Date pickers: Calendar popup interface
- Search: With magnifying glass icon, placeholder text

**Buttons**:
- Primary: px-4 py-2 rounded-md font-medium
- Secondary: Border variant with transparent background
- Icon buttons: Square aspect ratio, centered icon
- States: Hover scale or background shifts, active states

### Data Visualization

**Chart Types**:
- Time series line charts (trip patterns over time)
- Bar charts (trip distribution by hour/day)
- Heatmaps (pickup/dropoff density)
- Scatter plots (distance vs duration, fare vs trip)
- Geographic maps (trip routes, hotspots)

**Chart Styling**:
- Clean axis labels with proper formatting
- Grid lines: Subtle, not overpowering
- Tooltips: White background, shadow, rounded corners
- Legend: Positioned top-right or bottom
- Responsive canvas sizing

### Map Integration

**Interactive Map**:
- Full-width container or 2/3 layout split
- Leaflet.js or Mapbox GL for rendering
- Cluster markers for pickup/dropoff points
- Route polylines for trip visualization
- Zoom controls and layer toggles
- Info popup on marker click

## Page Layouts

### Landing/Overview Page
**Structure**:
1. **Hero Section** (h-[60vh]):
   - Large centered title: "NYC Taxi Trip Data Explorer"
   - Subtitle explaining the dataset and purpose
   - Key metrics row (4 metric cards): Total Trips, Avg Duration, Total Distance, Avg Fare
   - CTA button: "Explore Dashboard"
   
2. **Quick Insights Preview** (py-16):
   - 3-column grid showing preview of key insights
   - Each with mini chart + headline
   - "View Full Analysis" links

3. **System Overview** (py-16):
   - Brief architecture diagram or feature highlights
   - 2-column: Text description + Visual element

### Dashboard/Data Explorer Page
**Layout**:
- **Top Bar**: Page title + quick date range selector
- **Left Sidebar** (w-64): Filters panel (sticky)
- **Main Content** (flex-1):
  - Metrics row at top
  - Chart grid (2x2 or flexible)
  - Data table below charts
  - Pagination controls

### Insights Page
**Layout**:
- Page header with introduction
- Three insight sections (space-y-12):
  - Insight 1: Large chart + detailed analysis
  - Insight 2: Comparative visualization + findings
  - Insight 3: Geographic or pattern analysis + interpretation
- Each insight in bordered container (p-8 rounded-lg)

### Architecture Page (Optional)
- System diagram (centered, large)
- Component breakdown sections
- Technology stack cards
- Database schema visualization

## Animations

**Minimal and Purposeful**:
- Page transitions: Subtle fade-in for route changes
- Chart animations: Data enters with 800ms ease-in-out
- Hover states: Scale(1.02) or opacity shifts (200ms transition)
- Loading states: Skeleton screens or spinner for data fetching
- NO scroll-triggered animations, NO parallax, NO excessive motion

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (stack all, full-width cards, hamburger nav)
- Tablet: 768px - 1024px (2-column grids, collapsible sidebar)
- Desktop: > 1024px (full layout, 3-4 column grids, visible sidebar)

**Mobile Optimizations**:
- Hide sidebar, show hamburger menu
- Stack metric cards vertically
- Horizontal scroll for wide tables
- Simplified charts (hide minor details)
- Bottom sheet for filters instead of sidebar

## Icons

**Library**: Heroicons (outline and solid variants via CDN)
**Usage**:
- Navigation: map, chart-bar, light-bulb, cog
- Filters: funnel, calendar, location-marker
- Data: arrow-up/down (trends), check-circle (success)
- Actions: pencil, trash, eye, download
- Size: w-5 h-5 for inline, w-6 h-6 for buttons

## Images

**Hero Image**: No large hero image needed. This is a data dashboard, not a marketing site. Focus on data visualization and metrics.

**Supporting Images**:
- System architecture diagram (custom SVG or PNG)
- Map tiles for geographic visualization
- Optional: Small icons or illustrations for insight cards
- Chart legends and axis labels as SVG elements

---

**Final Note**: This design prioritizes data legibility, analytical clarity, and professional presentation. Every visual element serves the function of data exploration and insight communication. The aesthetic is modern, clean, and purposeful—suitable for academic evaluation while showcasing technical sophistication.