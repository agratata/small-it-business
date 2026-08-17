import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Send, MessageCircle } from "lucide-react";
import { supabase } from "./supabaseClient";

async function fetchCourseMeta(courseId) {
  const { data, error } = await supabase
    .from("courses")
    .select("code,name,lecturer:profiles!courses_lecturer_id_fkey(full_name),members:course_members(count)")
    .eq("id", courseId)
    .single();
  if (error) throw new Error("Couldn't load this course.");
  return data;
}

async function fetchMessages(courseId) {
  const { data, error } = await supabase
    .from("messages")
    .select("id,content,created_at,sender_id,sender:profiles(full_name,role)")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error("Couldn't load messages.");
  return data;
}

async function sendMessage(courseId, senderId, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ course_id: courseId, sender_id: senderId, content })
    .select("id,content,created_at,sender_id,sender:profiles(full_name,role)")
    .single();
  if (error) throw new Error("Message didn't send. Try again.");
  return data;
}

async function markCourseRead(courseId, userId) {
  await supabase
    .from("course_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("course_id", courseId)
    .eq("user_id", userId); // best-effort — a failed read receipt shouldn't block chat
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return "Today";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatView({ courseId, userId, onBack }) {
  const [courseMeta, setCourseMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [meta, msgs] = await Promise.all([fetchCourseMeta(courseId), fetchMessages(courseId)]);
      setCourseMeta(meta);
      setMessages(msgs);
      markCourseRead(courseId, userId);
    } catch (err) {
      setLoadError(err.message || "Something went wrong loading this course.");
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    if (courseId) load();
  }, [courseId, load]);

  // Realtime: subscribe to new rows in `messages` for this course.
  // supabase-js handles the websocket connection/heartbeats/reconnects
  // internally — we just describe what we want to listen to.
  useEffect(() => {
    if (!courseId) return;

    const channel = supabase
      .channel(`messages:course:${courseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `course_id=eq.${courseId}` },
        async (payload) => {
          const newRow = payload.new;
          // The realtime payload doesn't include the joined `sender` info,
          // so fetch that in for any message that isn't already in state
          // (i.e. wasn't sent by us, which we add locally on send).
          setMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [...prev, { ...newRow, sender: null }];
          });
          if (newRow.sender_id !== userId) markCourseRead(courseId, userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft("");
    try {
      const sent = await sendMessage(courseId, userId, text);
      // Add locally right away the realtime echo will be deduped by id.
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
    } catch (err) {
      setLoadError(err.message);
      setDraft(text); // restore the draft so nothing's lost
    } finally {
      setSending(false);
    }
  };

  let lastDate = null;

  return (
    <div className="h-screen w-full flex flex-col" style={{ background: "#FAFAF7", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .skeleton { animation: pulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3.5 shrink-0" style={{ borderBottom: "1px solid #E4E3DB", background: "#FAFAF7" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} aria-label="Back to course spaces" className="shrink-0">
            <ArrowLeft size={19} color="#5B5D7A" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#EEEDFE", color: "#3C3489" }}
              >
                {courseMeta?.code || "…"}
              </span>
              <h1 className="text-sm font-semibold truncate" style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}>
                {courseMeta?.name || "Loading…"}
              </h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#9FA0B8" }}>
              {courseMeta?.lecturer?.full_name ? `${courseMeta.lecturer.full_name} and ${(courseMeta.members?.[0]?.count ?? 1) - 1} students` : ""}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs shrink-0" style={{ border: "1px solid #E4E3DB", color: "#5B5D7A" }}>
          <Users size={13} />
          {courseMeta?.members?.[0]?.count ?? "-"}
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5">
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton flex gap-2.5 max-w-[65%]" style={{ marginLeft: i % 2 ? "auto" : 0 }}>
                <div className="h-16 w-full rounded-2xl" style={{ background: "#E4E3DB" }} />
              </div>
            ))}
          </div>
        )}

        {loadError && !loading && (
          <div className="text-center py-10">
            <p className="text-sm mb-2" style={{ color: "#C23B3B" }}>
              {loadError}
            </p>
            <button onClick={load} className="text-sm underline" style={{ color: "#5B4EFF" }}>
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !loadError &&
          messages.map((msg, i) => {
            const dateLabel = formatDateLabel(msg.created_at);
            const showDateDivider = dateLabel !== lastDate;
            lastDate = dateLabel;
            const isSelf = msg.sender_id === userId;
            const prevSameSender = i > 0 && messages[i - 1].sender_id === msg.sender_id && !showDateDivider;
            const isLecturer = msg.sender?.role === "lecturer";

            return (
              <React.Fragment key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#F0EFE8", color: "#9FA0B8" }}>
                      {dateLabel}
                    </span>
                  </div>
                )}
                <div
                  className={`flex gap-2.5 max-w-[85%] md:max-w-[65%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}
                  style={{ marginTop: prevSameSender ? "3px" : "14px" }}
                >
                  {!prevSameSender ? (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
                      style={{
                        background: isLecturer ? "#1B1D3A" : isSelf ? "#5B4EFF" : "#E4E3DB",
                        color: isLecturer || isSelf ? "#F2F1EA" : "#5B5D7A",
                      }}
                    >
                      {(msg.sender?.full_name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 shrink-0" />
                  )}

                  <div className={`min-w-0 ${isSelf ? "items-end" : "items-start"} flex flex-col`}>
                    {!prevSameSender && (
                      <div className={`flex items-center gap-1.5 mb-1 ${isSelf ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-medium" style={{ color: "#3D3E5C" }}>
                          {isSelf ? "You" : msg.sender?.full_name || "Unknown"}
                        </span>
                        {isLecturer && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#EAF6D2", color: "#4C7A0F" }}>
                            Lecturer
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className="px-3.5 py-2.5 text-sm"
                      style={{
                        background: isSelf ? "#1B1D3A" : "#fff",
                        color: isSelf ? "#F2F1EA" : "#1B1D3A",
                        border: isSelf ? "none" : "1px solid #E4E3DB",
                        borderRadius: isSelf ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      }}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] mt-1" style={{ color: "#C4C4D2" }}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

        {!loading && !loadError && messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#6B6C87" }}>
              No messages yet — say hello to get the conversation started.
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <form onSubmit={handleSend} className="flex items-center gap-2.5 px-4 md:px-8 py-3.5 shrink-0" style={{ borderTop: "1px solid #E4E3DB", background: "#FAFAF7" }}>
        <div className="relative flex-1">
          <MessageCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9FA0B8" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={courseMeta ? `Message ${courseMeta.code}…` : "Message…"}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
          />
        </div>
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="Send message"
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition"
          style={{
            background: draft.trim() && !sending ? "#1B1D3A" : "#E4E3DB",
            color: draft.trim() && !sending ? "#F2F1EA" : "#9FA0B8",
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}