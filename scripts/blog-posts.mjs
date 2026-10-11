
const dateFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const weekdayFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'UTC' });

export function buildBlogPosts(items, categories) {
  return items.filter(item => item.data.ogType === 'article' && !item.data.noindex && item.data.permalink !== false)
    .sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt)
      || (a.data.cardOrder ?? Number.MAX_SAFE_INTEGER) - (b.data.cardOrder ?? Number.MAX_SAFE_INTEGER)
      || a.url.localeCompare(b.url))
    .map(item => {
      const data = item.data;
      const category = categories.find(category => category.key === data.category);
      if (!category) throw new Error(`${item.inputPath}: kategori artikel tidak valid: ${data.category}`);
      const publishedAt = new Date(data.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) throw new Error(`${item.inputPath}: publishedAt tidak valid`);
      const href = item.url.replace(/\.html$/, '').replace(/\/$/, '');
      const title = data.cardTitle || data.ogTitle || data.title;
      const image = data.cardImage || data.ogImage;
      if (!image) throw new Error(`${item.inputPath}: gambar artikel belum diisi`);
      const displayDate = dateFormat.format(publishedAt);
      return {
        slug: href.split('/').pop(), category: category.key, categoryLabel: category.label, href,
        image, alt: data.cardAlt || title, title,
        description: data.cardDescription || data.description,
        date: `${weekdayFormat.format(publishedAt)} • ${displayDate}`, displayDate,
      };
    });
}
