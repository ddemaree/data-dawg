import { gql, gqlRequest } from "./client";
import { WordpressPost } from "./types";
import wrapPost from "./wrapPost";

const ALLOWED_POSTS = `
monkeys-typewriters
elden-ring
why-are-webcams-so-cursed
fuji-x100v-camera-review
2021-wfh-desk-setup
the-full-coinbase
2020-in-review
no-more-masters
2019-in-review
where-the-web-fonts-go
parcel-post
on-authority
people-over-work-product
how-to-blog-in-2021
blogging-is-a-pain-in-the-ass
no-more-computers
on-categories-and-shit-work
google-and-cognitive-overhead
`
  .trim()
  .split("\n");

const ALL_POSTS_QUERY = gql`
  query PostsQuery($startCursor: String, $slugs: [String]) {
    posts(
      first: 100
      after: $startCursor
      where: {
        status: PUBLISH
        dateQuery: { after: { year: 2015 } }
        nameIn: $slugs
      }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        slug
        title
        content
        date: dateGmt
        excerpt(format: RAW)
        featuredImage {
          node {
            sourceUrl
            srcSet
            sizes
            altText
            caption(format: RAW)
          }
        }
      }
    }
  }
`;

export async function getAllPosts(): Promise<WordpressPost[]> {
  const gqlResponse = await gqlRequest(ALL_POSTS_QUERY, {
    slugs: ALLOWED_POSTS,
  });
  const { data } = gqlResponse;
  const posts = data?.posts?.nodes ?? [];
  return posts.map((p: any) => wrapPost(p)) as WordpressPost[];
}
