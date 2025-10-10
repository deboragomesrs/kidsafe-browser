# AI Rules for Barra Kids Application

This document outlines the core technologies used in the Barra Kids application and provides guidelines for library usage to maintain consistency and best practices.

## Tech Stack Overview

*   **Vite**: A fast build tool that provides an instant development server and optimized builds for production.
*   **TypeScript**: A superset of JavaScript that adds static type definitions, enhancing code quality and maintainability.
*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **React Router**: A standard library for routing in React applications, enabling navigation between different views.
*   **TanStack React Query**: A powerful library for managing, caching, and synchronizing server state in React applications.
*   **Lucide React**: A library providing a set of beautiful and customizable SVG icons.
*   **Sonner**: A modern toast component for displaying notifications.
*   **Zod**: A TypeScript-first schema declaration and validation library, often used with forms.
*   **React Hook Form**: A performant, flexible, and extensible forms library for React.

## Library Usage Rules

To ensure consistency and leverage the existing ecosystem, please adhere to the following guidelines when developing:

*   **UI Components**: Always prioritize `shadcn/ui` components for building the user interface. If a specific component is not available or requires significant deviation from `shadcn/ui`'s design, create a new, small, and focused component in `src/components/` using Tailwind CSS.
*   **Styling**: All styling must be done using **Tailwind CSS** classes. Avoid writing custom CSS unless it's for global styles defined in `src/index.css` or specific utility classes.
*   **Routing**: Use `react-router-dom` for all client-side navigation and route management. All main routes should be defined in `src/App.tsx`.
*   **State Management & Data Fetching**: For managing server-side data and complex asynchronous operations, utilize `TanStack React Query`. For simple, local component state, `useState` and `useEffect` are appropriate.
*   **Form Handling**: Use `react-hook-form` for managing form state, validation, and submission. Integrate with `zod` for schema-based validation.
*   **Icons**: All icons should be sourced from the `lucide-react` library.
*   **Toast Notifications**: Use `sonner` for displaying all types of user notifications (success, error, info, loading).
*   **Utility Functions**: Leverage `clsx` and `tailwind-merge` (via the `cn` utility in `src/lib/utils.ts`) for conditionally applying and merging Tailwind CSS classes.
*   **Date Manipulation**: The `date-fns` library is available for any date formatting or manipulation needs.