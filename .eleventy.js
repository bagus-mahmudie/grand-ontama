import { prepareImages, responsiveHtml } from './scripts/responsive-images.mjs';

export default function (eleventyConfig) {
  let responsiveImages = {};
  eleventyConfig.on('eleventy.before', async () => { responsiveImages = await prepareImages(); });
  eleventyConfig.addTransform('responsive-images', function (content) {
    return this.page.outputPath?.endsWith('.html') ? responsiveHtml(content, responsiveImages) : content;
  });
  eleventyConfig.addFilter("dateToIso", (date) => {
    const value = date instanceof Date ? date : new Date(date);
    return value.toISOString().slice(0, 10);
  });
  eleventyConfig.addFilter("json", (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c")
  );

  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/docs": "assets/docs" });
  eleventyConfig.addPassthroughCopy({ "src/assets/icons": "assets/icons" });
  eleventyConfig.addPassthroughCopy({ "src/assets/audio": "assets/audio" });
  eleventyConfig.addPassthroughCopy({ "src/assets/video": "assets/video" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css/site.css": "assets/css/site.css" });
  eleventyConfig.addPassthroughCopy({ "src/static/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy({ "src/static/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/static/sitemap.xsl": "sitemap.xsl" });
  eleventyConfig.addPassthroughCopy({ "src/static/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "server/mailer": "mailer" });
  eleventyConfig.addPassthroughCopy({ "server/vendor": "vendor" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk"]
  };
}
