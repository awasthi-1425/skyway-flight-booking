# ✈️ Skyway - Premium Flight Booking Platform

Skyway is a modern, high-performance Progressive Web Application (PWA) for flight booking. Built with Next.js, Supabase, and Tailwind CSS, it features a highly responsive "glassmorphic" dark-theme UI, real-time seat synchronization, and secure, atomic database transactions.

## 🔗 Live Links
* **Live Deployment:** https://skyway-flight-booking.vercel.app/
* **Lighthouse PWA Score:** See the `/public` folder for the >90 performance screenshot.

---

## 🚀 Core Features & Architecture (Evaluation Criteria)

### 1. Schema, RLS & Atomic Operations
* **Row Level Security (RLS):** Strict Supabase RLS policies ensure that users can only view, modify, and manage their own bookings.
* **Atomic Transactions:** Cancellation and rescheduling logic are handled securely via PostgreSQL Remote Procedure Calls (RPCs) like `cancel_booking` and `reschedule_flight`. This prevents race conditions and ensures data integrity.
* **DB-Level Validation:** The "2-hour before departure" modification lock is enforced natively at the database level, preventing any client-side bypass.

### 2. Real-Time Seat Map UX
* **Live Synchronization:** Utilizes Supabase Realtime channels to visually lock seats across all active clients the moment they are selected or booked.
* **Intuitive Grid:** Seats are visually separated by cabin class (First, Business, Economy) with clear visual indicators for available, selected, and occupied states using a premium glassmorphism design language.

### 3. State Management (Zustand)
* **Store Design:** Application state is separated logically into `useFlightStore` (search, cart, passengers) and `useUserStore` (auth session).
* **Security via `partialize`:** Zustand's `persist` middleware is used to save flight searches, but `partialize` is explicitly implemented to omit sensitive passenger data (e.g., Passport numbers, DOB) from `localStorage`.
* **Clean Resets:** Custom reset functions wipe the cart and user state completely upon logout to prevent cross-session data leaks.

### 4. Code Quality & Responsive Design
* **Strict TypeScript:** Built with strict type interfaces (`Flight`, `Seat`, `Booking`) avoiding the use of `any` to ensure robust compilation.
* **Mobile-First Glassmorphism:** Fully responsive on mobile, tablet, and desktop. The UI employs Tailwind CSS utility classes to achieve a unified, high-contrast dark mode aesthetic.
* **PWA Enabled:** Configured with a web manifest and service worker, allowing mobile users to install the app directly to their home screens.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **State Management:** Zustand
* **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime, RPCs)
* **Date Formatting:** `date-fns`

---

## 💻 Local Setup Instructions

Follow these steps to run the Skyway platform locally:

### 1. Clone the repository

git clone https://github.com/awasthi-1425/skyway-flight-booking
```
cd skyway
2. Install Dependencies
```
npm install
3. Environment Variables
```
Create a .env.local file in the root directory based on the provided .env.example:


cp .env.example .env.local
Update .env.local with your Supabase Project URL and Anon Key.

4. Database Setup & Seeding
The database schema, RLS policies, and RPC functions are located in the /supabase/migrations directory.

Open your Supabase Dashboard -> SQL Editor.

Copy and paste the contents of the migration/seed SQL files in sequential order.

Execute the scripts to generate the tables, functions, dummy flights, and seats.

5. Run the Development Server
```
npm run dev
Open http://localhost:3000 in your browser to view the application.

🔑 Test Credentials
To evaluate the booking management dashboard without creating a new account, you can use the following seeded test user:

Email: jawaasthi7@gmail.com

Password: Atlpa@12332

(Note: Ensure you have run the database seed script to populate this user).

Author: Siddhant Awasthi
