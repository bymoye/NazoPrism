import { QuantizerCelebi, Score, argbFromRgb, hexFromArgb } from '@material/material-color-utilities';
import type { ColorExtractionWorkerMessage, ColorExtractionWorkerResponse } from '../types/worker';

declare const self: DedicatedWorkerGlobalScope;

// --- Worker 内部常量 ---
const MAX_IMAGE_SIZE = 256; // 缩放后的图片最大尺寸
const QUANTIZATION_COLORS = 128; // 官方推荐的量化颜色数
const FALLBACK_COLOR_ERROR = 0xff78ccc0; 

/**
 * 计算目标尺寸（基于假设的宽高比）
 */
function calculateTargetSize(isMobile: boolean): { width: number; height: number } {
  const aspectRatio = isMobile ? 9 / 16 : 16 / 9;
  
  if (aspectRatio >= 1) { // 横向或正方形
    return {
      width: MAX_IMAGE_SIZE,
      height: Math.round(MAX_IMAGE_SIZE / aspectRatio)
    };
  } else { // 纵向
    return {
      width: Math.round(MAX_IMAGE_SIZE * aspectRatio),
      height: MAX_IMAGE_SIZE
    };
  }
}

/**
 * 计算实际缩放尺寸（保持原始宽高比）
 */
function calculateScaledSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  if (aspectRatio >= 1 ) { // 横向或正方形
    if (originalWidth > MAX_IMAGE_SIZE) {
      return {
        width: MAX_IMAGE_SIZE,
        height: Math.round(MAX_IMAGE_SIZE / aspectRatio)
      };
    }
  } else { // 纵向
    if (originalHeight > MAX_IMAGE_SIZE) {
      return {
        width: Math.round(MAX_IMAGE_SIZE * aspectRatio),
        height: MAX_IMAGE_SIZE
      };
    }
  }
  
  return { width: originalWidth, height: originalHeight };
}

/**
 * 从 ImageData 中提取像素数据
 */
function extractPixels(imageData: ImageData): number[] {
  const pixelData = imageData.data;
  const pixels: number[] = [];

  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const a = pixelData[i + 3];

    // 跳过透明像素
    if (a < 255) continue;

    pixels.push(argbFromRgb(r, g, b));
  }

  return pixels;
}

/**
 * 创建 OffscreenCanvas 并获取 ImageData
 */
function createImageData(image: ImageBitmap | VideoFrame, width: number, height: number): ImageData {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 OffscreenCanvas 上下文');
  }

  ctx.drawImage(image, 0, 0, width, height);
  
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Worker 的消息处理函数
 */
self.onmessage = async function (e: MessageEvent<ColorExtractionWorkerMessage>) {
  const { imageUrl, messageId, isMobile } = e.data;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`图片加载失败: ${response.statusText}`);
    }

    let imageData: ImageData;
    const targetSize = calculateTargetSize(isMobile);

    // 方案一：优先使用 ImageDecoder API (如果支持)
    if ('ImageDecoder' in self && response.body) {
      console.log("使用 ImageDecoder API");

      const decoder = new ImageDecoder({
        data: response.body,
        type: response.headers.get('content-type') || 'image/jpeg',
        preferAnimation: false,
        desiredHeight: targetSize.height,
        desiredWidth: targetSize.width,
      });

      // 解码第一帧
      const result = await decoder.decode({ frameIndex: 0 });
      const frame = result.image;

      // 计算最终绘制尺寸
      const scaledSize = calculateScaledSize(frame.codedWidth, frame.codedHeight);
      imageData = createImageData(frame, scaledSize.width, scaledSize.height);

      // 释放资源
      frame.close();
      decoder.close();
    }
    // 方案二：降级使用 createImageBitmap
    else {
      console.log("使用 createImageBitmap API");
      
      const blob = await response.blob();
      
      // 获取原始尺寸
      const tempBitmap = await createImageBitmap(blob);
      const scaledSize = calculateScaledSize(tempBitmap.width, tempBitmap.height);
      tempBitmap.close();
      
      // 创建缩放后的 ImageBitmap
      const imageBitmap = await createImageBitmap(blob, {
        resizeWidth: scaledSize.width,
        resizeHeight: scaledSize.height,
        resizeQuality: 'low',
      });

      imageData = createImageData(imageBitmap, imageBitmap.width, imageBitmap.height);
      imageBitmap.close();
    }

    // 提取像素数据
    const pixels = extractPixels(imageData);
    if (pixels.length === 0) {
      throw new Error('图片中没有不透明的像素');
    }

    // 使用官方算法提取颜色
    const quantizationResult = QuantizerCelebi.quantize(pixels, QUANTIZATION_COLORS);
    const rankedColors = Score.score(quantizationResult);

    if (rankedColors.length === 0) {
      throw new Error('无法从图片中提取有效颜色');
    }

    const extractedColor = rankedColors[0];

    // 发送成功响应
    self.postMessage({
      messageId,
      success: true,
      color: extractedColor,
      // hex: hexFromArgb(extractedColor),
    } as ColorExtractionWorkerResponse);

  } catch (error) {
    // 发送失败响应
    self.postMessage({
      messageId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      color: FALLBACK_COLOR_ERROR,
      hex: hexFromArgb(FALLBACK_COLOR_ERROR),
    } as ColorExtractionWorkerResponse);
  }
};