// Navigation and layout read the manifest: metadata only, no prose.
export { chapterManifest as chapters } from "./chapters/manifest";
export { bookInfo } from "./chapters/types";
export { loadChapter, loadAllChapters } from "./chapters/load";
export type { Chapter, ChapterMeta, SubchapterMeta } from "./chapters/types";
