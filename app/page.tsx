import { kv } from "@vercel/kv";
import { InboxDto } from "mailslurp-client";
import { cookies } from "next/headers";
import CreateEmail from "./email/create";
import EmailInbox from "./email/inbox";
import { mailslurp } from "./email/route";
import WeblnNostrWrapper from "./wrapper";

export default async function Index() {
  const npub = cookies().get("npub");

  let inbox: InboxDto | undefined | null;

  inbox = npub ? await kv.get("email-" + npub.value) : undefined;

  if (
    npub &&
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
      {npub ? (
        <div className="flex flex-row justify-center grow">
          <div className="flex flex-col gap-4 max-w-sm grow justify-center">
            {inbox ? <EmailInbox inbox={inbox} /> : <CreateEmail />}
          </div>
        </div>
      ) : null}
    </WeblnNostrWrapper>
  );
}
