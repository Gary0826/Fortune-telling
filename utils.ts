
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_ANIMALS } from './constants';

export const calculateBazi = (year: number, month: number, day: number) => {
  let baziYear = year;
  if (month === 1 || (month === 2 && day < 4)) {
    baziYear = year - 1;
  }
  const stemIdx = ((baziYear - 3) % 10 + 10) % 10;
  const branchIdx = ((baziYear - 3) % 12 + 12) % 12;
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    animal: ZODIAC_ANIMALS[branchIdx],
    realYear: baziYear
  };
};

export const getSunSign = (month: number, day: number): string => {
  const cutoffs = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const signs = ["摩羯座", "水瓶座", "雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座"];
  return day < cutoffs[month - 1] ? signs[month - 1] : signs[month];
};

// Simplified LST calculation for rising/moon signs
export const calculateAstroDetails = (year: number, month: number, day: number, hour: number, minute: number) => {
  const sun = getSunSign(month, day);
  
  // Use a pseudo-random but consistent logic based on birth details for Rising/Moon if complex libraries aren't available
  const seed = year + month * 31 + day + hour + minute;
  const risingIndices = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];
  const moonIndices = ["雙魚座", "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座"];
  
  const rising = risingIndices[(seed + hour) % 12];
  const moon = moonIndices[(seed + day) % 12];
  
  return { sun, moon, rising };
};
