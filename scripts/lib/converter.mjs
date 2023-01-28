import domino from "domino";
import TurndownService from "turndown";
import cloudinary from "./cloudinary.mjs";
import _ from "lodash";

export function getDocument(content) {
  var string = '<x-turndown id="turndown-root">' + content + "</x-turndown>";
  return domino.createDocument(string);
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "--------",
});
turndownService.keep(["figure", "div", "tweet"]);

export function processPostMeta(postMeta) {
  let categories = postMeta._categories.nodes.map((c) => c.name);
  let tags = postMeta._tags.nodes.map((t) => t.name);

  if (_.includes(categories, "Featured")) postMeta.featured = true;
  categories = _.without(
    categories,
    "Featured",
    "Uncategorized",
    "Articles",
    "Notes"
  );

  tags = tags.map((t) => _.upperFirst(t));

  // console.log(postMeta._linkFields);
  let { linkUrl } = postMeta._linkFields;
  let featuredImage =
    postMeta._featuredImage && postMeta._featuredImage.node.sourceUrl;
  let postFormat =
    postMeta._formats.nodes[0] && postMeta._formats.nodes[0].name;

  postMeta = {
    ...postMeta,
    categories,
    tags,
    linkUrl,
    featuredImage,
    postFormat,
  };

  postMeta = _.omitBy(postMeta, (v, k) => {
    return !v || v.length === 0 || !k.match(/^[a-z]/);
  });

  return postMeta;
}

export async function toMarkdown(document, transformers = []) {
  if (typeof document === "string") {
    document = getDocument(document);
  }

  const defaultTransformers = [
    transformLazyLoadImages,
    transformTweets,
    transformYoutubes,
  ];

  transformers = defaultTransformers
    .concat(transformers)
    .map((t) => t(document));

  await Promise.all(transformers);

  return turndownService.turndown(document);
}

async function transformTweets(doc) {
  const nodes = doc.querySelectorAll(".wp-block-embed.is-provider-twitter");

  await Promise.all(
    nodes.map(async (node) => {
      const twUrl = node.children[0].textContent;
      const twEmbed = await fetch(
        "https://publish.twitter.com/oembed?" +
          new URLSearchParams({
            url: twUrl,
            format: "json",
            maxwidth: "650",
          })
      ).then((res) => res.json());

      node.innerHTML = twEmbed.html;
    })
  );
}

async function transformYoutubes(doc) {
  const nodes = doc.querySelectorAll(".wp-block-embed.is-provider-youtube");

  await Promise.all(
    nodes.map(async (node) => {
      const ytUrl = node.children[0].textContent;
      const ytMarkup = await fetch(
        "https://www.youtube.com/oembed?" +
          new URLSearchParams({
            url: ytUrl,
            format: "json",
            maxwidth: "650",
          })
      ).then((res) => res.json());

      node.innerHTML = ytMarkup.html;
    })
  );
}

async function transformLazyLoadImages(doc) {
  const nodes = doc.querySelectorAll(".wp-block-image img[src^=data]");
  await Promise.all(
    nodes.map(async function (node) {
      [
        "onload",
        "data-sizes",
        "data-srcset",
        "data-transformations",
        "data-cloudinary",
        "class",
      ].forEach((key) => {
        node.removeAttribute(key);
      });

      let height = Number.parseInt(node.getAttribute("height"));
      let width = Number.parseInt(node.getAttribute("width"));
      let aspectRatio = width / height;
      node.setAttribute("data-aspect-ratio", aspectRatio);

      if (node.closest(".wp-block-gallery")) {
        width = 800;
        height = Math.floor(width / aspectRatio);
        node.classList.add("gallery-image");
      } else if (width > 1600) {
        width = 1600;
        height = Math.floor(width / aspectRatio);
      }

      const publicId = node.getAttribute("data-public-id");
      const clAsset = cloudinary.url(publicId, { width, height });

      node.src = clAsset;
      node.width = width;
      node.height = height;
      node.setAttribute("loading", "lazy");
    })
  );
}
