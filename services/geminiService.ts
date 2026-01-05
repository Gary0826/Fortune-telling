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

  const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text) return text;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed, trying next...`, error.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("All models failed:", error);
        if (error?.message?.includes('quota') || error?.message?.includes('429')) {
          return "【連線頻率過高】：大師目前的免費額度已用完（Gemini Free Tier 限制）。請於 1 小時後再試，或更換 API Key。";
        }
        if (error?.message?.includes('referrer') || error?.message?.includes('403')) {
          return "【權限錯誤】：請檢查 API Key 網域限制，需允許 https://gary0826.github.io/*";
        }
        return `連線失敗：${error?.message || '大師正在整理思緒'}，請稍後再試。`;
      }
    }
  }
  return "占卜能量暫時中斷，請稍後再試。";
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

  const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of modelsToTry) {
    try {
      // 防禦性程式碼：確保 history 的第一個訊息一定是 'user'
      // 如果不是，則過濾掉開頭的 'model' 訊息，直到找到第一個 'user'
      let sanitizedHistory = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user' as 'user' | 'model',
        parts: h.parts
      }));

      while (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
        sanitizedHistory.shift();
      }

      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: sanitizedHistory,
      });

      // 將身份設定放入提問中，確保大師不會忘記自己是誰
      const fullMessage = `${systemInstruction}\n\n用戶提問：${message}`;
      const result = await chat.sendMessage(fullMessage);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (error: any) {
      console.error(`Chat with model ${modelName} failed:`, error.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        if (error?.message?.includes('referrer') || error?.message?.includes('403')) {
          return "【權限錯誤】：請檢查 API Key 網域限制。";
        }
        return `對話失敗：${error?.message || '請稍後再試'}`;
      }
    }
  }
  return "大師暫時無法回覆。";
};
