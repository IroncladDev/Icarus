import { cookies } from "next/headers";
import { NextRequest as Request, NextResponse as Response } from "next/server";
import { mailslurp } from "../route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const emailId = searchParams.get("email");

  if (!emailId || typeof emailId !== "string") {
    return Response.json({
      success: false,
      message: "email query search param required",
    });
  }

  const npub = cookies().get("npub");

  if (!npub?.value) {
    return Response.json({
      success: false,
      message: "Invalid npub",
    });
  }

  const email = await mailslurp.getEmail(emailId);

  if (email) {
    return Response.json({
      success: true,
      data: email,
    });
  } else {
    return Response.json({
      success: false,
      message: "Could not find email",
    });
  }
}
