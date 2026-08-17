# E-Commerce Frontend

This is the frontend repository for the E-Commerce application, built with [Next.js 15](https://nextjs.org/) (App Router), React 19, and TypeScript.

## Getting Started

First, set up your environment variables by copying the example file:

```bash
cp .env.example .env
```
Make sure `NEXT_PUBLIC_API_URL` is configured correctly to point to your backend API.

Then, make sure to install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev`: Runs the Next.js development server with Turbopack for ultra-fast compilation.
- `npm run build`: Builds the application for production usage.
- `npm run start`: Starts a Next.js production server.
- `npm run lint`: Runs ESLint to catch linting errors.
- `npm run sass`: Watches for SCSS changes and compiles them to CSS.

## Tech Stack

- **Framework**: Next.js 15
- **Library**: React 19
- **Styling**: SCSS / React Bootstrap
- **Components & Sliders**: Swiper, React Slick, Lightgallery
- **Language**: TypeScript

## Project Structure

- `/src` - Contains the main source code for the application including components, app routes, and services.
- `/public` - Contains static assets such as images, fonts, and compiled CSS (`/public/assets/css/style.css`).
