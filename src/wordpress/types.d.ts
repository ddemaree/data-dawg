export type WordpressImage = {
  sourceUrl: string;
  srcSet: string;
  sizes: string;
  caption: string;
  altText: string;
};

export type WordpressPost = {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  featuredImage?: WordpressImage;
};

export type WordpressResponse = {
  status: number;
  post: WordpressPost;
  error?: string;
};
