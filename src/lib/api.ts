import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof Response) {
    return new NextResponse(error.statusText || "Request failed", { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request", issues: error.flatten() }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

export function assertSupabase<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    throw new Error("Supabase returned no data.");
  }

  return data;
}

export function assertSupabaseSuccess(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}
