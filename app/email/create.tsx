"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { options } from "./constants";
import { Label } from "@/components/ui/label";

// 1. Create invoice
// | hash npub, duration into invoice
// | send back to client
// 2. Client pays invoice
// 3. Poll Invoice hash from client
// | provide preimage, invoice, hash
// | check hash from server side
// 4. Create email

export default function CreateEmail() {
  const [duration, setDuration] = useState<keyof typeof options>("10mins");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const createEmail = async (pr: string) => {
    const res = await fetch("/email", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        pr,
      }),
    }).then((r) => r.json());

    if (res.success) {
      window.location.reload();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: res.message,
        duration: 1500
      })
    }
  };

  const prepayInvoice = async () => {
    setLoading(true);
    const res = await fetch("/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        duration: duration,
      }),
    }).then((r) => r.json());

    if (res?.pr) {
      if (typeof window.webln !== "undefined") {
        try {
          await window.webln.enable();
          await window.webln.sendPayment(res.pr);
          await createEmail(res.pr);
        } catch (err) {
          setLoading(false);
          console.log(err);
          toast({
            title: "Error",
            description: (err as any).message,
            duration: 1500,
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-2 items-center justify-center">
          <img src="/logo.svg" width="32" height="32" alt="Icarus Logo" />
          <h1 className="font-bold text-3xl">Icarus</h1>
        </div>
        <h2 className="text-muted-foreground italic">Temporary Email Burner</h2>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="duration">Duration</Label>
        <p className="text-xs text-muted-foreground">Emails only last for a temporary period of time</p>
        <Select
          name="duration"
          value={duration}
          onValueChange={(dur) => setDuration(dur as keyof typeof options)}
        >
          <SelectTrigger id="duration">
            <SelectValue placeholder="Expiry Duration" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([key, value], i) => (
              <SelectItem key={i} value={key}>
                <div className="flex gap-2 items-center w-full">
                  <span>{value.label}</span>
                  <span>-</span>
                  <span className="text-muted-foreground text-xs">{value.price} sats</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={prepayInvoice} disabled={loading}>Create</Button>
    </div>
  );
}
