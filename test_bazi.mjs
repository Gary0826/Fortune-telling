import { calculateBazi } from './utils.ts';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ZODIAC_ANIMALS } from './constants.tsx';

// Mocking constants for node
global.HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
global.EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
global.ZODIAC_ANIMALS = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];

// Actually calculateBazi needs those imported, let's just use tsx to run it properly
