"use client";

import LoginForm from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your credentials to access your account
      </p>

      <LoginForm />
    </>
  );
}
