import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import * as jpeg from 'jpeg-js';
import { useApp } from '@/context/AppContext';
import { diseases } from '@/data/diseases';
import MODEL_ASSET from '@/assets/model.tflite';
import { useLocalTfliteModel } from '@/lib/tflite';

type InferenceResult = {
  disease: typeof diseases[number];
  confidence: number;
};

function toProbabilities(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const alreadyProbabilities = values.every((value) => value >= 0 && value <= 1) && total > 0.85 && total < 1.15;
  if (alreadyProbabilities) return values;
  const max = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - max));
  const exponentialTotal = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / exponentialTotal);
}

async function makeModelInput(uri: string, dataType: string): Promise<ArrayBuffer> {
  const file = new File(uri);
  const encoded = new Uint8Array(await file.arrayBuffer());
  const decoded = jpeg.decode(encoded, { useTArray: true });
  if (decoded.width !== 224 || decoded.height !== 224) {
    throw new Error('Preprocessed image must be 224 by 224 pixels.');
  }

  const pixelCount = decoded.width * decoded.height;
  if (dataType === 'float32') {
    const values = new Float32Array(pixelCount * 3);
    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      const source = pixel * 4;
      const target = pixel * 3;
      values[target] = decoded.data[source] / 255;
      values[target + 1] = decoded.data[source + 1] / 255;
      values[target + 2] = decoded.data[source + 2] / 255;
    }
    return values.buffer;
  }
  if (dataType === 'uint8') {
    const values = new Uint8Array(pixelCount * 3);
    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      const source = pixel * 4;
      const target = pixel * 3;
      values[target] = decoded.data[source];
      values[target + 1] = decoded.data[source + 1];
      values[target + 2] = decoded.data[source + 2];
    }
    return values.buffer;
  }
  throw new Error(`Unsupported model input type: ${dataType}`);
}

export default function Diagnosis() {
  const { colors: c, isArabic, language, toggleLanguage, toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  const modelPlugin = useLocalTfliteModel(MODEL_ASSET);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settingsRequired, setSettingsRequired] = useState(false);
  const t = (en: string, ar: string) => (isArabic ? ar : en);

  const runInference = async (uri: string) => {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        throw new Error('Native TFLite inference is available in an iOS or Android development build.');
      }
      if (modelPlugin.state !== 'loaded') {
        throw new Error('The offline model is still loading. Please try again in a moment.');
      }
      const input = modelPlugin.model.inputs[0];
      const output = modelPlugin.model.outputs[0];
      if (!input || !output || input.shape.join('x') !== '1x224x224x3') {
        throw new Error('This model does not expose the expected 224×224 RGB input.');
      }
      const outputSize = output.shape.reduce((size, dimension) => size * dimension, 1);
      if (outputSize !== diseases.length) {
        throw new Error(`This model does not expose the expected ${diseases.length}-class output.`);
      }
      const inputBuffer = await makeModelInput(uri, input.dataType);
      const outputs = await modelPlugin.model.run([inputBuffer]);
      const rawOutput = output.dataType === 'uint8' ? new Uint8Array(outputs[0]) : new Float32Array(outputs[0]);
      const probabilities = toProbabilities(Array.from(rawOutput));
      const bestIndex = probabilities.indexOf(Math.max(...probabilities));
      const confidence = probabilities[bestIndex] ?? 0;
      if (confidence < 0.5 || bestIndex < 0 || bestIndex >= diseases.length) {
        setError(t('Unrecognized / Non-Plant Image. Please capture a clear leaf photo.', 'لم يتم التعرف على ورقة نباتية. يرجى التقاط صورة واضحة لورقة النبتة.'));
        return;
      }
      setResult({ disease: diseases[bestIndex], confidence: Math.round(confidence * 100) });
    } catch (inferenceError) {
      setError(inferenceError instanceof Error ? inferenceError.message : t('Unable to run the offline diagnosis.', 'تعذر تشغيل التشخيص دون اتصال.'));
    } finally {
      setBusy(false);
    }
  };

  const pick = async (fromCamera: boolean) => {
    try {
      setError(null);
      setSettingsRequired(false);
      const permission = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(t('Permission is needed to access your camera or gallery.', 'يلزم السماح بالوصول إلى الكاميرا أو المعرض.'));
        setSettingsRequired(Platform.OS !== 'web' && permission.canAskAgain === false);
        return;
      }
      const response = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false });
      const originalUri = response.canceled ? null : response.assets[0]?.uri;
      if (!originalUri) return;
      setImageUri(originalUri);
      const resized = await manipulateAsync(originalUri, [{ resize: { width: 224, height: 224 } }], { compress: 0.85, format: SaveFormat.JPEG });
      await runInference(resized.uri);
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : t('Unable to read this image.', 'تعذر قراءة هذه الصورة.'));
      setSettingsRequired(false);
      setBusy(false);
    }
  };

  const modelMessage = modelPlugin.state === 'loading'
    ? t('Loading offline model…', 'جارٍ تحميل النموذج دون اتصال…')
    : modelPlugin.state === 'error'
      ? t('Offline model unavailable in this build.', 'النموذج دون اتصال غير متاح في هذا الإصدار.')
      : t('Offline model ready · 14 classes', 'النموذج جاهز · 14 فئة');

  return (
    <View style={[styles.root, { backgroundColor: c.background, direction: isArabic ? 'rtl' : 'ltr' }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={[styles.eyebrow, { color: c.primary }]}>{t('PLANT CLINIC', 'عيادة النبات')}</Text><Text style={[styles.title, { color: c.foreground }]}>{t('Field diagnosis', 'التشخيص الميداني')}</Text></View>
          <View style={styles.actions}><Pressable onPress={toggleLanguage} style={[styles.iconButton, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.lang, { color: c.foreground }]}>{language === 'en' ? 'ع' : 'EN'}</Text></Pressable><Pressable onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: c.card, borderColor: c.border }]}><Feather name={c.background === '#10231D' ? 'sun' : 'moon'} size={18} color={c.foreground} /></Pressable></View>
        </View>
        <Text style={[styles.intro, { color: c.mutedForeground }]}>{t('Capture a full leaf photo. The image is resized in memory and evaluated locally across all 14 crop conditions.', 'التقط صورة كاملة للورقة. تتم إعادة تحجيم الصورة في الذاكرة وتحليلها محلياً عبر 14 حالة زراعية.')}</Text>
        <View style={[styles.preview, { backgroundColor: c.card, borderColor: c.border }]}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <><View style={[styles.cameraGlyph, { backgroundColor: c.soft }]}><Feather name="camera" size={32} color={c.primary} /></View><Text style={[styles.previewTitle, { color: c.foreground }]}>{t('No image selected', 'لم يتم اختيار صورة')}</Text><Text style={[styles.previewBody, { color: c.mutedForeground }]}>{t('Full-size images are accepted without forced cropping.', 'تُقبل الصور كاملة الحجم دون قص إجباري.')}</Text></>}</View>
        <View style={styles.captureRow}><Pressable testID="open-camera" onPress={() => pick(true)} style={({ pressed }) => [styles.capture, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}><Feather name="camera" size={20} color={c.primaryForeground} /><Text style={[styles.captureText, { color: c.primaryForeground }]}>{t('Camera', 'الكاميرا')}</Text></Pressable><Pressable testID="open-gallery" onPress={() => pick(false)} style={({ pressed }) => [styles.capture, { backgroundColor: c.secondary, opacity: pressed ? 0.8 : 1 }]}><Feather name="image" size={20} color={c.secondaryForeground} /><Text style={[styles.captureText, { color: c.secondaryForeground }]}>{t('Gallery', 'المعرض')}</Text></Pressable></View>
        <View style={[styles.modelStatus, { backgroundColor: c.soft }]}><View style={[styles.statusDot, { backgroundColor: modelPlugin.state === 'loaded' ? c.success : modelPlugin.state === 'error' ? c.danger : c.warning }]} /><Text style={[styles.modelStatusText, { color: c.secondaryForeground }]}>{modelMessage}</Text></View>
        {busy && <View style={[styles.processing, { backgroundColor: c.soft }]}><ActivityIndicator color={c.primary} /><Text style={[styles.processingText, { color: c.secondaryForeground }]}>{t('Resizing and evaluating 224 × 224 RGB input…', 'جارٍ تحجيم وتحليل مدخل RGB بحجم 224 × 224…')}</Text></View>}
         {!!error && !busy && <View style={[styles.errorCard, { backgroundColor: `${c.danger}12`, borderColor: c.danger }]}><Feather name="alert-circle" size={18} color={c.danger} /><Text style={[styles.errorText, { color: c.foreground }]}>{error}</Text>{settingsRequired && <Pressable testID="open-settings" onPress={() => Linking.openSettings().catch(() => undefined)} style={[styles.settingsButton, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.settingsButtonText, { color: c.foreground }]}>{t('Open Settings', 'فتح الإعدادات')}</Text></Pressable>}</View>}
        {result && !busy && <View style={[styles.result, { backgroundColor: c.card, borderColor: c.border }]}><View style={styles.resultHead}><View style={{ flex: 1 }}><Text style={[styles.resultEyebrow, { color: c.primary }]}>{t('DIAGNOSIS RESULT', 'نتيجة التشخيص')}</Text><Text style={[styles.resultTitle, { color: c.foreground }]}>{isArabic ? result.disease.ar : result.disease.en}</Text></View><View style={[styles.confidence, { backgroundColor: c.soft }]}><Text style={[styles.confidenceNumber, { color: c.primary }]}>{result.confidence}%</Text><Text style={[styles.confidenceLabel, { color: c.mutedForeground }]}>{t('confidence', 'ثقة')}</Text></View></View><View style={[styles.divider, { backgroundColor: c.border }]} /><View style={styles.rx}><View style={[styles.rxIcon, { backgroundColor: `${c.accent}35` }]}><Feather name="shield" size={17} color={c.accentForeground} /></View><View style={{ flex: 1 }}><Text style={[styles.rxLabel, { color: c.mutedForeground }]}>{t('Recommended treatment', 'العلاج الموصى به')}</Text><Text style={[styles.rxText, { color: c.foreground }]}>{isArabic ? result.disease.treatmentAr : result.disease.treatmentEn}</Text></View></View><View style={[styles.offline, { backgroundColor: c.soft }]}><Feather name="check-circle" size={15} color={c.success} /><Text style={[styles.offlineText, { color: c.secondaryForeground }]}>{t('Predicted from the local model output', 'تم التنبؤ من مخرجات النموذج المحلي')}</Text></View></View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 17 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.6, marginBottom: 8 },
  title: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lang: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  intro: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginBottom: 18, maxWidth: 360 },
  preview: { height: 250, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 14 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  cameraGlyph: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  previewTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 5 },
  previewBody: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  captureRow: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  capture: { flex: 1, minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  captureText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  modelStatus: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  modelStatusText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  processing: { borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  processingText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, flex: 1 },
  errorCard: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  errorText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 19, flex: 1 },
  settingsButton: { borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, marginLeft: 28 },
  settingsButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  result: { borderRadius: 22, borderWidth: 1, padding: 18 },
  resultHead: { flexDirection: 'row', alignItems: 'flex-start' },
  resultEyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 27, maxWidth: 220 },
  confidence: { borderRadius: 15, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center' },
  confidenceNumber: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  confidenceLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2 },
  divider: { height: 1, marginVertical: 17 },
  rx: { flexDirection: 'row', gap: 12 },
  rxIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rxLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 5 },
  rxText: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 21 },
  offline: { flexDirection: 'row', gap: 7, alignItems: 'center', borderRadius: 12, padding: 11, marginTop: 17 },
  offlineText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
});