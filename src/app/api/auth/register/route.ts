import { NextResponse } from "next/server";
import { handleApiError } from "@/shared/api/handle-api-error";
import { authOptions, registerUser, registerSchema } from "@/features/auth";
import { getServerSession } from "next-auth";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { ApiResponse } from "@/shared/api/api-response";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session) throw new AccessDeniedError("Already logged in");
    const body = await req.json();
    const parsedBody = registerSchema.parse(body);
    await registerUser(parsedBody);
    const response: ApiResponse<null> = {
      message: "Account created successfully",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
