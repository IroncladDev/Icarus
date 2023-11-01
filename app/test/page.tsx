import { kv } from "@vercel/kv";

export default function Page() {
  async function create() {
    'use server';
    await kv.set("user_1_session", "session_token_value");
    const session = await kv.get("user_1_session");
    console.log(session, "LOG THING")
  }

  return (
    <form action={create}>
      <input type="text" name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}