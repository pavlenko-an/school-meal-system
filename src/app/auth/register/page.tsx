"use client";

import RegisterForm from "@/features/auth/ui/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign up
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Create a new account
      </p>
      <RegisterForm />
    </>
  );
}
