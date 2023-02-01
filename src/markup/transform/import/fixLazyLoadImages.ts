import cloudinary from "../../../cloudinary/client";

export default async function fixLazyLoadImages(doc: Document) {
  const nodes = doc.querySelectorAll(
    'img[src^="data"], img[onload*="CLDBind"]'
  ) as NodeListOf<HTMLImageElement>;
  await Promise.all(
    Array.from(nodes).map(async function (node: HTMLImageElement) {
      // console.log(`Processing node: ${node.outerHTML}`);
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

      let height = Number.parseInt(node.getAttribute("height") as string);
      let width = Number.parseInt(node.getAttribute("width") as string);
      let aspectRatio = width / height;
      node.setAttribute("data-aspect-ratio", `${aspectRatio}`);

      // Handle WP Gallery images
      if (node.closest(".wp-block-gallery")) {
        width = 800;
        height = Math.floor(width / aspectRatio);
        node.classList.add("gallery-image");
      } else if (width > 1600) {
        width = 1600;
        height = Math.floor(width / aspectRatio);
      }

      const publicId = node.getAttribute("data-public-id");
      if (publicId) {
        const clAsset = cloudinary.url(publicId, { width, height });
        node.src = clAsset;
        node.width = width;
        node.height = height;
        node.setAttribute("loading", "lazy");
      }
    })
  );
}
