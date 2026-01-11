import { NextResponse } from "next/server";
import { registerUser } from "@/features/auth/lib/register";
import { handleApiError } from "@/shared/api/handle-api-error";
import { registerSchema } from "@/features/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = registerSchema.parse(body);
    const user = await registerUser(parsedBody);
    return NextResponse.json(
      { userId: user.id, message: "Account created" },
      { status: 201 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
