"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { useEffect, useRef, useState } from "react";
import "./globals.css";
import { NostrNdkContext } from "./state";
import setNpub from './actions/setNpub';

const RELAYS = ["wss://relay.snort.social", "wss://nos.lol"];

export default function WeblnNostrWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowNostrPubkey, setWindowNostrPubkey] = useState<
    "pending" | string | false
  >("pending");
  const [windowWeblnEnabled, setWindowWeblnEnabled] = useState<
    boolean | "pending"
  >("pending");
  const [ndk, setNdk] = useState<NDK | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Connect to Nostr and load websocket connection
  useEffect(() => {
    async function connectNostr() {
      try {
        const signer = new NDKNip07Signer();
        const _ndk = new NDK({
          explicitRelayUrls: RELAYS,
          signer,
        });

        _ndk.pool.on("relay:connect", async (r: any) => {
          console.log(`Connected to a relay ${r.url}`);
        });

        _ndk.connect(2500);

        const user = await signer.user();

        if (user.npub) {
          setWindowNostrPubkey(user.npub);
        }

        setNdk(_ndk);
      } catch (err) {
        console.log(err);
        setWindowNostrPubkey(false);
      }
    }
    async function enableWebln() {
      try {
        if (typeof window.webln !== "undefined") {
          await window.webln.enable();
          setWindowWeblnEnabled(true);
        } else {
          setWindowWeblnEnabled(false);
        }
      } catch (err) {
        console.log(err);
        setWindowWeblnEnabled(false);
      }
    }

    connectNostr();
    enableWebln();
  }, []);

  useEffect(() => {
    if (
      windowNostrPubkey &&
      windowNostrPubkey !== "pending" &&
      formRef.current
    ) {
      const cookies = Object.fromEntries(
        document.cookie.split("; ").map((x) => x.split("=")),
      );
      if (!cookies.npub) {
        formRef.current.submit();
        console.log("Submitted");
      }
    }
  }, [windowNostrPubkey, formRef]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NostrNdkContext.Provider value={ndk}>
        <main className="flex min-h-screen flex-col">
          <div className="flex justify-center grow">
            <div className="flex flex-col justify-center w-full max-w-3xl">
              {windowNostrPubkey === "pending" ||
              typeof windowWeblnEnabled === "string" ? (
                <div className="flex flex-col gap-4 min-w-[280px] self-center justify-self-center">
                  <Skeleton className="w-full rounded-lg h-[20px]" />
                  <Skeleton className="w-full rounded-lg h-[20px]" />
                  <Skeleton className="w-full rounded-lg h-[20px]" />
                </div>
              ) : (
                <>
                  {windowNostrPubkey && windowWeblnEnabled ? (
                    <div className="flex flex-col max-w-3xl w-full grow md:p-4">
                      {children}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {windowNostrPubkey && !windowWeblnEnabled
                        ? null
                        : "nostr not enabled"}
                      {windowWeblnEnabled && !windowNostrPubkey
                        ? null
                        : "webln not enabled"}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        <Toaster />
        <ModeToggle />
      </NostrNdkContext.Provider>

      <form action={setNpub} onSubmit={(e) => e.preventDefault()} ref={formRef}>
        <input type="hidden" name="npub" value={windowNostrPubkey || ""} />
      </form>
    </ThemeProvider>
  );
}
