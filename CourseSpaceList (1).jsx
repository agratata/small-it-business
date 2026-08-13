import React, { useState } from "react";
import { MessageCircle, Users, Plus, Search, Bell, ChevronRight, X } from "lucide-react";

const COURSES = [
  {
    code: "COMP301",
    name: "Distributed Systems",
    lecturer: "Dr. Adeyemi",
    initials: "DA",
    members: 42,
    unread: 3,
    lastMessage: "Assignment 3 deadline moved to Friday",
    lastSender: "Dr. Adeyemi",
    color: "purple",
  },
  {
    code: "MATH210",
    name: "Linear Algebra II",
    lecturer: "Prof. Kowalski",
    initials: "PK",
    members: 61,
    unread: 0,
    lastMessage: "Thanks, that makes sense now",
    lastSender: "Priya S.",
    color: "teal",
  },
  {
    code: "BIOL110",
    name: "Cell Biology",
    lecturer: "Dr. Nguyen",
    initials: "DN",
    members: 88,
    unread: 12,
    lastMessage: "Lab groups for next week are posted",
    lastSender: "Dr. Nguyen",
    color: "coral",
  },
  {
    code: "HIST150",
    name: "Modern World History",
    lecturer: "Dr. Okonkwo",
    initials: "DO",
    members: 35,
    unread: 0,
    lastMessage: "Can we push the reading discussion?",
    lastSender: "Marcus T.",
    color: "pink",
  },
];

const COLOR_MAP = {
  purple: { bg: "#EEEDFE", text: "#3C3489" },
  teal: { bg: "#E1F5EE", text: "#085041" },
  coral: { bg: "#FAECE7", text: "#712B13" },
  pink: { bg: "#FBEAF0", text: "#72243E" },
};

export default function CourseSpaceList() {
  const [query, setQuery] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const filtered = COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
  );

  const totalUnread = COURSES.reduce((sum, c) => sum + c.unread, 0);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setJoinError("Enter a course code.");
      return;
    }
    if (joinCode.trim().length < 4) {
      setJoinError("That code looks too short. Check with your lecturer.");
      return;
    }
    setShowJoinModal(false);
    setJoinCode("");
    setJoinError("");
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#FAFAF7", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
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
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ background: "#D85A30" }}
              />
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
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1B1D3A" }}
            >
              Your course spaces
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B6C87" }}>
              {totalUnread > 0
                ? `${totalUnread} unread message${totalUnread === 1 ? "" : "s"} across ${COURSES.length} courses`
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

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: "#6B6C87" }}>
              No courses match "{query}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((course) => {
              const c = COLOR_MAP[course.color];
              return (
                <button
                  key={course.code}
                  className="text-left p-5 rounded-2xl transition group"
                  style={{ background: "#fff", border: "1px solid #E4E3DB" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1B1D3A")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E4E3DB")}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        background: c.bg,
                        color: c.text,
                      }}
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

                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-4">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {course.initials}
                    </div>
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

                  <div
                    className="flex items-center gap-2 pt-3"
                    style={{ borderTop: "1px solid #F0EFE8" }}
                  >
                    <MessageCircle size={14} color="#9FA0B8" className="shrink-0" />
                    <p className="text-xs truncate flex-1" style={{ color: "#6B6C87" }}>
                      <span style={{ color: "#3D3E5C", fontWeight: 500 }}>{course.lastSender}: </span>
                      {course.lastMessage}
                    </p>
                    <ChevronRight
                      size={14}
                      color="#C4C4D2"
                      className="shrink-0 transition group-hover:translate-x-0.5"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* join course modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 flex items-center justify-center px-6 z-20"
          style={{ background: "rgba(27,29,58,0.45)" }}
        >
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: "#FAFAF7" }}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}
              >
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
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  border: "1px solid #E4E3DB",
                  background: "#fff",
                  color: "#1B1D3A",
                }}
              />
              {joinError && (
                <p className="text-xs mb-2" style={{ color: "#C23B3B" }}>
                  {joinError}
                </p>
              )}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#1B1D3A", color: "#F2F1EA" }}
              >
                Join course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
