# Synapse AI Learning Platform Blueprint

## Overview

Synapse is an AI-powered Learning Management System (LMS) designed for medical board reviews. It provides a personalized and adaptive learning experience for students while offering robust content and user management tools for administrators. The platform is built on Next.js and Firebase, featuring a modern, responsive, and intuitive user interface.

## Core Features & Design

-   **Dual-Role System:** Distinct interfaces and functionalities for "Student" and "Admin" roles.
-   **Modern & Responsive UI:**
    -   A sleek, dark/light theme-switchable interface that adapts seamlessly to desktop and mobile devices.
    -   A visually balanced layout with clean spacing, modern components, and a professional aesthetic.
    -   Dynamic icons, gradients, and subtle animations create an engaging and intuitive user experience.
-   **Personalized Student Dashboard:**
    -   Greets students based on the time of day.
    -   "Continue Studying" section provides quick access to the next module.
    -   "All Subjects" section offers a comprehensive overview of available courses.
-   **Moodle-Structured Modules:** Courses are organized by subject, with expandable modules that contain study materials. Students can now view and access uploaded PDFs and videos directly within each module.
-   **Robust Assessment Engine:**
    -   **100-Item Clinical Chemistry Quiz:** A comprehensive, 100-item sample quiz for Clinical Chemistry.
    -   **Dynamic Practice Assessments:** Each subject has its own practice assessment, dynamically populated with a specific question set.
    -   **Enhanced Quiz Controls:**
        -   **Exit with Confirmation:** A prominent exit button allows users to leave the quiz at any time. A confirmation modal prevents accidental exits.
        -   **Collapsible Panel:** The side panel containing the timer and question navigation can be hidden, providing a more focused, full-screen view of the current question.
-   **Comprehensive & Granular Admin Panel:** A "Teacher's Lounge" for instructors to:
    -   Select a specific subject and module to manage.
    -   **Upload Course Materials:** Upload PDFs and videos to the selected module. Files are stored locally within the project's `/public/uploads` directory and are immediately available to students. The UI shows a simulated progress bar for a better user experience.
        -   Add or update the question bank for each subject's individual practice assessment via a JSON editor.
-   **Sequential Assessment Flow:**
    -   **Practice Assessments:** Each subject has its own practice assessment, which unlocks only after the student completes all modules for that subject.
    -   **Final Mock Exam:** A comprehensive 100-item mock exam that unlocks only after all individual subject assessments have been successfully completed.
-   **State Persistence:** The application uses the browser's `localStorage` to save and restore the user's theme preference, login status, and course progress, ensuring a seamless user experience across sessions.
