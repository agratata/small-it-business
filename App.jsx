import React, { useEffect, useState } from "react";
import { onAuthStateChange, getCurrentUser, signOut } from "./auth";
import LoginScreen from "./LoginScreen";
import CourseSpaceList from "./CourseSpaceList";
import ChatView from "./ChatView";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [openCourseId, setOpenCourseId] = useState(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoadingSession(false);
    });

    // Fires on login, logout, and token refresh (including in other tabs).
    const { data: sub } = onAuthStateChange((u) => {
      setUser(u);
      if (!u) setOpenCourseId(null);
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  if (loadingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#FAFAF7" }}>
        <p className="text-sm" style={{ color: "#6B6C87" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onAuthSuccess={() => {}} />;
  }

  // Role/full name were stored as auth metadata at signup time (see
  // auth.js signUp()) and are available on the session user right away —
  // no extra database round trip needed just to render the UI.
  const role = user.user_metadata?.role || "student";

  if (openCourseId) {
    return <ChatView courseId={openCourseId} userId={user.id} onBack={() => setOpenCourseId(null)} />;
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