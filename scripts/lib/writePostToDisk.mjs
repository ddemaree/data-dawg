import _ from "lodash";
import * as fs from "fs/promises";
import matter from "gray-matter";
import { DateTime } from "luxon";

export default async function writePostToDisk(content, post) {
  const postDate = DateTime.fromISO(post.date);
  const filenameDate = postDate.toISODate();

  let postFrontData = {
    ...post,
  };

  if (post.slug) {
    let fileExists = null;
    const postPath = `./posts/${filenameDate}-${post.slug}.md`;

    try {
      fileExists = await fs.stat(postPath);
    } catch (e) {}

    if (fileExists) {
      const fileData = matter.read(postPath);

      postFrontData = {
        ...postFrontData,
        ...fileData.data,
      };
    }

    // Only include meta keys that start with a letter (no __typename etc)
    postFrontData = _.pickBy(postFrontData, (v, k) => k.match(/^[a-z]/));

    let fileContents = matter.stringify(content, postFrontData, {
      lineWidth: -1,
    });

    console.log(`Writing ${postPath}`);
    await fs.writeFile(postPath, fileContents);
  }
}
