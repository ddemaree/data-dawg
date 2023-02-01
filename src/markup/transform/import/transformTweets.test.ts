import { describe, expect, test } from "@jest/globals";
import { createDocument } from "../../createDocument";
import { html } from "../../utils";
import transformTweets from "./transformTweets";

const MARKUP = `
<figure class=\"wp-block-embed is-type-rich is-provider-twitter wp-block-embed-twitter\"><div class=\"wp-block-embed__wrapper\">\n<blockquote class=\"twitter-tweet\" data-width=\"500\" data-dnt=\"true\"><p lang=\"en\" dir=\"ltr\">I find the world fascinating. Most open world games feel like task whack-a-mole anymore. I love how ER encourages you to explore and rewards that curiosity. I also like the ways you can customize your play style and gear.</p>&mdash; Justin Belcher (@gravitywins) <a href=\"https://twitter.com/gravitywins/status/1508906117786574854?ref_src=twsrc%5Etfw\">March 29, 2022</a></blockquote><script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>\n</div></figure>
`;

const OUTPUT = `<a href="https://twitter.com/gravitywins/status/1508906117786574854">Tweet by Justin Belcher (@gravitywins) from March 29, 2022</a>`;

const testDoc = createDocument(MARKUP);

describe("Transforming Tweets", () => {
  test("simplify markup", async () => {
    const result = await transformTweets(testDoc).then(html);
    expect(result).toEqual(OUTPUT);
  });
});
