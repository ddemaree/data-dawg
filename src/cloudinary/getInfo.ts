import { cloudinary } from "./url-gen";
import { getInfo } from "@cloudinary/url-gen/qualifiers/flag";

export async function getCloudinaryImageInfo(src: string) {
  const img = cloudinary.image(src).addFlag(getInfo());
  const imgInfoUrl = img.toURL();

  const imageInfo = await fetch(imgInfoUrl)
    .then(async (res) => {
      let imgInfoData = {
        output: { width: null, height: null, bytes: null },
        url: imgInfoUrl,
      };
      try {
        imgInfoData = await res.json();
      } catch (err) {
        console.log(err, res);
      }
      return imgInfoData;
    })
    .catch((err) => ({
      err,
      imgInfoUrl,
      output: { width: null, height: null, bytes: null },
    }));

  const {
    output: { width, height, bytes },
  } = imageInfo;

  return { width, height, bytes };
}
