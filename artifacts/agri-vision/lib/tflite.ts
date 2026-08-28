import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export type LocalModel =
  | { state: 'loading'; isReady: false; model: undefined; error?: undefined }
  | { state: 'fallback'; isReady: true; model: undefined; error: Error }
  | { state: 'native'; isReady: true; model: NativeTfliteModel; error?: undefined };

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

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useLocalTfliteModel(source: number): LocalModel {
  const [model, setModel] = useState<LocalModel>({
    state: 'loading',
    isReady: false,
    model: undefined,
  });

  useEffect(() => {
    let cancelled = false;

    const loadNativeModel = async () => {
      if (Platform.OS === 'web' || isExpoGo) {
        if (!cancelled) {
          setModel({
            state: 'fallback',
            isReady: true,
            model: undefined,
            error: new Error(expoGoMessage),
          });
        }
        return;
      }

      try {
        // Keep this require inside the effect. Expo Go can resolve the JS package
        // but does not ship its native Nitro implementation.
        const nativeModule = require('react-native-fast-tflite') as NativeTfliteModule;
        const nativeModel = await nativeModule.loadTensorflowModel(source, []);
        if (!cancelled) {
          setModel({ state: 'native', isReady: true, model: nativeModel });
        }
      } catch (loadError) {
        if (!cancelled) {
          setModel({
            state: 'fallback',
            isReady: true,
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