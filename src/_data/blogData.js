import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { buildBlogPosts } from '../../scripts/blog-posts.mjs';

const categoryData = {
  "categories": [
    {
      "key": "info-perumahan",
      "label": "Info Perumahan"
    },
    {
      "key": "harga-rumah",
      "label": "Harga Rumah"
    },
    {
      "key": "tips-kpr",
      "label": "Tips KPR"
    },
    {
      "key": "panduan-pembeli",
      "label": "Panduan Pembeli"
    }
  ]
};

export default async function () {
  const directory = path.resolve('src/blog');
  const files = (await fs.readdir(directory)).filter(file => file.endsWith('.njk')).sort();
  const articles = await Promise.all(files.map(async file => {
    const inputPath = path.join(directory, file);
    const { data } = matter(await fs.readFile(inputPath, 'utf8'));
    return { inputPath, data, url: '/' + String(data.permalink || '').replace(/^\//, '') };
  }));
  return { categories: categoryData.categories, posts: buildBlogPosts(articles, categoryData.categories) };
}
