# GEMINI Project Context: WEGO RestoPay

## 1. Project Overview

**WEGO RestoPay** is a comprehensive, multi-tenant restaurant management platform, publicly marketed as **Foodie**. Built with a modern, cutting-edge technology stack, it provides restaurant owners with a suite of tools to manage their business, while offering a seamless ordering experience for customers.

The system is architected around a **Next.js 16** frontend and a **Supabase** backend. It leverages server-side rendering (SSR) and advanced React 19 features, including the React Compiler, for high performance.

**Key Architectural Features:**
- **Technology Stack**: Next.js, React 19, TypeScript, Supabase (Auth, Postgres, Storage), TanStack Query v5, Tailwind CSS.
- **Multi-tenancy**: The database schema and application logic are designed to support multiple restaurants. Authenticated users (owners) can switch between different restaurants they manage.
- **Authentication**: Handled by Supabase Auth, with session management integrated via middleware (`@supabase/ssr`) on nearly every request.
- **Database**: A PostgreSQL database managed by Supabase, featuring a well-defined schema for restaurants, menus, menu items, inventory, and orders.
- **Security**: Row-Level Security (RLS) is extensively used to ensure data isolation between tenants. Users can only access and modify data for restaurants they own.
- **Data Fetching**: Primarily managed by TanStack Query (`@tanstack/react-query`), which provides caching, re-fetching, and a centralized state for server data.
- **UI**: A rich, responsive component library built with Radix UI primitives, `lucide-react` for icons, and styled with Tailwind CSS.

**User Personas:**
- **Restaurant Owners/Staff**: Access a protected dashboard to manage menus, track inventory, view orders, and configure their restaurant.
- **Clients/Customers**: Use the public-facing side of the application to browse restaurants, view menus, and place orders.

## 2. Building and Running

The project is a standard Next.js application. Key commands are defined in `package.json`.

-   **Install Dependencies**:
    ```bash
    npm install
    ```

-   **Run Development Server**:
    Starts the application in development mode on `http://localhost:3000`.
    ```bash
    npm run dev
    ```

-   **Create a Production Build**:
    Builds the application for production.
    ```bash
    npm run build
    ```

-   **Run Production Server**:
    Starts the application in production mode. A build must be created first.
    ```bash
    npm run start
    ```

-   **Linting**:
    Runs ESLint to check for code quality and style issues.
    ```bash
    npm run lint
    ```

## 3. Development Conventions

-   **File Structure**: The `src/app` directory is organized using Next.js App Router conventions, with route groups for different sections:
    -   `(dashboard)`: Contains all routes for the authenticated restaurant management dashboard.
    -   `(public)`: Intended for public-facing pages like restaurant listings.
    -   `(staff)`: For staff-specific interfaces like Point of Sale (POS).
    -   `sign-in`, `sign-up`: Authentication pages.
-   **Data Access**:
    -   **Client-Side**: Use the `useUser()` hook (`@/hooks/useUser.ts`) to get the current user's data. This hook uses TanStack Query to fetch from Supabase.
    -   **Server-Side**: Use the Supabase client for server components to query the database, respecting RLS policies.
-   **Database Migrations**: Database schema changes are managed via SQL migration files located in `supabase/migrations`. The Supabase CLI should be used to create and apply migrations.
-   **Styling**: Utility-first CSS using Tailwind CSS. UI components are built compositionally and can be found in `src/components/ui`.
-   **State Management**:
    -   **Server State**: TanStack Query is the primary tool for managing asynchronous server state.
    -   **Client State**: Zustand is available for global client-side state, though most state is managed locally or via TanStack Query.
-   **Environment Variables**: The application relies on environment variables for Supabase configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Ensure a `.env.local` file is created with the correct values.
-   **Code Quality**: TypeScript is used throughout the project, and ESLint is configured to enforce coding standards.
