
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Star, RotateCcw, ArrowRight, User,
  MessageCircle, Compass, Info, ChevronLeft, Clock
} from 'lucide-react';
import { ReadingMode, UserInfo, ReadingResult, SelectedTarot, TarotCard } from './types.ts';
import { calculateBazi, calculateAstroDetails } from './utils.ts';
import { FULL_DECK } from './constants.tsx';
import { fetchInterpretation, chatWithAI } from './services/geminiService.ts';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-10 shadow-2xl ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}> = ({ onClick, children, className = "", disabled = false, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
    outline: 'bg-transparent border-2 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo>(() => {
    try {
      const saved = localStorage.getItem('fortune_user_info');
      return saved ? JSON.parse(saved) : { year: 1998, month: 8, day: 8, hour: 12, minute: 0 };
    } catch {
      return { year: 1998, month: 8, day: 8, hour: 12, minute: 0 };
    }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCards, setSelectedCards] = useState<SelectedTarot[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fortune_user_info', JSON.stringify(userInfo));
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = parseInt(value);

    if (isNaN(val)) {
      const defaults: Record<string, number> = { year: 1998, month: 8, day: 8, hour: 12, minute: 0 };
      val = defaults[name] ?? 0;
    } else {
      if (name === 'month') val = Math.max(1, Math.min(12, val));
      if (name === 'day') val = Math.max(1, Math.min(31, val));
      if (name === 'hour') val = Math.max(0, Math.min(23, val));
      if (name === 'minute') val = Math.max(0, Math.min(59, val));
      if (name === 'year') val = Math.max(1900, Math.min(2100, val));
    }

    setUserInfo(prev => ({ ...prev, [name]: val }));
  };

  const startReading = (mode: ReadingMode) => {
    setLoading(true);
    setResult(null);
    setSelectedCards([]);

    setTimeout(() => {
      if (mode === ReadingMode.TAROT) {
        setLoading(false);
        setStep(3);
      } else {
        generateDirectResult(mode);
        setLoading(false);
        setStep(4);
      }
    }, 1200);
  };

  const generateDirectResult = (mode: ReadingMode) => {
    const y = Number(userInfo.year);
    const m = Number(userInfo.month);
    const d = Number(userInfo.day);
    const h = Number(userInfo.hour);
    const min = Number(userInfo.minute);

    if (mode === ReadingMode.BAZI) {
      const bazi = calculateBazi(y, m, d, h, min);
      setResult({
        type: mode,
        title: '八字命盤核心分析',
        summary: `元神為「${bazi.element}」，生肖屬${bazi.animal}。`,
        details: bazi
      });
    } else if (mode === ReadingMode.ASTRO) {
      const astro = calculateAstroDetails(y, m, d, h, min);
      setResult({
        type: mode,
        title: '星盤性格與運勢概覽',
        summary: `太陽：${astro.sun} | 上升：${astro.rising} | 月亮：${astro.moon}`,
        details: astro
      });
    }
  };

  const handlePickTarot = (card: TarotCard) => {
    if (selectedCards.length >= 3) return;
    if (selectedCards.some(c => c.card.id === card.id)) return;
    const isReversed = Math.random() > 0.7;
    setSelectedCards(prev => [...prev, { card, isReversed }]);
  };

  const confirmTarot = async () => {
    const readingResult: ReadingResult = {
      type: ReadingMode.TAROT,
      title: '神諭塔羅指引',
      summary: selectedCards.map(c => `${c.card.name}(${c.isReversed ? '逆' : '正'})`).join(' → '),
      details: { selectedCards }
    };
    setResult(readingResult);
    setStep(4);
  };

  const getAiInterpretation = async () => {
    if (!result) return;
    setAiLoading(true);
    try {
      const interpretation = await fetchInterpretation(result);
      setResult(prev => prev ? { ...prev, aiInterpretation: interpretation } : null);

      // 修復：Google AI SDK 要求對話紀錄必須由 'user' role 開始
      setChatHistory([
        { role: 'user', parts: [{ text: "大師，請為我剛才的占卜結果進行深度解析。" }] },
        { role: 'model', parts: [{ text: interpretation }] }
      ]);
    } catch (e) {
      console.error(e);
      setResult(prev => prev ? { ...prev, aiInterpretation: "抱歉，目前無法連結宇宙意志，請稍後再試。" } : null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !result || chatLoading) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    const newHistory = [...chatHistory, { role: 'user' as const, parts: [{ text: userMsg }] }];
    setChatHistory(newHistory);

    try {
      const response = await chatWithAI(userMsg, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model' as const, parts: [{ text: response }] }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 md:py-20">
      <header className={`text-center transition-all duration-700 max-w-2xl ${step === 4 ? 'mb-8 scale-90' : 'mb-16'}`}>
        <div
          onClick={() => { setStep(1); setResult(null); }}
          className="group inline-flex cursor-pointer items-center gap-2.5 px-5 py-2.5 bg-indigo-500/10 rounded-full mb-6 ring-1 ring-indigo-400/20 hover:bg-indigo-500/20 transition-all"
        >
          <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="text-indigo-200 font-bold tracking-widest text-sm uppercase">玄微 · 命運觀測站</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-300 tracking-tight mb-5">
          {step === 4 ? '命運的啟示' : '探索宇宙的私語'}
        </h1>
        <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
          {step === 1 ? '請輸入您的出生資訊，讓群星為您指引方向。' :
            step === 2 ? '選擇一種連結方式，開展您的命運之旅。' :
              step === 3 ? '深呼吸三次，靜下心來，直覺選出三張牌。' : '宇宙的能量已經凝聚，請細品下方的解讀。'}
        </p>
      </header>

      <main className="w-full max-w-4xl relative z-20">
        {step === 1 && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card>
              <div className="flex items-center gap-3 mb-8 border-b border-slate-700/50 pb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <User className="text-white w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">出生時刻配置</h2>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-indigo-300 ml-1">出生日期 (年/月/日)</label>
                    <div className="grid grid-cols-4 gap-3">
                      <input type="number" name="year" value={userInfo.year} onChange={handleInputChange} onBlur={handleBlur} className="col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono text-xl shadow-inner" placeholder="年" />
                      <input type="number" name="month" value={userInfo.month} onChange={handleInputChange} onBlur={handleBlur} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono text-xl shadow-inner" placeholder="月" />
                      <input type="number" name="day" value={userInfo.day} onChange={handleInputChange} onBlur={handleBlur} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono text-xl shadow-inner" placeholder="日" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-indigo-300 ml-1">精確時間 (時/分)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" name="hour" value={userInfo.hour} onChange={handleInputChange} onBlur={handleBlur} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono text-xl shadow-inner" placeholder="時" />
                      <input type="number" name="minute" value={userInfo.minute} onChange={handleInputChange} onBlur={handleBlur} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono text-xl shadow-inner" placeholder="分" />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full mt-10 h-14 text-lg">
                確認資訊，選擇占卜 <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>
          </div>
        )}

        {step === 2 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {[
              { mode: ReadingMode.BAZI, icon: Compass, title: '生辰八字', desc: '以五行生剋洞察本命與大運', color: 'from-blue-500 to-cyan-500' },
              { mode: ReadingMode.ASTRO, icon: Star, title: '西洋占星', desc: '解碼星盤配置，對齊靈魂頻率', color: 'from-purple-500 to-indigo-500' },
              { mode: ReadingMode.TAROT, icon: Sparkles, title: '神諭塔羅', desc: '針對當下困惑提供直觀的啟示', color: 'from-pink-500 to-rose-500' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => startReading(item.mode)}
                className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-700 hover:border-indigo-500/50 rounded-3xl p-8 text-left transition-all hover:scale-[1.03] hover:shadow-2xl shadow-indigo-500/10"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-6 flex items-center text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  開始觀測 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            ))}
            <div className="md:col-span-3 flex justify-center mt-6">
              <Button variant="ghost" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" /> 返回修改資料</Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-white tracking-tight">正在連結星辰網絡...</p>
              <p className="text-slate-400 animate-pulse">解析能量波動中，請稍候</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col mb-8 text-center animate-pulse">
              <h2 className="text-4xl md:text-5xl font-black text-indigo-400 mb-2">請先在心中默念</h2>
              <h2 className="text-4xl md:text-5xl font-black text-indigo-400">自己想問的問題，再抽牌</h2>
            </div>

            <div className="flex justify-between items-center mb-8">
              <Button variant="ghost" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4" /> 重新選擇</Button>
              <div className="text-indigo-300 font-bold bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                已選擇 {selectedCards.length} / 3 張
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-12 pt-6 px-4 hide-scrollbar snap-x snap-mandatory"
            >
              {FULL_DECK.map((card, i) => {
                const isSelected = selectedCards.some(c => c.card.id === card.id);
                const order = selectedCards.findIndex(c => c.card.id === card.id) + 1;
                return (
                  <div
                    key={card.id}
                    onClick={() => handlePickTarot(card)}
                    className={`flex-shrink-0 w-44 h-72 md:w-48 md:h-80 rounded-2xl border-2 transition-all duration-500 cursor-pointer snap-center relative group overflow-hidden
                    ${isSelected ? 'border-indigo-400 -translate-y-6 scale-105 shadow-2xl shadow-indigo-500/40' : 'border-indigo-900/50 bg-indigo-950/20 hover:border-indigo-500/40 hover:-translate-y-2'}`}
                  >
                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                      {isSelected ? (
                        <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                          <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                            {order}
                          </div>
                          <p className="text-indigo-200 font-bold text-sm tracking-widest uppercase">已選中</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 border-2 border-indigo-500/20 rounded-full flex items-center justify-center mb-4 group-hover:border-indigo-500/40 group-hover:scale-110 transition-all">
                            <Sparkles className="text-indigo-500/30 group-hover:text-indigo-400" />
                          </div>
                          <p className="text-indigo-900/40 font-bold text-xs group-hover:text-indigo-400/50 transition-colors uppercase tracking-widest">Oracle Card</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCards.length === 3 && (
              <div className="flex justify-center mt-12">
                <Button onClick={confirmTarot} className="px-12 h-16 text-xl animate-bounce shadow-indigo-500/40">
                  揭開命運面紗 <Sparkles className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <Card>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-700/50 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">{result.title}</h2>
                  <p className="text-indigo-400 font-medium">{result.summary}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setStep(2); setResult(null); }} className="h-12"><RotateCcw className="w-4 h-4" /> 重新占卜</Button>
                </div>
              </div>

              {result.type === ReadingMode.BAZI && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {[
                    { label: '年柱', val: result.details.year, sub: '根基' },
                    { label: '月柱', val: result.details.month, sub: '環境' },
                    { label: '日柱', val: result.details.day, sub: '自身' },
                    { label: '時柱', val: result.details.hour, sub: '晚年' }
                  ].map((p, i) => (
                    <div key={i} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 text-center hover:bg-indigo-500/5 transition-all">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{p.label}</div>
                      <div className="text-4xl font-black text-white mb-2 font-serif">{p.val}</div>
                      <div className="text-[12px] font-medium text-indigo-400 opacity-60">{p.sub}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.type === ReadingMode.ASTRO && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    { label: '太陽星座', val: result.details.sun, sub: '自我 / 人格', icon: '☀️' },
                    { label: '上升星座', val: result.details.rising, sub: '外在 / 面具', icon: '🌅' },
                    { label: '月亮星座', val: result.details.moon, sub: '情感 / 潛意識', icon: '🌙' }
                  ].map((p, i) => (
                    <div key={i} className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 text-center hover:bg-indigo-500/5 transition-all">
                      <div className="text-3xl mb-4">{p.icon}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{p.label}</div>
                      <div className="text-3xl font-black text-white mb-2">{p.val}</div>
                      <div className="text-[12px] font-medium text-indigo-400 opacity-60">{p.sub}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.type === ReadingMode.TAROT && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {result.details.selectedCards.map((c: SelectedTarot, i: number) => (
                    <div key={i} className="group relative bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 text-center hover:bg-slate-800/60 transition-colors">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-lg">
                        {i === 0 ? "過去 / 現狀" : i === 1 ? "核心 / 挑戰" : "建議 / 未來"}
                      </div>
                      <div className={`text-4xl mb-6 transition-transform duration-700 inline-block ${c.isReversed ? 'rotate-180 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`}>
                        🎴
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">{c.card.name}</h4>
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-block ${c.isReversed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                        {c.isReversed ? '逆位 (Reversed)' : '正位 (Upright)'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {!result.aiInterpretation ? (
                  <div className="flex flex-col items-center py-10 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                      <MessageCircle className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">玄微大師 深度解析</h3>
                    <p className="text-slate-400 text-center max-w-sm mb-8 px-6">
                      由先進的 Gemini AI 模型為您進行多維度的命運深度解析，提供事業、感情與生活的具體建議。
                    </p>
                    <Button onClick={getAiInterpretation} disabled={aiLoading} className="px-10 h-14">
                      {aiLoading ? (
                        <>正在讀取群星脈絡... <RotateCcw className="w-5 h-5 animate-spin" /></>
                      ) : (
                        <>開始深度解析 <Sparkles className="w-5 h-5" /></>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3 mb-6 font-master title-font">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Sparkles className="text-white w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-black text-white">玄微大師的深度啟示</h3>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-indigo-500/20 leading-relaxed text-slate-200 shadow-2xl space-y-6 max-h-[500px] overflow-y-auto hide-scrollbar">
                      {chatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                          <div className={`max-w-[85%] p-5 rounded-3xl shadow-lg ${chat.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                            }`}>
                            <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
                              {chat.parts[0].text}
                            </div>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-700/50">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="mt-10 mb-6 group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-2 pl-4 pr-2">
                        <input
                          type="text"
                          placeholder="向大師繼續發問..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-white text-base py-2"
                        />
                        <Button onClick={handleSendMessage} disabled={chatLoading} className="h-10 px-4 py-0 rounded-xl">
                          {chatLoading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-center mt-8 space-x-4">
                      <Button variant="outline" onClick={() => window.print()} className="h-12"><Info className="w-4 h-4" /> 匯出報告</Button>
                      <Button variant="ghost" onClick={() => { setStep(2); setResult(null); setChatHistory([]); }} className="h-12 border border-slate-700">下一位占友</Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <footer className="text-center py-10 opacity-40 hover:opacity-100 transition-opacity">
              <p className="text-slate-500 text-xs">© 2026 玄微命理觀測站. 所有解析僅供參考，未來掌握在您的手中。</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
