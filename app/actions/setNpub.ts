"use server";

import { cookies } from "next/headers";

export default async function setNpub(formData: FormData) {
  const npub = formData.get("npub");

  if (npub) {
    cookies().set("npub", npub as string);
  }
}