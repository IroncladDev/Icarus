import NDK from "@nostr-dev-kit/ndk";
import { createContext } from "react";

export const NostrNdkContext = createContext<NDK | null>(null);
