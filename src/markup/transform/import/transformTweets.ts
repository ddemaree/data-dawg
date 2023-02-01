export default async function transformTweets(doc: Document) {
  // This should capture all links to tweets in figures (embeds) and/or Twitter's oEmbed markup (.twitter-tweet)
  const rootElement = doc.getElementById("root") as HTMLElement;
  const nodes = rootElement.querySelectorAll(
    ':where(figure,blockquote.twitter-tweet) a[href^="https://twitter.com"][href*="status/"]'
  ) as NodeListOf<HTMLAnchorElement>;

  if (!nodes) return doc;

  // If node is inside a figure
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    const parentElement = element.closest("#root > *") as HTMLElement;

    // Twitter / WordPress embed markup
    if (element.closest("blockquote.twitter-tweet")) {
      const twEmbedQuote = element.closest("blockquote.twitter-tweet");
      const twAuthorText = element.previousSibling as Text;

      if (twAuthorText.textContent) {
        const twAuthorTextMatch =
          twAuthorText.textContent.match(/— ([^\(]+) \(@(.+)\)/);
        const twAuthorName = twAuthorTextMatch!.at(1);
        const twAuthorHandle = twAuthorTextMatch!.at(2);
        const twDateText = element.textContent;

        const twUrl = new URL(element.href);
        twUrl.search = "";
        const twCleanUrl = twUrl.toString();

        const newLink = doc.createElement("a");
        newLink.href = twCleanUrl;
        newLink.innerHTML = `Tweet by ${twAuthorName} (@${twAuthorHandle}) from ${twDateText}`;

        rootElement.replaceChild(newLink, parentElement);
      }
    }
  }

  return doc;
}
