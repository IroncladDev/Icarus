"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Email, EmailPreview, InboxDto } from "mailslurp-client";
import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";

const formatDistanceShort = (date: Date) => {
  const distanceInMs = Date.now() - date.getTime();
  const seconds = Math.round(distanceInMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (seconds < 60) {
    return seconds + "s";
  } else if (minutes < 60) {
    return minutes + "m";
  } else if (hours < 24) {
    return hours + "h";
  } else {
    return days + "d";
  }
};

function Email({
  email,
  inbox,
  refetch,
}: {
  email: EmailPreview;
  inbox: InboxDto;
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedEmail, setLoadedEmail] = useState<Email | null>(null);

  const { toast } = useToast();

  const distance = formatDistanceShort(new Date(email.createdAt));

  const fetchEmail = async () => {
    setLoading(true);
    const res = await fetch("/email/read?email=" + email.id).then((r) =>
      r.json(),
    );

    setLoading(false);
    if (res.success) {
      console.log(res.data);
      setLoadedEmail(res.data);
    } else {
      toast({
        title: "Error",
        description: res.message,
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmail();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          refetch();
        }
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <div
          className={`flex gap-2 p-2 items-center ${
            email.read
              ? ""
              : "bg-muted hover:bg-slate-300 hover:dark:bg-slate-700"
          } hover:bg-muted transition-colors cursor-pointer`}
        >
          {email.from ? (
            <span className="shrink-0 basis-0 text-muted-foreground text-xs">
              {email.from?.split("@")[0]}
            </span>
          ) : null}
          <span className="text-xs">-</span>
          <span className="text-xs truncate grow">{email.subject}</span>
          <span className="text-xs text-muted-foreground">{distance}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>{email.subject}</DialogTitle>
          <DialogDescription className="flex flex-col gap-0.5">
            <span>From: {email.from}</span>
            <span>
              To:{" "}
              {email.to
                ?.map((x) => (x === inbox.emailAddress ? "You" : x))
                .join(", ")}
            </span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-4 rounded" />
            <div className="flex gap-4">
              <Skeleton className="h-4 rounded basis-1/3" />
              <Skeleton className="h-4 rounded basis-2/3" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 rounded basis-1/2" />
              <Skeleton className="h-4 rounded basis-1/2" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 rounded basis-2/3" />
              <Skeleton className="h-4 rounded basis-1/3" />
            </div>
          </div>
        ) : (
          <div className="flex gap-2 text-sm py-2 border-t markup">
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(loadedEmail?.body || ""),
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function InboxEmails({ inbox }: { inbox: InboxDto }) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Array<EmailPreview>>([]);

  const { toast } = useToast();

  const refetchEmails = () => {
    setLoading(true);
    fetch("/email")
      .then((r) => r.json())
      .then((res) => {
        setLoading(false);
        if (res.success) {
          setEmails(res.data.reverse());
        } else {
          toast({
            title: "Error",
            description: res.message,
          });
        }
      });
  };

  useEffect(() => {
    refetchEmails();
    window.addEventListener("focus", refetchEmails);

    return () => {
      window.removeEventListener("focus", refetchEmails);
    };
  }, []);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-2 border-b rounded-t-lg p-2 justify-between">
        <span className="text-base font-semibold">Inbox</span>
        <Button className="w-6 h-6 p-1" variant="ghost" onClick={refetchEmails}>
          <RefreshCw
            className={
              "w-4 h-4" + (loading ? " animate-spin text-muted-foreground" : "")
            }
          />
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {emails.map((email, i) => (
          <Email refetch={refetchEmails} email={email} inbox={inbox} key={i} />
        ))}

        {!loading && emails.length === 0 ? (
          <div className="p-4 flex flex-col gap-2 items-center">
            <span className="font-semibold text-lg">
              There&apos;s nothing here
            </span>
            <span className="text-muted-foreground text-sm text-center">
              When you receive mail,
              <br />
              it will appear here
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
