import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}

// Originals and their names are retained. Derivatives live in separate width folders.
export async function prepareImages() {
  const manifest = {};
  for (const file of await walk('src/assets/img')) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const info = await sharp(file).metadata();
    if (!info.width || (info.width < 256 && /\.webp$/i.test(file)) || info.pages > 1) continue;
    const relative = path.relative('src/assets/img', file).replaceAll('\\', '/');
    const source = '/assets/img/' + relative;
    const widths = [...new Set([160, 320, 640, 960, 1280, Math.min(info.width, 1920)].filter(w => w <= info.width))].sort((a,b) => a-b);
    const variants = [];
    const sourceStat = await fs.stat(file);
    for (const width of widths) {
      const url = `/assets/responsive/${width}/${relative.replace(/\.[^.]+$/, '.webp')}`;
      const target = '_site' + url;
      await fs.mkdir(path.dirname(target), { recursive: true });
      const existing = await fs.stat(target).catch(() => null);
      if (!existing || existing.mtimeMs < sourceStat.mtimeMs) {
        await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(target);
      }
      variants.push({ url, width });
    }
    manifest[source] = { src: variants.at(-1).url, srcset: variants.map(v => `${v.url} ${v.width}w`).join(', '), width: info.width, height: info.height };
  }
  await fs.mkdir('_site/assets/generated', { recursive: true });
  await fs.writeFile('_site/assets/generated/responsive-images.js', 'window.responsiveImages = ' + JSON.stringify(manifest) + ';');
  return manifest;
}

export function responsiveHtml(html, manifest) {
  return html.replace(/<img\b[^>]*>/g, (tag, offset) => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const entry = manifest[src];
    if (!entry) return tag;
    const context = html.slice(Math.max(0, offset - 650), offset);
    let sizes = '(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 56px), 1280px';
    if (/grand-ontama-logo|footer-grand-ontama/.test(src)) sizes = '120px';
    else if (/grand-ontama-404/.test(src)) sizes = '(max-width: 643px) calc(100vw - 32px), 612px';
    else if (/\/icon\//.test(src)) sizes = '48px';
    else if (/data-gallery-thumb[^>]*>[\s]*$/.test(context)) sizes = '(max-width: 639px) 40vw, (max-width: 1023px) 16vw, 210px';
    else if (/home-property-card|home-facility-card|blog-index-card/.test(context)) sizes = '(max-width: 639px) 80vw, (max-width: 1023px) 44vw, 420px';
    else if (/home-hero-art/.test(tag)) sizes = '100vw';
    else if (/home-interior-panel/.test(context)) sizes = '(max-width: 639px) 46vw, 424px';
    tag = tag.replace(/\bsrc="[^"]+"/, `src="${entry.src}"`);
    if (!/\bsrcset=/.test(tag)) tag = tag.replace(/>$/, ` srcset="${entry.srcset}" sizes="${sizes}">`);
    if (!/\bwidth=/.test(tag)) tag = tag.replace(/>$/, ` width="${entry.width}">`);
    if (!/\bheight=/.test(tag)) tag = tag.replace(/>$/, ` height="${entry.height}">`);
    return tag;
  });
}
