import * as Astronomy from 'astronomy-engine';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_ANIMALS } from './constants.tsx';

// Helper to handle both ESM and CJS import styles for astronomy-engine
const A = (Astronomy as any).SunPosition ? Astronomy : (Astronomy as any).default || Astronomy;

/**
 * 精確八字計算 (Four Pillars of Destiny)
 */
export const calculateBazi = (year: number, month: number, day: number, hour: number, minute: number) => {
  const date = new Date(year, month - 1, day, hour, minute);

  // 子時跨日處理 (23:00 以後算隔天)
  let adjustedDate = new Date(date.getTime());
  if (hour >= 23) {
    adjustedDate = new Date(date.getTime() + 24 * 3600000);
  }

  const jd = (adjustedDate.getTime() / 86400000) + 2440587.5;

  // 1. 年柱：以立春（315°）為歲首
  const sunLong = A.SunPosition(date).elon;
  let baziYear = year;
  if (sunLong < 315 && month <= 3) {
    baziYear = year - 1;
  } else if (sunLong >= 315 && month === 12) {
    baziYear = year;
  }

  const yearOffset = baziYear - 1924;
  const yearStemIdx = ((yearOffset % 10) + 10) % 10;
  const yearBranchIdx = ((yearOffset % 12) + 12) % 12;

  // 2. 月柱：基於節氣
  const solarTermsLong = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
  let monthIdx = -1;
  for (let i = 0; i < 12; i++) {
    const start = solarTermsLong[i];
    const end = solarTermsLong[(i + 1) % 12];
    if (start < end) {
      if (sunLong >= start && sunLong < end) monthIdx = i;
    } else {
      if (sunLong >= start || sunLong < end) monthIdx = i;
    }
  }

  const monthStemStart = (yearStemIdx % 5) * 2 + 2;
  const monthStemIdx = (monthStemStart + monthIdx) % 10;

  // 3. 日柱：基準點 1991-10-09 為 壬子 (Index 48)
  const dayOffset = Math.floor(jd + 0.5 - 2448538.5);
  const dayCycleIdx = ((48 + dayOffset) % 60 + 60) % 60;
  const finalDayStemIdx = dayCycleIdx % 10;
  const finalDayBranchIdx = dayCycleIdx % 12;

  // 4. 時柱
  const hourIdx = Math.floor(((hour + 1) % 24) / 2);
  const hourStemStart = (finalDayStemIdx % 5) * 2;
  const hourStemIdx = (hourStemStart + hourIdx) % 10;

  const getElement = (stemIdx: number) => {
    const elements = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
    return elements[stemIdx % 10];
  };

  return {
    year: HEAVENLY_STEMS[yearStemIdx].char + EARTHLY_BRANCHES[yearBranchIdx],
    month: HEAVENLY_STEMS[monthStemIdx].char + EARTHLY_BRANCHES[(monthIdx + 2) % 12],
    day: HEAVENLY_STEMS[finalDayStemIdx].char + EARTHLY_BRANCHES[finalDayBranchIdx],
    hour: HEAVENLY_STEMS[hourStemIdx].char + EARTHLY_BRANCHES[hourIdx],
    element: getElement(finalDayStemIdx),
    animal: ZODIAC_ANIMALS[yearBranchIdx]
  };
};

const getZodiacSign = (long: number): string => {
  const signs = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];
  let normalized = long % 360;
  if (normalized < 0) normalized += 360;
  return signs[Math.floor(normalized / 30) % 12] || "未知";
};

export const calculateAstroDetails = (year: number, month: number, day: number, hour: number, minute: number) => {
  const date = new Date(year, month - 1, day, hour, minute);
  const sunLong = A.SunPosition(date).elon;
  let moonLong;
  try {
    moonLong = A.EclipticGeoMoon ? A.EclipticGeoMoon(date).lon : A.Ecliptic(A.GeoMoon(date)).elon;
  } catch {
    moonLong = 0;
  }

  const date2 = new Date(Date.UTC(year, month - 1, day, hour - 8, minute));
  const gst = A.SiderealTime(date2);
  const lst = (gst + 121.5654 / 15) % 24;

  const signs = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];
  const risingIdx = Math.floor((lst / 2 + 3) % 12);

  return {
    sun: getZodiacSign(sunLong),
    moon: getZodiacSign(moonLong),
    rising: signs[risingIdx]
  };
};
