import { JSDOM } from "jsdom";

export { JSDOM };

export type MarkupSource = string | Document;

export function createDocument(htmlString: MarkupSource) {
  if (typeof htmlString === "string") {
    return new JSDOM(`<x-document id="root">${htmlString}</x-document>`).window
      .document;
  }

  return htmlString;
}
