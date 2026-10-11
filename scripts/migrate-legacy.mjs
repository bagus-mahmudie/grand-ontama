import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const legacy = path.join(root, "_legacy_import");
const src = path.join(root, "src");

const groups = {
  "beranda.html": "index.njk",
  "tentang-kami.html": "tentang-kami.njk",
  "rumah-dijual.html": "rumah-dijual.njk",
  "blogs.html": "blogs.njk",
  "luxora.html": "properti/luxora.njk",
  "verona.html": "properti/verona.njk",
  "melodia.html": "properti/melodia.njk",
  "lapangan-padel.html": "fasilitas/lapangan-padel.njk",
  "lapangan-tenis.html": "fasilitas/lapangan-tenis.njk",
  "mushola.html": "fasilitas/mushola.njk",
  "galery-luxora.html": "galeri/luxora.njk",
  "galery-verona.html": "galeri/verona.njk",
  "galery-melodia.html": "galeri/melodia.njk",
  "cara-jual-rumah-ke-bank.html": "blog/cara-jual-rumah-ke-bank.njk",
  "harga-pasaran-rumah-2026.html": "blog/harga-pasaran-rumah-2026.njk",
  "mimpi-beli-rumah.html": "blog/mimpi-beli-rumah.njk",
  "pajak-jual-beli-rumah.html": "blog/pajak-jual-beli-rumah.njk",
  "pemasaran-properti.html": "blog/pemasaran-properti.njk",
  "renovasi-sebelum-jual-rumah.html": "blog/renovasi-sebelum-jual-rumah.njk",
  "tips-foto-rumah-dijual.html": "blog/tips-foto-rumah-dijual.njk",
  "tips-jual-rumah.html": "blog/tips-jual-rumah.njk"
};

const text = (html, pattern, fallback = "") => {
  const match = html.match(pattern);
  return match ? match[1].replace(/\s+/g, " ").trim() : fallback;
};

const raw = (html, pattern, fallback = "") => {
  const match = html.match(pattern);
  return match ? match[1].trim() : fallback;
};

const attr = (html, selectorPattern, fallback = "") => {
  const match = html.match(selectorPattern);
  return match ? match[1].trim() : fallback;
};

function yamlString(value) {
  return JSON.stringify(value.replace(/\r?\n/g, " "));
}

function normalizeContent(content) {
  return content
    .replace(/(src|href|action)=("|')assets\//g, "$1=$2/assets/")
    .replace(/action=("|')mailer\//g, "action=$1/mailer/")
    .replace(/data-location-images=("|')assets\//g, "data-location-images=$1/assets/")
    .replace(/\|assets\//g, "|/assets/")
    .replace(/href=("|')\.?#contact\1/g, 'href=$1/#contact$1')
    .replace(/href=("|')beranda(?:\.html)?\1/g, "href=$1/$1")
    .replace(/href=("|')([^"'#/:]+)\.html([#?][^"']*)?\1/g, 'href=$1/$2$3$1')
    .replace(/href=("|')(?!\/|#|https?:|mailto:|tel:|javascript:)([^"']+)\1/g, 'href=$1/$2$1');
}

for (const [legacyFile, outputFile] of Object.entries(groups)) {
  const html = fs.readFileSync(path.join(legacy, legacyFile), "utf8");
  const main = raw(html, /(<main\b[\s\S]*?<\/main>)/i);
  if (!main) throw new Error(`Elemen main tidak ditemukan: ${legacyFile}`);

  const slug = path.basename(legacyFile, ".html");
  const urlPath = slug === "beranda" ? "/" : `/${slug}`;
  const title = text(html, /<title>([\s\S]*?)<\/title>/i, "Grand Ontama");
  const description = attr(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const keywords = attr(html, /<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i);
  const ogTitle = attr(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i, title);
  const ogImage = attr(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i, "https://grandontama.com/assets/img/thumbnail/luxora.webp");
  const pageKey = slug === "beranda" ? "beranda" : slug;

  const frontMatter = [
    "---",
    "layout: layouts/base.njk",
    `permalink: ${yamlString(slug === "beranda" ? "index.html" : `${slug}.html`)}`,
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `keywords: ${yamlString(keywords)}`,
    `ogTitle: ${yamlString(ogTitle)}`,
    `ogImage: ${yamlString(ogImage)}`,
    `canonical: ${yamlString(`https://grandontama.com${urlPath}`)}`,
    `pageKey: ${yamlString(pageKey)}`,
    "---",
    ""
  ].join("\n");

  const target = path.join(src, outputFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, frontMatter + normalizeContent(main) + "\n");
}

const normalizePartial = (name) => normalizeContent(fs.readFileSync(path.join(legacy, name), "utf8"));

fs.mkdirSync(path.join(src, "_includes", "partials"), { recursive: true });
fs.writeFileSync(path.join(src, "_includes", "partials", "header.njk"), normalizePartial("navbar.html"));
fs.writeFileSync(path.join(src, "_includes", "partials", "footer.njk"), normalizePartial("footer.html"));

for (const folder of ["img", "audio", "video"]) {
  fs.cpSync(path.join(legacy, "assets", folder), path.join(src, "assets", folder), { recursive: true });
}
fs.mkdirSync(path.join(src, "assets", "js"), { recursive: true });
if (!fs.existsSync(path.join(src, "assets", "js", "app.js"))) {
  fs.copyFileSync(path.join(legacy, "assets", "js", "app.js"), path.join(src, "assets", "js", "app.js"));
}
fs.mkdirSync(path.join(src, "assets", "css"), { recursive: true });
if (!fs.existsSync(path.join(src, "assets", "css", "input.css"))) {
  fs.copyFileSync(path.join(legacy, "assets", "src", "input.css"), path.join(src, "assets", "css", "input.css"));
}

console.log(`Migrated ${Object.keys(groups).length} pages and shared assets.`);
