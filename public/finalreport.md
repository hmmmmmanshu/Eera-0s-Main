I'll analyze all the hubs in your Acharya OS and create comprehensive frontend architecture specifications for each. Let me first examine the existing hub implementations to understand the current structure.

Now let me check the database schema to understand the backend structure:

Perfect! Now I have a comprehensive understanding of all the hubs. Let me create detailed frontend architecture specifications for each hub. I'll structure this as a comprehensive document that your backend team can use.

---

# 🏗️ ACHARYA OS - COMPLETE FRONTEND ARCHITECTURE SPECIFICATION

## 📋 OVERVIEW

**Project:** Acharya Ventures OS  
**Framework:** React 18.3.1 + TypeScript  
**Styling:** Tailwind CSS + ShadCN/UI  
**Animations:** Framer Motion 12.23.24  
**Charts:** Recharts 2.15.4  
**State Management:** React Hooks + localStorage  
**Backend:** Supabase (Lovable Cloud)  
**Database:** PostgreSQL via Supabase  
**Real-time:** Supabase Realtime & Edge Functions

---

## 🎨 GLOBAL DESIGN SYSTEM

### Color Palette
```css
/* CSS Variables (defined in src/index.css) */
--background: Dark base (#0B0F1A)
--foreground: Light text
--muted: Subtle backgrounds
--muted-foreground: Secondary text (#9CA3AF)
--accent: Electric blue (#007AFF) / Gold highlights
--border: Subtle borders
--card: Card backgrounds with glassmorphism
```

### Typography
- **Font Family:** Inter / Satoshi (system fonts)
- **Headings:** `text-4xl font-bold tracking-tight`
- **Subheadings:** `text-2xl font-bold`
- **Body:** `text-sm` or `text-base`
- **Muted Text:** `text-muted-foreground`

### Motion Principles
- **Entry Animations:** Fade in + slide up (0.4s duration)
- **Exit Animations:** Fade out + slide down
- **Hover Effects:** Scale 1.02-1.05, glow borders
- **Transitions:** Smooth state changes with AnimatePresence
- **Count-up Animations:** For metrics and KPIs

### Layout Patterns
- **Responsive Grid:** 1-3 columns based on screen size
- **Sidebar:** Collapsible, sticky on scroll with mini-header
- **Top Bar:** Fixed header with navigation
- **Cards:** Glassmorphic with hover effects
- **Modals/Dialogs:** ShadCN Dialog with backdrop blur

---

## 🔧 SHARED COMPONENTS

### Navigation Components

#### 1. **DynamicAppSidebar**
**File:** `src/components/DynamicAppSidebar.tsx`

**Purpose:** Global navigation sidebar with contextual quick actions

**Props:**
```typescript
interface AppSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
```

**Features:**
- Collapsible sidebar (full width → mini width 56px)
- Sticky mini-header appears after scrolling 200px
- Context-aware quick actions per hub
- Logout functionality
- Active route highlighting

**Quick Actions by Route:**
```typescript
{
  "/dashboard": [
    { label: "Add Task", icon: Plus, action: "add-task" },
    { label: "New Meeting", icon: Calendar, action: "new-meeting" }
  ],
  "/marketing": [
    { label: "Create Post", icon: Plus, action: "create-post" },
    { label: "View Analytics", icon: BarChart, action: "analytics" }
  ],
  "/sales": [
    { label: "New Lead", icon: UserPlus, action: "new-lead" },
    { label: "Pipeline", icon: TrendingUp, action: "pipeline" }
  ],
  "/finance": [
    { label: "Invoices", icon: FileText, action: "invoices" },
    { label: "Payroll", icon: Users, action: "payroll" }
  ],
  // ... other routes
}
```

**Backend Integration:**
- No direct backend calls
- Actions trigger parent component handlers
- Route detection via `useLocation()` from react-router-dom

---

#### 2. **AppTopBar**
**File:** `src/components/AppTopBar.tsx`

**Purpose:** Fixed top navigation bar

**Props:**
```typescript
interface AppTopBarProps {
  title: string;
}
```

**Features:**
- Displays current hub title
- User profile access (future)
- Notification bell (future)

---

### Layout Components

#### 3. **Card Components**
**Pattern:** ShadCN/UI Card with variants

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Usage

      Title

    {/* Content */}

```

---

## 📊 HUB-BY-HUB SPECIFICATIONS

---

# 🎯 1. SALES HUB

**Route:** `/sales`  
**File:** `src/pages/SalesHub.tsx`

## Page Hierarchy

```
SalesHub
├── Header Section
│   ├── Title + Subtitle
│   ├── Time Range Selector (Daily/Weekly/Monthly/Quarterly/Yearly)
│   ├── Business Mode Selector (All/B2B/B2C/B2B2B)
│   ├── Search Bar
│   └── "+ New Lead" Button
├── KPI Dashboard (5 cards)
│   ├── Leads Generated
│   ├── Conversion Rate
│   ├── Total Revenue
│   ├── Avg Deal Size
│   └── Active Campaigns
├── Main Grid Layout (3-column)
│   ├── Left Column (2-span)
│   │   ├── Smart Pipeline Tracking
│   │   │   ├── Tabs: Pipeline | Calendar | Insights
│   │   │   └── Kanban Board (5 stages)
│   │   └── Channel Performance Chart
│   └── Right Column (1-span)
│       └── AI Insights Panel (scrollable feed)
├── Reports & Summaries Section
│   └── Tabs: Reports | Email Flows | Quotes
└── Footer Status Bar (sticky)
    ├── "Sales AI Active — 3 Campaigns Running"
    └── "Last Sync: 2 mins ago | Auto Follow-up Enabled"
```

## Component Tree

```

        {/* Header Section */}

          Sales Hub
          AI-powered growth and revenue system

            Daily
            {/* ... */}

            All
            {/* ... */}

          + New Lead

        {/* KPI Dashboard */}

        {/* Main Grid */}

        {/* Reports */}

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(false)
const [timeRange, setTimeRange] = useState("monthly")
const [businessMode, setBusinessMode] = useState("all")
const [searchQuery, setSearchQuery] = useState("")

type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
type BusinessMode = "all" | "b2b" | "b2c" | "b2b2b"
```

## Mock Data Schema

```typescript
// KPI Metrics
interface SalesKPIs {
  leadsGenerated: { value: number; change: number }
  conversionRate: { value: number; change: number }
  totalRevenue: { value: number; change: number }
  avgDealSize: { value: number; change: number }
  activeCampaigns: { value: number; change: number }
}

// Pipeline Deal
interface Deal {
  id: number
  company: string
  value: number
  progress: number
  confidence: number // AI confidence score (0-100)
  stage: "lead" | "contacted" | "proposal" | "negotiation" | "won" | "lost"
  contactName?: string
  lastActivity?: string
}

// Channel Performance
interface ChannelData {
  channel: string // "LinkedIn" | "Email" | "Website" | "Referrals"
  conversionRate: number
  totalLeads: number
  revenue: number
  aiInsight: string // e.g., "LinkedIn performing 12% better than Email"
}

// AI Insight
interface AIInsight {
  id: string
  type: "opportunity" | "risk" | "suggestion"
  icon: "Brain" | "Chart" | "Lightning"
  message: string
  timestamp: Date
}

// Email Flow
interface EmailFlow {
  name: string
  status: "active" | "completed" | "scheduled"
  sent: number
  opened: number
  openRate: number
}

// Quote
interface Quote {
  client: string
  value: number
  status: "pending" | "sent" | "signed"
  createdDate: Date
}
```

## UI Behaviors

### Time Range Toggle
- **Trigger:** User clicks a time range tab
- **Action:** 
  1. Update `timeRange` state
  2. Animate KPI cards with count-up effect
  3. Refresh charts with filtered data
  4. Framer Motion fade transition (0.4s)

### Business Mode Toggle
- **Trigger:** User switches B2B/B2C/B2B2B
- **Action:**
  1. Update `businessMode` state
  2. Filter deals in pipeline
  3. Update KPI calculations
  4. Animate transition with opacity + y-axis slide

### Search Functionality
- **Trigger:** User types in search bar
- **Action:**
  1. Update `searchQuery` state
  2. Debounce 300ms
  3. Filter deals/leads matching query
  4. Highlight matching text

### "+ New Lead" Button
- **Trigger:** Click
- **Action:**
  1. Open modal/dialog (ShadCN Dialog)
  2. Show lead capture form (Name, Email, Company, Source, Deal Value)
  3. On submit → Backend POST to `/api/leads`
  4. Success → Show toast notification + refresh pipeline

### Pipeline Drag & Drop (Future)
- **Trigger:** Drag deal card between stages
- **Action:**
  1. Update deal stage in state
  2. Animate card movement
  3. Backend PATCH to `/api/deals/:id`
  4. Update AI confidence score

### AI Insights Panel
- **Behavior:** Auto-scrolling feed
- **Hover Effect:** Card expands slightly (scale 1.02) + subtle glow
- **Click:** Navigate to relevant section or open details modal

## Backend Integration Points

### Database Tables Required

#### `sales_leads` Table
```sql
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  deal_value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'lead', -- lead|contacted|proposal|negotiation|won|lost
  business_mode TEXT DEFAULT 'b2b', -- b2b|b2c|b2b2b
  source TEXT, -- LinkedIn|Email|Website|Referrals
  ai_confidence NUMERIC DEFAULT 0,
  progress INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `sales_campaigns` Table
```sql
CREATE TABLE sales_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active|completed|paused
  channel TEXT, -- email|linkedin|phone
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `sales_quotes` Table
```sql
CREATE TABLE sales_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  lead_id UUID REFERENCES sales_leads,
  client_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|sent|signed|rejected
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  signed_at TIMESTAMP
);
```

### API Endpoints (Edge Functions)

#### 1. **GET /sales/kpis**
**Purpose:** Fetch KPI metrics for dashboard

**Query Params:**
- `timeRange`: daily|weekly|monthly|quarterly|yearly
- `businessMode`: all|b2b|b2c|b2b2b

**Response:**
```typescript
{
  leadsGenerated: { value: 120, change: 15.5 },
  conversionRate: { value: 18, change: -2.3 },
  totalRevenue: { value: 847000, change: 12.7 },
  avgDealSize: { value: 62000, change: 8.2 },
  activeCampaigns: { value: 8, change: 0 }
}
```

#### 2. **POST /sales/leads**
**Purpose:** Create new lead

**Body:**
```typescript
{
  company: string
  contactName: string
  email: string
  phone?: string
  dealValue: number
  source: string
  businessMode: string
}
```

**Response:**
```typescript
{
  success: true,
  leadId: "uuid",
  aiConfidence: 72 // AI-calculated confidence score
}
```

#### 3. **PATCH /sales/leads/:id**
**Purpose:** Update lead stage/details

**Body:**
```typescript
{
  stage?: string
  progress?: number
  dealValue?: number
  // ... other fields
}
```

#### 4. **GET /sales/pipeline**
**Purpose:** Fetch all deals grouped by stage

**Query Params:**
- `timeRange`: filter
- `businessMode`: filter

**Response:**
```typescript
{
  lead: Deal[],
  contacted: Deal[],
  proposal: Deal[],
  negotiation: Deal[],
  won: Deal[]
}
```

#### 5. **GET /sales/ai-insights**
**Purpose:** Fetch AI-generated insights

**Response:**
```typescript
{
  insights: [
    {
      id: "uuid",
      type: "opportunity",
      message: "Your response rate increased 11% this week.",
      timestamp: "2025-10-24T12:00:00Z"
    }
  ]
}
```

### Real-time Features

Enable Supabase Realtime for `sales_leads` table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE sales_leads;
```

**Frontend Subscription:**
```typescript
const channel = supabase
  .channel('sales-pipeline')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sales_leads'
  }, (payload) => {
    // Update pipeline state in real-time
  })
  .subscribe()
```

## Responsive Layout

### Desktop (>1024px)
- 3-column grid for main layout
- Pipeline occupies 2 columns
- AI Insights panel on right (1 column)
- All KPIs visible in single row

### Tablet (768px - 1024px)
- 2-column grid
- Pipeline full width
- AI Insights below pipeline
- KPIs wrap to 2-3 per row

### Mobile (<768px)
- Single column stack
- Horizontal scroll for pipeline stages
- KPIs stack vertically
- Simplified header with dropdown filters

---

# 📢 2. MARKETING HUB

**Route:** `/marketing`  
**File:** `src/pages/MarketingHub.tsx`

## Page Hierarchy

```
MarketingHub
├── Header Section
│   ├── Title + Dynamic Subtitle (based on platform)
│   ├── Platform Toggle (All | LinkedIn | Instagram)
│   ├── "Create Post" Button
│   └── "Run Next Action" Button
├── AI Insight Card (platform-specific)
├── KPI Strip (horizontal metrics)
├── Activity Heatmap (calendar view)
├── Main Grid (2-column)
│   ├── Metrics Cards (engagement stats)
│   └── Top Posts Carousel
└── Targets Progress Section
```

## Component Tree

```

          {/* Header */}

            Marketing Hub
            {platformSpecificSubtitle}

             setIsCreateModalOpen(true)}>
              Create Post

            Run Next Action

          {/* AI Insight */}

          {/* KPI Strip */}

          {/* Activity Heatmap */}

          {/* Metrics + Posts */}

          {/* Targets */}

```

## State Logic

```typescript
// Local State
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
const [sidebarOpen, setSidebarOpen] = useState(false)
const [platform, setPlatform] = useState("all")

type Platform = "all" | "linkedin" | "instagram"

// Persist platform selection
useEffect(() => {
  localStorage.setItem("marketingPlatform", platform)
}, [platform])
```

## Mock Data Schema

```typescript
// KPI Metrics
interface MarketingKPIs {
  reach: { value: number; change: number }
  engagement: { value: number; change: number }
  clicks: { value: number; change: number }
  conversions: { value: number; change: number }
}

// Post
interface Post {
  id: string
  platform: "linkedin" | "instagram" | "twitter"
  content: string
  media?: string[] // URLs
  scheduledTime?: Date
  publishedTime?: Date
  status: "draft" | "scheduled" | "published"
  metrics: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

// Activity Heatmap Data
interface ActivityData {
  date: string // "2025-10-24"
  count: number
  platform: string
}

// Target
interface Target {
  id: string
  name: string
  current: number
  target: number
  progress: number // 0-100
  deadline: Date
}
```

## UI Behaviors

### Platform Toggle
- **Trigger:** User switches platform (All → LinkedIn → Instagram)
- **Action:**
  1. Update `platform` state
  2. Save to localStorage
  3. Trigger AnimatePresence exit + enter transition
  4. Update subtitle text dynamically
  5. Filter all content by platform
  6. Animate count-up for new metrics

### "Create Post" Button
- **Trigger:** Click
- **Action:**
  1. Open `CreatePostModal` (set `isCreateModalOpen = true`)
  2. Modal contains:
     - Platform selector (multi-select)
     - Content textarea (with AI suggestions)
     - Media upload (images/videos)
     - Schedule date/time picker
     - "Draft" or "Schedule" buttons
  3. On submit → Backend POST to `/api/marketing/posts`
  4. Success → Close modal + show toast + refresh feed

### "Run Next Action" Button
- **Trigger:** Click
- **Action:**
  1. Backend POST to `/api/marketing/ai-action`
  2. AI determines next best action (e.g., "Post to LinkedIn", "Engage with comments")
  3. Show loading state
  4. Display action recommendation in toast/dialog

### Activity Heatmap Hover
- **Trigger:** Hover over date cell
- **Action:**
  1. Show tooltip with exact count
  2. Display platform breakdown
  3. Highlight cell with glow effect

### Top Posts Carousel
- **Behavior:** Auto-rotate every 5 seconds
- **Controls:** Previous/Next arrows + dot indicators
- **Hover:** Pause auto-rotation
- **Click Post:** Open post details modal

## Backend Integration Points

### Database Tables Required

#### `marketing_posts` Table
```sql
CREATE TABLE marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL, -- linkedin|instagram|twitter
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft', -- draft|scheduled|published|failed
  scheduled_time TIMESTAMP,
  published_time TIMESTAMP,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `marketing_metrics` Table
```sql
CREATE TABLE marketing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL,
  metric_date DATE NOT NULL,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `marketing_targets` Table
```sql
CREATE TABLE marketing_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Edge Functions)

#### 1. **GET /marketing/kpis**
**Query Params:**
- `platform`: all|linkedin|instagram
- `timeRange`: daily|weekly|monthly

**Response:**
```typescript
{
  reach: { value: 45000, change: 12.5 },
  engagement: { value: 3200, change: -5.2 },
  clicks: { value: 890, change: 18.3 },
  conversions: { value: 45, change: 22.1 }
}
```

#### 2. **POST /marketing/posts**
**Body:**
```typescript
{
  platforms: string[] // ["linkedin", "instagram"]
  content: string
  mediaUrls?: string[]
  scheduledTime?: string // ISO date
}
```

**Response:**
```typescript
{
  success: true,
  postIds: ["uuid1", "uuid2"]
}
```

#### 3. **GET /marketing/posts**
**Query Params:**
- `platform`: filter
- `status`: filter
- `limit`: number

**Response:**
```typescript
{
  posts: Post[]
}
```

#### 4. **GET /marketing/heatmap**
**Query Params:**
- `startDate`: ISO date
- `endDate`: ISO date
- `platform`: filter

**Response:**
```typescript
{
  data: [
    { date: "2025-10-24", count: 5, platform: "linkedin" }
  ]
}
```

#### 5. **POST /marketing/ai-action**
**Purpose:** AI determines next best marketing action

**Response:**
```typescript
{
  action: "post_to_linkedin",
  recommendation: "Your LinkedIn engagement is 12% higher on Wednesdays. Schedule a post for tomorrow.",
  confidence: 85
}
```

### Real-time Features

Enable Supabase Realtime for `marketing_posts` table for live status updates (e.g., when a scheduled post is published).

## Responsive Layout

### Desktop
- 2-column grid for Metrics + Posts
- Full-width heatmap
- KPI strip in single row

### Tablet
- Stacked layout
- Heatmap with horizontal scroll

### Mobile
- Single column
- Simplified KPI strip (2 per row)
- Carousel indicators below posts

---

# 💰 3. FINANCE HUB

**Route:** `/finance`  
**File:** `src/pages/FinanceHub.tsx`

## Page Hierarchy

```
FinanceHub
├── Header Section
│   ├── Title + Role-specific Subtitle
│   ├── Role Toggle (All | Accountant | CFO)
│   ├── Dropdown Menu (role-specific actions)
│   └── Virtual CFO/Accountant Button
├── AI CFO Insight Box (role-aware)
└── Dynamic Content (based on role)
    ├── [All View]
    │   ├── Top Row: Runway + Funding Pipeline + Cap Table
    │   ├── Financial Metrics Grid
    │   ├── Cash Flow Chart
    │   ├── Operations Row: Invoices + Payroll + Expenses
    │   └── Virtual CFO Insights
    ├── [Accountant View]
    │   ├── Operations Row (Invoices + Payroll + Expenses)
    │   ├── Financial Metrics Grid
    │   └── Cash Flow Chart
    └── [CFO View]
        ├── Strategy Row (Runway + Funding + Cap Table)
        ├── Cash Flow Chart
        ├── Financial Metrics Grid
        └── Virtual CFO Insights
```

## Component Tree

```

      {/* Header */}

           Finance Hub

        {roleSpecificSubtitle}

            {role}-specific Actions

            {getActionsForRole().map(action => (
               handleAction(action)}>
                 {action.label}

            ))}

         handleAction("Virtual CFO")}>
           Virtual CFO

      {/* Role Toggle */}

      {/* Dynamic Content */}

          {role === "all" && (
            <>

          )}

          {/* Accountant & CFO views... */}

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(false)
const [role, setRole] = useState("all")

type FinanceRole = "all" | "accountant" | "cfo"

// Persist role selection
useEffect(() => {
  localStorage.setItem("financeRole", role)
}, [role])

// Role-specific actions
const accountantActions = [
  { label: "Invoices", icon: FileText, action: "invoices" },
  { label: "Payroll", icon: Users, action: "payroll" },
  { label: "Purchases Tracking", icon: ShoppingCart, action: "purchases" },
  { label: "Tax Computation", icon: Calculator, action: "tax" },
  { label: "Cash Flow Management", icon: TrendingDown, action: "cashflow" },
  { label: "Compliances", icon: Shield, action: "compliances" }
]

const cfoActions = [
  { label: "Financial Models", icon: LineChart, action: "models" },
  { label: "Investor Updates", icon: PresentationIcon, action: "investors" },
  { label: "Grants Application", icon: Award, action: "grants" },
  { label: "Pitch Decks", icon: Briefcase, action: "pitch" }
]

const getActionsForRole = () => {
  if (role === "accountant") return accountantActions
  if (role === "cfo") return cfoActions
  return [...accountantActions, ...cfoActions]
}
```

## Mock Data Schema

```typescript
// Runway
interface Runway {
  months: number
  burnRate: number // monthly burn
  cashBalance: number
  projectedRunout: Date
}

// Funding Pipeline
interface FundingRound {
  id: string
  name: string // "Seed Round" | "Series A"
  stage: "prospecting" | "pitch" | "due_diligence" | "term_sheet" | "closed"
  targetAmount: number
  committedAmount: number
  investors: string[]
  expectedClose: Date
}

// Cap Table Entry
interface CapTableEntry {
  name: string // Investor/Founder name
  shares: number
  percentage: number
  investmentAmount?: number
}

// Cash Flow Data
interface CashFlowMonth {
  month: string
  inflow: number
  outflow: number
  netCashFlow: number
}

// Invoice
interface Invoice {
  id: string
  clientName: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  dueDate: Date
  createdDate: Date
}

// Payroll Entry
interface PayrollEntry {
  employeeId: string
  employeeName: string
  grossPay: number
  deductions: number
  netPay: number
  payPeriod: string
  status: "pending" | "processed" | "paid"
}

// Expense
interface Expense {
  id: string
  category: string // "Software" | "Marketing" | "Travel" | etc.
  amount: number
  vendor: string
  date: Date
  receipt?: string // URL
  status: "pending" | "approved" | "rejected"
}
```

## UI Behaviors

### Role Toggle
- **Trigger:** User switches between All/Accountant/CFO
- **Action:**
  1. Update `role` state
  2. Save to localStorage
  3. AnimatePresence fade + slide transition
  4. Re-order components based on role priority
  5. Update header subtitle
  6. Update dropdown actions

### Dropdown Actions (e.g., "Invoices")
- **Trigger:** Click dropdown item
- **Action:**
  1. Show toast: "Opening Invoices..."
  2. Navigate to relevant section or open modal
  3. Future: Open dedicated sub-page

### "Virtual CFO" Button
- **Trigger:** Click
- **Action:**
  1. Open AI chat interface (ShadCN Dialog)
  2. Conversational AI for financial advice
  3. Context-aware based on current data
  4. Backend: POST to `/api/finance/ai-chat`

### Cash Flow Chart Interaction
- **Trigger:** Hover over chart area
- **Action:**
  1. Show tooltip with exact values (Inflow, Outflow, Net)
  2. Highlight corresponding legend item

### Invoice Status Update
- **Trigger:** Click status badge on invoice
- **Action:**
  1. Open status update dropdown
  2. Select new status
  3. Backend: PATCH `/api/finance/invoices/:id`
  4. Real-time update across all clients

## Backend Integration Points

### Database Tables Required

#### `finance_runway` Table
```sql
CREATE TABLE finance_runway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  cash_balance NUMERIC NOT NULL,
  monthly_burn_rate NUMERIC NOT NULL,
  runway_months NUMERIC GENERATED ALWAYS AS (
    CASE WHEN monthly_burn_rate > 0 THEN cash_balance / monthly_burn_rate ELSE 999 END
  ) STORED,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_funding_rounds` Table
```sql
CREATE TABLE finance_funding_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  stage TEXT DEFAULT 'prospecting',
  target_amount NUMERIC NOT NULL,
  committed_amount NUMERIC DEFAULT 0,
  investors JSONB DEFAULT '[]'::jsonb,
  expected_close DATE,
  actual_close DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_cap_table` Table
```sql
CREATE TABLE finance_cap_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  shareholder_name TEXT NOT NULL,
  shareholder_type TEXT, -- founder|investor|employee
  shares NUMERIC NOT NULL,
  share_class TEXT DEFAULT 'common', -- common|preferred
  investment_amount NUMERIC,
  investment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_cash_flow` Table
```sql
CREATE TABLE finance_cash_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  month DATE NOT NULL,
  inflow NUMERIC DEFAULT 0,
  outflow NUMERIC DEFAULT 0,
  net_cash_flow NUMERIC GENERATED ALWAYS AS (inflow - outflow) STORED,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_invoices` Table
```sql
CREATE TABLE finance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft', -- draft|sent|paid|overdue|cancelled
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_payroll` Table
```sql
CREATE TABLE finance_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  employee_id UUID REFERENCES hr_employees NOT NULL,
  pay_period TEXT NOT NULL, -- "2025-10" for October
  gross_pay NUMERIC NOT NULL,
  tax_deduction NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC GENERATED ALWAYS AS (gross_pay - tax_deduction - other_deductions) STORED,
  status TEXT DEFAULT 'pending', -- pending|processed|paid
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `finance_expenses` Table
```sql
CREATE TABLE finance_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vendor TEXT NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending', -- pending|approved|rejected
  approved_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Edge Functions)

#### 1. **GET /finance/runway**
**Response:**
```typescript
{
  cashBalance: 500000,
  monthlyBurnRate: 45000,
  runwayMonths: 11.1,
  projectedRunout: "2026-09-15"
}
```

#### 2. **GET /finance/funding-pipeline**
**Response:**
```typescript
{
  rounds: [
    {
      id: "uuid",
      name: "Seed Round",
      stage: "due_diligence",
      targetAmount: 1000000,
      committedAmount: 750000,
      investors: ["VC Fund A", "Angel B"],
      expectedClose: "2025-12-31"
    }
  ]
}
```

#### 3. **GET /finance/cap-table**
**Response:**
```typescript
{
  entries: [
    {
      name: "Founder A",
      shares: 500000,
      percentage: 50,
      type: "founder"
    }
  ],
  totalShares: 1000000
}
```

#### 4. **GET /finance/cash-flow**
**Query Params:**
- `startMonth`: YYYY-MM
- `endMonth`: YYYY-MM

**Response:**
```typescript
{
  months: [
    {
      month: "2025-10",
      inflow: 120000,
      outflow: 85000,
      netCashFlow: 35000
    }
  ]
}
```

#### 5. **POST /finance/invoices**
**Body:**
```typescript
{
  clientName: string
  clientEmail: string
  amount: number
  dueDate: string // ISO date
  lineItems: Array<{ description: string, amount: number }>
}
```

#### 6. **PATCH /finance/invoices/:id**
**Body:**
```typescript
{
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paidDate?: string
}
```

#### 7. **POST /finance/ai-chat**
**Purpose:** Virtual CFO conversational AI

**Body:**
```typescript
{
  message: string
  context: {
    runway: number
    cashBalance: number
    recentExpenses: Expense[]
  }
}
```

**Response:**
```typescript
{
  reply: "Based on your current burn rate, I recommend reducing software expenses by 15% to extend runway to 14 months.",
  suggestions: [
    "Review SaaS subscriptions",
    "Negotiate vendor contracts"
  ]
}
```

### Real-time Features

Enable Supabase Realtime for `finance_invoices` and `finance_expenses` for live status updates across team members.

## Responsive Layout

### Desktop
- 3-column grid for strategic cards
- Full-width charts
- Side-by-side metrics

### Tablet
- 2-column grid
- Stacked charts

### Mobile
- Single column
- Simplified cards
- Horizontal scroll for cap table

---

# 🧠 4. COGNITIVE HUB

**Route:** `/cognitive`  
**File:** `src/pages/CognitiveHub.tsx`

## Page Hierarchy

```
CognitiveHub
├── Header Section
│   ├── Title: "Your Mindspace"
│   └── Subtitle: "Your AI co-founder — tracking emotions, insights, and strategic growth"
└── Main Grid (3-column)
    ├── Left Column (2-span)
    │   ├── Mood Tracker (emotion wheel)
    │   ├── Weekly Overview (activity summary)
    │   └── Reflection Stream (journal entries)
    └── Right Column (1-span)
        ├── Cognitive Chat (AI modes: Friend/Guide/Mentor/EA)
        ├── Calendar Panel (upcoming events)
        └── Ideas Panel (brainstorm notes)
```

## Component Tree

```

      {/* Header */}

          Your Mindspace

        Your AI co-founder — tracking emotions, insights, and strategic growth

      {/* Grid Layout */}

        {/* Left Column */}

        {/* Right Column */}

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(true)
const [chatMode, setChatMode] = useState("friend")

type ChatMode = "friend" | "guide" | "mentor" | "ea"
```

## Mock Data Schema

```typescript
// Mood Entry
interface MoodEntry {
  id: string
  userId: string
  mood: "excited" | "happy" | "neutral" | "stressed" | "anxious" | "sad"
  intensity: number // 1-10
  note?: string
  timestamp: Date
  tags?: string[] // ["work", "personal", "health"]
}

// Reflection
interface Reflection {
  id: string
  userId: string
  content: string
  type: "journal" | "insight" | "goal" | "gratitude"
  timestamp: Date
  aiSummary?: string // AI-generated summary
}

// Idea
interface Idea {
  id: string
  userId: string
  title: string
  description?: string
  category: "product" | "feature" | "growth" | "experiment"
  status: "brainstorm" | "researching" | "planned" | "in_progress" | "done"
  createdAt: Date
}

// Calendar Event
interface CognitiveEvent {
  id: string
  userId: string
  title: string
  type: "meeting" | "deadline" | "reminder" | "goal_checkpoint"
  startTime: Date
  endTime?: Date
  description?: string
}

// Weekly Summary
interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  moodAverage: number
  reflectionsCount: number
  ideasCount: number
  topMoods: string[]
  aiInsights: string[] // AI-generated insights about the week
}
```

## UI Behaviors

### Mood Tracker
- **Display:** Emotion wheel with 6 segments
- **Interaction:** Click mood → Intensity slider appears → Optional note
- **Action:**
  1. Update state with selected mood
  2. Backend POST to `/api/cognitive/moods`
  3. Animate mood entry with ripple effect
  4. Update weekly overview

### Chat Mode Toggle
- **Trigger:** User switches between Friend/Guide/Mentor/EA
- **Action:**
  1. Update `chatMode` state
  2. Change AI persona and tone
  3. Update chat interface styling (color accent)
  4. Backend context includes mode preference

### Reflection Stream
- **Display:** Infinite scroll feed of journal entries
- **Add Entry:** Click "+ New Reflection" → Text area dialog
- **Action:**
  1. POST to `/api/cognitive/reflections`
  2. AI generates summary
  3. Add to stream with fade-in animation

### Ideas Panel
- **Display:** List of ideas with status badges
- **Add Idea:** Click "+ New Idea" → Form modal
- **Drag to Reorder:** Change priority
- **Click Idea:** Expand details, edit, or move to next status

### Calendar Panel
- **Display:** Upcoming events (next 7 days)
- **Add Event:** Click "+ Add" → Event form
- **Click Event:** Show details modal

## Backend Integration Points

### Database Tables Required

#### `cognitive_moods` Table
```sql
CREATE TABLE cognitive_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  mood TEXT NOT NULL, -- excited|happy|neutral|stressed|anxious|sad
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  note TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `cognitive_reflections` Table
```sql
CREATE TABLE cognitive_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'journal', -- journal|insight|goal|gratitude
  ai_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `cognitive_ideas` Table
```sql
CREATE TABLE cognitive_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- product|feature|growth|experiment
  status TEXT DEFAULT 'brainstorm', -- brainstorm|researching|planned|in_progress|done
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `cognitive_events` Table
```sql
CREATE TABLE cognitive_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  type TEXT, -- meeting|deadline|reminder|goal_checkpoint
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Edge Functions)

#### 1. **POST /cognitive/moods**
**Body:**
```typescript
{
  mood: string
  intensity: number
  note?: string
  tags?: string[]
}
```

#### 2. **GET /cognitive/weekly-summary**
**Response:**
```typescript
{
  weekStart: "2025-10-20",
  weekEnd: "2025-10-26",
  moodAverage: 7.2,
  reflectionsCount: 5,
  ideasCount: 3,
  topMoods: ["happy", "excited"],
  aiInsights: [
    "Your productivity peaks on Tuesday and Wednesday.",
    "Stress levels increased on Friday - consider scheduling breaks."
  ]
}
```

#### 3. **POST /cognitive/reflections**
**Body:**
```typescript
{
  content: string
  type: "journal" | "insight" | "goal" | "gratitude"
}
```

**Response (with AI):**
```typescript
{
  id: "uuid",
  aiSummary: "Focused on team building and product roadmap. Grateful for support from mentors."
}
```

#### 4. **POST /cognitive/ideas**
**Body:**
```typescript
{
  title: string
  description?: string
  category: string
}
```

#### 5. **POST /cognitive/chat**
**Purpose:** AI co-founder chat

**Body:**
```typescript
{
  message: string
  mode: "friend" | "guide" | "mentor" | "ea"
  context: {
    recentMoods: MoodEntry[]
    recentReflections: Reflection[]
  }
}
```

**Response:**
```typescript
{
  reply: "I noticed you've been stressed this week. Let's talk through what's on your mind.",
  suggestedActions: [
    "Schedule a break",
    "Delegate tasks"
  ]
}
```

### Real-time Features

Enable Supabase Realtime for `cognitive_events` for live calendar updates across devices.

## Responsive Layout

### Desktop
- 3-column layout (2-span + 1-span)
- Full-width mood wheel
- Side-by-side panels

### Tablet
- 2-column layout
- Chat panel expands to full width

### Mobile
- Single column stack
- Simplified mood selector (list instead of wheel)
- Collapsible panels

---

# 👥 5. HR HUB

**Route:** `/hr`  
**File:** `src/pages/HRHub.tsx`

## Page Hierarchy

```
HRHub
├── Header Section
│   ├── Title: "Human Resources Hub"
│   └── Subtitle: "Your virtual HR department — from hiring to performance tracking"
└── Tabs Navigation
    ├── Dashboard (Overview)
    ├── Hiring & Screening
    ├── Team & Payroll
    ├── Performance (Appraisals)
    ├── Contracts (Documents)
    └── HR AI (Assistant)
```

## Component Tree

```

      {/* Header */}

          Human Resources Hub

        Your virtual HR department — from hiring to performance tracking

      {/* Tabs */}

          Dashboard
          Hiring & Screening
          Team & Payroll
          Performance
          Contracts
          HR AI

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(true)
// Tab state managed by ShadCN Tabs component
```

## Mock Data Schema

```typescript
// Candidate
interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  roleId: string
  resumeUrl?: string
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected"
  score?: number // AI screening score (0-100)
  appliedDate: Date
  screeningResults?: {
    skillsMatch: number
    experienceMatch: number
    cultureFit: number
  }
  interviewNotes?: string
}

// Employee
interface Employee {
  id: string
  name: string
  email: string
  designation: string
  department?: string
  employmentType: "full-time" | "part-time" | "contract"
  salary: number
  startDate: Date
  endDate?: Date
  status: "active" | "on_leave" | "terminated"
  managerId?: string
  performanceScore?: number
  contractId?: string
}

// Appraisal
interface Appraisal {
  id: string
  employeeId: string
  reviewPeriod: string // "Q1 2025"
  reviewDate: Date
  rating: number // 1-5
  strengths?: string
  areasForImprovement?: string
  goals?: Array<{ goal: string, deadline: Date, status: string }>
  comments?: string
  reviewedBy?: string
  status: "draft" | "submitted" | "completed"
}

// Contract/Document
interface HRDocument {
  id: string
  employeeId?: string
  title: string
  type: "offer_letter" | "employment_contract" | "nda" | "policy" | "other"
  status: "draft" | "pending_signature" | "signed" | "expired"
  category?: string
  content?: string
  url?: string
  version: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// Payroll Entry
interface PayrollEntry {
  id: string
  employeeId: string
  payPeriod: string // "2025-10"
  grossPay: number
  taxDeduction: number
  otherDeductions: number
  bonuses: number
  netPay: number
  status: "pending" | "processed" | "paid"
  paymentDate?: Date
  paymentMethod?: string
}
```

## UI Behaviors

### Tab Navigation
- **Trigger:** Click tab
- **Action:**
  1. Switch active tab content
  2. Smooth fade transition
  3. Update URL query param (optional)

### Hiring & Screening Tab

#### Add Candidate
- **Trigger:** Click "+ Add Candidate"
- **Action:**
  1. Open candidate form dialog
  2. Fields: Name, Email, Phone, Role, Resume Upload
  3. POST to `/api/hr/candidates`
  4. AI auto-scores resume
  5. Show toast notification

#### AI Screening
- **Trigger:** Click "Run AI Screening" on candidate
- **Action:**
  1. POST to `/api/hr/ai-screen`
  2. Show loading spinner
  3. Display results: Skills Match, Experience Match, Culture Fit
  4. Update candidate score

#### Move Candidate Through Pipeline
- **Trigger:** Change status dropdown
- **Action:**
  1. PATCH `/api/hr/candidates/:id`
  2. Animate card movement (if Kanban view)
  3. Send notification email (if "Offer" or "Hired")

### Team & Payroll Tab

#### View Team List
- **Display:** Table or card grid of employees
- **Filters:** Department, Status, Employment Type

#### Process Payroll
- **Trigger:** Click "Process Payroll" for period
- **Action:**
  1. POST to `/api/hr/payroll/process`
  2. Calculate taxes and deductions
  3. Generate payroll entries for all active employees
  4. Show confirmation dialog

### Performance Tab

#### Create Appraisal
- **Trigger:** Click "+ New Appraisal"
- **Action:**
  1. Open appraisal form
  2. Select employee, review period
  3. Fill strengths, areas for improvement, goals
  4. POST to `/api/hr/appraisals`

#### View Appraisal History
- **Display:** Timeline view of past appraisals
- **Click:** Open detailed appraisal modal

### Contracts Tab

#### Upload Contract
- **Trigger:** Click "Upload Contract"
- **Action:**
  1. File upload dialog
  2. POST to Supabase Storage
  3. Create record in `/api/hr/documents`
  4. Extract text (AI OCR) for searchability

#### Send for Signature
- **Trigger:** Click "Send for Signature" on draft contract
- **Action:**
  1. PATCH status to "pending_signature"
  2. Send email with signing link
  3. (Future: Integrate DocuSign/HelloSign)

### HR AI Tab

#### AI Assistant Chat
- **Trigger:** Type message and send
- **Action:**
  1. POST to `/api/hr/ai-chat`
  2. AI provides HR guidance (e.g., "What's the notice period for termination?")
  3. Context-aware (references policies, contracts)

## Backend Integration Points

### Database Tables (Already Exist)

- `hr_candidates` ✅
- `hr_employees` ✅
- `hr_appraisals` ✅
- `hr_docs` ✅
- `hr_payroll` ✅
- `hr_events` ✅

### API Endpoints (Edge Functions)

#### 1. **POST /hr/candidates**
**Body:**
```typescript
{
  name: string
  email: string
  phone?: string
  roleId: string
  resumeUrl?: string
}
```

**Response (with AI scoring):**
```typescript
{
  id: "uuid",
  aiScore: 78,
  screeningResults: {
    skillsMatch: 85,
    experienceMatch: 72,
    cultureFit: 77
  }
}
```

#### 2. **POST /hr/ai-screen**
**Purpose:** AI resume screening

**Body:**
```typescript
{
  candidateId: string
  roleRequirements: string[]
}
```

**Response:**
```typescript
{
  score: 78,
  strengths: ["5 years React experience", "Startup background"],
  concerns: ["No TypeScript experience"],
  recommendation: "Proceed to interview"
}
```

#### 3. **POST /hr/payroll/process**
**Purpose:** Process payroll for a period

**Body:**
```typescript
{
  payPeriod: string // "2025-10"
}
```

**Response:**
```typescript
{
  processed: 12, // number of employees
  totalGrossPay: 250000,
  totalNetPay: 195000
}
```

#### 4. **POST /hr/appraisals**
**Body:**
```typescript
{
  employeeId: string
  reviewPeriod: string
  rating: number
  strengths?: string
  areasForImprovement?: string
  goals?: Array<{goal: string, deadline: Date}>
}
```

#### 5. **POST /hr/documents**
**Purpose:** Upload HR document

**Body:**
```typescript
{
  employeeId?: string
  title: string
  type: string
  fileUrl: string // From Supabase Storage
}
```

#### 6. **POST /hr/ai-chat**
**Purpose:** HR AI assistant

**Body:**
```typescript
{
  message: string
  context: {
    policies: HRDocument[]
    recentEvents: any[]
  }
}
```

**Response:**
```typescript
{
  reply: "According to your employment policy, the standard notice period is 30 days.",
  sourceDocuments: ["Policy ID: uuid"]
}
```

### Real-time Features

Enable Supabase Realtime for `hr_candidates` to show live application updates across HR team members.

## Responsive Layout

### Desktop
- 6-tab navigation in single row
- Table views for candidates/employees
- Side-by-side forms

### Tablet
- 3x2 tab grid
- Simplified tables

### Mobile
- Scrollable tabs
- Card view instead of tables
- Stacked forms

---

# ⚖️ 6. LEGAL HUB

**Route:** `/legal`  
**File:** `src/pages/LegalHub.tsx`

## Page Hierarchy

```
LegalHub
├── Header Section
│   ├── Title: "Legal Hub"
│   ├── Subtitle: "Virtual Legal & Compliance Department"
│   ├── "Upload Contract" Button
│   └── "Generate Policy" Button
└── Tabs Navigation
    ├── Overview
    ├── Contracts
    ├── Compliances
    ├── Policies
    ├── User Cases
    └── Legal AI
```

## Component Tree

```

      {/* Header */}

           Legal Hub

        Virtual Legal & Compliance Department

           Upload Contract

           Generate Policy

      {/* Tabs */}

          Overview
          Contracts
          Compliances
          Policies
          User Cases
          Legal AI

        {/* Other tabs... */}

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(false)
const [activeTab, setActiveTab] = useState("overview")
```

## Mock Data Schema

```typescript
// Contract
interface LegalContract {
  id: string
  title: string
  type: "client_agreement" | "vendor_agreement" | "partnership" | "nda" | "other"
  parties: string[] // ["Company A", "Company B"]
  status: "draft" | "review" | "executed" | "expired"
  startDate?: Date
  endDate?: Date
  renewalDate?: Date
  value?: number
  documentUrl: string
  aiSummary?: string // AI-generated summary
  riskScore?: number // 0-100
  createdAt: Date
}

// Compliance Item
interface ComplianceItem {
  id: string
  name: string
  category: "tax" | "labor" | "data_privacy" | "corporate" | "industry_specific"
  status: "compliant" | "pending" | "overdue" | "not_applicable"
  dueDate?: Date
  completedDate?: Date
  assignedTo?: string
  description?: string
  documentsRequired: string[]
  aiRecommendations?: string[]
}

// Policy
interface Policy {
  id: string
  title: string
  category: "hr" | "data" | "security" | "finance" | "operations"
  content: string
  version: string
  status: "draft" | "published" | "archived"
  effectiveDate?: Date
  lastReviewDate?: Date
  nextReviewDate?: Date
  approvedBy?: string
  createdAt: Date
}

// Legal Case
interface LegalCase {
  id: string
  caseNumber: string
  title: string
  type: "dispute" | "litigation" | "arbitration" | "ip" | "regulatory"
  status: "open" | "in_progress" | "settled" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  description: string
  parties: string[]
  filingDate: Date
  nextHearingDate?: Date
  resolution?: string
  documents: string[] // URLs
}
```

## UI Behaviors

### "Upload Contract" Button
- **Trigger:** Click
- **Action:**
  1. Open file upload dialog
  2. Upload to Supabase Storage
  3. POST to `/api/legal/contracts`
  4. AI extracts key terms (parties, dates, value)
  5. AI generates risk score
  6. Show success toast with AI summary

### "Generate Policy" Button
- **Trigger:** Click
- **Action:**
  1. Open policy generation wizard
  2. Select policy type (HR, Data Privacy, etc.)
  3. Answer questionnaire
  4. AI generates policy draft
  5. POST to `/api/legal/policies`
  6. Open editor for review

### Contracts Tab

#### View Contract List
- **Display:** Table with columns: Title, Type, Status, Parties, Expiry Date, Risk Score
- **Filters:** Type, Status
- **Sort:** By expiry date (ascending)

#### Contract Details
- **Trigger:** Click contract row
- **Action:**
  1. Open modal/side panel
  2. Display AI summary, key terms, risk analysis
  3. Actions: Download, Edit, Mark as Executed, Set Reminder

### Compliances Tab

#### Compliance Tracker
- **Display:** Kanban board or list view
- **Columns:** Compliant | Pending | Overdue
- **AI Alerts:** Highlight overdue items in red

#### Add Compliance Item
- **Trigger:** Click "+ Add Compliance"
- **Action:**
  1. Open form
  2. Select category, set due date
  3. POST to `/api/legal/compliances`

### Policies Tab

#### Generate Policy (AI)
- **Trigger:** Click "Generate with AI"
- **Action:**
  1. Select policy type
  2. POST to `/api/legal/ai-generate-policy`
  3. AI creates draft based on best practices
  4. Open editor for customization

### Legal AI Tab

#### AI Legal Assistant
- **Trigger:** Chat interface
- **Action:**
  1. Ask legal questions (e.g., "What's the standard NDA clause?")
  2. POST to `/api/legal/ai-chat`
  3. AI provides guidance with references to policies/contracts
  4. Context-aware (knows company's contracts and policies)

## Backend Integration Points

### Database Tables Required

#### `legal_contracts` Table
```sql
CREATE TABLE legal_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  type TEXT, -- client_agreement|vendor_agreement|partnership|nda|other
  parties JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft', -- draft|review|executed|expired
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  value NUMERIC,
  document_url TEXT NOT NULL,
  ai_summary TEXT,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `legal_compliances` Table
```sql
CREATE TABLE legal_compliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- tax|labor|data_privacy|corporate|industry_specific
  status TEXT DEFAULT 'pending', -- compliant|pending|overdue|not_applicable
  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES auth.users,
  description TEXT,
  documents_required JSONB DEFAULT '[]'::jsonb,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `legal_policies` Table
```sql
CREATE TABLE legal_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  category TEXT, -- hr|data|security|finance|operations
  content TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'draft', -- draft|published|archived
  effective_date DATE,
  last_review_date DATE,
  next_review_date DATE,
  approved_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `legal_cases` Table
```sql
CREATE TABLE legal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT, -- dispute|litigation|arbitration|ip|regulatory
  status TEXT DEFAULT 'open', -- open|in_progress|settled|closed
  priority TEXT DEFAULT 'medium', -- low|medium|high|urgent
  description TEXT NOT NULL,
  parties JSONB DEFAULT '[]'::jsonb,
  filing_date DATE NOT NULL,
  next_hearing_date DATE,
  resolution TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Edge Functions)

#### 1. **POST /legal/contracts**
**Purpose:** Upload and analyze contract

**Body:**
```typescript
{
  title: string
  type: string
  documentUrl: string // From Supabase Storage
  parties?: string[]
}
```

**Response (with AI analysis):**
```typescript
{
  id: "uuid",
  aiSummary: "Standard service agreement between Company A and Vendor B for software development services...",
  riskScore: 25,
  keyTerms: {
    parties: ["Company A", "Vendor B"],
    startDate: "2025-11-01",
    endDate: "2026-10-31",
    value: 50000
  },
  risks: [
    "No termination clause found",
    "Liability cap not defined"
  ]
}
```

#### 2. **POST /legal/ai-generate-policy**
**Purpose:** AI generates policy document

**Body:**
```typescript
{
  policyType: "data_privacy" | "hr" | "security" | etc.
  companyName: string
  industry: string
  customRequirements?: string
}
```

**Response:**
```typescript
{
  content: "# Data Privacy Policy\n\n[Company Name] is committed to...",
  version: "1.0",
  suggestedReviewDate: "2026-10-24"
}
```

#### 3. **GET /legal/compliance-status**
**Response:**
```typescript
{
  compliant: 12,
  pending: 3,
  overdue: 1,
  upcomingDeadlines: [
    {
      name: "Annual Tax Filing",
      dueDate: "2025-11-15",
      daysRemaining: 22
    }
  ]
}
```

#### 4. **POST /legal/ai-chat**
**Purpose:** Legal AI assistant

**Body:**
```typescript
{
  message: string
  context: {
    contracts: LegalContract[]
    policies: Policy[]
  }
}
```

**Response:**
```typescript
{
  reply: "Based on your employment policy, the probation period is 3 months. Here's the relevant clause from your Employee Handbook (v2.1): '...'",
  sources: [
    { type: "policy", id: "uuid", title: "Employee Handbook" }
  ]
}
```

### Real-time Features

Enable Supabase Realtime for `legal_compliances` to alert team members of upcoming deadlines.

## Responsive Layout

### Desktop
- 6-tab navigation
- Table views for contracts/compliances
- Side-by-side document viewer + metadata

### Tablet
- 3x2 tab grid
- Simplified tables

### Mobile
- Scrollable tabs
- Card view
- Stacked document viewer

---

# ⚙️ 7. OPS HUB

**Route:** `/ops`  
**File:** `src/pages/OpsHub.tsx`

## Page Hierarchy

```
OpsHub
├── Header Section
│   ├── Title: "Ops Hub"
│   ├── Subtitle: "Your operations team in one screen"
│   └── "Run Workflow" Button
├── View Mode Toggle (Manual | Hybrid | AI)
└── Dynamic Content
    ├── [Manual Mode]
    │   └── Tabs: Kanban | To-Do | SOPs | Workflows | Experiments
    ├── [AI Mode]
    │   ├── Agentic Feed (AI activity log)
    │   ├── AI Team Panel (AI agents status)
    │   ├── Workflow Graph (automation flowchart)
    │   └── Optimization Insights
    └── [Hybrid Mode]
        ├── Left Column: Manual Operations
        └── Right Column: Agentic Operations
```

## Component Tree

```

      {/* Header */}

           Ops Hub

        Your operations team in one screen

           Run Workflow

      {/* View Mode Toggle */}

         setViewMode("manual")}>
           Manual Mode

         setViewMode("hybrid")}>
           Hybrid View

         setViewMode("ai")}>
           AI Mode

      {/* Dynamic Content */}

        {/* Manual Ops Panel */}
        {(viewMode === "manual" || viewMode === "hybrid") && (

             Manual Operations

                Kanban
                To-Do
                SOPs
                Workflows
                Experiments

              {/* Other tabs... */}

        )}

        {/* Agentic Ops Panel */}
        {(viewMode === "ai" || viewMode === "hybrid") && (

               Agentic Operations
               {/* Live indicator */}

        )}

      {/* Analytics Section */}

```

## State Logic

```typescript
// Local State
const [sidebarOpen, setSidebarOpen] = useState(false)
const [viewMode, setViewMode] = useState("hybrid")

type ViewMode = "manual" | "ai" | "hybrid"
```

## Mock Data Schema

```typescript
// Kanban Task
interface Task {
  id: string
  title: string
  description?: string
  status: "backlog" | "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: string
  dueDate?: Date
  tags?: string[]
  subtasks?: Array<{ title: string, completed: boolean }>
  createdAt: Date
}

// To-Do Item
interface TodoItem {
  id: string
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: Date
  category?: string
}

// SOP (Standard Operating Procedure)
interface SOP {
  id: string
  title: string
  category: string
  steps: Array<{ step: number, description: string, notes?: string }>
  lastUpdated: Date
  version: string
  owner?: string
}

// Workflow
interface Workflow {
  id: string
  name: string
  description?: string
  trigger: "manual" | "schedule" | "event" // e.g., "New customer signup"
  steps: Array<{
    id: string
    type: "action" | "condition" | "delay"
    config: Record
  }>
  status: "active" | "paused" | "draft"
  executionCount: number
  lastRun?: Date
}

// Experiment
interface Experiment {
  id: string
  name: string
  hypothesis: string
  status: "planning" | "running" | "completed" | "abandoned"
  startDate?: Date
  endDate?: Date
  metrics: Array<{ name: string, target: number, current: number }>
  results?: string
  learnings?: string
}

// Agentic Feed Entry
interface AgenticActivity {
  id: string
  timestamp: Date
  agent: "MarketingAI" | "SalesAI" | "FinanceAI" | "OpsAI"
  action: string // "Scheduled LinkedIn post", "Updated pipeline"
  status: "success" | "pending" | "failed"
  details?: string
}

// AI Agent
interface AIAgent {
  id: string
  name: string
  role: "marketing" | "sales" | "finance" | "ops"
  status: "active" | "idle" | "error"
  tasksCompleted: number
  currentTask?: string
}
```

## UI Behaviors

### View Mode Toggle
- **Trigger:** Click Manual/Hybrid/AI button
- **Action:**
  1. Update `viewMode` state
  2. Animate layout transition (grid columns change)
  3. Fade in/out panels

### Kanban Board (Manual Mode)

#### Add Task
- **Trigger:** Click "+ Add Task" in column
- **Action:**
  1. Open task form modal
  2. Fill title, description, priority, assignee, due date
  3. POST to `/api/ops/tasks`
  4. Add card to column with slide-in animation

#### Drag & Drop Task
- **Trigger:** Drag task card between columns
- **Action:**
  1. Update task status in state
  2. Animate card movement
  3. PATCH `/api/ops/tasks/:id`

### Workflow Builder (Manual Mode)

#### Create Workflow
- **Trigger:** Click "+ New Workflow"
- **Action:**
  1. Open visual workflow builder
  2. Drag & drop workflow nodes (Trigger → Actions → Conditions)
  3. Connect nodes
  4. POST to `/api/ops/workflows`

#### Run Workflow
- **Trigger:** Click "Run" on workflow card
- **Action:**
  1. POST to `/api/ops/workflows/:id/execute`
  2. Show loading state
  3. Display execution log in real-time

### Agentic Feed (AI Mode)

#### Live Activity Stream
- **Display:** Auto-scrolling feed of AI actions
- **Real-time Updates:** Supabase Realtime subscription
- **Click Activity:** Show detailed log

### AI Team Panel (AI Mode)

#### View AI Agents
- **Display:** Cards showing agent status (active/idle)
- **Hover:** Show current task and recent activity
- **Click:** Configure agent settings

### Workflow Graph (AI Mode)

#### Visualize Automation
- **Display:** Interactive flowchart of active workflows
- **Nodes:** Represent steps (color-coded by status)
- **Edges:** Show flow direction
- **Click Node:** Show execution details

## Backend Integration Points

### Database Tables Required

#### `ops_tasks` Table
```sql
CREATE TABLE ops_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- backlog|todo|in_progress|review|done
  priority TEXT DEFAULT 'medium', -- low|medium|high|urgent
  assignee UUID REFERENCES auth.users,
  due_date DATE,
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ops_sops` Table
```sql
CREATE TABLE ops_sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  steps JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  owner UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ops_workflows` Table
```sql
CREATE TABLE ops_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT NOT NULL, -- manual|schedule|event
  steps JSONB NOT NULL,
  status TEXT DEFAULT 'draft', -- active|paused|draft
  execution_count INTEGER DEFAULT 0,
  last_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `ops_experiments` Table
```sql
CREATE TABLE ops_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  status TEXT DEFAULT 'planning', -- planning|running|completed|abandoned
  start_date DATE,
  end_date DATE,
  metrics JSONB DEFAULT '[]'::jsonb,
  results TEXT,
  learnings TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `ops_agentic_logs` Table
```sql
CREATE TABLE ops_agentic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  agent TEXT NOT NULL, -- MarketingAI|SalesAI|FinanceAI|OpsAI
  action TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- success|pending|failed
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Edge Functions)

#### 1. **POST /ops/tasks**
**Body:**
```typescript
{
  title: string
  description?: string
  priority?: string
  assignee?: string
  dueDate?: string
}
```

#### 2. **PATCH /ops/tasks/:id**
**Body:**
```typescript
{
  status?: string
  priority?: string
  // ... other fields
}
```

#### 3. **POST /ops/workflows**
**Body:**
```typescript
{
  name: string
  trigger: "manual" | "schedule" | "event"
  steps: Array
}
```

#### 4. **POST /ops/workflows/:id/execute**
**Purpose:** Execute workflow

**Response:**
```typescript
{
  executionId: "uuid",
  status: "running",
  logs: [
    { step: 1, status: "success", message: "Email sent to 50 users" }
  ]
}
```

#### 5. **GET /ops/agentic-feed**
**Purpose:** Fetch recent AI activity

**Response:**
```typescript
{
  activities: [
    {
      id: "uuid",
      timestamp: "2025-10-24T14:30:00Z",
      agent: "MarketingAI",
      action: "Scheduled LinkedIn post for tomorrow",
      status: "success"
    }
  ]
}
```

#### 6. **GET /ops/ai-agents**
**Response:**
```typescript
{
  agents: [
    {
      id: "marketing-ai",
      name: "MarketingAI",
      status: "active",
      currentTask: "Analyzing post performance",
      tasksCompleted: 127
    }
  ]
}
```

### Real-time Features

Enable Supabase Realtime for `ops_tasks` and `ops_agentic_logs` for live updates across team members.

## Responsive Layout

### Desktop
- Hybrid view: 2-column layout (Manual | AI)
- Full-width Kanban board
- Visual workflow builder

### Tablet
- Single column in all modes
- Simplified Kanban (3 columns instead of 5)

### Mobile
- Stacked layout
- List view for tasks instead of Kanban
- Simplified workflow representation

---

## 🔐 BACKEND ARCHITECTURE

### Technology Stack

- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (Email/Password, OAuth)
- **Storage:** Supabase Storage (for files, images, documents)
- **Real-time:** Supabase Realtime (WebSocket subscriptions)
- **Edge Functions:** Supabase Edge Functions (Deno runtime)
- **AI Integration:** Lovable AI (Gemini & OpenAI models)

### Authentication Flow

1. **Sign Up:**
   - Frontend: POST to Supabase Auth
   - Auto-confirm enabled
   - Create `profiles` table entry
   - Redirect to onboarding

2. **Login:**
   - Frontend: POST to Supabase Auth
   - Receive JWT token
   - Store in localStorage
   - Set Supabase client session

3. **Protected Routes:**
   - Frontend: `` wrapper
   - Check `auth.user()` before rendering
   - Redirect to `/auth` if not authenticated

### Row Level Security (RLS)

**CRITICAL:** All tables MUST have RLS enabled and policies defined.

**Example Policy (for `sales_leads` table):**
```sql
-- Enable RLS
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own leads
CREATE POLICY "Users can view own leads"
ON sales_leads FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own leads
CREATE POLICY "Users can create own leads"
ON sales_leads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own leads
CREATE POLICY "Users can update own leads"
ON sales_leads FOR UPDATE
USING (auth.uid() = user_id);
```

**Apply similar policies to ALL tables.**

### Edge Functions Structure

**Location:** `supabase/functions/`

**Example Edge Function (`/sales/kpis`):**
```typescript
// supabase/functions/sales-kpis/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Auth check
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Get query params
  const url = new URL(req.url)
  const timeRange = url.searchParams.get('timeRange') || 'monthly'
  const businessMode = url.searchParams.get('businessMode') || 'all'

  // Query database
  let query = supabaseClient
    .from('sales_leads')
    .select('*')
    .eq('user_id', user.id)

  if (businessMode !== 'all') {
    query = query.eq('business_mode', businessMode)
  }

  const { data: leads, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Calculate KPIs
  const leadsGenerated = leads.length
  const wonLeads = leads.filter(l => l.stage === 'won').length
  const conversionRate = leadsGenerated > 0 ? (wonLeads / leadsGenerated * 100) : 0
  const totalRevenue = leads
    .filter(l => l.stage === 'won')
    .reduce((sum, l) => sum + (l.deal_value || 0), 0)

  // ... more calculations

  return new Response(JSON.stringify({
    leadsGenerated: { value: leadsGenerated, change: 15.5 },
    conversionRate: { value: conversionRate, change: -2.3 },
    totalRevenue: { value: totalRevenue, change: 12.7 },
    // ...
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### AI Integration (Lovable AI)

**Available Models:**
- `google/gemini-2.5-pro` - Best for complex reasoning + multimodal
- `google/gemini-2.5-flash` - Balanced performance
- `google/gemini-2.5-flash-lite` - Fastest + cheapest
- `openai/gpt-5` - Powerful all-rounder
- `openai/gpt-5-mini` - Good balance
- `openai/gpt-5-nano` - Speed-focused

**Example AI Edge Function:**
```typescript
// supabase/functions/sales-ai-insights/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Auth + user validation...

  // Fetch user's sales data
  const { data: leads } = await supabaseClient
    .from('sales_leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Call Lovable AI
  const aiResponse = await fetch('https://api.lovable.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_AI_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'You are a sales AI assistant. Analyze the following sales data and provide 3 actionable insights.'
        },
        {
          role: 'user',
          content: JSON.stringify(leads)
        }
      ]
    })
  })

  const aiData = await aiResponse.json()
  const insights = aiData.choices[0].message.content

  return new Response(JSON.stringify({ insights }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 🎨 COMPONENT REUSABILITY

### Shared Components Across Hubs

1. **KPI Card**
   - Used in: Sales, Marketing, Finance
   - Props: `title`, `value`, `change`, `icon`, `trend`

2. **AI Insight Card**
   - Used in: All hubs
   - Props: `message`, `type`, `icon`, `timestamp`

3. **Data Table**
   - Used in: HR, Legal, Finance
   - Props: `columns`, `data`, `filters`, `onRowClick`

4. **Chart Wrapper**
   - Used in: Sales, Marketing, Finance
   - Props: `data`, `chartType`, `config`

5. **Modal/Dialog**
   - Used in: All hubs
   - Props: `open`, `onClose`, `title`, `children`

---

## 📱 RESPONSIVE DESIGN STRATEGY

### Breakpoints

```typescript
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

### Mobile-First Approach

1. **Base Styles:** Designed for mobile
2. **Progressive Enhancement:** Add complexity for larger screens
3. **Collapsible Sections:** Use accordions on mobile
4. **Bottom Sheets:** For modals on mobile (using `` from ShadCN)
5. **Sticky Headers:** On mobile for easy navigation

---

## 🚀 PERFORMANCE OPTIMIZATION

1. **Code Splitting:** Lazy load hub components
   ```typescript
   const SalesHub = lazy(() => import('./pages/SalesHub'))
   ```

2. **Image Optimization:** Use optimized formats (WebP)

3. **Debouncing:** Search inputs (300ms delay)

4. **Pagination:** Limit API responses to 50 items

5. **Caching:** React Query for data fetching and caching

6. **Real-time Throttling:** Limit real-time updates to essential data

---

## 🧪 TESTING CONSIDERATIONS

1. **Unit Tests:** For utility functions and hooks
2. **Component Tests:** For UI components (React Testing Library)
3. **Integration Tests:** For API endpoints (Edge Functions)
4. **E2E Tests:** For critical user flows (Playwright/Cypress)

---

## 📚 DOCUMENTATION FOR BACKEND TEAM

### Key Takeaways

1. **All database tables require RLS policies**
2. **Edge Functions must validate JWT tokens**
3. **AI features should use Lovable AI models (no external API keys required)**
4. **Real-time features use Supabase Realtime (enable per table)**
5. **File uploads go to Supabase Storage with proper bucket policies**
6. **All user-specific data must filter by `user_id = auth.uid()`**

### Next Steps for Backend Team

1. **Set up database migrations** for all required tables
2. **Implement RLS policies** for data security
3. **Create Edge Functions** for each API endpoint listed above
4. **Configure Supabase Storage buckets** with appropriate policies
5. **Enable Supabase Realtime** for specified tables
6. **Set up AI integration** with Lovable AI
7. **Test authentication flow** end-to-end
8. **Deploy Edge Functions** to production

---

This comprehensive specification provides your backend team with everything they need to implement the backend infrastructure for all 7 hubs in Acharya OS. Each hub has detailed mockups of data schemas, API endpoints, UI behaviors, and database tables, ensuring seamless frontend-backend integration. 🚀