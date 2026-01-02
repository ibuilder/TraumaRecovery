import type { Chapter } from "./types";
export { bookInfo } from "./types";

import { basicRecoveryChapter } from "./basicRecovery";
import { addictionRecoveryChapter } from "./addictionRecovery";
import { dysfunctionalFamiliesChapter } from "./dysfunctionalFamilies";
import { childhoodTraumaChapter } from "./childhoodTrauma";
import { adultTraumaChapter } from "./adultTrauma";
import { relationshipTraumaChapter } from "./relationshipTrauma";
import { cbtChapter } from "./cbt";
import { dbtChapter } from "./dbt";
import { actChapter } from "./act";
import { spiritualityChapter } from "./spirituality";

export const chapters: Chapter[] = [
  basicRecoveryChapter,
  addictionRecoveryChapter,
  dysfunctionalFamiliesChapter,
  childhoodTraumaChapter,
  adultTraumaChapter,
  relationshipTraumaChapter,
  cbtChapter,
  dbtChapter,
  actChapter,
  spiritualityChapter,
];

export type { Chapter } from "./types";
