import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { RegisterInput } from "../model/auth.types";
import { registerApi } from "../lib/api";
import { registerSchema } from "../model/register.schema";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      organizationId: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setSuccess(null);

    try {
      await registerApi(data);
      setSuccess(
        "Аккаунт успішно створений! Перенаправляємо на сторінку входу..."
      );
      reset();
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Не вдалося підключитися до сервера");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm text-gray-900
    placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100
    ${
      errors.email
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
    }`}
            placeholder="email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Ім&apos;я
            </label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm text-gray-900
                    placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100
                    ${
                      errors.firstName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
              placeholder="Олександр"
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Прізвище
            </label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm text-gray-900
                    placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100
                    ${
                      errors.lastName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
              placeholder="Петренко"
              disabled={isSubmitting}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm pr-10 text-gray-900
                placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Пітвердження пароля
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm text-gray-900
                  placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="organizationId"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            ID організації (якщо є запрошення)
          </label>
          <input
            id="organizationId"
            type="text"
            {...register("organizationId")}
            className={`block w-full rounded-md border px-3 py-2 shadow-sm sm:text-sm text-gray-900
                  placeholder:text-gray-400 placeholder:font-medium placeholder:opacity-100 ${
                    errors.organizationId
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            disabled={isSubmitting}
          />
          {errors.organizationId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.organizationId.message}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0"></div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Помилка</h3>
              <div className="mt-2 text-sm text-red-700">{serverError}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="shrink-0"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Реєстрація...
            </span>
          ) : (
            "Зареєструватися"
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Вже є акаунт?{" "}
        <a
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Увійти
        </a>
      </div>
    </form>
  );
}
