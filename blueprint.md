# Synapse Review Application Blueprint

## Overview

Synapse Review is a comprehensive, web-based learning and assessment platform designed specifically for Medical Technology students and educators. It provides a structured, engaging, and modern environment for students to master complex subjects and for teachers to manage course content and track progress.

## Core Features & Design

### **Application Architecture**
-   **Framework:** Built with Next.js and the App Router.
-   **Deployment:** Hosted on **Cloudflare Pages**.
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

## Current Task: Deploy to Cloudflare Pages for Early Access

### **1. Goal**
Successfully deploy the application to Cloudflare Pages to make it fully functional and ready for early access by co-teachers and students.

### **2. Problem Analysis**
The core runtime requirement for the application is access to its Firebase Admin SDK credentials. The application is now designed to check for these credentials and provide a specific error message if they are missing. This diagnostic feature will be critical for a successful Cloudflare Pages deployment.

### **3. Action Plan**
I have removed the Netlify-specific configuration (`netlify.toml`) and updated this blueprint. The codebase is now ready for Cloudflare. The next steps are to be performed by you in the Cloudflare Pages dashboard.

### **4. Deployment Instructions for You on Cloudflare Pages**

1.  **Connect Your GitHub Repository:**
    *   In your Cloudflare dashboard, go to **Workers & Pages** and select **Create application**.
    *   Connect to your GitHub account and select the `SynapseReviewRMT` repository.

2.  **Configure Your Build Settings:**
    *   **Framework preset:** Select **Next.js**.
    *   Cloudflare will automatically detect the correct build command (`next build`) and output directory (`.next`).

3.  **Set Your Environment Variables (This is the most critical step):**
    *   Go to the **Environment Variables** section for your project.
    *   You must add the following three variables. Click **"Encrypt"** for the `FIREBASE_PRIVATE_KEY`.

| Variable Name | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID | (e.g., `synapse-review-12345`) |
| `FIREBASE_CLIENT_EMAIL` | Your Firebase service account email | (e.g., `firebase-adminsdk-...@...`) |
| `FIREBASE_PRIVATE_KEY` | Your Firebase service account private key | (The long key from your JSON file) |

    *   **Crucially, ensure there are no typos in the names or values.** The error message on your deployed site will tell you if one is missing.

4.  **Deploy and Verify:**
    *   Save and Deploy.
    *   Once the deployment is complete, visit your live Cloudflare Pages URL.
    *   If you see the "Server Connection Error," read the specific message. It will tell you *exactly* which environment variable you need to fix in your Cloudflare settings.
    *   Correct the variable, and the site will go live.
