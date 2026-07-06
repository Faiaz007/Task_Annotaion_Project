"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login/", { email, password });
      const authPayload = JSON.stringify({
        state: {
          accessToken: data.access,
          refreshToken: data.refresh,
        },
      });
      localStorage.setItem("auth-storage", authPayload);
      document.cookie = `auth-storage=${encodeURIComponent(authPayload)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      router.push("/tasks");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || "Invalid credentials");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(79,142,247,0.4) 0%, rgba(167,139,250,0.2) 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(34,211,238,0.5) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm mx-4 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #4f8ef7, #a78bfa)" }}>
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to your TaskFlow workspace
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@vairad.com"
              className="input-dark"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-dark"
                style={{ paddingRight: "44px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-muted)" }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ padding: "12px 20px", fontSize: "14px" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <div
            className="text-center text-xs pt-2 pb-1 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-muted)" }}
          >
            Demo: <span style={{ color: "var(--text-secondary)" }}>demo@vairad.com</span> / <span style={{ color: "var(--text-secondary)" }}>DemoPass123!</span>
          </div>
        </form>
      </div>
    </div>
  );
}
