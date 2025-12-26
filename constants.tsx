
import React from 'react';
import { TarotCard } from './types';

export const HEAVENLY_STEMS = [
  { char: '甲', element: '木', yinYang: '陽' }, { char: '乙', element: '木', yinYang: '陰' },
  { char: '丙', element: '火', yinYang: '陽' }, { char: '丁', element: '火', yinYang: '陰' },
  { char: '戊', element: '土', yinYang: '陽' }, { char: '己', element: '土', yinYang: '陰' },
  { char: '庚', element: '金', yinYang: '陽' }, { char: '辛', element: '金', yinYang: '陰' },
  { char: '壬', element: '水', yinYang: '陽' }, { char: '癸', element: '水', yinYang: '陰' }
];

export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "愚者", type: 'major', keywords: ["無窮潛力", "冒險", "純真"], desc_up: "開始一段新的旅程，保持好奇心。", desc_rev: "魯莽的決定，缺乏計畫。", advice_career: "勇於嘗試新領域。", advice_love: "享受當下的快樂。", advice_health: "注意足部健康。" },
  { id: 1, name: "魔術師", type: 'major', keywords: ["創造力", "顯化", "能力"], desc_up: "你擁有實現目標所需的一切資源。", desc_rev: "才華被埋沒，缺乏行動力。", advice_career: "展現你的溝通長才。", advice_love: "主動出擊會有好結果。", advice_health: "注意神經系統與雙手。" },
  { id: 2, name: "女祭司", type: 'major', keywords: ["直覺", "內在智慧", "神秘"], desc_up: "傾聽你的內心，現在是等待而非行動的時機。", desc_rev: "忽視直覺，情緒不穩。", advice_career: "觀察優於行動，細心規劃。", advice_love: "保持一點神秘感。", advice_health: "調整內分泌與睡眠。" },
  { id: 3, name: "皇后", type: 'major', keywords: ["豐盛", "母性", "感官"], desc_up: "一切都在蓬勃發展，充滿愛與美。", desc_rev: "過度依賴，創造力停滯。", advice_career: "創意工作會有大收穫。", advice_love: "包容與溫柔的愛。", advice_health: "多接近大自然。" },
  { id: 4, name: "皇帝", type: 'major', keywords: ["權威", "秩序", "保護"], desc_up: "建立結構，展現你的領導力。", desc_rev: "暴虐專橫，缺乏彈性。", advice_career: "建立明確的規則。", advice_love: "給予穩定的支持。", advice_health: "注意頭部與壓力。" },
  { id: 5, name: "教皇", type: 'major', keywords: ["傳統", "導師", "信仰"], desc_up: "遵循傳統或尋求專業建議。", desc_rev: "反傳統，思想僵化。", advice_career: "適合進修與學習。", advice_love: "追求長久穩定的承諾。", advice_health: "頸部與肩膀需要放鬆。" },
  { id: 6, name: "戀人", type: 'major', keywords: ["選擇", "和諧", "結合"], desc_up: "重要的價值觀選擇，關係和諧。", desc_rev: "關係失調，錯誤的抉擇。", advice_career: "團隊合作至關重要。", advice_love: "坦誠溝通解決誤會。", advice_health: "呼吸系統與對稱器官。" },
  { id: 7, name: "戰車", type: 'major', keywords: ["意志力", "勝利", "掌控"], desc_up: "克服困難，堅定前行。", desc_rev: "失去控制，方向不明。", advice_career: "野心勃勃的執行力。", advice_love: "積極追求但別太急躁。", advice_health: "消化系統與心理壓力。" },
  { id: 8, name: "力量", type: 'major', keywords: ["內在韌性", "勇氣", "包容"], desc_up: "溫柔的力量勝過剛烈。", desc_rev: "自卑感，失去耐性。", advice_career: "以柔克剛，處理棘手人物。", advice_love: "展現包容與耐心。", advice_health: "保持正面心態提升免疫。" },
  { id: 9, name: "隱士", type: 'major', keywords: ["內省", "獨處", "真理"], desc_up: "暫時退隱，尋求內在的答案。", desc_rev: "孤立自閉，過度偏執。", advice_career: "適合深度研究。", advice_love: "給予彼此空間。", advice_health: "注意視力與老化問題。" },
  { id: 10, name: "命運之輪", type: 'major', keywords: ["轉變", "機運", "因果"], desc_up: "好運將至，命運在轉動。", desc_rev: "運氣不佳，抗拒改變。", advice_career: "把握突如其來的機會。", advice_love: "緣分天註定。", advice_health: "循環系統與新陳代謝。" },
  { id: 11, name: "正義", type: 'major', keywords: ["平衡", "公平", "責任"], desc_up: "種瓜得瓜，公正的結果。", desc_rev: "不公平，逃避責任。", advice_career: "合約簽署需謹慎。", advice_love: "建立平等的互動模式。", advice_health: "多喝水，注意腎臟。" },
  { id: 12, name: "吊人", type: 'major', keywords: ["犧牲", "新觀點", "等待"], desc_up: "換個角度看世界，暫時的停滯。", desc_rev: "無謂的犧牲，停滯不前。", advice_career: "打破舊有的思考框架。", advice_love: "無私的付出，等待收穫。", advice_health: "肢體伸展與血液循環。" },
  { id: 13, name: "死神", type: 'major', keywords: ["結束", "重生", "轉型"], desc_up: "舊事物的終結是新生的開始。", desc_rev: "拖延改變，恐懼終結。", advice_career: "大膽轉型或離職。", advice_love: "告別不適合的關係。", advice_health: "排毒與生活作息調整。" },
  { id: 14, name: "節制", type: 'major', keywords: ["調和", "平衡", "治癒"], desc_up: "融合不同的元素，達到平衡。", desc_rev: "失去平衡，溝通不暢。", advice_career: "協調溝通是關鍵。", advice_love: "心靈契合的愛。", advice_health: "多喝水，作息均衡。" },
  { id: 15, name: "惡魔", type: 'major', keywords: ["束縛", "慾望", "沈溺"], desc_up: "受限於慾望或恐懼，需覺醒。", desc_rev: "擺脫束縛，重新拿回掌控權。", advice_career: "注意職場誘惑與不道德。", advice_love: "釐清是愛還是控制。", advice_health: "戒除不良習慣。" },
  { id: 16, name: "高塔", type: 'major', keywords: ["崩解", "震撼", "覺醒"], desc_up: "突如其來的改變，打破虛假的平靜。", desc_rev: "勉強維持現狀，遲早要面對。", advice_career: "劇烈的變動，重新開始。", advice_love: "關係中的震撼教育。", advice_health: "注意突發性意外或發炎。" },
  { id: 17, name: "星星", type: 'major', keywords: ["希望", "療癒", "啟發"], desc_up: "在黑暗中看見希望，身心獲得療癒。", desc_rev: "失望，失去目標。", advice_career: "充滿創意的方向。", advice_love: "純潔且充滿希望的愛。", advice_health: "放鬆心情，接觸自然。" },
  { id: 18, name: "月亮", type: 'major', keywords: ["不安", "潛意識", "幻象"], desc_up: "前路不明，充滿不安與幻象。", desc_rev: "撥雲見日，真相大白。", advice_career: "小心流言蜚語。", advice_love: "感情中的猜忌與不安。", advice_health: "注意心理健康與婦科。" },
  { id: 19, name: "太陽", type: 'major', keywords: ["快樂", "成功", "活力"], desc_up: "充滿陽光與希望，一切順利。", desc_rev: "短暫延遲的成功，過度自信。", advice_career: "表現亮眼，升遷在望。", advice_love: "公開透明且熱烈的關係。", advice_health: "充滿活力，多曬太陽。" },
  { id: 20, name: "審判", type: 'major', keywords: ["覺醒", "召喚", "重生"], desc_up: "面對過去，做出重大決定。", desc_rev: "拒絕召喚，優柔寡斷。", advice_career: "面臨關鍵的職涯選擇。", advice_love: "重修舊好或破鏡重圓。", advice_health: "身體機能的再生與恢復。" },
  { id: 21, name: "世界", type: 'major', keywords: ["圓滿", "整合", "新旅程"], desc_up: "達成目標，完美的終點。", desc_rev: "差一步就成功，尚未圓滿。", advice_career: "國際化發展或專案大成。", advice_love: "修成正果，完美結合。", advice_health: "身心靈合一，最優狀態。" }
];

export const generateMinorArcana = (): TarotCard[] => {
  const suits = [
    { name: '權杖', type: 'Wands', element: '火', trait: '行動與熱情' },
    { name: '聖杯', type: 'Cups', element: '水', trait: '情感與直覺' },
    { name: '寶劍', type: 'Swords', element: '風', trait: '思考與傷害' },
    { name: '金幣', type: 'Pentacles', element: '土', trait: '物質與現實' }
  ];
  const ranks = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', '侍從', '騎士', '皇后', '國王'];
  const cards: TarotCard[] = [];
  let id = 22;
  suits.forEach(suit => {
    ranks.forEach(rank => {
      cards.push({
        id: id++,
        name: `${suit.name}${rank}`,
        type: 'minor',
        suit: suit.name,
        rank: rank,
        element: suit.element,
        keywords: [suit.trait, rank],
        desc_up: `代表${suit.trait}在生活中的展現。`,
        desc_rev: `能量流動稍有阻礙。`,
        advice_career: "在工作中保持穩定與專注。",
        advice_love: "需要更多的包容與理解。",
        advice_health: "注意身體發出的微小訊號。"
      });
    });
  });
  return cards;
};

export const FULL_DECK = [...MAJOR_ARCANA, ...generateMinorArcana()];
