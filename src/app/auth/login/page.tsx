"use client";

import LoginForm from "@/features/auth/ui/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
        Вхід до акаунту
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Введіть свої облікові дані для доступу до акаунту
      </p>

      <LoginForm />
    </>
  );
}
