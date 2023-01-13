import { isBrowser, isNotEmpty, isObject, isUndefined } from "@sentimental/toolkit";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { Canceler } from "./canceler";
import { HttpMethod } from "./constant";

export interface RequestConfig extends AxiosRequestConfig<undefined> {
  /**
   * Automatically cancel repeated requests
   * you can set this property to false to allow repeated requests to be sent
   * @default true
   */
  autoCancel?: boolean;
}

/**
 * Override axios response type
 * @augments C Http request configuration type
 * @augments D Default data type
 */
export interface RequestResponse<C extends RequestConfig = RequestConfig, D = any> extends Omit<AxiosResponse<D>, "config"> {
  config: C;
}

/**
 * Provides all Axios functions and additional automatic cancellation
 * @augments T Type of default configuration
 * @augments D Default data type
 */
export class Request<T extends RequestConfig = RequestConfig, D = any> {
  /** The instance of the http request canceler */
  protected readonly canceler: Canceler = new Canceler();

  /** The instance of the axios */
  private readonly axiosInstance: AxiosInstance;

  /**
   * Initialize the Axios instance
   *
   * Setup http request interceptor
   * Client sends request -> [request interceptor] -> server
   *
   * Setup http request response interceptor
   * The server returns the information -> [intercept unified processing] -> the client JS gets the information
   *
   * @param config The http request configuration
   */
  public constructor(private readonly config?: T) {
    // Initialize the axios instance
    this.axiosInstance = axios.create(config);

    // Initialize this nprogress configuration
    if (isBrowser()) nProgress.configure(this.nProgressConfigure());

    // Use http request interceptor
    this.axiosInstance.interceptors.request.use((c: RequestConfig) => {
      nProgress.start();
      // If there is an unfinished repeated request, cancel the repeated request first
      if (c.autoCancel || (isUndefined(c.autoCancel) && (config?.autoCancel ?? true))) {
        this.canceler.cancel(c);
      }
      // Add the current request to the canceller
      this.canceler.add(c);

      return this.onFulfilledRequestInterceptor(<T>c);
    }, this.onRejectedRequestInterceptor.bind(this));

    // Use http response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: RequestResponse) => {
        nProgress.done();
        // After the request ends, remove this request
        this.canceler.remove(response.config);
        return this.onFulfilledResponseInterceptor(<RequestResponse<T>>response);
      },
      error => {
        nProgress.done();
        return this.onRejectedResponseInterceptor(error);
      }
    );
  }

  /**
   * The default configuration of nprogress
   * @returns nprogress configuration
   */
  protected nProgressConfigure(): Partial<nProgress.NProgressOptions> {
    return {
      easing: "ease",
      speed: 500,
      showSpinner: true,
      trickleSpeed: 200,
      minimum: 0.3
    };
  }

  /**
   * The callback for http request sending interceptor successful
   * @param config
   */
  protected onFulfilledRequestInterceptor(config: T): T {
    return config;
  }

  /**
   * The callback for http request sending interceptor failure
   * @param error
   */
  protected onRejectedRequestInterceptor(error: AxiosError): Promise<unknown> | void {
    return Promise.reject(error);
  }

  /**
   * The callback for http response interceptor successful
   * @param response
   */
  protected onFulfilledResponseInterceptor(response: RequestResponse<T, D>): any {
    return response;
  }

  /**
   * The callback for http response interceptor failure
   * @param error
   */
  protected onRejectedResponseInterceptor(error: AxiosError): Promise<unknown> | void {
    return Promise.reject(error);
  }

  /**
   * Get the method of http request
   * @param method http request method
   */
  protected request(method: HttpMethod) {
    return async <Data = any>(url: string, data?: any, config?: T): Promise<Data> => {
      if (typeof data === "object") {
        // If there is an empty object in the input member, it needs to be removed
        for (const key in data) {
          if (isObject(data[key]) && !isNotEmpty(data[key])) data[key] = undefined;
        }
      }
      // Rewrite parameters according to different request methods
      data = method.toUpperCase() === HttpMethod.GET ? { params: data } : { data };
      return <Data>await this.axiosInstance(Object.assign({}, data, this.config, config, { url, method }));
    };
  }

  /** Cancel all pending requests */
  public get cancelAll() {
    return this.canceler.cancelAll.bind(this.canceler);
  }

  /** [GET] request method */
  public get get() {
    return this.request(HttpMethod.GET);
  }

  /** [POST] request method */
  public get post() {
    return this.request(HttpMethod.POST);
  }

  /** [PUT] request method */
  public get put() {
    return this.request(HttpMethod.PUT);
  }

  /** [DELETE] request method */
  public get delete() {
    return this.request(HttpMethod.DELETE);
  }
}
