import * as fs from "fs/promises";
import _ from "lodash";

import apollo from "@apollo/client/core/core.cjs";
import { processPostMeta, toMarkdown } from "./lib/converter.mjs";
import writePostToDisk from "./lib/writePostToDisk.mjs";
import { DateTime } from "luxon";
const { gql, ApolloClient, HttpLink, InMemoryCache } = apollo;

const WP_JWT =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2RlbWFyZWUubWUiLCJpYXQiOjE2NjU2NjQ3NjYsIm5iZiI6MTY2NTY2NDc2NiwiZXhwIjoxNjY2MjY5NTY2LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIzIn19fQ.nghFFIWoCyHz8NeiVl5L4zk7ljpmnmknDpUi3JPQ82w";

const cache = new InMemoryCache();

const link = new HttpLink({
  uri: "https://demaree.me/graphql",
  headers: {
    Authorization: `Bearer ${WP_JWT}`,
  },
});

const client = new ApolloClient({
  cache,
  link,
});

(async () => {
  const query = gql`
    query PostQuery($startCursor: String) {
      posts(first: 50, after: $startCursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          title
          slug
          date: dateGmt
          content: unencodedContent
          excerpt: unencodedExcerpt
          _categories: categories {
            nodes {
              name
            }
          }
          _tags: tags {
            nodes {
              name
            }
          }
          _formats: postFormats {
            nodes {
              name
            }
          }
          _postFields: postFields {
            subtitle
          }
          _linkFields: linkFields {
            linkUrl
          }
          _featuredImage: featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  `;

  await fs.rm("./posts", { recursive: true });
  await fs.mkdir("./posts", { recursive: true });

  let startCursor = null;
  let hasNextPage = null;

  do {
    const res = await client.query({ query, variables: { startCursor } });

    const postNodes = res.data.posts.nodes;
    startCursor = res.data.posts.pageInfo.endCursor;
    hasNextPage = res.data.posts.pageInfo.hasNextPage;

    await Promise.all(
      postNodes.map(async function ({ content, ...postMeta }) {
        const postDate = DateTime.fromISO(postMeta.date);

        if (postDate.year <= 2012) return;

        const markdown = await toMarkdown(content);

        postMeta = processPostMeta(postMeta);

        writePostToDisk(markdown, postMeta);
      })
    );
  } while (hasNextPage);
})();
