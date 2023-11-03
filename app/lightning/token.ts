import { kv } from "@vercel/kv";

function generateAuthorization() {
  const encodedCredentials = Buffer.from(
    `${process.env.AB_CLIENT_ID}:${process.env.AB_CLIENT_SECRET}`,
  ).toString("base64");
  return `Basic ${encodedCredentials}`;
}

export const getTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const token = await kv.get("accessToken");
  const refresh = await kv.get("refreshToken");

  if (!token && !refresh) {
    await kv.set("accessToken", process.env.AB_ACCESS_TOKEN);
    await kv.set("refreshToken", process.env.AB_REFRESH_TOKEN);
    return {
      accessToken: process.env.AB_ACCESS_TOKEN!,
      refreshToken: process.env.AB_REFRESH_TOKEN!,
    };
  }

  return {
    accessToken: token as string,
    refreshToken: refresh as string,
  };
};

export const refreshTokens = async () => {
  const token = await kv.get("accessToken");
  const refresh = await kv.get("refreshToken");

  if (token && refresh) {
    const res = await fetch(
      `https://api.getalby.com/oauth/token?refresh_token=${refresh}&grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          Authorization: generateAuthorization(),
          accept: "application/json",
        },
      },
    ).then((r) => r.json());

    if ("access_token" in res && "refresh_token" in res) {
      await kv.set("accessToken", res.access_token);
      await kv.set("refreshToken", res.refresh_token);
    } else {
      throw new Error("Failed to refresh tokens, invalid response from Alby");
    }
  } else {
    throw new Error("No tokens found");
  }
};
