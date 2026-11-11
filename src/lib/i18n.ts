export type Lang = "en" | "am";
export const parseLang = (v?: string): Lang => (v === "am" ? "am" : "en");
/** Show the Amharic text when Amharic is selected and available, otherwise English. */
export const pick = (lang: Lang, en: string, am?: string | null) => (lang === "am" && am ? am : en);
export const money = (price: unknown, currency: string) => `${Number(price).toFixed(2)} ${currency}`;
