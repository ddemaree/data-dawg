import { createDocument, MarkupSource } from "./createDocument";
import fixLazyLoadImages from "./transform/import/fixLazyLoadImages";
import transformTweets from "./transform/import/transformTweets";

function removeScriptTags(document: Document) {
  const nodes = document.querySelectorAll("script");

  for (let index = 0; index < nodes.length; index++) {
    const currentNode = nodes[index];
    currentNode.parentNode?.removeChild(currentNode);
  }

  return document;
}

export type MarkupTransformer =
  | ((doc: Document) => Document)
  | ((doc: Document) => void);
export type MarkupTransformerStack = MarkupTransformer[];

const importTransformers: MarkupTransformerStack = [
  removeScriptTags,
  fixLazyLoadImages,
  transformTweets,
];

export default async function transform(
  htmlSource: MarkupSource,
  transformers: MarkupTransformerStack = importTransformers
) {
  const document = createDocument(htmlSource);
  const defaultTransformers = transformers.map((t) => t(document));
  await Promise.all(defaultTransformers);
  return document;
}
