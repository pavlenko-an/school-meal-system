import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/shared/errors/domain-error";

export function handleApiError(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validation error",
        issues: error.issues,
      },
      { status: 400 }
    );
  }

  console.error(error);

  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}
