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
      // Keep localStorage for the Axios interceptor (api.ts)
      localStorage.setItem("auth-storage", authPayload);
      // Also set a cookie so the server-side middleware can guard routes
      document.cookie = `auth-storage=${encodeURIComponent(authPayload)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      router.push("/tasks");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-800">Task Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to continue</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6 space-y-4"
        >
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              placeholder="demo@vairad.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium bg-zinc-800 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <div className="text-center text-xs text-zinc-400">
            Demo: demo@vairad.com / DemoPass123!
          </div>
        </form>
      </div>
    </div>
  );
}
