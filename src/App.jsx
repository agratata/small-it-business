import React, { useEffect, useState } from "react";
import { onAuthStateChange, getCurrentUser, signOut } from "./auth";
import LandingPage from "./LandingPage";
import LoginScreen from "./LoginScreen";
import CourseSpaceList from "./CourseSpaceList";
import ChatView from "./ChatView";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [openCourseId, setOpenCourseId] = useState(null);

  // Logged-out visitors see the public landing page first. This flips to
  // true when they click "Log in" or "Create an account" on it.
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoadingSession(false);
    });

    // Fires on login, logout, and token refresh (including in other tabs).
    const { data: sub } = onAuthStateChange((u) => {
      setUser(u);
      if (!u) {
        setOpenCourseId(null);
        setShowLogin(false); // signing out returns you to the landing page
      }
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  if (loadingSession) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "#FAFAF7" }}
      >
        <p className="text-sm" style={{ color: "#6B6C87" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <LoginScreen
          onAuthSuccess={() => {}}
          onBack={() => setShowLogin(false)}
        />
      );
    }

    return (
      <LandingPage
        onLogin={() => setShowLogin(true)}
        onSignUp={() => setShowLogin(true)}
      />
    );
  }

  // Role/full name were stored as auth metadata at signup time (see
  // auth.js signUp()) and are available on the session user right away —
  // no extra database round trip needed just to render the UI.
  const role = user.user_metadata?.role || "student";

  if (openCourseId) {
    return (
      <ChatView
        courseId={openCourseId}
        userId={user.id}
        onBack={() => setOpenCourseId(null)}
      />
    );
  }

  return (
    <CourseSpaceList
      userId={user.id}
      role={role}
      onOpenCourse={(id) => setOpenCourseId(id)}
      onSignOut={signOut}
    />
  );
}