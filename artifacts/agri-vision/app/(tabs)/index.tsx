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
    marker: { left: '45%', top: '44%' },
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
    marker: { left: '15%', top: '37%' },
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
    marker: { left: '30%', top: '32%' },
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
    marker: { left: '57%', top: '49%' },
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
    marker: { left: '71%', top: '43%' },
  },
];

// Natural Earth country boundary, simplified for mobile SVG rendering while
// retaining the northern frontier, Red Sea coast, Gulf wedge, and southern border.
const KSA_PATH =
  'M 163.7 82.4 L 187.3 95.5 L 241.4 138.0 L 298.2 142.7 L 303.0 153.1 L 320.2 153.8 L 319.6 156.4 L 321.0 155.9 L 323.4 164.1 L 326.3 165.0 L 325.3 166.0 L 328.2 169.1 L 326.0 171.5 L 328.1 172.2 L 327.1 173.9 L 335.6 175.4 L 337.1 177.6 L 333.1 177.8 L 336.1 178.4 L 335.2 180.3 L 337.1 180.0 L 338.4 184.4 L 342.5 183.4 L 345.1 188.7 L 354.6 195.3 L 351.1 194.0 L 351.9 199.2 L 355.8 203.0 L 354.2 209.5 L 352.0 205.8 L 351.1 210.3 L 353.4 210.6 L 356.6 218.7 L 354.4 217.1 L 361.1 223.1 L 362.9 231.7 L 367.1 238.9 L 371.6 242.7 L 377.6 241.4 L 378.3 243.9 L 380.2 241.3 L 382.3 242.4 L 377.8 248.6 L 383.8 249.8 L 384.3 253.8 L 403.9 279.2 L 457.0 286.7 L 458.7 284.9 L 468.0 301.2 L 454.4 346.1 L 392.3 368.7 L 331.4 378.1 L 313.3 387.8 L 301.4 403.3 L 298.1 411.7 L 292.6 415.0 L 288.6 414.8 L 283.2 407.6 L 275.2 408.7 L 256.7 406.7 L 251.2 404.1 L 230.2 404.6 L 225.4 407.0 L 215.0 402.0 L 209.8 406.4 L 211.6 407.6 L 208.9 411.8 L 210.2 421.4 L 208.2 421.2 L 207.2 424.3 L 202.1 428.0 L 200.5 419.9 L 193.1 409.7 L 193.2 413.2 L 192.0 403.5 L 181.3 394.9 L 175.2 386.1 L 174.1 380.6 L 169.4 375.4 L 168.7 367.1 L 166.5 365.7 L 163.9 357.1 L 160.1 354.8 L 159.8 351.0 L 157.9 351.4 L 155.4 346.8 L 146.1 339.7 L 139.4 338.0 L 127.2 320.9 L 125.3 316.3 L 127.2 314.2 L 125.9 306.5 L 122.2 300.6 L 123.8 300.7 L 126.6 291.7 L 125.1 292.5 L 123.9 283.4 L 119.5 278.2 L 119.5 274.8 L 112.3 260.4 L 101.6 252.4 L 101.9 250.9 L 100.2 252.2 L 91.1 247.3 L 91.7 245.6 L 85.3 236.3 L 87.6 235.9 L 87.3 229.0 L 80.9 218.4 L 76.1 215.3 L 75.9 209.9 L 72.2 207.8 L 62.2 189.9 L 44.2 164.9 L 45.3 163.9 L 34.8 162.0 L 32.8 164.5 L 32.0 163.0 L 36.8 153.2 L 39.8 134.6 L 63.0 138.0 L 71.4 131.4 L 76.6 123.3 L 92.0 120.1 L 95.6 112.5 L 102.6 108.7 L 81.4 86.2 L 122.9 74.9 L 126.9 72.0 L 152.0 76.1 L 163.7 82.4 Z';

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
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 500 500"
          preserveAspectRatio="xMidYMid meet"
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={KSA_PATH}
            fill={`${c.primary}20`}
            stroke={c.primary}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <SvgText x="218" y="236" fill={c.primary} fontSize="14" fontWeight="700">KSA</SvgText>
          <SvgText x="177" y="255" fill={c.mutedForeground} fontSize="8">AGRICULTURAL SITES</SvgText>
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
  riyadhLabel: { left: '52%', top: '47%' },
  qassimLabel: { left: '39%', top: '40%' },
  tabukLabel: { left: '10%', top: '34%' },
  easternLabel: { left: '65%', top: '41%' },
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