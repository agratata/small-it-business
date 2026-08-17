import React, { useEffect, useState } from "react";
import { onAuthStateChange, getCurrentUser, signOut } from "./auth";
import { supabase } from "./supabaseClient";
import LoginScreen from "./LoginScreen";
import CourseSpaceList from "./CourseSpaceList";
import ChatView from "./ChatView";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
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

  // The `profiles` table (not auth metadata) is the source of truth for
  // role — metadata is only set once at signup and can go stale or be
  // wrong if a signup attempt partially failed. Always look role up here.
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Couldn't load profile role:", error);
          setRole("student");
        } else {
          setRole(data.role);
        }
      });
  }, [user]);

  if (loadingSession || (user && role === null)) {
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