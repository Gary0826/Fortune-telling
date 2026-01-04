import { calculateBazi } from './utils.ts';

// 1991年10月9日早上9點10分
// 預期：年: 辛未, 月: 戊戌, 日: 壬子, 時: 乙巳
const result = calculateBazi(1991, 10, 9, 9, 10);
console.log('Result for 1991-10-09 09:10:');
console.log('Year:', result.year);
console.log('Month:', result.month);
console.log('Day:', result.day);
console.log('Hour:', result.hour);

const expected = { year: '辛未', month: '戊戌', day: '壬子', hour: '乙巳' };
const success = result.year === expected.year && 
                result.month === expected.month && 
                result.day === expected.day && 
                result.hour === expected.hour;

if (success) {
  console.log('✅ Bazi calculation is ACCURATE!');
} else {
  console.log('❌ Bazi calculation MISMATCH!');
  process.exit(1);
}
