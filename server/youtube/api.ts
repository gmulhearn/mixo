import got from 'got';
import { parseVideo } from './parser.service';

const rfc3986EncodeURIComponent = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, escape);

export async function searchVideos(searchQuery: string, limit?: number) {
  const YOUTUBE_URL = 'https://www.youtube.com';

  const results = [];
  let details = [];
  let fetched = false;

  const searchRes: any = await got.get(`${YOUTUBE_URL}/results?q=${rfc3986EncodeURIComponent(searchQuery.trim())}&hl=en`);
  let html = await searchRes.body;
  // try to parse html
  try {
    const data = html.split("ytInitialData = '")[1].split("';</script>")[0];
    // @ts-ignore
    html = data.replace(/\\x([0-9A-F]{2})/ig, (...items) => {
      return String.fromCharCode(parseInt(items[1], 16));
    });
    html = html.replaceAll("\\\\\"", "");
    html = JSON.parse(html)
  } catch(e) { /* nothing */}

  if(html && html.contents && html.contents.sectionListRenderer && html.contents.sectionListRenderer.contents
    && html.contents.sectionListRenderer.contents.length > 0 && html.contents.sectionListRenderer.contents[0].itemSectionRenderer &&
    html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents.length > 0){
    details = html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    fetched = true;
  }
  // backup/ alternative parsing
  if (!fetched) {
    try {
      details = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
      fetched = true;
    } catch (e) { /* nothing */
    }
  }
  if (!fetched) {
    try {
      details = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
      fetched = true;
    } catch(e) { /* nothing */ }
  }

  if (!fetched) return [];

  // tslint:disable-next-line:prefer-for-of
  for (const detail of details) {
    if (limit && results.length >= limit) break;

    const parsed = parseVideo(detail);
    if (!parsed) continue;

    results.push(parsed);
  }

  return results;
}