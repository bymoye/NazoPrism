import { Hct, QuantizerCelebi, Score, hexFromArgb } from '@material/material-color-utilities';
import type { ColorExtractionWorkerMessage, ColorExtractionWorkerResponse } from '../types/worker';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async function (e: MessageEvent<ColorExtractionWorkerMessage>) {
  const { blob, messageId } = e.data;

  try {
    if (!blob) {
      throw new Error('没有接收到有效的图片 Blob 数据');
    }

    // 在 Worker 中处理图片 Blob
    const imageBitmap = await createImageBitmap(blob);

    // 计算缩放尺寸以提高性能
    const maxSize = 80;
    const scale = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
    const width = Math.floor(imageBitmap.width * scale);
    const height = Math.floor(imageBitmap.height * scale);

    // 创建 OffscreenCanvas 并获取像素数据
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 OffscreenCanvas 上下文');
    }

    // 绘制缩放后的图片
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixelData = imageData.data;

    // 这个数组只保存那些通过了过滤的、有代表性的颜色
    const filteredPixels: number[] = [];

    for (let i = 0; i < pixelData.length; i += 4) {
      const a = pixelData[i + 3];
      // 忽略透明或半透明像素
      if (a < 255) {
        continue;
      }

      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const argb = (a << 24) | (r << 16) | (g << 8) | b;

      // 使用 HCT 颜色空间的 Tone (亮度, 0-100) 来判断
      // 过滤掉几乎纯白 (Tone > 95) 或几乎纯黑 (Tone < 5) 的颜色
      const hct = Hct.fromInt(argb);
      if (hct.tone > 95.0 || hct.tone < 5.0) {
        continue;
      }

      // 将通过所有考验的像素添加到数组中
      filteredPixels.push(argb);
    }

    // 使用的像素数据进行量化和评分
    const quantizationResult = QuantizerCelebi.quantize(filteredPixels, 128);
    const ranked = Score.score(quantizationResult);

    // 直接取用评分最高的结果，并提供一个备用色
    const extractedColor = ranked[0] || 0xff4285f4; // Google Blue as a fallback
    const hexColor = hexFromArgb(extractedColor);

    // 发送结果
    const successResponse: ColorExtractionWorkerResponse = {
      messageId,
      success: true,
      color: extractedColor,
      hex: hexColor,
    };
    self.postMessage(successResponse);
  } catch (error) {
    const errorResponse: ColorExtractionWorkerResponse = {
      messageId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      color: 0xff6750a4,
      hex: '#64B5B9FF',
    };
    self.postMessage(errorResponse);
  }
};
