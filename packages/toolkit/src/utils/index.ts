import { isExist } from "../is";

/**
 * Assign object properties
 * @param source The source data object that needs to be assigned
 * @param template The object template to be returned
 */
export function assignObject<T extends Record<any, any>>(source: Record<any, any>, template: T): T {
  const result = { ...template };
  for (const key in result) {
    if (key in source && isExist(source[key])) result[key] = source[key];
  }
  return result;
}

/**
 * Assign object list properties
 * @param source The list of source data that needs to be assigned
 * @param template The object template to be returned
 */
export function assginList<T extends Record<any, any>>(source: Record<any, any>[], template: T): T[] {
  return source.map(item => assignObject(item, template));
}

/**
 * Concatenating nullable strings
 * @param strs strings to be concatenated
 */
export function concatString(...strs: Array<string | null | undefined>): string {
  return strs.filter(Boolean).join("");
}

/**
 * Get the byte length of a string
 * @param str
 */
export function getStringByteLength(str: string): number {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c > 255) length += 2;
    else length += 1;
  }
  return length;
}
