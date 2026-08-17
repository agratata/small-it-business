import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, Users, Plus, Search, Bell, ChevronRight, X, LogOut } from "lucide-react";
import { supabase } from "./supabaseClient";

const COLOR_CYCLE = ["purple", "teal", "coral", "pink"];
const COLOR_MAP = {
  purple: { bg: "#EEEDFE", text: "#3C3489" },
  teal: { bg: "#E1F5EE", text: "#085041" },
  coral: { bg: "#FAECE7", text: "#712B13" },
  pink: { bg: "#FBEAF0", text: "#72243E" },
};

// Courses the current user can see. RLS on the `courses` table already
// restricts this to courses they lecture or are enrolled in, so we don't
// need to filter client-side.
async function fetchMyCourses() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id,code,name,lecturer_id,lecturer:profiles(full_name),members:course_members(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Couldn't load your courses.");

  // last_read_at only exists for courses the user is enrolled in (students).
  // Lecturers viewing their own course don't have a course_members row.
  const { data: memberships } = await supabase.from("course_members").select("course_id,last_read_at");

  return courses.map((c) => ({
    ...c,
    last_read_at: memberships?.find((m) => m.course_id === c.id)?.last_read_at ?? null,
  }));
}

async function fetchRecentMessages(courseIds) {
  if (courseIds.length === 0) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("course_id,content,created_at,sender:profiles(full_name)")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("Couldn't load recent messages.");
  return data;
}

async function joinCourseByCode(userId, code) {
  // join_code is stored lowercase (generated via md5() in the schema),
  // but the input field uppercases what the student types for display —
  // so match case-insensitively rather than assuming they line up.
  const { data: matches, error: lookupError } = await supabase
    .from("courses")
    .select("id,code,name")
    .ilike("join_code", code);
  if (lookupError) throw new Error("Couldn't look up that code.");
  if (!matches || matches.length === 0) throw new Error("No course found with that code.");
  const course = matches[0];

  const { error: joinError } = await supabase
    .from("course_members")
    .insert({ course_id: course.id, user_id: userId });
  if (joinError) {
    if (joinError.code === "23505") throw new Error("You've already joined this course.");
    throw new Error("Couldn't join that course.");
  }
  return course;
}

async function createCourse(lecturerId, name, code) {
  const { data, error } = await supabase
    .from("courses")
    .insert({ name, code, lecturer_id: lecturerId })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("That course code is already taken.");
    throw new Error("Couldn't create the course.");
  }
  return data;
}

export default function CourseSpaceList({ userId, role = "student", onOpenCourse, onSignOut }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", code: "" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null);

  const isLecturer = role === "lecturer";

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const myCourses = await fetchMyCourses();
      const courseIds = myCourses.map((c) => c.id);
      const messages = await fetchRecentMessages(courseIds);

      const assembled = myCourses.map((c, i) => {
        const courseMessages = messages.filter((msg) => msg.course_id === c.id);
        const last = courseMessages[0];
        const unread = c.last_read_at
          ? courseMessages.filter((msg) => new Date(msg.created_at) > new Date(c.last_read_at)).length
          : 0;

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          lecturer: c.lecturer?.full_name || "Unknown lecturer",
          members: c.members?.[0]?.count ?? 0,
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
  }, []);

  useEffect(() => {
    if (userId) loadCourses();
  }, [userId, loadCourses]);

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
      await joinCourseByCode(userId, joinCode.trim());
      setShowJoinModal(false);
      setJoinCode("");
      await loadCourses();
    } catch (err) {
      setJoinError(err.message || "Couldn't join that course.");
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.name.trim() || !createForm.code.trim()) {
      setCreateError("Enter a course name and code.");
      return;
    }
    setCreating(true);
    try {
      const course = await createCourse(userId, createForm.name.trim(), createForm.code.trim().toUpperCase());
      setCreatedCourse(course);
      setCreateForm({ name: "", code: "" });
      await loadCourses();
    } catch (err) {
      setCreateError(err.message || "Couldn't create that course.");
    } finally {
      setCreating(false);
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
          {onSignOut && (
            <button onClick={onSignOut} aria-label="Sign out" title="Sign out">
              <LogOut size={17} color="#5B5D7A" />
            </button>
          )}
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

          {isLecturer ? (
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreatedCourse(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium self-start"
              style={{ background: "#1B1D3A", color: "#F2F1EA" }}
            >
              <Plus size={15} />
              Create a course
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium self-start"
              style={{ background: "#1B1D3A", color: "#F2F1EA" }}
            >
              <Plus size={15} />
              Join a course
            </button>
          )}
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
              {isLecturer ? "Create your first course space above." : "Ask your lecturer for a join code to get started."}
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

      {/* join course modal (students) */}
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
                placeholder="e.g. a1b2c3"
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

      {/* create course modal (lecturers) */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center px-6 z-20" style={{ background: "rgba(27,29,58,0.45)" }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: "#FAFAF7" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}>
                Create a course
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError("");
                  setCreatedCourse(null);
                }}
                aria-label="Close"
              >
                <X size={18} color="#6B6C87" />
              </button>
            </div>

            {createdCourse ? (
              <div className="text-center py-4">
                <p className="text-sm mb-3" style={{ color: "#3D3E5C" }}>
                  "{createdCourse.name}" is live. Share this join code with your students:
                </p>
                <div
                  className="inline-block px-4 py-2 rounded-lg text-lg mb-4"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#EEEDFE", color: "#3C3489" }}
                >
                  {createdCourse.join_code}
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedCourse(null);
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "#1B1D3A", color: "#F2F1EA" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#3D3E5C" }}>
                    Course name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Intro to Business Analytics"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#3D3E5C" }}>
                    Course code
                  </label>
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. COMP301"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
                  />
                </div>
                {createError && (
                  <p className="text-xs mb-2" style={{ color: "#C23B3B" }}>
                    {createError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: "#1B1D3A", color: "#F2F1EA", opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? "Creating…" : "Create course"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}