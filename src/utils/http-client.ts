/**
 * @file utils/http-client.ts
 * @description HTTP请求封装工具
 */

/**
 * HTTP请求方法类型
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 查询参数类型
 */
type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * 请求配置接口
 */
interface RequestConfig {
  /** 请求头 */
  headers?: Record<string, string>;
  /** 查询参数 */
  queryParams?: QueryParams;
  /** 请求体 */
  body?: unknown;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 缓存策略 */
  cache?: RequestCache;
  /** 是否包含凭据 */
  credentials?: RequestCredentials;
}

/**
 * HTTP响应接口
 */
interface HttpResponse<T = unknown> {
  /** 响应数据 */
  data: T;
  /** HTTP状态码 */
  status: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Headers;
  /** 是否成功 */
  ok: boolean;
}

/**
 * HTTP错误类
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly response: Response | undefined;
  public readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: Response,
    data?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.response = response ?? undefined;
    this.data = data;
  }
}

/**
 * HTTP客户端类
 */
class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeout: number;

  /**
   * 构造函数
   *
   * @param baseURL - 基础URL
   * @param defaultHeaders - 默认请求头
   * @param defaultTimeout - 默认超时时间
   */
  constructor(baseURL = '', defaultHeaders: Record<string, string> = {}, defaultTimeout = 10000) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * 构建查询字符串
   *
   * @param params - 查询参数对象
   * @returns 查询字符串
   */
  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * 构建完整URL
   *
   * @param url - 相对或绝对URL
   * @param queryParams - 查询参数
   * @returns 完整URL
   */
  private buildURL(url: string, queryParams?: QueryParams): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const queryString = queryParams ? this.buildQueryString(queryParams) : '';
    return `${fullURL}${queryString}`;
  }

  /**
   * 处理请求体
   *
   * @param body - 请求体数据
   * @param headers - 请求头
   * @returns 处理后的请求体
   */
  private processBody(
    body: unknown,
    headers: Record<string, string>,
  ): string | FormData | undefined {
    if (!body) return undefined;

    // 如果是FormData，直接返回并移除Content-Type让浏览器自动设置
    if (body instanceof FormData) {
      delete headers['Content-Type'];
      return body;
    }

    // 如果Content-Type是application/json，序列化为JSON
    if (headers['Content-Type']?.includes('application/json')) {
      return JSON.stringify(body);
    }

    // 其他情况转换为字符串
    return String(body);
  }

  /**
   * 解析响应数据
   *
   * @param response - Fetch响应对象
   * @returns 解析后的数据
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type') || '';

    try {
      if (contentType.includes('application/json')) {
        return await response.json();
      }

      if (contentType.includes('text/')) {
        return (await response.text()) as T;
      }

      // 默认尝试解析为JSON
      return await response.json();
    } catch (error) {
      // 如果解析失败，返回响应文本
      return (await response.text()) as T;
    }
  }

  /**
   * 执行HTTP请求
   *
   * @param method - HTTP方法
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns HTTP响应
   */
  private async request<T = unknown>(
    method: HttpMethod,
    url: string,
    config: RequestConfig = {},
  ): Promise<HttpResponse<T>> {
    const {
      headers = {},
      queryParams,
      body,
      timeout = this.defaultTimeout,
      cache = 'default',
      credentials = 'same-origin',
    } = config;

    // 合并请求头
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    // 构建URL
    const fullURL = this.buildURL(url, queryParams);

    // 处理请求体
    const processedBody = this.processBody(body, mergedHeaders);

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullURL, {
        method,
        headers: mergedHeaders,
        body: processedBody || null,
        cache,
        credentials,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 检查响应状态
      if (!response.ok) {
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        throw new HttpError(errorMessage, response.status, response.statusText, response);
      }

      // 解析响应数据
      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError('Request timeout', 408, 'Request Timeout');
      }

      // 重新抛出HttpError
      if (error instanceof HttpError) {
        throw error;
      }

      // 处理其他错误
      throw new HttpError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'Network Error',
      );
    }
  }

  /**
   * GET请求
   *
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns HTTP响应
   */
  public async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'body'>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, config);
  }

  /**
   * POST请求
   *
   * @param url - 请求URL
   * @param body - 请求体
   * @param config - 请求配置
   * @returns HTTP响应
   */
  public async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, { ...config, body });
  }

  /**
   * PUT请求
   *
   * @param url - 请求URL
   * @param body - 请求体
   * @param config - 请求配置
   * @returns HTTP响应
   */
  public async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, { ...config, body });
  }

  /**
   * DELETE请求
   *
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns HTTP响应
   */
  public async delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, config);
  }

  /**
   * PATCH请求
   *
   * @param url - 请求URL
   * @param body - 请求体
   * @param config - 请求配置
   * @returns HTTP响应
   */
  public async patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, { ...config, body });
  }
}

// 创建默认的HTTP客户端实例
const httpClient = new HttpClient();

// 导出HTTP客户端类和默认实例
export { HttpClient, httpClient };
export type { HttpResponse, RequestConfig, QueryParams };
