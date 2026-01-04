import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReadingMode, ReadingResult, SelectedTarot } from "../types.ts";

export const fetchInterpretation = async (result: ReadingResult): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.API_KEY || '';
  if (!apiKey) return "API Key 未設定。";

  const genAI = new GoogleGenerativeAI(apiKey);

  let prompt = "";
  const systemInstruction = "你是專業命理大師「玄微老師」。語氣溫柔、專業、富有同理心且具神秘感。請用繁體中文回覆，針對用戶情況給予具體建議。";

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  if (result.type === ReadingMode.TAROT) {
    const cards: SelectedTarot[] = result.details.selectedCards;
    const cardsStr = cards.map((c, i) => {
      const pos = i === 0 ? "過去/現狀" : i === 1 ? "挑戰/障礙" : "未來/建議";
      const orientation = c.isReversed ? "逆位" : "正位";
      return `${pos}: ${c.card.name} (${orientation})`;
    }).join(", ");
    prompt = `${systemInstruction}\n\n今天是 ${dateStr}。用戶抽到了三張塔羅牌：${cardsStr}。請針對此牌組進行深度解析。包含事業、愛情、健康建議，並給一段溫暖的總結。`;
  } else if (result.type === ReadingMode.ASTRO) {
    const { sun, moon, rising } = result.details;
    prompt = `${systemInstruction}\n\n今天是 ${dateStr}。用戶的太陽星座是${sun}，月亮星座是${moon}，上升星座是${rising}。請根據這黃金三角分析性格特質與近期運勢（事業、愛情、健康），並提供成長建議。`;
  } else if (result.type === ReadingMode.BAZI) {
    const { year, month, day, hour } = result.details;
    prompt = `${systemInstruction}\n\n今天是 ${dateStr}。用戶的八字為：年柱 ${year}, 月柱 ${month}, 日柱 ${day}, 時柱 ${hour}。請根據五行生剋與格局，分析用戶的性格、大運趨勢，並在事業、人際、健康方面給予指導。`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return text || "占卜能量暫時中斷，請稍後再試。";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `連線失敗：${error?.message || '網路不穩'}，請稍後再試。`;
  }
};

/**
 * 續聊功能：針對之前的占卜結果持續對話
 */
export const chatWithAI = async (
  message: string,
  history: any[]
): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.API_KEY || '';
  if (!apiKey) return "API Key 未設定。";

  const genAI = new GoogleGenerativeAI(apiKey);
  const systemInstruction = "你是專業命理大師「玄微老師」。用戶正在針對剛才的占卜結果向你請教。請保持專業與同理心，給予具體的解析與建議。";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: h.parts
      })),
    });

    const result = await chat.sendMessage(`${systemInstruction}\n\n${message}`);
    const response = await result.response;
    return response.text() || "大師正在冥想中，請稍後再試。";
  } catch (error: any) {
    console.error("Chat Error:", error);
    return `對話失敗：${error?.message || '請稍後再試'}`;
  }
};
