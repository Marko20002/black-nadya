/**
 * Reads a modeltranslation-style field (e.g. "name" -> name_en/name_mk/name_sq)
 * from an API object in the current language, falling back to English.
 */
export function pickTranslated(obj, field, lang) {
  if (!obj) return '';
  return obj[`${field}_${lang}`] || obj[`${field}_en`] || '';
}
