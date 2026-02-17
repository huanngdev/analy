import slugifyFn from "slugify";

export function slugify(text: string) {
  return slugifyFn(text, {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: false,
    locale: "en",
    trim: true,
  });
}
