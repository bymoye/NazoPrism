/**
 * Worker 相关的类型定义
 */

// Color Extraction Worker 消息类型
export interface ColorExtractionWorkerMessage {
  imageUrl: string;
  messageId: number;
  isMobile: boolean;
}

// Color Extraction Worker 响应类型
export interface ColorExtractionWorkerResponse {
  messageId: number;
  success: boolean;
  color: number;
  error?: string;
}

// Worker 就绪消息类型
export interface WorkerReadyMessage {
  type: 'ready';
  message: string;
}

// Worker 消息联合类型
export type WorkerMessageData = ColorExtractionWorkerResponse | WorkerReadyMessage;
