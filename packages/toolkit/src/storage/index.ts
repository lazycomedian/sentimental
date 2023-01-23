import { isBrowser, isNumber, isString, isUndefined } from "../is";
import { Logger } from "../logger";

export type StorageType = "localStorage" | "sessionStorage";

export interface StorageOption {
  /** The unique identifier used to distinguish each Storage instance */
  name: string;
  /**
   * Provides the operating environment of the application,
   * which can independently store the corresponding data in different operating environments
   * @example Tokens in the development environment and production environment
   * "@STORAGE/token:DEV": "YJ1K9IbdHp8d..."
   * "@STORAGE/token:PROD": "P1DjaO1k..."
   */
  mode?: string;
  /**
   * Provide the type of storage you need, you can choose one from localStorage and sessionStorage, the default is session storage
   * @default "sessionStorage"
   */
  type?: StorageType;
  /**
   * Customize the method of serialization, The JSON.stringify is used by default
   * @param value
   * @default JSON.stringify
   */
  serializer?(value: any): string;
  /**
   * Customize the method of deserialization, The JSON.parse is used by default
   * @param value
   * @default JSON.parse
   */
  deserializer?(value: string): any;
}

/**
 * Integrates multi-instance, you can set an expiration time for stored data,
 * And can store data in different operating environments
 * @augments K The type constraint of this Storage key
 */
export class Storage<K extends string = string> {
  protected readonly logger: Logger = new Logger("SENTIMENTAL STORAGE");

  /**
   * Store serialized data locally, the default is sessionStorage
   * @default "sessionStorage"
   *
   * If you need localStorage, you can enter parameters in each method
   * @example storage.getItem('key','localStorage')
   *
   * or create a new instance of localStorage
   * @example new CacheStorage({ type: "localStorage" })
   *
   * @param option Configuration option of CacheStorage
   */
  public constructor(private readonly option: StorageOption) {
    if (!isBrowser()) throw new Error("The current running environment is not a browser");
  }

  /** Get the default value of StorageType */
  protected get storageType(): StorageType {
    return this.option.type || "sessionStorage";
  }

  /** the method of serialization */
  private get serializer() {
    return this.option.serializer || JSON.stringify;
  }

  /** The method of deserialization */
  private get deserializer() {
    return this.option.deserializer || JSON.parse;
  }

  /**
   * Get the customized full key of this storage
   * @param key key to the stored value
   */
  protected getFullKey(key: K): string {
    const mode = this.option.mode?.toUpperCase();
    return [this.option.name, mode ? `:${mode}` : "", "/", key].join("");
  }

  /**
   * Get all storage items in the current mode
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  private getInstanceValues(type: StorageType = this.storageType): StorageValue<K>[] {
    const values: StorageValue<K>[] = [];
    for (const key in window[type]) {
      try {
        const storageValue: StorageValue<K> = JSON.parse(window[type][key]);
        if (
          storageValue.__NAME_ === this.option.name &&
          (isUndefined(this.option.mode) || storageValue.__MODE__ === this.option.mode)
        )
          values.push(storageValue);
      } catch {}
    }
    return values;
  }

  /**
   * Cache key-value pairs
   * @param key key to the stored value
   * @param value value to be stored
   * @param expiration Expiration time , unit is [minutes]
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public setItem(key: K, value: any, expiration: number = 0, type: StorageType = this.storageType): void {
    if (expiration) {
      const date = new Date();
      date.setMinutes(date.getMinutes() + expiration);
      expiration = date.valueOf();
    }
    const storageValue = new StorageValue<K>(this.option.name, key, this.serializer(value), expiration, this.option.mode);
    window[type].setItem(this.getFullKey(key), JSON.stringify(storageValue));
  }

  /**
   * Get the Stored data
   * @param key Provide the key to store data for storage
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public getItem<T = any>(key: K, type: StorageType = this.storageType): T | null {
    const fullKey = this.getFullKey(key);
    try {
      const value = window[type].getItem(fullKey);
      if (!isString(value)) {
        // console.warn(`[${this.logger.title || ""}] The storage value retrieved from ${type} by ${key} is ${typeName(value)}`);
        return null;
      }
      const { __EXPIRY__, __VALUE__ }: StorageValue<K> = JSON.parse(value);

      // Returns null if the data has expired and removes the data from storage
      if (isNumber(__EXPIRY__) && __EXPIRY__ !== 0 && Date.now() >= new Date(__EXPIRY__).valueOf()) {
        window[type].removeItem(fullKey);
        return null;
      }
      return this.deserializer(__VALUE__);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  /**
   * Remove stored key-value pairs based on key
   * @param key Provide the key to store data for storage
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public removeItem(key: K, type: StorageType = this.storageType): void {
    window[type].removeItem(this.getFullKey(key));
  }

  /**
   * Does this property exist in storage
   * @param key Provide the key to store data for storage
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public has(key: K, type: StorageType = this.storageType): boolean {
    return window[type].hasOwnProperty(this.getFullKey(key));
  }

  /**
   * Clear the key-value pairs in the current instance
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public clear(type: StorageType = this.storageType): void {
    this.getInstanceValues(type).forEach(({ __KEY__ }) => this.removeItem(__KEY__));
  }

  /**
   * Clear all key-value pairs
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public clearAll(type: StorageType = this.storageType): void {
    window[type].clear();
  }

  /**
   * Get the size of the key-value pair in the current instance
   * @param type Provide the type of storage you need, you can choose one from localStorage and sessionStorage
   * @default "sessionStorage"
   */
  public size(type: StorageType = this.storageType): number {
    return this.getInstanceValues(type).length;
  }
}

class StorageValue<K> {
  constructor(
    public readonly __NAME_: string,
    public readonly __KEY__: K,
    public readonly __VALUE__: string,
    public readonly __EXPIRY__: number,
    public readonly __MODE__?: string
  ) {}
}
