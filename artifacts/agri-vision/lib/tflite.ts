import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type LocalModel =
  | { state: 'loading'; model: undefined; error?: undefined }
  | { state: 'fallback'; model: undefined; error: Error }
  | { state: 'native'; model: NativeTfliteModel; error?: undefined };

export type NativeTfliteModel = {
  inputs: Array<{ name: string; dataType: string; shape: number[] }>;
  outputs: Array<{ name: string; dataType: string; shape: number[] }>;
  run(input: ArrayBuffer[]): Promise<ArrayBuffer[]>;
};

type NativeTfliteModule = {
  loadTensorflowModel: (
    source: number,
    delegates: string[],
  ) => Promise<NativeTfliteModel>;
};

const expoGoMessage =
  'The native model runtime is unavailable in Expo Go. Using the local demo evaluator instead.';

export function useLocalTfliteModel(source: number): LocalModel {
  const [model, setModel] = useState<LocalModel>({ state: 'loading', model: undefined });

  useEffect(() => {
    let cancelled = false;

    const loadNativeModel = async () => {
      if (Platform.OS === 'web') {
        if (!cancelled) {
          setModel({ state: 'fallback', model: undefined, error: new Error(expoGoMessage) });
        }
        return;
      }

      try {
        // Keep this require inside the effect. Expo Go can resolve the JS package
        // but does not ship its native Nitro implementation.
        const nativeModule = require('react-native-fast-tflite') as NativeTfliteModule;
        const nativeModel = await nativeModule.loadTensorflowModel(source, []);
        if (!cancelled) {
          setModel({ state: 'native', model: nativeModel });
        }
      } catch (loadError) {
        if (!cancelled) {
          setModel({
            state: 'fallback',
            model: undefined,
            error: loadError instanceof Error ? loadError : new Error(expoGoMessage),
          });
        }
      }
    };

    loadNativeModel();
    return () => {
      cancelled = true;
    };
  }, [source]);

  return model;
}