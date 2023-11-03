import { kv } from "@vercel/kv";
import MailSlurp, {
  CreateInboxDtoInboxTypeEnum,
  InboxDto,
} from "mailslurp-client";
import { cookies } from "next/headers";
import { NextRequest as Request, NextResponse as Response } from "next/server";
import createInvoice from "../lightning/createInvoice";
import decodeInvoice from "../lightning/devodeInvoice";
import { options } from "./constants";

if (!process.env.MAILSLURP_API_KEY) {
  throw new Error("Missing Mailslurp API key");
}

export const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  const npub = cookies().get("npub");

  if (!npub?.value) {
    return Response.json({
      success: false,
      message: "Invalid npub",
    });
  }

  const option = options[body.duration as keyof typeof options];

  if (option) {
    const invoice = await createInvoice({
      amount: option.price,
      description: JSON.stringify({
        npub: npub.value,
        option,
        timeStamp: Date.now(),
      }),
    });

    return Response.json({
      success: true,
      pr: invoice.payment_request,
    });
  } else {
    return Response.json({
      success: false,
      message: "Invalid duration option",
    });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();

  const npub = cookies().get("npub");

  if (!npub?.value) {
    return Response.json({
      success: false,
      message: "Invalid npub",
    });
  }

  if (body?.pr && typeof body.pr === "string") {
    try {
      const decoded = decodeInvoice(body.pr);

      if (decoded) {
        const { npub: decodedNpub, option, timeStamp } = decoded;
        if (Math.abs(Date.now() - timeStamp) >= 60000) {
          throw new Error("Payment timed out, please try again");
        }

        if (npub.value !== decodedNpub) {
          throw new Error("Invalid npub");
        }

        const inbox = await mailslurp.createInboxWithOptions({
          useDomainPool: true,
          expiresIn: option.duration,
          inboxType: CreateInboxDtoInboxTypeEnum.HTTP_INBOX,
          useShortAddress: true,
        });

        await kv.set("email-" + npub.value, inbox);

        return Response.json({
          success: true,
        });
      }
    } catch (err) {
      console.log(err);
      return Response.json({
        success: false,
        message: (err as any).message,
      });
    }
  }
}

export async function GET() {
  const npub = cookies().get("npub");

  if (!npub?.value) {
    return Response.json({
      success: false,
      message: "Invalid npub",
    });
  }

  const inbox: InboxDto | null | undefined = await kv.get(
    "email-" + npub.value,
  );

  if (inbox) {
    try {
      const emails = await mailslurp.getEmails(inbox.id, {
        limit: 100,
      });

      if (Array.isArray(emails)) {
        return Response.json({
          success: true,
          data: emails,
        });
      } else {
        return Response.json({
          success: false,
          message: "Invalid response",
        });
      }
    } catch (err) {
      console.log(err);
      return Response.json({
        success: false,
        message: "Could not find inbox",
      });
    }
  } else {
    return Response.json({
      success: false,
      message: "Could not find inbox",
    });
  }
}
