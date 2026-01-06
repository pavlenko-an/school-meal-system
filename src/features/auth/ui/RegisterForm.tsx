import { useRouter } from "next/navigation";
import { useState } from "react";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return "Password must contain uppercase, lowercase and digit";
        return undefined;

      case "confirmPassword":
        if (!value) return "Confirm password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
      ...(name === "password"
        ? {
            confirmPassword: validateField(
              "confirmPassword",
              formData.confirmPassword
            ),
          }
        : {}),
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const newErrors: FieldErrors = {};
    (["email", "password", "confirmPassword"] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        setServerError(data.message || "Error during registration");
      } else {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch (err) {
      setServerError("Error connecting to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some((e) => e);

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
            placeholder="email@example.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="rounded-md w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="John"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="rounded-md w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Smith"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Password (minimum 8 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-md w-full px-3 py-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
            placeholder="your_password"
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-md w-full px-3 py-2 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
            placeholder="your_password"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{serverError}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || hasErrors}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          ) : (
            "Sign Up"
          )}
        </button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <a
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </a>
      </div>
    </form>
  );
}
