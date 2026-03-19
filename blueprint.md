# Synapse MedTech Review Portal Blueprint

## Overview

Synapse is a premium Learning Management System (LMS) for MedTech students, built with Next.js and Tailwind CSS. It provides a comprehensive platform for studying, taking assessments, and tracking progress, with a separate portal for instructors to manage content and monitor student performance.

## Core Features

- **High-End Aesthetics:** The UI is heavily inspired by Spotify, with a focus on a modern, card-based layout, and a vibrant, blue-themed design.
- **Dynamic & Immersive UX:** Features a time-based greeting, a "Continue Studying" section for quick access, and a moving radial gradient background for added depth.
- **Adaptive Dark Mode:** A Sun/Moon toggle allows users to switch between a high-contrast dark theme and a clean light theme, both centered around a blue color palette.
- **Secure Login System:** Separate login portals for students and admins, with a redesigned, immersive login page.
- **Mobile-First Navigation:** A bottom navigation bar provides easy access to all major sections of the application.
- **Spotify-Inspired Dashboard:** A grid of large, visually engaging cards for each subject, similar to how Spotify displays playlists or albums.
- **Moodle-Structured Modules:** Courses are organized by subject, with expandable modules that contain study materials.
- **Robust Assessment Engine:**
    - **100-Item Clinical Chemistry Quiz:** A comprehensive, 100-item sample quiz for Clinical Chemistry.
    - **Dynamic Practice Assessments:** Each subject has its own practice assessment, dynamically populated with a specific question set.
- **Comprehensive & Granular Admin Panel:** A "Teacher's Lounge" for instructors to:
    - Select a specific subject to manage.
    - Upload course materials (PDFs, videos) directly to the selected subject's modules.
    - Add or update the question bank for each subject's individual practice assessment via a JSON editor.
- **Sequential Assessment Flow:** 
    - **Practice Assessments:** Each subject has its own practice assessment, which unlocks only after the student completes all modules for that subject.
    - **Final Mock Exam:** A comprehensive 100-item mock exam that unlocks only after all individual subject assessments have been successfully completed.
- **State Persistence:** The application uses the browser's `localStorage` to save and restore the user's theme preference, login status, and course progress, ensuring a seamless user experience across sessions.
- **Two-Step Quiz Submission:** In the assessment quiz, users first select an answer and then click a "Submit" button to confirm their choice before proceeding to the next question. This prevents accidental submissions and allows for a more deliberate answering process.

## Design & UI

- **Logo:** A minimalist logo with the word "SYNAPSE" in the "Exo 2" font, with a pulsing dot to the right. The logo is enlarged on the login page for a more prominent effect.
- **Colors:** A Spotify-inspired blue theme. The dark mode features a deep, dark blue background (#040815) with vibrant blue accents (#00A0F0). The light mode uses a clean white background (#FFFFFF) with a professional blue accent (#0060F0).
- **Dynamic Background:** A subtle, moving radial gradient adds depth and energy to the interface.
- **Card-Based Layout:** A grid-based layout with large, visually engaging cards for each subject. Cards feature enhanced hover effects, including a smooth sliding "Play" button and a prominent "glow" effect.
- **Typographic Hierarchy:** Large, bold headings for emphasis, creating a clear and dynamic visual hierarchy.
- **Rounded Corners:** 20px rounded corners are used on all major UI elements.
- **Engaging Iconography:** Subject icons are now more descriptive and enclosed in circular, gradient-filled containers, creating a more cohesive and visually appealing design reminiscent of the Spotify UI.
