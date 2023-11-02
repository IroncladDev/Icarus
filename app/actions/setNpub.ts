"use server";

import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

export default async function setNpub(formData: FormData) {
  const npub = formData.get("npub");

  if (npub) {
    cookies().set("npub", npub as string);
  }

  redirect("/")
}