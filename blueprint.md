# Synapse Review Application Blueprint

## Overview

Synapse Review is a comprehensive, web-based learning and assessment platform designed specifically for Medical Technology students and educators. It provides a structured, engaging, and modern environment for students to master complex subjects and for teachers to manage course content and track progress.

## Core Features & Design

### **Application Architecture**
-   **Framework:** Built with Next.js and the App Router.
-   **Deployment:** Hosted on Netlify.
-   **Backend:** Powered by Firebase (Firestore Database and Firebase Storage).
-   **Styling:** Styled with Tailwind CSS.

### **Key Features**
-   **Dual-Role System:** Distinct interfaces and functionalities for "Student" and "Admin" roles.
-   **Modern & Responsive UI:**
    -   A sleek, dark-themed interface that adapts seamlessly to desktop and mobile devices.
    -   A visually balanced layout with clean spacing, modern components, and a professional aesthetic.
    -   Dynamic icons, gradients, and subtle animations create an engaging and intuitive user experience.
-   **Moodle-Structured Modules:** Courses are organized by subject, with expandable modules that contain study materials. Students can view and access uploaded PDFs and videos directly within each module.
-   **Robust Assessment Engine:**
    -   **100-Item Clinical Chemistry Quiz:** A comprehensive, 100-item sample quiz for Clinical Chemistry.
    -   **Dynamic Practice Assessments:** Each subject has its own practice assessment, dynamically populated with a specific question set.
-   **Comprehensive & Granular Admin Panel:** A "Teacher's Lounge" for instructors to:
    -   Select a specific subject and module to manage.
    -   **Upload Course Materials:** Upload PDFs and videos to the selected module. Files are stored in Firebase Storage and are immediately available to students.
    -   Add or update the question bank for each subject's individual practice assessment via a JSON editor.
-   **State Persistence:** The application uses the browser's `localStorage` to save and restore user progress and preferences, ensuring a seamless user experience across sessions.

---

## Current Task: Final Deployment Fix for Early Access

### **1. Goal**
Resolve the final "Server Connection Error" on Netlify to make the application fully functional and ready for early access by co-teachers and students.

### **2. Problem Analysis**
The application is successfully building on Netlify but is failing at runtime. The screenshot provided shows a generic error message from the Next.js Server Component renderer. This happens in production environments and hides the specific error details for security reasons. The root cause is that the application cannot initialize the Firebase Admin SDK because the environment variables (credentials) are missing or incorrect in the Netlify deployment settings. Our previous attempts to throw an error are being caught and hidden by this Next.js security feature.

### **3. Action Plan**
I will make a final code change to bypass Next.js's generic error handling and display a precise, actionable error message directly in the user interface.

-   **Step 1: Refactor Firebase Initialization:** I will modify `lib/firebase.ts` to gracefully handle missing environment variables instead of throwing an immediate error. This will prevent the Next.js renderer from catching the error and showing a generic message.

-   **Step 2: Propagate Initialization Error:** I will update the main server action (`app/actions.ts`) that initializes the data (`seedInitialData`) to check if Firebase was successfully initialized. If it was not, the action will return a detailed error message explaining exactly which environment variable is missing.

-   **Step 3: Display Specific Error in UI:** The application's main page (`app/page.tsx`) is already designed to display any error message returned from the server. This change will ensure the *specific* error from Step 2 is shown to the user.

### **4. Expected Outcome**
After you push this final change, the deployed application will no longer show a generic error. Instead, it will display a clear, helpful message, such as:

> **"The following are missing: FIREBASE_PRIVATE_KEY. Please check your hosting provider's settings."**

This will allow you to instantly identify and correct the specific typo or error in your Netlify environment variable settings. Once corrected, the application will be fully functional and ready for your students and colleagues.
