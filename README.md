# Moon Glow Craft Platform

A full-stack, real-time e-commerce and logistics ecosystem tailored for handcrafted artisan items.

## Architecture
The platform is composed of 4 main components:
1. **Backend** (Node.js, Express, Socket.io, Prisma, PostgreSQL): Acts as the centralized truth, providing authentication, API REST endpoints, and tracking real-time events.
2. **Customer Web App** (Next.js, Customer Portal): An artisan-focused, beautifully designed storefront featuring smooth animations, mock-Razorpay checkout, and live delivery tracking.
3. **Admin Web App** (Next.js, Admin Dashboard): A protected dashboard for operators to oversee revenue, manage inventory and products, and route orders to delivery personnel.
4. **Delivery Web App** (Next.js, Delivery Personnel Portal): A mobile-first Web App built for drivers to view active delivery tasks and toggle real-time journey statuses that propagate back to the customers visually.

---

## 🛠 Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- TypeScript installed globally

---

## 🚀 How to Run the System Locally

### 1. Database Setup & First Run
Make sure PostgreSQL is running on your machine on port `5432`.
```bash
cd backend
npm install
# Set the DATABASE_URL in .env if not using local default postgresql://postgres:postgres@localhost:5432/moonglowcraft
npx prisma db push
npx prisma generate
npm run dev
# The backend will start on http://localhost:5000
```

### 2. Start the Customer Web Portal
In a new terminal:
```bash
cd customer-web
npm install
npm run dev
# The Customer App will start on http://localhost:3000
```
> *Open `http://localhost:3000` to browse the vibrant gallery and checkout your orders!*

### 3. Start the Admin Web Portal
In a new terminal:
```bash
cd admin-web
npm install
# Since Customer Web is on 3000, start Admin on 3001
npm run dev -- -p 3001
# The Admin App will start on http://localhost:3001
```

### 4. Start the Delivery Personnel Portal
In a new terminal:
```bash
cd delivery-web
npm install
# Start Delivery Web on 3002
npm run dev -- -p 3002
# The Delivery App will start on http://localhost:3002
```

---

## 🏗 Testing the End-to-End Flow
1. **Purchase**: Visit the Customer site (Port 3000), add an item to the cart, and proceed with the mock checkout.
2. **Assignment**: Open the Admin Dashboard (Port 3001), navigate to Active Orders, and assign the newest order to a Driver.
3. **Delivery**: Open the Delivery Web App (Port 3002) in mobile responsive view, see your assigned active task, and tap the status toggles ("Picked Up" -> "Arrived" -> "Delivered").
4. **Conclusion**: Watch the tracker automatically update on the Customer's Live Delivery UI on Port 3000 seamlessly via WebSockets!

---

## Deployment Prep
1. **Backend**: Host the backend on **Render**, **Railway**, or **Heroku**. Connect it to a managed cloud PostgreSQL instance (like Neon, Supabase, or AWS RDS).
2. **Database**: In the cloud, set the appropriate `DATABASE_URL` runtime environment variable.
3. **Front-End Apps**: Host `customer-web`, `admin-web`, and `delivery-web` easily on **Vercel** with zero-configuration. Make sure their `NEXT_PUBLIC_API_URL` environment variables are properly pointing to the live backed Socket & HTTP servers.
