"use client";

import RegisterForm from "@/features/auth/ui/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
        Реєстрація
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Створіть новий акаунт
      </p>
      <RegisterForm />
    </>
  );
}
