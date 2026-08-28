import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useApp } from '@/context/AppContext';

type Farm = {
  id: string;
  nameEn: string;
  nameAr: string;
  regionEn: string;
  regionAr: string;
  cropEn: string;
  cropAr: string;
  moisture: string;
  temperature: string;
  stress: number;
  marker: { left: `${number}%`; top: `${number}%` };
};

const farms: Farm[] = [
  {
    id: 'KSA-QS-014',
    nameEn: 'Al-Qassim Olive & Date Farm',
    nameAr: 'مزرعة القصيم للزيتون والتمور',
    regionEn: 'Al-Qassim',
    regionAr: 'القصيم',
    cropEn: 'Dates · Olive',
    cropAr: 'تمور · زيتون',
    moisture: '38%',
    temperature: '31°C',
    stress: 22,
    marker: { left: '44%', top: '45%' },
  },
  {
    id: 'KSA-TB-008',
    nameEn: 'Tabuk Wheat Sector B',
    nameAr: 'قطاع القمح B في تبوك',
    regionEn: 'Tabuk',
    regionAr: 'تبوك',
    cropEn: 'Winter wheat',
    cropAr: 'قمح شتوي',
    moisture: '21%',
    temperature: '27°C',
    stress: 68,
    marker: { left: '27%', top: '42%' },
  },
  {
    id: 'KSA-JF-004',
    nameEn: 'Al-Jauf Farm #04',
    nameAr: 'مزرعة الجوف رقم 04',
    regionEn: 'Al-Jauf',
    regionAr: 'الجوف',
    cropEn: 'Stone fruit',
    cropAr: 'فواكه حجرية',
    moisture: '44%',
    temperature: '29°C',
    stress: 14,
    marker: { left: '29%', top: '24%' },
  },
  {
    id: 'KSA-RY-021',
    nameEn: 'Riyadh Greenhouse Cluster',
    nameAr: 'مجمع البيوت المحمية في الرياض',
    regionEn: 'Riyadh',
    regionAr: 'الرياض',
    cropEn: 'Tomato · Cucumber',
    cropAr: 'طماطم · خيار',
    moisture: '29%',
    temperature: '34°C',
    stress: 51,
    marker: { left: '57%', top: '61%' },
  },
  {
    id: 'KSA-EP-019',
    nameEn: 'Eastern Province Citrus Farm',
    nameAr: 'مزرعة الحمضيات بالمنطقة الشرقية',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    cropEn: 'Citrus',
    cropAr: 'حمضيات',
    moisture: '47%',
    temperature: '33°C',
    stress: 18,
    marker: { left: '79%', top: '55%' },
  },
];

function MetricCard({
  icon,
  label,
  value,
  detail,
  color,
  cardColor,
  labelColor,
  valueColor,
  detailColor,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  detail: string;
  color: string;
  cardColor: string;
  labelColor: string;
  valueColor: string;
  detailColor: string;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: cardColor }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.metricLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.metricDetail, { color: detailColor }]}>{detail}</Text>
    </View>
  );
}

function KsaMap({
  selectedFarm,
  onSelect,
  radarActive,
  onRadar,
  onClose,
}: {
  selectedFarm: Farm | null;
  onSelect: (farm: Farm) => void;
  radarActive: boolean;
  onRadar: () => void;
  onClose: () => void;
}) {
  const { colors: c, isArabic } = useApp();
  const radarScale = useRef(new Animated.Value(0.25)).current;
  const radarOpacity = useRef(new Animated.Value(0.75)).current;
  const t = (en: string, ar: string) => (isArabic ? ar : en);

  useEffect(() => {
    if (!radarActive) {
      radarScale.stopAnimation();
      radarOpacity.stopAnimation();
      radarScale.setValue(0.25);
      radarOpacity.setValue(0.75);
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(radarScale, { toValue: 1.8, duration: 1700, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(radarOpacity, { toValue: 0.05, duration: 850, useNativeDriver: true }),
          Animated.timing(radarOpacity, { toValue: 0.75, duration: 850, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [radarActive, radarOpacity, radarScale]);

  return (
    <View style={[styles.mapScreen, { backgroundColor: c.background, direction: isArabic ? 'rtl' : 'ltr' }]}>
      <View style={[styles.mapHeader, { paddingTop: 12 }]}>
        <Pressable onPress={onClose} style={[styles.circleButton, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={19} color={c.foreground} />
        </Pressable>
        <View style={styles.mapHeaderCopy}>
          <Text style={[styles.mapEyebrow, { color: c.primary }]}>{t('KSA FARM EXPLORATION', 'استكشاف مزارع المملكة')}</Text>
          <Text style={[styles.mapTitle, { color: c.foreground }]}>{t('Saudi Arabia', 'المملكة العربية السعودية')}</Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: c.soft }]}>
          <View style={[styles.liveDot, { backgroundColor: c.success }]} />
          <Text style={[styles.liveText, { color: c.secondaryForeground }]}>{t('LIVE', 'مباشر')}</Text>
        </View>
      </View>

      <View style={[styles.mapCanvas, { backgroundColor: c.soft, borderColor: c.border }]}>
        <View style={styles.mapGrid}>
          <View style={[styles.gridLine, { backgroundColor: c.border }]} />
          <View style={[styles.gridLineHorizontal, { backgroundColor: c.border }]} />
        </View>
        <Svg width="100%" height="100%" viewBox="0 0 340 440" style={StyleSheet.absoluteFill}>
          <Path
            d="M51 62 L76 47 L108 40 L143 41 L179 47 L209 56 L231 70 L242 86 L252 98 L249 111 L261 125 L258 140 L270 154 L266 171 L278 187 L274 204 L287 220 L281 237 L294 252 L286 268 L300 284 L291 300 L275 307 L268 321 L252 329 L235 333 L220 346 L202 351 L184 363 L165 372 L147 365 L129 358 L112 347 L96 341 L82 330 L71 315 L61 303 L57 287 L47 275 L50 260 L40 246 L44 228 L37 213 L41 195 L35 179 L40 162 L35 146 L44 130 L41 114 L50 99 L46 84 L54 72 Z"
            fill={`${c.primary}20`}
            stroke={c.primary}
            strokeWidth="2"
          />
          <SvgText x="121" y="188" fill={c.primary} fontSize="14" fontWeight="700">KSA</SvgText>
          <SvgText x="105" y="207" fill={c.mutedForeground} fontSize="8">AGRICULTURAL SITES</SvgText>
        </Svg>

        <Text style={[styles.regionLabel, styles.riyadhLabel, { color: c.mutedForeground }]}>{t('Riyadh', 'الرياض')}</Text>
        <Text style={[styles.regionLabel, styles.qassimLabel, { color: c.mutedForeground }]}>{t('Al-Qassim', 'القصيم')}</Text>
        <Text style={[styles.regionLabel, styles.tabukLabel, { color: c.mutedForeground }]}>{t('Tabuk', 'تبوك')}</Text>
        <Text style={[styles.regionLabel, styles.easternLabel, { color: c.mutedForeground }]}>{t('Eastern', 'الشرقية')}</Text>

        {farms.map((farm) => {
          const stressed = farm.stress >= 50 || (radarActive && farm.id === 'KSA-QS-014');
          const selected = selectedFarm?.id === farm.id;
          return (
            <Pressable
              key={farm.id}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(farm);
              }}
              style={[styles.marker, { left: farm.marker.left, top: farm.marker.top }]}
              testID={`farm-marker-${farm.id}`}
            >
              {selected && <View style={[styles.markerHalo, { borderColor: c.primary }]} />}
              <View style={[styles.markerPin, { backgroundColor: stressed ? c.danger : c.primary, borderColor: c.background }]}>
                <Feather name={stressed ? 'alert-triangle' : 'map-pin'} size={12} color="#FFFFFF" />
              </View>
            </Pressable>
          );
        })}

        {radarActive && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.radarPulse,
              {
                borderColor: c.accent,
                transform: [{ scale: radarScale }],
                opacity: radarOpacity,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.mapLegend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: c.primary }]} /><Text style={[styles.legendText, { color: c.mutedForeground }]}>{t('Healthy site', 'موقع سليم')}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: c.danger }]} /><Text style={[styles.legendText, { color: c.mutedForeground }]}>{t('Stress alert', 'تنبيه إجهاد')}</Text></View>
      </View>

      <Pressable
        testID="start-radar-scan"
        onPress={onRadar}
        style={({ pressed }) => [styles.radarButton, { backgroundColor: c.primary, opacity: pressed ? 0.82 : 1 }]}
      >
        <Feather name={radarActive ? 'loader' : 'radio'} size={19} color={c.primaryForeground} />
        <Text style={[styles.radarButtonText, { color: c.primaryForeground }]}>{radarActive ? t('Scanning farms…', 'جارٍ مسح المزارع…') : t('Start Radar Scan', 'مسح الرادار')}</Text>
      </Pressable>
    </View>
  );
}

function FarmSheet({ farm, onClose, onDiagnose }: { farm: Farm; onClose: () => void; onDiagnose: () => void }) {
  const { colors: c, isArabic } = useApp();
  const t = (en: string, ar: string) => (isArabic ? ar : en);
  const stressed = farm.stress >= 50;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.sheetDismiss} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: c.card, direction: isArabic ? 'rtl' : 'ltr' }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={styles.sheetTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetEyebrow, { color: c.primary }]}>{t(farm.regionEn.toUpperCase(), farm.regionAr)}</Text>
              <Text style={[styles.sheetTitle, { color: c.foreground }]}>{isArabic ? farm.nameAr : farm.nameEn}</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.sheetClose, { backgroundColor: c.soft }]}>
              <Feather name="x" size={18} color={c.foreground} />
            </Pressable>
          </View>
          <View style={styles.farmIdRow}>
            <Feather name="hash" size={13} color={c.mutedForeground} />
            <Text style={[styles.farmId, { color: c.mutedForeground }]}>{t('Farm ID', 'معرّف المزرعة')} · {farm.id}</Text>
            <View style={[styles.chainPill, { backgroundColor: c.soft }]}>
              <Feather name="link" size={12} color={c.success} />
              <Text style={[styles.chainText, { color: c.success }]}>{t('Verified', 'موثّق')}</Text>
            </View>
          </View>
          <View style={styles.telemetryGrid}>
            <View style={[styles.telemetry, { backgroundColor: c.soft }]}><Text style={[styles.telemetryLabel, { color: c.mutedForeground }]}>{t('Crop type', 'المحصول')}</Text><Text style={[styles.telemetryValue, { color: c.foreground }]}>{isArabic ? farm.cropAr : farm.cropEn}</Text></View>
            <View style={[styles.telemetry, { backgroundColor: c.soft }]}><Text style={[styles.telemetryLabel, { color: c.mutedForeground }]}>{t('Soil moisture', 'رطوبة التربة')}</Text><Text style={[styles.telemetryValue, { color: c.foreground }]}>{farm.moisture}</Text></View>
            <View style={[styles.telemetry, { backgroundColor: c.soft }]}><Text style={[styles.telemetryLabel, { color: c.mutedForeground }]}>{t('Temperature', 'الحرارة')}</Text><Text style={[styles.telemetryValue, { color: c.foreground }]}>{farm.temperature}</Text></View>
            <View style={[styles.telemetry, { backgroundColor: c.soft }]}><Text style={[styles.telemetryLabel, { color: c.mutedForeground }]}>{t('AI stress', 'إجهاد الذكاء الاصطناعي')}</Text><Text style={[styles.telemetryValue, { color: stressed ? c.danger : c.success }]}>{farm.stress}%</Text></View>
          </View>
          {stressed ? (
            <Pressable onPress={onDiagnose} style={({ pressed }) => [styles.sheetAction, { backgroundColor: c.accent, opacity: pressed ? 0.82 : 1 }]} testID="diagnose-farm-leaf">
              <Feather name="camera" size={18} color={c.accentForeground} />
              <Text style={[styles.sheetActionText, { color: c.accentForeground }]}>{t('Diagnose Leaf Health', 'تشخيص صحة الأوراق')}</Text>
              <Feather name={isArabic ? 'arrow-left' : 'arrow-right'} size={17} color={c.accentForeground} />
            </Pressable>
          ) : (
            <View style={[styles.healthyNotice, { backgroundColor: c.soft }]}><Feather name="check-circle" size={17} color={c.success} /><Text style={[styles.healthyNoticeText, { color: c.secondaryForeground }]}>{t('Site is within healthy stress range.', 'الموقع ضمن نطاق الإجهاد الصحي.')}</Text></View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function FieldHealth() {
  const { colors: c, isArabic, language, toggleLanguage, toggleTheme } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [radarActive, setRadarActive] = useState(false);
  const t = (en: string, ar: string) => (isArabic ? ar : en);
  const insights = useMemo(() => [
    { icon: 'droplet' as const, title: t('New water-stress hotspot detected', 'اكتشاف بؤرة إجهاد مائي جديدة'), detail: t('Al-Qassim Sector · 12 min ago', 'قطاع القصيم · منذ 12 دقيقة'), tone: c.warning },
    { icon: 'link' as const, title: t('Blockchain ledger sync complete', 'اكتملت مزامنة سجل البلوك تشين'), detail: t('1,842 field logs verified', 'تم توثيق 1,842 سجلاً ميدانياً'), tone: c.primary },
    { icon: 'sun' as const, title: t('Optimal harvest window identified', 'تم تحديد نافذة الحصاد المثلى'), detail: t('Al-Jauf Farm #04 · In 6 days', 'مزرعة الجوف رقم 04 · خلال 6 أيام'), tone: c.accent },
  ], [c.accent, c.primary, c.warning, isArabic]);

  const openDiagnosis = () => {
    try {
      setSelectedFarm(null);
      setMapOpen(false);
      setTimeout(() => {
        try {
          router.navigate('/(tabs)/diagnosis');
        } catch {
          // The tab may already be transitioning; the native tab state remains safe.
        }
      }, 80);
    } catch {
      // Closing the sheet is intentionally best-effort and must never crash the app.
    }
  };

  if (mapOpen) {
    return (
      <>
        <KsaMap selectedFarm={selectedFarm} onSelect={setSelectedFarm} radarActive={radarActive} onRadar={() => { setRadarActive((value) => !value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} onClose={() => { setMapOpen(false); setSelectedFarm(null); }} />
        {selectedFarm && <FarmSheet farm={selectedFarm} onClose={() => setSelectedFarm(null)} onDiagnose={openDiagnosis} />}
      </>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background, direction: isArabic ? 'rtl' : 'ltr' }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={[styles.eyebrow, { color: c.primary }]}>{t('AGRI-VISION · KSA NETWORK', 'أجري فيجن · شبكة المملكة')}</Text><Text style={[styles.title, { color: c.foreground }]}>{t('Explore the living farm', 'استكشف المزرعة الحية')}</Text><Text style={[styles.subtitle, { color: c.mutedForeground }]}>{t('A clear view of crop health across Saudi Arabia.', 'رؤية واضحة لصحة المحاصيل في المملكة العربية السعودية.')}</Text></View>
          <View style={styles.actions}><Pressable onPress={toggleLanguage} style={[styles.iconButton, { backgroundColor: c.card, borderColor: c.border }]}><Text style={[styles.lang, { color: c.foreground }]}>{language === 'en' ? 'ع' : 'EN'}</Text></Pressable><Pressable onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: c.card, borderColor: c.border }]}><Feather name={c.background === '#10231D' ? 'sun' : 'moon'} size={18} color={c.foreground} /></Pressable></View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard icon="cpu" label={t('AI predictions', 'تنبؤات الذكاء الاصطناعي')} value="94%" detail={t('Model confidence', 'ثقة النموذج')} color={c.primary} cardColor={c.card} labelColor={c.mutedForeground} valueColor={c.foreground} detailColor={c.mutedForeground} />
          <MetricCard icon="check-circle" label={t('Verified data', 'بيانات موثّقة')} value="1.8K" detail={t('Blockchain field logs', 'سجلات ميدانية موثّقة')} color={c.accent} cardColor={c.card} labelColor={c.mutedForeground} valueColor={c.foreground} detailColor={c.mutedForeground} />
          <MetricCard icon="map" label={t('Active farms / sites', 'المزارع والمواقع النشطة')} value="32" detail={t('Across KSA sectors', 'عبر قطاعات المملكة')} color={c.success} cardColor={c.card} labelColor={c.mutedForeground} valueColor={c.foreground} detailColor={c.mutedForeground} />
          <MetricCard icon="activity" label={t('Sustainability index', 'مؤشر الاستدامة')} value="89/100" detail={t('Water & eco efficiency', 'كفاءة المياه والبيئة')} color={c.warning} cardColor={c.card} labelColor={c.mutedForeground} valueColor={c.foreground} detailColor={c.mutedForeground} />
        </View>

        <Pressable onPress={() => { setMapOpen(true); Haptics.selectionAsync(); }} style={({ pressed }) => [styles.exploreButton, { backgroundColor: c.primary, opacity: pressed ? 0.84 : 1 }]} testID="start-exploration">
          <View style={[styles.exploreIcon, { backgroundColor: `${c.primaryForeground}18` }]}><Feather name="globe" size={20} color={c.primaryForeground} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.exploreTitle, { color: c.primaryForeground }]}>{t('Start Exploration', 'ابدأ الاستكشاف')}</Text><Text style={[styles.exploreDetail, { color: `${c.primaryForeground}B8` }]}>{t('Explore farms and crop signals across KSA', 'استكشف المزارع وإشارات المحاصيل في المملكة')}</Text></View>
          <Feather name={isArabic ? 'arrow-left' : 'arrow-right'} size={19} color={c.primaryForeground} />
        </Pressable>

        <View style={styles.sectionHead}><Text style={[styles.sectionTitle, { color: c.foreground }]}>{t('Latest insights', 'أحدث الرؤى')}</Text><View style={[styles.syncPill, { backgroundColor: c.soft }]}><View style={[styles.liveDot, { backgroundColor: c.success }]} /><Text style={[styles.syncText, { color: c.success }]}>{t('Synced now', 'متزامن الآن')}</Text></View></View>
        <View style={{ gap: 10 }}>{insights.map((insight) => <View key={insight.title} style={[styles.insightCard, { backgroundColor: c.card, borderColor: c.border }]}><View style={[styles.insightIcon, { backgroundColor: `${insight.tone}18` }]}><Feather name={insight.icon} size={17} color={insight.tone} /></View><View style={{ flex: 1 }}><Text style={[styles.insightTitle, { color: c.foreground }]}>{insight.title}</Text><Text style={[styles.insightDetail, { color: c.mutedForeground }]}>{insight.detail}</Text></View><Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={17} color={c.mutedForeground} /></View>)}</View>
        <View style={[styles.networkFooter, { backgroundColor: c.soft }]}><Feather name="radio" size={16} color={c.primary} /><Text style={[styles.networkText, { color: c.secondaryForeground }]}>{t('32 sites reporting · Last satellite refresh 8 min ago', '32 موقعاً يرسل البيانات · آخر تحديث للقمر الصناعي منذ 8 دقائق')}</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.45, marginBottom: 8 },
  title: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 6, lineHeight: 19, maxWidth: 270 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lang: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metricCard: { width: '48.5%', minHeight: 135, borderRadius: 18, padding: 14 },
  metricIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, marginBottom: 4 },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.8 },
  metricDetail: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  exploreButton: { minHeight: 73, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 },
  exploreIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  exploreTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 4 },
  exploreDetail: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  syncPill: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  syncText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  insightCard: { minHeight: 68, borderRadius: 17, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  insightIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginBottom: 4 },
  insightDetail: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  networkFooter: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18 },
  networkText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17 },
  mapScreen: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 17 },
  circleButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  mapHeaderCopy: { flex: 1 },
  mapEyebrow: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.35, marginBottom: 4 },
  mapTitle: { fontSize: 21, fontFamily: 'Inter_700Bold' },
  livePill: { borderRadius: 12, paddingVertical: 7, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.6 },
  mapCanvas: { height: 495, borderRadius: 25, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  mapGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
  gridLine: { width: 1, height: '100%', position: 'absolute', left: '33%' },
  gridLineHorizontal: { height: 1, width: '100%', position: 'absolute', top: '53%' },
  regionLabel: { position: 'absolute', fontFamily: 'Inter_500Medium', fontSize: 9 },
  riyadhLabel: { left: '51%', top: '51%' },
  qassimLabel: { left: '37%', top: '41%' },
  tabukLabel: { left: '23%', top: '27%' },
  easternLabel: { left: '73%', top: '57%' },
  marker: { position: 'absolute', width: 34, height: 34, marginLeft: -17, marginTop: -17, alignItems: 'center', justifyContent: 'center' },
  markerHalo: { position: 'absolute', width: 31, height: 31, borderRadius: 16, borderWidth: 1.5, opacity: 0.5 },
  markerPin: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radarPulse: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 2, left: '38%', top: '40%' },
  mapLegend: { flexDirection: 'row', gap: 18, paddingVertical: 13 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  radarButton: { minHeight: 53, borderRadius: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  radarButtonText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(11, 26, 20, 0.42)' },
  sheetDismiss: { flex: 1 },
  sheet: { borderTopLeftRadius: 27, borderTopRightRadius: 27, padding: 20, paddingBottom: 30 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sheetEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.25, marginBottom: 7 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 21, lineHeight: 26 },
  sheetClose: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  farmIdRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11, marginBottom: 17 },
  farmId: { fontFamily: 'Inter_500Medium', fontSize: 10, flex: 1 },
  chainPill: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5, flexDirection: 'row', gap: 4, alignItems: 'center' },
  chainText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  telemetryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  telemetry: { width: '48.5%', minHeight: 67, borderRadius: 14, padding: 11 },
  telemetryLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, marginBottom: 6 },
  telemetryValue: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  sheetAction: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  sheetActionText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  healthyNotice: { borderRadius: 14, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'center' },
  healthyNoticeText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
});