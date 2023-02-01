import { describe, expect, test } from "@jest/globals";
import transform from "./transform";
import { html } from "./utils";

describe("Transform (clean up) html", () => {
  test("remove all script tags", async () => {
    const source = `
<blockquote class="twitter-tweet">A TWEET</blockquote>
<script src="path/to/tweet.js"></script>
    `.trim();
    const result = await transform(source).then(html);

    expect(result.trim()).toEqual(
      '<blockquote class="twitter-tweet">A TWEET</blockquote>'
    );
  });

  test("removes lazy-load image syntax", async () => {
    const source = `
<figure class=\"wp-block-post-featured-image\"><img width=\"1200\" height=\"1200\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjEyMDAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0icmdiYSgxNTMsMTUzLDE1MywwLjUpO3JnYmEoMTUzLDE1MywxNTMsMC4xKTtyZ2JhKDE1MywxNTMsMTUzLDAuNSkiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPjwvcmVjdD48L3N2Zz4=\" class=\"attachment-post-thumbnail size-post-thumbnail wp-post-image wp-post-4907 wp-image-5309 wp-post-4907\" alt=\"Fuji X100V camera with lens cap and strap\" decoding=\"async\" loading=\"lazy\" data-public-id=\"bitsandletters-assets/IMG_2826.jpg\" data-format=\"jpg\" data-transformations=\"f_auto,q_auto\" data-version=\"1627225725\" data-size=\"2000 2000\" data-srcset=\"https://res.cloudinary.com/demaree/images/w_1200,h_1200,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 1200w, https://res.cloudinary.com/demaree/images/w_300,h_300,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 300w, https://res.cloudinary.com/demaree/images/w_1024,h_1024,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 1024w, https://res.cloudinary.com/demaree/images/w_150,h_150,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 150w, https://res.cloudinary.com/demaree/images/w_768,h_768,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 768w, https://res.cloudinary.com/demaree/images/w_1536,h_1536,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 1536w, https://res.cloudinary.com/demaree/images/w_800,h_800,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 800w, https://res.cloudinary.com/demaree/images/w_400,h_400,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 400w, https://res.cloudinary.com/demaree/images/w_200,h_200,c_fill/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 200w, https://res.cloudinary.com/demaree/images/f_auto,q_auto/v1627225725/bitsandletters-assets/IMG_2826/IMG_2826.jpg?_i=AA 2000w\" data-sizes=\"(max-width: 1200px) 100vw, 1200px\" data-delivery=\"upload\" onload=\";window.CLDBind?CLDBind(this):null;\" data-cloudinary=\"lazy\" /></figure>
    `.trim();
    const result = await transform(source).then(html);
    expect(result).toEqual(
      `
<figure class=\"wp-block-post-featured-image\"><img width=\"1200\" height=\"1200\" src=\"https://res.cloudinary.com/demaree/image/upload/h_1200,w_1200/v1/bitsandletters-assets/IMG_2826.jpg\" alt=\"Fuji X100V camera with lens cap and strap\" decoding=\"async\" loading=\"lazy\" data-public-id=\"bitsandletters-assets/IMG_2826.jpg\" data-format=\"jpg\" data-version=\"1627225725\" data-size=\"2000 2000\" data-delivery=\"upload\" data-aspect-ratio=\"1\"></figure>    
    `.trim()
    );
  });
});
