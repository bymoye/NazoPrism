/**
 * @file utils/type-guards.ts
 * @description 类型守卫工具集
 * 
 * 提供运行时类型检查的工具函数，用于安全的类型判断和类型缩窄
 * 所有函数都使用TypeScript的类型守卫语法，确保类型安全
 */

/**
 * 检查值是否为字符串
 * 
 * @param value - 要检查的值
 * @returns 如果是字符串则返回true
 * 
 * @example
 * ```typescript
 * const data: unknown = 'hello';
 * if (isString(data)) {
 *   console.log(data.toUpperCase()); // TypeScript知道这是字符串类型
 * }
 * ```
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * 检查值是否为对象（非null，非数组）
 * 
 * @param value - 要检查的值
 * @returns 如果是对象则返回true
 * 
 * @example
 * ```typescript
 * const data: unknown = { name: 'test' };
 * if (isObject(data)) {
 *   console.log(data.name); // TypeScript知道这是对象类型
 * }
 * ```
 */
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * 检查值是否为数组
 * 
 * @param value - 要检查的值
 * @returns 如果是数组则返回true
 * 
 * @example
 * ```typescript
 * const data: unknown = [1, 2, 3];
 * if (isArray(data)) {
 *   console.log(data.length); // TypeScript知道这是数组类型
 * }
 * ```
 */
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);

/**
 * 检查值是否为Error对象
 * 
 * @param value - 要检查的值
 * @returns 如果是Error对象则返回true
 * 
 * @example
 * ```typescript
 * try {
 *   throw new Error('测试错误');
 * } catch (error) {
 *   if (isError(error)) {
 *     console.log(error.message); // TypeScript知道这是Error类型
 *   }
 * }
 * ```
 */
export const isError = (value: unknown): value is Error => value instanceof Error;
