
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, Star, Sun, Search, RotateCcw, ArrowRight, User, 
  Droplets, Wind, Mountain, Compass, MapPin, Heart, Briefcase, 
  Activity, MessageCircle, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { ReadingMode, UserInfo, ReadingResult, SelectedTarot, TarotCard } from './types';
import { calculateBazi, calculateAstroDetails } from './utils';
import { FULL_DECK } from './constants';
import { fetchInterpretation } from './services/geminiService';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; secondary?: boolean }> = ({ onClick, children, className = "", disabled = false, secondary = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
    ${secondary 
      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' 
      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-500 hover:to-purple-500'} 
    ${className}`}
  >
    {children}
  </button>
);

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    year: 1995, month: 6, day: 15, hour: 12, minute: 0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [selectedCards, setSelectedCards] = useState<SelectedTarot[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const startReading = (mode: ReadingMode) => {
    setLoading(true);
    setResult(null);
    setSelectedCards([]);
    
    if (mode === ReadingMode.TAROT) {
      setTimeout(() => {
        setLoading(false);
        setStep(3);
        setShuffling(true);
        setTimeout(() => setShuffling(false), 1500);
      }, 800);
    } else {
      setTimeout(() => {
        generateDirectResult(mode);
        setLoading(false);
        setStep(4);
      }, 1500);
    }
  };

  const generateDirectResult = (mode: ReadingMode) => {
    if (mode === ReadingMode.BAZI) {
      const bazi = calculateBazi(userInfo.year, userInfo.month, userInfo.day);
      setResult({
        type: mode,
        title: '【 八字命盤解析 】',
        summary: `本命元神為「${bazi.stem.char}${bazi.stem.element}」，生肖屬${bazi.animal}。`,
        details: { main: `${bazi.stem.char}${bazi.branch}`, element: bazi.stem.element }
      });
    } else if (mode === ReadingMode.ASTRO) {
      const astro = calculateAstroDetails(userInfo.year, userInfo.month, userInfo.day, userInfo.hour, userInfo.minute);
      setResult({
        type: mode,
        title: '【 星盤運勢解析 】',
        summary: `太陽：${astro.sun} | 上升：${astro.rising} | 月亮：${astro.moon}`,
        details: astro
      });
    }
  };

  const handlePickTarot = (card: TarotCard) => {
    if (selectedCards.length >= 3 || selectedCards.find(c => c.card.id === card.id)) return;
    const isReversed = Math.random() > 0.5;
    setSelectedCards(prev => [...prev, { card, isReversed }]);
  };

  const confirmTarot = async () => {
    const readingResult: ReadingResult = {
      type: ReadingMode.TAROT,
      title: '【 塔羅指引解析 】',
      summary: selectedCards.map(c => `${c.card.name}(${c.isReversed ? '逆' : '正'})`).join(' / '),
      details: { selectedCards }
    };
    setResult(readingResult);
    setStep(4);
  };

  const getAiInterpretation = async () => {
    if (!result) return;
    setAiLoading(true);
    const interpretation = await fetchInterpretation(result);
    setResult(prev => prev ? { ...prev, aiInterpretation: interpretation } : null);
    setAiLoading(false);
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div onClick={() => setStep(1)} className="inline-flex cursor-pointer items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4 ring-1 ring-indigo-400/30 hover:bg-indigo-500/20 transition-colors">
          <Sparkles className="w-6 h-6 text-indigo-400 mr-2" />
          <span className="text-indigo-300 font-medium tracking-wider">靈靈染 · 命運觀測站 v5.0</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400 mb-4">
          探索妳的命運軌跡
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-sm">
          結合 AI 智慧與古老智慧，為妳的迷惘提供清晰的星火指引。
        </p>
      </header>

      {step === 1 && (
        <div className="max-w-md mx-auto">
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
              <span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
              輸入出生時刻
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">西元年</label>
                  <input type="number" name="year" value={userInfo.year} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">月</label>
                  <input type="number" name="month" min="1" max="12" value={userInfo.month} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">日</label>
                  <input type="number" name="day" min="1" max="31" value={userInfo.day} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                  <label className="text-xs text-slate-400">時 (24h)</label>
                  <input type="number" name="hour" min="0" max="23" value={userInfo.hour} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">分</label>
                  <input type="number" name="minute" min="0" max="59" value={userInfo.minute} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white" />
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full mt-4">
                下一步 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && !loading && (
        <div className="grid md:grid-cols-3 gap-6">
          <button onClick={() => startReading(ReadingMode.BAZI)} className="group relative bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-all hover:scale-105 hover:border-indigo-500/50 text-left">
            <User className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">生辰八字</h3>
            <p className="text-sm text-slate-400">運用五行平衡理論，觀測流年運勢與命盤底色。</p>
          </button>
          <button onClick={() => startReading(ReadingMode.ASTRO)} className="group relative bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-all hover:scale-105 hover:border-purple-500/50 text-left">
            <Star className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">西洋星盤</h3>
            <p className="text-sm text-slate-400">解讀太陽、上升、月亮黃金三角，揭示靈魂本質。</p>
          </button>
          <button onClick={() => startReading(ReadingMode.TAROT)} className="group relative bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-all hover:scale-105 hover:border-pink-500/50 text-left">
            <Sparkles className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">塔羅占卜</h3>
            <p className="text-sm text-slate-400">抽取 3 張牌組，針對特定當下問題提供宇宙建議。</p>
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-6 text-lg text-indigo-200 animate-pulse">正在觀測星圖軌跡...</p>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">請靜心，並選取 3 張牌</h3>
          <p className="text-slate-400 mb-8">({selectedCards.length} / 3)</p>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 py-8 px-4 hide-scrollbar cursor-grab"
          >
            {FULL_DECK.map((card, i) => {
              const isSelected = selectedCards.find(c => c.card.id === card.id);
              return (
                <div 
                  key={card.id}
                  onClick={() => handlePickTarot(card)}
                  className={`flex-shrink-0 w-28 h-48 md:w-32 md:h-56 rounded-xl border-2 transition-all duration-500 cursor-pointer
                  ${isSelected ? 'border-yellow-400 scale-110 -translate-y-4' : 'border-indigo-900 bg-indigo-950/50'}
                  ${shuffling ? 'animate-pulse' : ''}`}
                >
                   <div className="h-full w-full flex items-center justify-center">
                     <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center">
                       <Sparkles className="text-white/20" />
                     </div>
                   </div>
                </div>
              );
            })}
          </div>

          {selectedCards.length === 3 && (
            <Button onClick={confirmTarot} className="mt-8 mx-auto animate-float">
              開啟宇宙指引
            </Button>
          )}
        </div>
      )}

      {step === 4 && result && (
        <div className="space-y-8">
          <Card>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">{result.title}</h2>
              <p className="text-indigo-400 mt-2">{result.summary}</p>
            </div>

            {result.type === ReadingMode.TAROT && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {result.details.selectedCards.map((c: SelectedTarot, i: number) => (
                  <div key={i} className="bg-slate-800/50 p-6 rounded-xl border border-indigo-500/20 text-center">
                    <span className="text-xs text-slate-400 block mb-2">{i === 0 ? "過去" : i === 1 ? "現在" : "未來"}</span>
                    <h4 className={`text-xl font-bold text-white mb-2 ${c.isReversed ? 'rotate-180' : ''}`}>{c.card.name}</h4>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">{c.isReversed ? '逆位' : '正位'}</span>
                  </div>
                ))}
              </div>
            )}

            {!result.aiInterpretation ? (
              <div className="text-center">
                <Button onClick={getAiInterpretation} disabled={aiLoading}>
                  {aiLoading ? (
                    <span className="flex items-center"><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> 宇宙解析中...</span>
                  ) : (
                    <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-2" /> 請求 AI 靈靈染深度解析</span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-slate-950/50 p-6 rounded-xl border border-indigo-500/20 leading-relaxed text-slate-300 whitespace-pre-wrap">
                {result.aiInterpretation}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center">
              <Button secondary onClick={() => { setStep(2); setResult(null); }}>
                重新占卜
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;
