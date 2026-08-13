import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, MessageCircle, ArrowRight } from "lucide-react";

const COURSE_TAGS = ["COMP301", "chat", "MATH210", "assignments", "BIOL110", "office hrs"];

export default function LoginScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isUniEmail = (email) => {
    const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return email.includes("@") && domain.includes(".") && !freeProviders.includes(domain);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && form.name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Enter your university email.");
      return;
    }
    if (!isUniEmail(form.email.trim())) {
      setError("Use your university email address, not a personal one.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        @keyframes drawUnderline {
          from { stroke-dashoffset: 340; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes drift {
          0% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }
        .underline-path {
          stroke-dasharray: 340;
          stroke-dashoffset: 340;
          animation: drawUnderline 0.9s 0.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .dot { animation: bounce 1.2s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        .float-tag { animation: drift 6s ease-in-out infinite; }
      `}</style>

      {/* LEFT: brand panel */}
      <div
        className="md:w-1/2 relative overflow-hidden flex flex-col justify-between px-8 py-10 md:px-14 md:py-14"
        style={{ background: "#1B1D3A", color: "#F2F1EA", minHeight: "360px" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
            style={{ background: "#C9F158", color: "#1B1D3A" }}
          >
            C
          </div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Get Studious
          </span>
        </div>

        <div className="my-10 md:my-0">
          <h1
            className="text-3xl md:text-[2.6rem] leading-tight font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Stop losing messages
            <br />
            in{" "}
            <span className="relative inline-block">
              email
              <svg
                className="absolute left-0 -bottom-1 w-full"
                height="10"
                viewBox="0 0 170 10"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="underline-path"
                  d="M2 7 C 40 2, 130 2, 168 7"
                  fill="none"
                  stroke="#C9F158"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-sm text-sm md:text-base" style={{ color: "#B4B4CC" }}>
            One place for your course spaces and lecturer chat — built by students, for students.
          </p>

          {/* chat bubble mock */}
          <div
            className="mt-8 inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-sm"
            style={{ background: "#2A2C54" }}
          >
            <span className="text-xs" style={{ color: "#D8D8E8" }}>
              Dr. Adeyemi is typing
            </span>
            <span className="flex gap-1">
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: "#C9F158" }} />
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: "#C9F158" }} />
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: "#C9F158" }} />
            </span>
          </div>
        </div>

        {/* floating course tags */}
        <div className="hidden md:flex flex-wrap gap-2 max-w-sm">
          {COURSE_TAGS.map((tag, i) => (
            <span
              key={tag}
              className="float-tag px-3 py-1.5 rounded-full text-xs"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: "rgba(201,241,88,0.08)",
                border: "1px solid rgba(201,241,88,0.35)",
                color: "#C9F158",
                animationDelay: `${i * 0.4}s`,
              }}
            >
              {tag.includes(" ") || tag === "chat" || tag === "assignments" || tag === "office hrs" ? (
                <MessageCircle size={11} className="inline mr-1 -mt-0.5" />
              ) : null}
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT: form panel */}
      <div
        className="md:w-1/2 flex items-center justify-center px-6 py-12 md:px-14"
        style={{ background: "#FAFAF7" }}
      >
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center py-16">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ background: "#EAF6D2" }}
              >
                <MessageCircle size={22} color="#4C7A0F" />
              </div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}>
                {mode === "signup" ? "Account created" : "Welcome back"}
              </h2>
              <p className="text-sm" style={{ color: "#6B6C87" }}>
                {mode === "signup" ? "You can now join your course spaces." : "Redirecting you to your course spaces."}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", password: "" });
                }}
                className="mt-6 text-sm underline"
                style={{ color: "#5B4EFF" }}
              >
                Back to form
              </button>
            </div>
          ) : (
            <>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: "#1B1D3A", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {mode === "login" ? "Log in" : "Create your account"}
              </h2>
              <p className="text-sm mb-7" style={{ color: "#6B6C87" }}>
                {mode === "login"
                  ? "Use your university email to continue."
                  : "Sign up with your university email — it's free."}
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {mode === "signup" && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#3D3E5C" }}>
                      Full name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9FA0B8" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Amara Okafor"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition"
                        style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
                        onFocus={(e) => (e.target.style.borderColor = "#5B4EFF")}
                        onBlur={(e) => (e.target.style.borderColor = "#E4E3DB")}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#3D3E5C" }}>
                    University email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9FA0B8" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@university.edu"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition"
                      style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#5B4EFF")}
                      onBlur={(e) => (e.target.style.borderColor = "#E4E3DB")}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#3D3E5C" }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9FA0B8" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none transition"
                      style={{ border: "1px solid #E4E3DB", background: "#fff", color: "#1B1D3A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#5B4EFF")}
                      onBlur={(e) => (e.target.style.borderColor = "#E4E3DB")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} color="#9FA0B8" /> : <Eye size={16} color="#9FA0B8" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs mt-2 mb-1" style={{ color: "#C23B3B" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition"
                  style={{ background: "#1B1D3A", color: "#F2F1EA" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2A2C54")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#1B1D3A")}
                >
                  {mode === "login" ? "Log in" : "Create account"}
                  <ArrowRight size={15} />
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "#6B6C87" }}>
                {mode === "login" ? "New here? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                  }}
                  className="font-medium underline"
                  style={{ color: "#5B4EFF" }}
                >
                  {mode === "login" ? "Create an account" : "Log in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
