
import { GoogleGenAI } from "@google/genai";
import { ReadingMode, ReadingResult, SelectedTarot } from "../types";

export const fetchInterpretation = async (result: ReadingResult): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  let prompt = "";
  const systemInstruction = "你是專業命理師「靈靈染」。語氣溫柔、專業、富有同理心且具神秘感。請用繁體中文回覆，針對用戶情況給予具體建議。";

  if (result.type === ReadingMode.TAROT) {
    const cards: SelectedTarot[] = result.details.selectedCards;
    const cardsStr = cards.map((c, i) => {
      const pos = i === 0 ? "過去/現狀" : i === 1 ? "挑戰/障礙" : "未來/建議";
      const orientation = c.isReversed ? "逆位" : "正位";
      return `${pos}: ${c.card.name} (${orientation})`;
    }).join(", ");
    prompt = `用戶抽到了三張塔羅牌：${cardsStr}。請針對此牌組進行深度解析。包含事業、愛情、健康建議，並給一段溫暖的總結。`;
  } else if (result.type === ReadingMode.ASTRO) {
    const { sun, moon, rising } = result.details;
    prompt = `用戶的太陽星座是${sun}，月亮星座是${moon}，上升星座是${rising}。請根據這黃金三角分析性格特質與近期運勢（事業、愛情、健康），並提供成長建議。`;
  } else if (result.type === ReadingMode.BAZI) {
    const { main, element } = result.details;
    prompt = `用戶的八字年柱為${main}，五行屬${element}。請根據五行生剋原理，分析用戶今年的流年運勢，並在事業、人際、健康方面給予指導。`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    return response.text || "占卜能量暫時中斷，請稍後再試。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "連接宇宙意識時發生錯誤，請檢查網路後再試。";
  }
};
