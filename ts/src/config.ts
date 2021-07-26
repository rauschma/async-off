import { z } from 'zod';


interface ConfigJson {
  /**
   * Removes a function call wrapped around a value.
   * Use case – unit testing:
   * 
   * ```ts
   * processAsyncData(toAsyncIterable(['a', 'b', 'c']));
   * processSyncData(['a', 'b', 'c']);
   * ```
   * 
   * Note: (processAsyncData() is renamed separately.)
   */
  unwrapFunctionCall?: Array<string>;
  /**
   * Included by default: `"Promise"`
   */
  unwrapParamerizedType?: Array<string>;
  renameVariable?: Record<string, string>;
  /**
   * Included by default: `{"AsyncIterable": "Iterable"}`
   */
  renameType?: Record<string, string>;
}

/**
 * Redundant type definition, but the interface is
 * easier to read and is better documentation.
 */
const ConfigJsonSchema = z.object({
  unwrapFunctionCall: z.array(z.string()).optional(),
  unwrapParamerizedType: z.array(z.string()).optional(),
  renameVariable: z.record(z.string()).optional(),
  renameType: z.record(z.string()).optional(),
});

function validateConfigJson(data: unknown): ConfigJson {
  return ConfigJsonSchema.parse(data); // may throw an exception
}

export interface Config {
  unwrapFunctionCall: Set<string>;
  unwrapParamerizedType: Set<string>;
  renameVariable: Map<string, string>;
  renameType: Map<string, string>;
}

export function extractConfig(inputText: string): Config {

  let config: ConfigJson = {};
  const configMatch = /\n\s*\/\/<async-off-config>(.*?)\n\s*\/\/<\/async-off-config>/us.exec(inputText);
  if (configMatch) {
    const settingsStr = configMatch[1].replace(/\n\s*\/\//g, '\n');
    config = validateConfigJson(JSON.parse(settingsStr));
  }

  const unwrapFunctionCall = new Set<string>(config.unwrapFunctionCall);
  const unwrapParamerizedType = new Set<string>(config.unwrapFunctionCall);
  const renameVariable = new Map<string, string>(Object.entries(config.renameVariable ?? {}));
  const renameType = new Map<string, string>(Object.entries(config.renameType ?? {}));

  unwrapParamerizedType.add('Promise');
  renameType.set('AsyncIterable', 'Iterable');
  renameType.set('AsyncIterator', 'Iterator');

  return {unwrapFunctionCall, unwrapParamerizedType, renameVariable, renameType};
}
