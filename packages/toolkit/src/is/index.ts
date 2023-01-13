import { Logger } from "../logger";

export type TypeName =
  | "String"
  | "Number"
  | "Array"
  | "Object"
  | "Null"
  | "Undefined"
  | "Symbol"
  | "BigInt"
  | "Function"
  | "AsyncFunction"
  | "GeneratorFunction"
  | "Date"
  | "Map"
  | "Set"
  | "Promise"
  | "Proxy"
  | "Arguments"
  | "Error"
  | "RegExp"
  | "ArrayBuffer"
  | "WeakMap";

const logger = new Logger("SENTIMENTAL IS");

/**
 * Is it a specific type
 * @param target
 * @param type Type of the target
 */
export function is<T extends string = TypeName>(target: unknown, type: T): boolean {
  return Object.prototype.toString.call(target) === `[object ${type}]`;
}

/**
 * Is it a string
 * @param target
 */
export function isString(target: unknown): target is string {
  return typeof target === "string";
}

/**
 * Is it a number
 * @param target
 */
export function isNumber(target: unknown): target is number {
  return typeof target === "number";
}

/**
 * Is it a boolean
 * @param target
 */
export function isBoolean(target: unknown): target is boolean {
  return typeof target === "boolean";
}

/**
 * Is it a function
 * @param target
 */
export function isFunction<T extends Function = Function>(target: unknown): target is T {
  return typeof target === "function";
}

/**
 * Is it undefined
 * @param target
 */
export function isUndefined(target: unknown): target is undefined {
  return typeof target === "undefined";
}

/**
 * Is it null
 * @param target
 */
export function isNull(target: unknown): target is null {
  return target === null;
}

/**
 * does it exist
 * @param target
 */
export function isExist<T = unknown>(target: T): target is Exclude<T, undefined | null> {
  return !isUndefined(target) && !isNull(target);
}

/**
 * Is it an array
 * @param target
 */
export function isArray<T extends any[]>(target: unknown): target is T {
  return is(target, "Array");
}

/**
 * Is it an object
 * @param target
 */
export function isObject<T extends Record<any, any>>(target: unknown): target is T {
  return is(target, "Object");
}

/**
 * Is it a Map structure
 * @param target
 */
export function isMap<K = any, V = any, T extends Map<K, V> = Map<K, V>>(target: unknown): target is T {
  return is(target, "Map");
}

/**
 * Is it a Set structure
 * @param target
 */
export function isSet<T = any, S extends Set<T> = Set<T>>(target: unknown): target is S {
  return is(target, "Set");
}

/**
 * Is it a promise object
 * @param target
 */
export function isPromise<T extends Promise<any>>(target: unknown): target is T {
  return is(target, "Promise");
}

/**
 * Is it a date object
 * @param target
 */
export function isDate(target: unknown): target is Date {
  return is(target, "Date");
}

/**
 * Whether the current operating environment is a browser
 */
export function isBrowser(): boolean {
  return !!(typeof window !== "undefined" && window.document?.createElement);
}

/**
 * Is it an html element
 * @param target
 */
export function isElement<T extends Element = Element>(target: unknown): target is T {
  return isObject(target) && !!target.tagName;
}

/**
 * Is it a json object
 * @param target
 */
export function isJSON(target: string): boolean {
  if (typeof target !== "string") return false;
  try {
    const value = JSON.parse(target);
    return isObject(value);
  } catch (error) {
    return false;
  }
}

/**
 * Is it a non-empty collection
 * @param target
 */
export function isNotEmpty<T extends any[] | Record<any, any>>(target: unknown): target is T {
  if (isArray(target)) return target.length > 0;
  if (isMap(target) || isSet(target)) return target.size > 0;
  if (isObject(target)) return Object.keys(target).length > 0;
  return false;
}

/**
 * Is it an empty collection
 * @param target
 */
export function isEmpty(target: any[] | Record<any, any>): boolean {
  return !isNotEmpty(target);
}

/**
 * is not an empty string
 * @param target
 */
export function isNotBlank<T extends string>(target: unknown): target is T {
  return typeof target === "string" && target.trim().length > 0;
}

/**
 * Is it a category-specific number
 * @param target
 * @param regexp Regular expression to limit the kind of numbers
 */
export function isSpecificNumber<T extends string | number>(target: T, regexp: RegExp): boolean {
  if (!isString(target) && !isNumber(target)) {
    logger.warning("isSpecificNumber([string | number]): Only string or number types can be passed in");
    return false;
  }
  return regexp.test(target.toString());
}

/**
 * Is it an integer
 * @param target
 */
export function isInteger<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^-?\d+$/);
}

/**
 * Is it a positive integer
 * @param target
 */
export function isPositiveInt<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^[0-9]*[1-9][0-9]*$/);
}

/**
 * Is it a negative integer
 * @param target
 */
export function isNegativeInt<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^-[0-9]*[1-9][0-9]*$/);
}

/**
 * Is it a non-positive integer (including negative integer and 0)
 * @param target
 */
export function isNonPositiveInt<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^((-\d+)|(0+))$/);
}

/**
 * Is it a non-negative integer (including positive integers and 0)
 * @param params
 */
export function isNonNegativeInt<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^\d+$/);
}

/**
 * Is it a floating point number (does not include integers)
 * @param target
 */
export function isFloat<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/);
}

/**
 * Is it a positive floating point number
 * @param target
 */
export function isPositiveFloat<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/);
}

/**
 * Is it a negative floating point number
 * @param target
 */
export function isNegativeFloat<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$/);
}

/**
 * Is it a non-positive floating point number (including negative floating point number and 0)
 * @param params
 */
export function isNonPositiveFloat<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*))|0?\.0+|0$/);
}

/**
 * Is it a non-negative floating point number (including positive floating point number and 0)
 * @param params
 */
export function isNonNegativeFloat<T extends string | number>(target: T): boolean {
  return isSpecificNumber(target, /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$/);
}
