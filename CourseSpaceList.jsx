import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, Users, Plus, Search, Bell, ChevronRight, X } from "lucide-react";

// Fill these in with your project's values (Settings → API in Supabase).
// Hardcoded here only because this preview sandbox doesn't support env
// vars or npm packages — in your real app pull these from env vars.
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";

const COLOR_CYCLE = ["purple", "teal", "coral", "pink"];
const COLOR_MAP = {
  purple: { bg: "#EEEDFE", text: "#3C3489" },
  teal: { bg: "#E1F5EE", text: "#085041" },
  coral: { bg: "#FAECE7", text: "#712B13" },
  pink: { bg: "#FBEAF0", text: "#72243E" },
};

function authHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
  };
}

// Course spaces the current user belongs to, with the course details embedded.
async function fetchMyCourses(accessToken) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/course_members?select=course_id,last_read_at,courses(id,code,name,lecturer:profiles(full_name),members:course_members(count))`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) throw new Error("Couldn't load your courses.");
  return res.json();
}

// Most recent messages across those courses, newest first — grouped
// client-side per course into "last message" + "unread count" below,
// since PostgREST doesn't support top-N-per-group in one call.
async function fetchRecentMessages(accessToken, courseIds) {
  if (courseIds.length === 0) return [];
  const idsParam = `(${courseIds.join(",")})`;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?course_id=in.${idsParam}&select=course_id,content,created_at,sender:profiles(full_name)&order=created_at.desc&limit=200`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) throw new Error("Couldn't load recent messages.");
  return res.json();
}

async function joinCourseByCode(accessToken, userId, code) {
  const lookupRes = await fetch(
    `${SUPABASE_URL}/rest/v1/courses?join_code=eq.${encodeURIComponent(code)}&select=id,code,name`,
    { headers: authHeaders(accessToken) }
  );
  if (!lookupRes.ok) throw new Error("Couldn't look up that code.");
  const matches = await lookupRes.json();
  if (matches.length === 0) throw new Error("No course found with that code.");
  const course = matches[0];

  const joinRes = await fetch(`${SUPABASE_URL}/rest/v1/course_members`, {
    method: "POST",
    headers: { ...authHeaders(accessToken), Prefer: "return=minimal" },
    body: JSON.stringify({
      course_id: course.id,
      user_id: userId,
      role_in_course: "student",
    }),
  });
  if (!joinRes.ok) {
    const data = await joinRes.json().catch(() => ({}));
    if (data.code === "23505") throw new Error("You've already joined this course.");
    throw new Error("Couldn't join that course.");
  }
  return course;
}

export default function CourseSpaceList({ userId, accessToken, onOpenCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const memberships = await fetchMyCourses(accessToken);
      const courseIds = memberships.map((m) => m.courses.id);
      const messages = await fetchRecentMessages(accessToken, courseIds);

      const assembled = memberships.map((m, i) => {
        const courseMessages = messages.filter((msg) => msg.course_id === m.courses.id);
        const last = courseMessages[0];
        const unread = courseMessages.filter(
          (msg) => new Date(msg.created_at) > new Date(m.last_read_at)
        ).length;

        return {
          id: m.courses.id,
          code: m.courses.code,
          name: m.courses.name,
          lecturer: m.courses.lecturer?.full_name || "Unknown lecturer",
          members: m.courses.members?.[0]?.count ?? 0,
          unread,
          lastMessage: last ? last.content : "No messages yet",
          lastSender: last ? last.sender?.full_name || "Someone" : "",
          color: COLOR_CYCLE[i % COLOR_CYCLE.length],
        };
      });

      setCourses(assembled);
    } catch (err) {
      setLoadError(err.message || "Something went wrong loading your courses.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) loadCourses();
  }, [accessToken, loadCourses]);

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
  );

  const totalUnread = courses.reduce((sum, c) => sum + c.unread, 0);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError("");

    if (!joinCode.trim()) {
      setJoinError("Enter a course code.");
      return;
    }

    setJoining(true);
    try {
      await joinCourseByCode(accessToken, userId, joinCode.trim());
      setShowJoinModal(false);
      setJoinCode("");
      await loadCourses();
    } catch (err) {
      setJoinError(err.message || "Couldn't join that course.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#FAFAF7", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .skeleton { animation: pulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* top nav */}
      <div
        className="flex items-center justify-between px-6 md:px-10 py-4 sticky top-0 z-10"
        style={{ background: "#FAFAF7", borderBottom: "1px solid #E4E3DB" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
            style={{ background: "#C9F158", color: "#1B1D3A" }}
          >
            G
          </div>
          <span
            className="font-semibold tracking-tight hidden sm:block"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1B1D3A" }}
          >
            Get Studious
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative" aria-label="Notifications">
            <Bell size={19} color="#5B5D7A" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: "#D85A30" }} />
            )}
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "#1B1D3A", color: "#F2F1EA" }}
          >
            YO
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1B1D3A" }}>
              Your course spaces
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B6C87" }}>
              {loading
                ? "Loading…"
                : totalUnread > 0
                ? `${totalUnread} unread message${totalUnread === 1 ? "" : "s"} across ${courses.length} courses`
                : "You're all caught up."}
            </p>
          </div>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium self-start"
            style={{ background: "#1B1D3A", color: "#F2F1EA" }}
          >
            <Plus size={15} />
            Join a course
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9FA0B8" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your courses"
            className="w-full sm:w-72 pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
          />
        </div>

        {loadError && (
          <div className="text-center py-10">
            <p className="text-sm mb-2" style={{ color: "#C23B3B" }}>
              {loadError}
            </p>
            <button onClick={loadCourses} className="text-sm underline" style={{ color: "#5B4EFF" }}>
              Try again
            </button>
          </div>
        )}

        {loading && !loadError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #E4E3DB", height: "148px" }} />
            ))}
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && courses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm mb-1" style={{ color: "#3D3E5C" }}>
              No course spaces yet.
            </p>
            <p className="text-sm" style={{ color: "#6B6C87" }}>
              Ask your lecturer for a join code to get started.
            </p>
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && courses.length > 0 && (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: "#6B6C87" }}>
              No courses match "{query}".
            </p>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((course) => {
              const c = COLOR_MAP[course.color];
              return (
                <button
                  key={course.id}
                  onClick={() => onOpenCourse?.(course.id)}
                  className="text-left p-5 rounded-2xl transition group"
                  style={{ background: "#fff", border: "1px solid #E4E3DB" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1B1D3A")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E4E3DB")}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", background: c.bg, color: c.text }}
                    >
                      {course.code}
                    </span>
                    {course.unread > 0 && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "#EAF6D2", color: "#4C7A0F" }}
                      >
                        {course.unread} new
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold mb-1" style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs" style={{ color: "#6B6C87" }}>
                      {course.lecturer}
                    </span>
                    <span className="text-xs" style={{ color: "#C4C4D2" }}>
                      &middot;
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: "#6B6C87" }}>
                      <Users size={11} />
                      {course.members}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #F0EFE8" }}>
                    <MessageCircle size={14} color="#9FA0B8" className="shrink-0" />
                    <p className="text-xs truncate flex-1" style={{ color: "#6B6C87" }}>
                      {course.lastSender && <span style={{ color: "#3D3E5C", fontWeight: 500 }}>{course.lastSender}: </span>}
                      {course.lastMessage}
                    </p>
                    <ChevronRight size={14} color="#C4C4D2" className="shrink-0 transition group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* join course modal */}
      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center px-6 z-20" style={{ background: "rgba(27,29,58,0.45)" }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: "#FAFAF7" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}>
                Join a course
              </h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError("");
                }}
                aria-label="Close"
              >
                <X size={18} color="#6B6C87" />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#6B6C87" }}>
              Enter the code your lecturer shared for this course.
            </p>
            <form onSubmit={handleJoin}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. COMP301-A2"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace", border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
              />
              {joinError && (
                <p className="text-xs mb-2" style={{ color: "#C23B3B" }}>
                  {joinError}
                </p>
              )}
              <button
                type="submit"
                disabled={joining}
                className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#1B1D3A", color: "#F2F1EA", opacity: joining ? 0.7 : 1 }}
              >
                {joining ? "Joining…" : "Join course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}