import { WordpressPost } from "./types";

export default function wrapPost(inputPostData: any): WordpressPost {
  const { slug, title, content, date, excerpt, ...postData } = inputPostData;

  const featuredImage = postData?.featuredImage?.node;

  const post: WordpressPost = {
    slug,
    title,
    content,
    date,
    excerpt,
    featuredImage,
  };

  return post;
}
