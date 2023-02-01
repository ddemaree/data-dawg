import { Cloudinary, CloudinaryImage } from "@cloudinary/url-gen";
import { fill, scale } from "@cloudinary/url-gen/actions/resize";

export const cloudinary = new Cloudinary({
  cloud: { cloudName: "demaree" },
  url: {
    secure: true,
    analytics: false,
  },
});

export function cloudinaryImage(src: string) {
  return cloudinary.image(src);
}

function fullCloudinaryImg(src: string) {
  return cloudinaryImage(src).resize(fill(1600));
}
