import { useTensorflowModel } from 'react-native-fast-tflite';

export function useLocalTfliteModel(source: number) {
  return useTensorflowModel(source, []);
}