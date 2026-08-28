import type { LocalModel } from './tflite';

export function useLocalTfliteModel(): LocalModel {
  return {
    state: 'fallback',
    model: undefined,
    error: new Error(
      'The native model runtime is unavailable on web. Using the local demo evaluator instead.',
    ),
  };
}