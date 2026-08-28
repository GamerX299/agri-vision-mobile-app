export function useLocalTfliteModel() {
  return {
    state: 'error' as const,
    error: new Error('Native TFLite inference is available in an iOS or Android development build.'),
    model: undefined,
  };
}