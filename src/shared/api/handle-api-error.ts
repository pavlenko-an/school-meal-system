import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/shared/errors/domain-error";
import { ApiResponse } from "./api-response";

export function handleApiError(error: unknown) {
  let status = 500;
  let response: ApiResponse<null> = { error: "Internal server error" };

  if (error instanceof DomainError) {
    status = error.statusCode;
    response = { error: error.message };
  } else if (error instanceof ZodError) {
    status = 400;
    const formattedIssues: Record<string, any> = {};
    error.issues.forEach((issue) => {
      if (!formattedIssues[issue.path.join(".")]) {
        formattedIssues[issue.path.join(".")] = [];
      }
      formattedIssues[issue.path.join(".")].push(issue.message);
    });

    response = {
      message: "Validation error",
      error: formattedIssues,
    };
  } else if (error instanceof Error) {
    response = { error: error.message };
  } else {
    response = { error: "Unknown error" };
  }

  console.error(error);

  return NextResponse.json(response, { status });
}
