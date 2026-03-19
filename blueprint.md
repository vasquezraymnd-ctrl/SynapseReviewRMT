# Project Blueprint

## Overview

This project is a web application that will be deployed to Cloudflare. The goal is to create a modern, visually appealing, and feature-rich application. The current focus is on setting up the initial project structure, including authentication and a basic UI.

## Style and Design

*   **Framework:** Next.js with TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** A combination of custom components and components from the `lucide-react` library.
*   **Authentication:** The application will use a custom authentication system with JWTs. It will include a login page, a registration page, and a protected area for authenticated users.

## Features

*   **Authentication:**
    *   User registration and login
    *   JWT-based authentication
    *   Protected routes
    *   A login page (`/login`)
*   **File Uploads:**
    *   A drag-and-drop file upload component
    *   The ability to upload files to a server (the specific implementation is TBD)

## Current Status

The project is in the initial setup phase. The basic Next.js project has been created, and the necessary dependencies have been installed. The following components have been created:

*   `app/layout.tsx`: The main layout for the application.
*   `app/page.tsx`: The home page.
*   `app/login/page.tsx`: The login page.
*   `components/Dropzone.tsx`: The file upload component.
*   `lib/auth.ts`: The authentication library.
*   `lib/jwt.ts`: The JWT library.

## Next Steps

1.  **Fix the Linter:** The linter is currently broken. This needs to be fixed before any more development can be done.
2.  **Complete the Authentication:** The authentication system is not yet complete. The login and registration pages need to be connected to the authentication library.
3.  **Implement the File Uploads:** The file upload component needs to be integrated with a backend service to handle the file uploads.
4.  **Deploy to Cloudflare:** The project needs to be deployed to Cloudflare. This will require setting up the necessary build and deployment configurations.
