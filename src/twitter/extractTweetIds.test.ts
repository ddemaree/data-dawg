import { describe, expect, test } from "@jest/globals";
import extractTweetIds from "./extractTweetIds";

describe("extractTweetIds", () => {
  test("finds all IDs from Tweet URLs", () => {
    const SIMPLE_HTML = `
    <a href="https://twitter.com/dd/status/123"></a>

    <a href="https://twitter.com/dd/status/456"></a>

    <a href="https://twitter.com/ddemaree"></a>

    <a href="https://twitter.com/ddemaree/status/789999"></a>
    `.trim();

    const idsResult = extractTweetIds(SIMPLE_HTML);
    expect(idsResult).toEqual(["123", "456", "789999"]);
  });

  test("returns only unique IDs", () => {
    const SIMPLE_HTML = `
    <a href="https://twitter.com/dd/status/123"></a>

    <a href="https://twitter.com/dd/status/456"></a>

    <a href="https://twitter.com/dd/status/456"></a>
    `.trim();
    const idsResult = extractTweetIds(SIMPLE_HTML);
    expect(idsResult).toEqual(["123", "456"]);
  });
});
