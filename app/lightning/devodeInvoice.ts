// @ts-expect-error no types :'(
import { decode } from "light-bolt11-decoder";

interface Section {
  name: string;
  tag?: string;
  letters: string;
  value: Record<string, number | string> | number | string;
}

interface DecodedInvoice {
  paymentRequest: string;
  sections: Array<Section>;
  expiry: any;
  route_hints: any;
}

export default function decodeInvoice(paymentRequest: string): {
  npub: string;
  option: {
    price: number;
    duration: number;
    label: string;
  };
  timeStamp: number;
} {
  const decoded: DecodedInvoice = decode(paymentRequest);

  if (decoded) {
    const description = decoded.sections.find((x) => x.name === "description");

    if (description && typeof description.value === "string") {
      try {
        const json = JSON.parse(description.value);

        if (
          "npub" in json &&
          "option" in json &&
          typeof json.npub === "string" &&
          typeof json.option === "object" &&
          "duration" in json.option &&
          "price" in json.option &&
          "label" in json.option &&
          typeof json.option.duration === "number" &&
          typeof json.option.price === "number" &&
          typeof json.option.label === "string" &&
          "timeStamp" in json &&
          typeof json.timeStamp === "number"
        ) {
          return json;
        } else {
          throw new Error("Invalid invoice description");
        }
      } catch (err) {
        throw new Error("Invalid invoice description");
      }
    } else {
      throw new Error("No description found");
    }
  } else {
    throw new Error("Invalid invoice");
  }
}
