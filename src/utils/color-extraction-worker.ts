import { Hct, QuantizerCelebi, Score, hexFromArgb } from '@material/material-color-utilities';
import type { ColorExtractionWorkerMessage, ColorExtractionWorkerResponse } from '../types/worker';

declare const self: DedicatedWorkerGlobalScope;

// --- Worker 内部常量 ---
const MAX_IMAGE_SIZE = 80; // 缩放后的图片最大尺寸
const QUANTIZATION_COLORS = 128; // 量化的目标颜色数
const MIN_HCT_TONE = 5.0; // 过滤的最低 HCT Tone 值
const MAX_HCT_TONE = 95.0; // 过滤的最高 HCT Tone 值
const FALLBACK_COLOR_ERROR = 0xff6750a4; // 发生错误时的备用色 (M3 Purple)
const DEFAULT_SEED_COLOR = 0xff78ccc0;
/**
 * Worker 的消息处理函数
 */
self.onmessage = async function (e: MessageEvent<ColorExtractionWorkerMessage>) {
  const { arrayBuffer, messageId } = e.data;

  try {
    if (!arrayBuffer) {
      throw new Error('没有接收到有效的 ArrayBuffer 数据');
    }

    // 从接收到的 ArrayBuffer 重新创建一个 Blob 对象
    const blob = new Blob([arrayBuffer]);

    // [FIX] 修正：使用 Worker 内部的常量进行缩放
    const imageBitmap = await createImageBitmap(blob, {
      resizeWidth: MAX_IMAGE_SIZE,
      resizeHeight: MAX_IMAGE_SIZE,
      resizeQuality: 'low',
    });

    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建 OffscreenCanvas 上下文');
    }

    ctx.drawImage(imageBitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);

    imageBitmap.close(); // 及时释放 ImageBitmap 内存
    const pixelData = imageData.data;

    const opaquePixels: number[] = [];
    for (let i = 0; i < pixelData.length; i += 4) {
      if (pixelData[i + 3] < 255) {
        continue;
      }
      const argb =
        (pixelData[i + 3] << 24) |
        (pixelData[i] << 16) |
        (pixelData[i + 1] << 8) |
        pixelData[i + 2];
      opaquePixels.push(argb);
    }

    if (opaquePixels.length === 0) {
      throw new Error('图片中没有不透明的像素');
    }

    const quantizationResult = QuantizerCelebi.quantize(opaquePixels, QUANTIZATION_COLORS);

    const filteredQuantizationResult = new Map<number, number>();
    for (const [color, count] of quantizationResult.entries()) {
      const hct = Hct.fromInt(color);
      if (hct.tone >= MIN_HCT_TONE && hct.tone <= MAX_HCT_TONE) {
        filteredQuantizationResult.set(color, count);
      }
    }

    const colorsToScore =
      filteredQuantizationResult.size > 0 ? filteredQuantizationResult : quantizationResult;

    const ranked = Score.score(colorsToScore);
    const extractedColor = ranked[0] || DEFAULT_SEED_COLOR; // 如果评分无结果，也使用一个备用色

    const successResponse: ColorExtractionWorkerResponse = {
      messageId,
      success: true,
      color: extractedColor,
      hex: hexFromArgb(extractedColor),
    };
    self.postMessage(successResponse);
  } catch (error) {
    const errorResponse: ColorExtractionWorkerResponse = {
      messageId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      color: FALLBACK_COLOR_ERROR,
      hex: hexFromArgb(FALLBACK_COLOR_ERROR),
    };
    self.postMessage(errorResponse);
  }
};
