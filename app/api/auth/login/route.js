import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signJwt } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, data.password_hash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJwt({ uid: data.id, email: data.email });

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
