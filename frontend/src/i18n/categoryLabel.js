import { pickTranslated } from './pickTranslated';

/** Reads a category's translated name for the active language, falling back to English. */
export function categoryLabel(category, lang) {
  if (!category) return '';
  return pickTranslated(category, 'name', lang);
}
