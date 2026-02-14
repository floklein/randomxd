"use server";

import axios from "axios";
import * as cheerio from "cheerio";

export type Film = {
  title: string;
  year: string;
  slug: string;
  link: string;
};

function parseFilmsFromHtml(html: string): Film[] {
  const $ = cheerio.load(html);
  const films: Film[] = [];

  $('div[data-component-class="LazyPoster"]').each((_, el) => {
    const $el = $(el);
    const itemName = $el.attr("data-item-name") ?? "";
    const slug = $el.attr("data-item-slug") ?? "";
    const link = $el.attr("data-item-link") ?? "";

    const match = itemName.match(/^(.+?)\s*\((\d{4})\)$/);
    const title = match ? match[1] : itemName;
    const year = match ? match[2] : "";

    films.push({ title, year, slug, link });
  });

  return films;
}

function getLastPage(html: string): number {
  const $ = cheerio.load(html);
  let lastPage = 1;

  $('a[href*="/watchlist/page/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/\/watchlist\/page\/(\d+)\//);
    if (match) {
      const page = parseInt(match[1], 10);
      if (page > lastPage) lastPage = page;
    }
  });

  return lastPage;
}

export async function fetchWatchlist(username: string): Promise<Film[]> {
  if (!username.trim()) {
    throw new Error("Please enter a username.");
  }

  const baseUrl = `https://letterboxd.com/${encodeURIComponent(username.trim())}/watchlist/`;

  let firstPageHtml: string;
  try {
    const res = await axios.get(baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });
    firstPageHtml = res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new Error(`User "${username}" not found on Letterboxd.`);
    }
    throw new Error("Failed to fetch watchlist. Please try again.");
  }

  const films = parseFilmsFromHtml(firstPageHtml);
  const lastPage = getLastPage(firstPageHtml);

  if (lastPage > 1) {
    const pagePromises = [];
    for (let page = 2; page <= lastPage; page++) {
      pagePromises.push(
        axios
          .get(`${baseUrl}page/${page}/`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000,
          })
          .then((res) => parseFilmsFromHtml(res.data))
      );
    }
    const pageResults = await Promise.all(pagePromises);
    for (const pageFilms of pageResults) {
      films.push(...pageFilms);
    }
  }

  if (films.length === 0) {
    throw new Error(`Watchlist for "${username}" is empty or not public.`);
  }

  return films;
}

export async function fetchMoviePoster(
  title: string,
  year: string
): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await axios.get("https://api.themoviedb.org/3/search/movie", {
      params: { api_key: apiKey, query: title, year: year || undefined },
      timeout: 5000,
    });
    const posterPath = res.data.results?.[0]?.poster_path;
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  } catch {
    return null;
  }
}
