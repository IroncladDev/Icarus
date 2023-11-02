import WeblnNostrWrapper from "./wrapper";
import { kv } from "@vercel/kv";
import { InboxDto } from "mailslurp-client";
import { cookies } from "next/headers";
import CreateEmail from "./email/create";
import EmailInbox from "./email/inbox";
import { mailslurp } from "./email/route";

export const metadata = {
  title: "Icarus",
  description: "Bitcoin email burner",
};

export default async function Index() {
  const npub = cookies().get("npub");

  if (!npub?.value) {
    return null;
  }

  let inbox: InboxDto | undefined | null;

  inbox = await kv.get("email-" + npub.value);

  if (
    inbox &&
    inbox.expiresAt &&
    Date.now() >= new Date(inbox.expiresAt).getTime()
  ) {
    mailslurp.deleteInbox(inbox.id);
    await kv.set("email-" + npub.value, "");
    inbox = undefined;
  }
  
  return (
    <WeblnNostrWrapper>
      <div className="flex flex-row justify-center grow">
        <div className="flex flex-col gap-4 max-w-sm grow justify-center">
          {inbox ? <EmailInbox inbox={inbox} /> : <CreateEmail />}
        </div>
      </div>
    </WeblnNostrWrapper>
  );
}
