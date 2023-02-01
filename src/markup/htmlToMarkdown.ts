import TurndownService from "turndown";
import { createDocument, MarkupSource } from "./createDocument";
import transform from "./transform";

import prettier from "prettier";

export default function htmlToMarkdown(source: MarkupSource) {
  const document = createDocument(source);

  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "--------",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  turndownService.keep(["figure", "div", "iframe", "video"]);

  turndownService.addRule("prettify figures", {
    filter: ["figure"],
    replacement: (content, node) => {
      const nodeSrc = (node as HTMLElement).outerHTML;

      const formattedCode = prettier.format(nodeSrc, {
        parser: "html",
        tabWidth: 2,
      });

      return `\n\n${formattedCode}\n\n`;
    },
  });

  transform(document);

  return turndownService.turndown(document);
}
