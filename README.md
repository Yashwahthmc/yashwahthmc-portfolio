# Yashwahthmc Portfolio

A modern, dynamic, and fully responsive personal portfolio website built with **React**, **Vite**, and **Firebase**. This portfolio features a secure admin dashboard for real-time content management.

## 🚀 Features

-   **Dynamic Content:** Data is fetched in real-time from Firebase Firestore.
-   **Admin Dashboard:** Secure login system to manage projects, experiences, and personal information without touching the code.
-   **Responsive Design:** Fully optimized for mobile, tablet, and desktop screens.
-   **Modern UI:** Interactive components with smooth animations and professional aesthetics.
-   **Firebase Integration:** Powered by Firebase Authentication, Firestore, and Analytics.

## 🛠️ Tech Stack

-   **Frontend:** React.js, Vite, React Router
-   **Styling:** Vanilla CSS (Custom properties & Modern layouts)
-   **Backend/Database:** Firebase Firestore
-   **Authentication:** Firebase Auth
-   **Analytics:** Firebase Analytics
-   **Deployment:** Vercel

## 📦 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Yashwahthmc/yashwahthmc-portfolio.git
    cd yashwahthmc-portfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Firebase:**
    -   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Firestore Database** and **Authentication** (Email/Password).
    -   Copy your Firebase config and update `src/firebase.js`.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🔒 Security Rules

To keep your portfolio secure while allowing visitors to view your data, update your Firestore rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Yashwahthmc](https://github.com/Yashwahthmc)
