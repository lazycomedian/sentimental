import { isExist } from "@sentimental/toolkit";
import axios, { AxiosRequestConfig, Canceler as AxiosCanceler } from "axios";

function stringify(data: Record<any, any>): string {
  if (!isExist(data)) return "";
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export class Canceler {
  protected readonly cancelers: Map<string, AxiosCanceler> = new Map();

  /**
   * Get the serialized parameter path
   * @param config The configuration of Axios
   */
  protected static getPathKey(config: AxiosRequestConfig): string {
    return [config.method, config.url, stringify(config.data), stringify(config.params)].join("&");
  }

  /**
   * Add a cancel request method
   * @param config The configuration of Axios
   */
  public add(config: AxiosRequestConfig): void {
    // Before the request starts, check the previous request to cancel the operation
    this.remove(config);

    const key = Canceler.getPathKey(config);
    if (!config.cancelToken && !this.cancelers.has(key)) {
      // 如果在集合中不存在当前请求，则添加
      const { token, cancel } = axios.CancelToken.source();

      config.cancelToken = token;
      this.cancelers.set(key, cancel);
    }
  }

  /**
   * Remove this outstanding request
   * @param config The configuration of Axios
   */
  public remove(config: AxiosRequestConfig): void {
    const key = Canceler.getPathKey(config);
    if (this.cancelers.has(key)) this.cancelers.delete(key);
  }

  /**
   * Cancel this outstanding request and remove it
   * @param config The configuration of Axios
   * @param message Additional message when removing this request
   */
  public cancel(config: AxiosRequestConfig, message?: string) {
    const key = Canceler.getPathKey(config);
    if (this.cancelers.has(key)) {
      const cancel = this.cancelers.get(key);
      cancel && cancel(message);

      this.cancelers.delete(key);
    }
  }

  /**
   * Cancel all pending requests
   */
  public cancelAll(): void {
    this.cancelers.forEach(canceler => canceler && canceler("Cancel all pending requests"));
    this.cancelers.clear();
  }
}
