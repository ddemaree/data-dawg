import { describe, expect, test } from "@jest/globals";
import htmlToMarkdown from "./htmlToMarkdown";

describe("HTML to Markdown", () => {
  test("Preserves figure tags", () => {
    const src = `
<h1>This is a sample</h1>

<figure><img src="myimage.jpg" /></figure>
    `;

    const result = htmlToMarkdown(src);

    expect(result).toEqual(
      `
# This is a sample

<figure><img src="myimage.jpg" /></figure>    
    `.trim()
    );
  });

  test("Handles tweets as single links on their own line", () => {
    const src = `
<p>Blah blah</p>

<p><a href="https://twitter.com/gravitywins/status/1508906117786574854">Tweet by Justin Belcher (@gravitywins) from March 29, 2022</a></p>

<p>Blah</p>
  `;

    const result = htmlToMarkdown(src);

    expect(result).toEqual(
      `
Blah blah

[Tweet by Justin Belcher (@gravitywins) from March 29, 2022](https://twitter.com/gravitywins/status/1508906117786574854)

Blah
  `.trim()
    );
  });

  test("Preserves video tags", () => {
    const src = `
<h1>This is a sample</h1>

<figure><video width="500"><source src="myvideo.mp4"></video></figure>
  `;

    const result = htmlToMarkdown(src);

    expect(result).toEqual(
      `
# This is a sample

<figure>
  <video width="500"><source src="myvideo.mp4" /></video>
</figure>
  `.trim()
    );
  });
});
