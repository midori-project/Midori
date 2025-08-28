"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerAction, State } from "@/app/signup/action";
import { RegisterSchema } from "@/schemas/auth/register";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterFormClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const data: RegisterFormData = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      password: (formData.get("password") as string) || "",
    };

    // Client-side validation
    const validation = RegisterSchema.safeParse(data);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field && typeof field === "string") {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Use server action instead of authService
      const result = await registerAction({ ok: true }, formData);
      
      if (result.ok) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        
        // Redirect to login page after success
        setTimeout(() => {
          router.push("/login?message=Registration successful. Please check your email to verify your account.");
        }, 1200);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      // Server action errors are handled in the result
      // This catch block is for unexpected errors
      setError("An unexpected error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="shadow-xl rounded-xl border border-gray-100 p-4">
        {/* Header (Figma style) */}
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/img/logo.png"
            alt="Midori logo"
            width={72}
            height={72}
            className="rounded-full"
          />

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign up</h1>
          <p className="text-sm text-gray-600">Create your Midori account</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-emerald-500 mr-1 text-sm">✅</span>
              <span className="text-xs text-emerald-700">{success}</span>
            </div>
          </div>
        )}

        {/* OAuth Buttons (Figma style) */}
        <div className="space-y-3 mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            disabled={isLoading}
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {error && (
            <div
              className="p-2 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <div className="flex items-center">
                <span className="text-red-500 mr-1 text-sm">⚠️</span>
                <span className="text-xs text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              disabled={isLoading}
              className={`w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                fieldErrors.name
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
              placeholder="Your name"
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              disabled={isLoading}
              className={`w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                fieldErrors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              disabled={isLoading}
              className={`w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                fieldErrors.password
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
              }`}
              placeholder="At least 8 characters"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow text-sm font-medium text-gray-900 bg-emerald-200 hover:bg-emerald-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing up...
              </div>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
