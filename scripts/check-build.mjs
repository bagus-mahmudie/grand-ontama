import fs from "node:fs";
import path from "node:path";
import loadBlogData from '../src/_data/blogData.js';

const root = process.cwd();
const output = path.join(root, "_site");
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function resolvePublicReference(reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(reference)) return null;

  const relative = clean.startsWith("/") ? clean.slice(1) : clean;
  const direct = path.join(output, relative);
  if (fs.existsSync(direct)) return direct;

  if (!path.extname(relative)) {
    const html = path.join(output, `${relative}.html`);
    if (fs.existsSync(html)) return html;
    const index = path.join(output, relative, "index.html");
    if (fs.existsSync(index)) return index;
  }

  return direct;
}

if (!fs.existsSync(output)) {
  throw new Error('Folder _site belum ada. Jalankan "npm run build" terlebih dahulu.');
}

const files = walk(output);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const expectedPosts = (await loadBlogData()).posts;
const blogHtml = fs.readFileSync(path.join(output, 'blogs.html'), 'utf8');
const cardCount = [...blogHtml.matchAll(/\bdata-blog-card\b/g)].length;
if (!expectedPosts.length || cardCount !== expectedPosts.length) failures.push(`Jumlah kartu blog ${cardCount}, seharusnya ${expectedPosts.length}`);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${file}: title kosong`);
  if (!/<link rel="canonical" href="https:\/\/grandontama\.com/i.test(html)) failures.push(`${file}: canonical tidak valid`);
  if (/jquery|owl\.carousel|navbar\.html|footer\.html/i.test(html)) failures.push(`${file}: dependensi legacy masih termuat`);
  if (/google\.com\/recaptcha\/api\.js/.test(html)) failures.push(`${file}: reCAPTCHA tidak diperlukan untuk form WhatsApp`);
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const reference = candidate.trim().split(/\s+/)[0];
      const target = resolvePublicReference(reference);
      if (target && !fs.existsSync(target)) failures.push(`${file}: srcset tidak ditemukan ${reference}`);
    }
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const schema = JSON.parse(match[1]);
      const article = schema['@graph']?.find(node => node['@type'] === 'Article');
      if (article && (!article.dateModified || article.dateModified < article.datePublished)) failures.push(`${file}: tanggal revisi artikel tidak valid`);
    } catch { failures.push(`${file}: JSON-LD tidak valid`); }
  }

  for (const match of html.matchAll(/(?:src|href|action)=["']([^"']+)["']/gi)) {
    const target = resolvePublicReference(match[1]);
    if (target && !fs.existsSync(target)) {
      failures.push(`${path.relative(output, file)} -> ${match[1]}`);
    }
  }
}

for (const required of ["index.html", ".htaccess", "assets/css/site.css", "assets/js/app.js", "mailer/send-contact.php", "vendor/autoload.php", "sitemap.xml", "robots.txt"]) {
  if (!fs.existsSync(path.join(output, required))) failures.push(`File wajib tidak ditemukan: ${required}`);
}

if (failures.length) {
  console.error(`Build check gagal (${failures.length}):`);
  failures.slice(0, 100).forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Build check berhasil: ${htmlFiles.length} HTML dan ${files.length} file diperiksa.`);
