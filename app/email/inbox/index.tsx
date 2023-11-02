import { Button } from "@/components/ui/button";
import { kv } from "@vercel/kv";
import { InboxDto } from "mailslurp-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mailslurp } from "../route";
import InboxEmails from "./emails";
import InboxMeta from "./metadata";

export default async function EmailInbox({ inbox }: { inbox: InboxDto }) {
  const destroy = async () => {
    "use server";
    const npub = cookies().get("npub");

    if (npub) {
      const inbox: InboxDto | null = await kv.get("email-" + npub.value);

      if (inbox) {
        mailslurp.deleteInbox(inbox.id);
      }

      await kv.set("email-" + npub.value, "");
    }

    redirect("/");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <InboxMeta inbox={inbox} />

      <InboxEmails inbox={inbox} />

      <form action={destroy}>
        <Button
          variant="outline"
          className="text-muted-foreground"
          type="submit"
        >
          Delete Inbox
        </Button>
      </form>
    </div>
  );
}
