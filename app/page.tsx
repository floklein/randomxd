"use client";

import { useState } from "react";
import Image from "next/image";
import { fetchWatchlist, fetchMoviePoster, type Film } from "./actions";

function pickRandom(films: Film[]): Film {
  return films[Math.floor(Math.random() * films.length)];
}

export default function Home() {
  const [username, setUsername] = useState("floxd");
  const [films, setFilms] = useState<Film[]>([]);
  const [currentFilm, setCurrentFilm] = useState<Film | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null);

  async function showFilm(film: Film) {
    setCurrentFilm(film);
    setPosterUrl(null);
    const poster = await fetchMoviePoster(film.title, film.year);
    setPosterUrl(poster);
  }

  async function handlePick() {
    if (films.length > 0 && loadedUsername === username.trim()) {
      showFilm(pickRandom(films));
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentFilm(null);
    setPosterUrl(null);
    setFilms([]);

    try {
      const result = await fetchWatchlist(username);
      setFilms(result);
      setLoadedUsername(username.trim());
      showFilm(pickRandom(result));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8 px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          What should I watch?
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePick();
          }}
          className="flex w-full gap-3"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Letterboxd username"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Loading..." : "Pick a movie"}
          </button>
        </form>

        {loading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Fetching watchlist...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {currentFilm && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="h-[345px] w-[230px] overflow-hidden rounded-lg bg-zinc-200 shadow-lg dark:bg-zinc-800">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${currentFilm.title} poster`}
                  width={230}
                  height={345}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Loading poster...
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <a
                href={`https://letterboxd.com${currentFilm.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
              >
                {currentFilm.title}
              </a>
              {currentFilm.year && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {currentFilm.year}
                </p>
              )}
            </div>

            <button
              onClick={() => showFilm(pickRandom(films))}
              className="mt-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Another one
            </button>

            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              {films.length} films in watchlist
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
