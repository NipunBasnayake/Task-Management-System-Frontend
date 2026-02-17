# Task Management System – Frontend

## Overview

Next.js 14+ frontend for the Task Management System with secure authentication and protected routes.

---

## Live Deployment

**Production URL** : https://task-management-system-frontend-smoky.vercel.app

**GitHub Repository** : https://github.com/NipunBasnayake/Task-Management-System-Frontend.git

---

## Tech Stack

- Next.js  
- TypeScript  
- Tailwind CSS 
- Axios 
- Next.js Middleware 

---

## Features

- User Registration & Login  
- Protected Dashboard  
- Create / Edit / Delete Tasks  
- Task Filtering (status / priority)  
- Loading & Error States  
- Responsive UI  
- Client-side form validation

---

## Security Considerations

- Route protection via Next.js middleware  
- Authentication handled via backend-issued HttpOnly cookies  
- No token storage in `localStorage`  
- Environment-based API configuration  
- Graceful error handling  

---

## Environment Variables
Create a `.env.local` file in the root directory:

```env
# Production Backend
NEXT_PUBLIC_API_BASE_URL=https://task-management-system-backend-delta.vercel.app/api/v1

# Local Development Backend (if backend runs locally)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

## Local Setup
Clone the repository
```bash
git clone https://github.com/NipunBasnayake/Task-Management-System-Frontend.git
cd Task-Management-System-Frontend
```
Install dependencies
```bash
npm install
```

Configure environment variables

Create a ```.env``` file based on ```.env.example```.

Run development server
```
npm run dev
```

App runs at:
```
http://localhost:3000
```

## Deployment (Vercel)

- Hosted on Vercel
- Environment variable configured in Vercel dashboard
 -Middleware enabled for protected routes
