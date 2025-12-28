import { SunPosition, EclipticGeoMoon, Observer, SiderealTime } from 'astronomy-engine';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_ANIMALS } from './constants.tsx';

export const calculateBazi = (year: number, month: number, day: number) => {
  // 簡單修正立春界線（大約每年的2/4左右），這裡做簡化處理：
  // 如果是1月或2月4日前，算上一年的生肖
  let baziYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    baziYear = year - 1;
  }

  // 1993年 = 癸酉年 (雞)
  // 基準 1924 (甲子年) -> 0, 0
  const offset = baziYear - 1924;
  const stemRealIdx = ((offset % 10) + 10) % 10;
  const branchRealIdx = ((offset % 12) + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemRealIdx],
    branch: EARTHLY_BRANCHES[branchRealIdx],
    animal: ZODIAC_ANIMALS[branchRealIdx],
    realYear: baziYear
  };
};

const getZodiacSign = (long: number): string => {
  const signs = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];
  // Normalize longitude to 0-360 just in case
  let normalized = long % 360;
  if (normalized < 0) normalized += 360;

  const idx = Math.floor(normalized / 30) % 12;
  return signs[idx] || "未知"; // Fallback just in case
};

export const calculateAstroDetails = (year: number, month: number, day: number, hour: number, minute: number) => {
  // 使用 astronomy-engine 計算
  const date = new Date(year, month - 1, day, hour, minute);
  const observer = new Observer(25.0330, 121.5654, 0); // 默認台北 (Taipei 101)

  // SunPosition returns EclipticCoordinates { ecliptic_longitude, ... }
  const sunLong = SunPosition(date).ecliptic_longitude;

  // EclipticGeoMoon returns Spherical { lat, lon, dist }
  // lon is Ecliptic Longitude
  const moonLong = EclipticGeoMoon(date).lon;

  // 上升星座計算 (Ascendant)
  // 1. Calculate Greenwich Sidereal Time (GST)
  // 2. Local Sidereal Time (LST) = GST + Longitude/15
  const date2 = new Date(Date.UTC(year, month - 1, day, hour - 8, minute)); // Convert to UTC approx
  const gst = SiderealTime(date2);
  const lst = (gst + 121.5654 / 15) % 24; // Taipei/Taiwan longitude

  const signs = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];

  // 太陽
  const sunSign = getZodiacSign(sunLong);
  // 月亮
  const moonSign = getZodiacSign(moonLong);

  // 上升估算
  const risingIdx = Math.floor((lst / 2 + 3) % 12);
  const risingSign = signs[risingIdx];

  return { sun: sunSign, moon: moonSign, rising: risingSign };
};
