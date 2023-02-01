import * as fs from "fs/promises";
import htmlToMarkdown from "../markup/htmlToMarkdown";
import { getAllPosts } from "../wordpress";
import transform from "../markup/transform";

import { DateTime } from "luxon";
import matter from "gray-matter";
import { html } from "../markup/utils";

export default async function pull({ dryRun = false }: { dryRun: boolean }) {
  const posts = await getAllPosts();

  await fs
    .rm("./posts", { recursive: true })
    .catch((err) => console.log("Couldn't delete directory"));
  await fs.mkdir("./posts", { recursive: true });

  await Promise.all(
    posts.map(async ({ content, ...post }) => {
      const postDate = DateTime.fromISO(post.date);
      const mdText = await transform(content).then((doc) =>
        htmlToMarkdown(html(doc))
      );

      if (post.slug) {
        let fileExists = null;
        const postPath = `./posts/${post.slug}.md`;

        let postFrontData = {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: postDate.toISODate(),
        };

        try {
          fileExists = await fs.stat(postPath);
        } catch (e) {}

        // if (fileExists) {
        //   const fileData = matter.read(postPath);

        //   postFrontData = {
        //     ...postFrontData,
        //     ...fileData.data,
        //   };
        // }

        try {
          let fileContents = matter.stringify(mdText, postFrontData);
          console.log(`Writing ${postPath}`);

          if (!dryRun) await fs.writeFile(postPath, fileContents);
        } catch (err: unknown) {
          console.error(err);
          console.error(postFrontData);
        }
      }
    })
  );
}
