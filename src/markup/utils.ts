import { MarkupSource } from "./createDocument";

export function html(doc: MarkupSource) {
  if (typeof doc === "string") return doc;

  if (doc.querySelector("#root")) {
    return doc.querySelector("#root")!.innerHTML.trim();
  }

  return doc.body.innerHTML.trim();
}
