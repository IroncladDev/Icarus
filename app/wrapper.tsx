"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import "./globals.css";
import {
  NostrNdkContext,
} from "./state";

const RELAYS = ["wss://relay.snort.social", "wss://nos.lol"];

export default function WeblnNostrWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowNostrEnabled, setWindowNostrEnabled] = useState<
    boolean | "pending"
  >("pending");
  const [windowWeblnEnabled, setWindowWeblnEnabled] = useState<
    boolean | "pending"
  >("pending");
  const [ndk, setNdk] = useState<NDK | null>(null);

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
          setWindowNostrEnabled(true);
        }

        setNdk(_ndk);
      } catch (err) {
        console.log(err);
        setWindowNostrEnabled(false);
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

  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <NostrNdkContext.Provider value={ndk}>
      <main className="flex min-h-screen flex-col">
        <div className="flex flex-row gap-2 justify-between px-4 py-2 border-b border-border items-center">
          <div className="flex gap-2 items-center">
            <img
              src="/logo-dark.svg"
              width={32}
              height={32}
              className="dark:block hidden"
            />
            <img
              src="/logo-light.svg"
              width={32}
              height={32}
              className="block dark:hidden"
            />
            <span className="text-3xl font-semibold">
              Icarus
            </span>
          </div>

          <ModeToggle />
        </div>

        <div className="flex justify-center grow">
          <div className="flex flex-col justify-center w-full max-w-3xl">
            {typeof windowNostrEnabled === "string" ||
              typeof windowWeblnEnabled === "string" ? (
              <div className="flex flex-col gap-4 min-w-[280px] self-center justify-self-center">
                <Skeleton className="w-full rounded-lg h-[20px]" />
                <Skeleton className="w-full rounded-lg h-[20px]" />
                <Skeleton className="w-full rounded-lg h-[20px]" />
              </div>
            ) : (
              <>
                {windowNostrEnabled && windowWeblnEnabled ? (
                  <div className="flex flex-col max-w-3xl w-full grow md:p-4">
                    {children}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {windowNostrEnabled &&
                      !windowWeblnEnabled ? null : (
                      "nostr not enabled"
                    )}
                    {windowWeblnEnabled &&
                      !windowNostrEnabled ? null : (
                      "webln not enabled"
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </NostrNdkContext.Provider>
  </ThemeProvider>
}
