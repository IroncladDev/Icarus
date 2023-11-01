import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeblnNostrWrapper from "./wrapper";
import { kv } from "@vercel/kv";
import { Button } from "@/components/ui/button";

export default function Index() {
  return <WeblnNostrWrapper>
    <div className="flex flex-row justify-center">
      <div className="flex flex-col gap-4 max-w-sm grow">
        <span className="text-xl italic font-italic text-muted-foreground grow text-center">Bitcoin for Burners</span>

        <Tabs defaultValue="phone" className="grow w-full">
          <TabsList className="w-full">
            <TabsTrigger value="phone" className="grow basis-0">Phone</TabsTrigger>
            <TabsTrigger value="email" className="grow basis-0">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="phone">
            <Button onClick={async () => {
              "use server";
              await kv.set("user_1_session", "session_token_value");
              const session = await kv.get("user_1_session");
              console.log(session);
            }}>Click</Button>
          </TabsContent>
          <TabsContent value="email">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  </WeblnNostrWrapper>;
}
