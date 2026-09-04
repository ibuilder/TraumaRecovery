/**
 * The shape of the book's content, shared between the chapter modules and the
 * things that consume them.
 *
 * These were zod schemas with the types inferred off them. Nothing ever called
 * `.parse()` — the chapter modules are TypeScript source, checked at compile
 * time, not untrusted input arriving over a wire — so the runtime validator was
 * paying for a guarantee the compiler already gives. They are plain types now,
 * and `zod` is no longer a dependency.
 *
 * The file also carried a `users` table in drizzle and its insert schema, left
 * from the scaffolding this project started as. There was no database, nothing
 * imported them, and `drizzle.config.ts` threw unless `DATABASE_URL` was set.
 * Both are gone, along with `drizzle-orm`, `drizzle-zod` and `pg`.
 */

export type Subchapter = {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
};

export type Chapter = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  readingTime: string;
  content: string;
  subchapters: Subchapter[];
};

export type BookInfo = {
  title: string;
  subtitle: string;
  author: string;
  description: string;
};
