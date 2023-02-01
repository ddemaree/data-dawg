import { compact, uniq } from "lodash";
import { createDocument, MarkupSource } from "../markup/createDocument";

export default function extractTweetIds(htmlInput: MarkupSource) {
  const doc = createDocument(htmlInput);

  const tweetLinks = doc.querySelectorAll(
    'a[href*="twitter.com/"]'
  ) as NodeListOf<HTMLAnchorElement>;

  return compact(
    uniq(
      Array.from(tweetLinks).map((linkElem) => {
        const href = linkElem.href;
        const tweetMatch = href.match(/twitter.com\/[^\/]+\/status\/(\d+)/);
        const tweetId = tweetMatch?.at(1) as string;
        return tweetId;
      })
    )
  );
}
