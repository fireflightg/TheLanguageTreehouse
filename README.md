# theLearningTreehouse

The Language Treehouse is a comprehensive language-learning platform that connects mentors with students, offering personalized educational experiences in multiple languages. This repository contains the code for the main landing page and a universal dashboard that serves as the foundation for both mentors and students to navigate the platform’s features.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### Landing Page

- **User Authentication**: Sign in, sign up, and sign out features.
- **Role-Based Navigation**: Tailored navigation options for Mentors and Students.
- **Call to Action**: Clear options to sign up or get started based on user status.
- **Languages Supported**: Information on supported languages, with the ability to read more about each language.
- **Smart Matching**: Highlights features for connecting students with suitable mentors.

### Universal Dashboard

- **Mentor and Student Functionality**:
  - Mentor-specific features include scheduling availability and teaching schedules.
  - Students can search for mentors based on date, time, subject, and language.
- **Session Scheduling**: Allows students to book sessions with mentors based on availability.
- **Video Library**: A searchable library of video resources for various subjects and languages.
- **Messages**: Communication interface for real-time messaging between mentors and students.
- **Profile Management**: Manage user settings and personal information.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/)
- **UI Components**: [Lucide Icons](https://lucide.dev/)
- **Authentication**: [Clerk](https://clerk.dev/) for user authentication
- **Database and Storage**: [Firebase Firestore](https://firebase.google.com/products/firestore) for data storage
- **Deployment**: [Vercel](https://vercel.com/) (recommended) or any preferred Next.js hosting provider

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/theLearningTreehouse.git
   cd theLearningTreehouse
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your Firebase and Clerk projects as described in the **Configuration** section below.

4. Run the development server:

   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:3000` in your browser to view the application.

## Configuration

1. **Firebase**:

   - Set up a Firebase project and enable Firestore.
   - Add a collection named `Users` to store user data and `Sessions` for session data.
   - Update Firebase settings in `firebaseConfig.js` with your project’s API key and other details.

2. **Clerk**:

   - Set up a Clerk project and add your frontend API key in `.env.local`.
   - Example:
     ```plaintext
     NEXT_PUBLIC_CLERK_FRONTEND_API=<your-clerk-frontend-api>
     ```

3. **Environment Variables**:
   - Create a `.env.local` file and add the required environment variables for Firebase and Clerk:
     ```plaintext
     NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
     NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
     ```

## Usage

- **Mentors**:

  - Set availability and subjects.
  - Accept session requests from students and manage session schedules.
  - Access resources in the video library and communicate with students via messaging.

- **Students**:
  - Search for mentors based on language, subject, date, and time preferences.
  - Schedule sessions and receive reminders.
  - Access video resources and communicate with mentors.

## Contributing

We welcome contributions to enhance theLearningTreehouse platform! If you would like to contribute:

1. Fork the repository.
2. Create a new branch with a meaningful name:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with clear commit messages.
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request, and describe the changes you made.

## License

This project is licensed under the GNU General Public License. See the [LICENSE](LICENSE) file for details.
