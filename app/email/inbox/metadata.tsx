"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlarmClock, Copy } from "lucide-react";
import { InboxDto } from "mailslurp-client";
import { useEffect } from "react";
import Countdown from "react-countdown";

function ReloadPage() {
  useEffect(() => {
    window.location.reload();
  }, []);

  return <></>;
}

export default function InboxMeta({ inbox }: { inbox: InboxDto }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Your Email</Label>
        <div className="flex gap-2 justify-between bg-secondary rounded-lg py-2 px-3 items-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-sm break-all">
              {inbox.emailAddress.split("@")[0]}
            </span>
            <span className="text-muted-foreground text-sm break-all text-slate-400 dark:text-slate-500/[.85]">
              @{inbox.emailAddress.split("@")[1]}
            </span>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground basis-0 shrink-0 grow-0 w-6 h-6 p-1"
            onClick={() => {
              window.navigator.clipboard
                .writeText(inbox.emailAddress)
                .then(() => {
                  toast({
                    description: "Copied to clipboard",
                    duration: 1000,
                  });
                });
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {inbox.expiresAt ? (
        <div className="flex gap-1 text-sm text-muted-foreground items-center justify-center">
          <AlarmClock className="w-4 h-4" />
          <span>Expires in</span>
          <Countdown date={new Date(inbox.expiresAt)}>
            <ReloadPage />
          </Countdown>
        </div>
      ) : null}
    </div>
  );
}
