import React, { useState, useEffect } from 'react';
import { AppMode, Platform, AnalysisResult, FileInput, TrendItem } from './types';
import { analyzeContent } from './services/geminiService';
import FileUpload from './components/FileUpload';
import AnalysisResultView from './components/AnalysisResultView';
import { 
  Sparkles, 
  BrainCircuit, 
  Users, 
  ArrowRight, 
  Loader2, 
  Settings2,
  Instagram,
  Linkedin,
  Youtube,
  Music2,
  MapPin,
  Languages,
  Target,
  UserCheck,
  Zap,
  Cpu,
  Flame,
  Twitter,
  Facebook,
  Search,
  ShieldCheck,
  FileText,
  Key
} from 'lucide-react';

// Define a type for the config state
interface ConfigState {
  goal: string;
  style: string;
  keywords: string;
  originalText: string;
  geography: string;
  targetAudience: string;
  targetLanguage: string;
  demographics: string;
  enableLiveTrends: boolean;
  brandGuidelines: string;
  niche: string;
}

const App: React.FC = () => {
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showGatekeeper, setShowGatekeeper] = useState<boolean>(true);
  const [tempKey, setTempKey] = useState<string>('');

  const [mode, setMode] = useState<AppMode>(AppMode.GENERATION);
  const [platform, setPlatform] = useState<Platform>(Platform.INSTAGRAM);
  const [files, setFiles] = useState<FileInput[]>([]);
  const [brandFiles, setBrandFiles] = useState<FileInput[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [trendResults, setTrendResults] = useState<TrendItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [config, setConfig] = useState<ConfigState>({
    goal: 'Viral Growth',
    style: 'Authentic',
    keywords: '',
    originalText: '',
    geography: '',
    targetAudience: '',
    targetLanguage: '',
    demographics: '',
    enableLiveTrends: false,
    brandGuidelines: '',
    niche: ''
  });

  // Check for existing API Key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const envKey = process.env.API_KEY;

    if (envKey && envKey.length > 0 && !envKey.includes("VITE_")) {
       // Priority 1: Environment Variable (Vercel)
       setApiKey(envKey);
       setShowGatekeeper(false);
    } else if (storedKey && storedKey.startsWith('AIza')) {
       // Priority 2: Local Storage
       setApiKey(storedKey);
       setShowGatekeeper(false);
    }
  }, []);

  const handleSaveKey = () => {
    if (!tempKey.startsWith('AIza')) {
      alert('Invalid Key format. It must start with AIza.');
      return;
    }
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setShowGatekeeper(false);
  };

  // Simulation of Loading Phases
  useEffect(() => {
    let interval: any;
    
    if (isAnalyzing) {
      setLoadingProgress(0);
      setLoadingMessage('Phase 1: Encrypting & Uploading to Cloud...');
      
      const startTime = Date.now();
      const estimatedDuration = 15000; 

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let progress = (elapsed / estimatedDuration) * 100;
        
        // Cap at 90% until the actual API returns
        if (progress > 90) progress = 90;
        
        setLoadingProgress(progress);

        // Phase Logic
        if (progress < 25) {
          setLoadingMessage('Phase 1: Encrypting & Uploading to Cloud...');
        } else if (progress < 50) {
          setLoadingMessage('Phase 2: Scanning Video Frames & Audio...');
        } else if (progress < 75) {
          if (config.enableLiveTrends || mode === AppMode.TREND_HUNTER) {
            setLoadingMessage('Phase 3: Searching Live Google Trends...');
          } else {
            setLoadingMessage('Phase 2: Deep Semantic Analysis...'); 
          }
        } else {
          setLoadingMessage(mode === AppMode.TREND_HUNTER ? 'Phase 4: Identifying Viral Patterns...' : 'Phase 4: Generating Viral Strategy...');
        }

      }, 100);
    } else {
      // When analysis finishes, snap to 100 if we have a result
      if (result || trendResults) setLoadingProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, config.enableLiveTrends, mode, result, trendResults]);

  const handleAnalyze = async () => {
    // Validation
    if (mode === AppMode.GENERATION && files.length === 0) {
      setError("Please upload content to analyze.");
      return;
    }
    if (mode === AppMode.REFINE && !config.originalText) {
      setError("Please enter text to refine.");
      return;
    }
    if (mode === AppMode.COMPETITOR_SPY && files.length === 0) {
      setError("Please upload competitor content to analyze.");
      return;
    }
    if (mode === AppMode.TREND_HUNTER && !config.niche) {
      setError("Please enter a niche to hunt trends for.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setTrendResults(null);

    try {
      const filesToAnalyze = files.map(f => f.file);

      // Add safety check for large files
      const totalSize = filesToAnalyze.reduce((sum, f) => sum + f.size, 0);
      const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total
      if (totalSize > MAX_TOTAL_SIZE) {
        setError("Total file size exceeds 100MB. Please upload smaller files.");
        setIsAnalyzing(false);
        return;
      }

      const data = await analyzeContent(filesToAnalyze, mode, platform, config, apiKey);

      if (mode === AppMode.TREND_HUNTER) {
        const trends = data as TrendItem[];
        if (trends && trends.length > 0) {
          setTrendResults(trends);
        } else {
          setError("No trends found for your niche. Try a different search term.");
        }
      } else {
        setResult(data as AnalysisResult);
      }
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred.";
      setError(errorMsg);
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseTrend = (trend: TrendItem) => {
    // Switch to Generation Mode
    setMode(AppMode.GENERATION);
    // Pre-fill context
    setConfig(prev => ({
      ...prev,
      style: 'Urgent & Hype', // Trends usually require energy
      goal: 'Viral Growth',
      keywords: trend.headline, // Use headline as context
      // Note: We can't easily pre-fill a file, so user still needs to upload
    }));
    // Show alert or toast instructions
    alert(`Trend "${trend.headline}" activated! Upload your content now to generate the strategy.`);
  };

  const ModeButton = ({ m, icon: Icon, label, desc }: { m: AppMode, icon: any, label: string, desc: string }) => (
    <button
      onClick={() => { setMode(m); setResult(null); setTrendResults(null); if(m !== AppMode.TREND_HUNTER) setFiles([]); }}
      className={`relative p-3 rounded-xl border transition-all text-left w-full h-full flex flex-col justify-between group ${
        mode === m 
          ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
      }`}
    >
      <div className="mb-2">
        <Icon className={`w-5 h-5 ${mode === m ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'}`} />
      </div>
      <div>
        <span className={`block font-bold text-sm ${mode === m ? 'text-white' : 'text-slate-200'}`}>{label}</span>
        <span className={`text-[10px] ${mode === m ? 'text-indigo-200' : 'text-slate-500'}`}>{desc}</span>
      </div>
    </button>
  );

  // GATEKEEPER UI
  if (showGatekeeper) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         {/* Background Orbs */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

         <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">SocialSEO AI</h1>
               <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase">Andromeda Engine Initialization</p>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Google AI Studio API Key</label>
                  <div className="relative">
                    <Key className="absolute top-3.5 left-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      placeholder="Paste key starting with AIza..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 ml-1">
                    Your key is stored locally in your browser. We do not save it on our servers.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 ml-1 underline">Get a key here.</a>
                  </p>
               </div>

               <button 
                 onClick={handleSaveKey}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center group"
               >
                 Initialize System
                 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SocialSEO AI</h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Andromeda Engine</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_api_key');
                setShowGatekeeper(true);
                setApiKey('');
                setTempKey('');
              }}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Change Key
            </button>
            <div className="text-xs text-slate-500 hidden md:block">
               v3.0.0-Andromeda
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Input */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Mode Selector */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Operation Mode</h2>
            <div className="grid grid-cols-4 gap-2">
              <ModeButton 
                m={AppMode.GENERATION} 
                icon={Sparkles} 
                label="Create" 
                desc="From Media" 
              />
              <ModeButton 
                m={AppMode.REFINE} 
                icon={Settings2} 
                label="Refine" 
                desc="Polisher" 
              />
              <ModeButton 
                m={AppMode.COMPETITOR_SPY} 
                icon={BrainCircuit} 
                label="Spy" 
                desc="Analysis" 
              />
              <ModeButton 
                m={AppMode.TREND_HUNTER} 
                icon={Flame} 
                label="Trends" 
                desc="Live Hunt" 
              />
            </div>
          </section>

          {/* Dynamic Configuration based on Mode */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm space-y-6">
            
            {/* Live Trend Toggle (Hidden in Trend Hunter Mode as it's implicit) */}
            {mode !== AppMode.TREND_HUNTER && (
              <div className="flex items-center justify-between bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30">
                <div className="flex items-center">
                  <Zap className="text-yellow-400 w-5 h-5 mr-3" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Trend Mode</h3>
                    <p className="text-xs text-indigo-300">Search web for real-time viral formats</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={config.enableLiveTrends} 
                    onChange={(e) => setConfig({...config, enableLiveTrends: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            )}

            {/* Platform Selector (Hidden in Trend Hunter & Spy) */}
            {mode !== AppMode.COMPETITOR_SPY && mode !== AppMode.TREND_HUNTER && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Target Platform</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: Platform.INSTAGRAM, icon: Instagram },
                    { id: Platform.TIKTOK, icon: Music2 },
                    { id: Platform.YOUTUBE, icon: Youtube },
                    { id: Platform.LINKEDIN, icon: Linkedin },
                    { id: Platform.TWITTER, icon: Twitter },
                    { id: Platform.FACEBOOK, icon: Facebook },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        platform === p.id 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                      title={p.id}
                    >
                      <p.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Guard (Hidden in Trend Hunter) */}
            {mode !== AppMode.TREND_HUNTER && (
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Brand Guard (Optional)
                  </label>
                  <div className="space-y-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <textarea 
                      className="w-full h-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none placeholder-slate-500"
                      placeholder="Paste strict guidelines here (e.g. 'Never use emoji', 'Always mention Sustainability')..."
                      value={config.brandGuidelines}
                      onChange={(e) => setConfig({...config, brandGuidelines: e.target.value})}
                    />
                    <div className="flex items-center space-x-2">
                       <p className="text-[10px] text-slate-500 uppercase font-bold flex-1">Or Upload PDF Style Guide:</p>
                       <div className="w-1/2">
                          <FileUpload files={brandFiles} setFiles={setBrandFiles} />
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {/* Mode D: Trend Hunter Inputs */}
            {mode === AppMode.TREND_HUNTER && (
              <div className="space-y-4 pt-4 border-t border-slate-700/50 animate-fade-in">
                 <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-xl flex items-center space-x-3">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="text-sm font-bold text-orange-200">The Trend Hunter</h3>
                      <p className="text-xs text-orange-400/80">Scours Google, TikTok & Twitter for real-time viral spikes.</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Niche / Industry</label>
                    <div className="relative">
                      <Search className="absolute top-3.5 left-3 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-3 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="e.g. Vegan Cooking, Crypto News, DIY Home Decor..."
                        value={config.niche}
                        onChange={(e) => setConfig({...config, niche: e.target.value})}
                      />
                    </div>
                 </div>
              </div>
            )}

            {/* Standard Targeting (Hidden in Trend Hunter) */}
            {mode !== AppMode.TREND_HUNTER && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Targeting & Context
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="relative">
                      <MapPin className="absolute top-3 left-3 text-slate-500 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Geography (e.g. NYC)"
                        value={config.geography}
                        onChange={(e) => setConfig({...config, geography: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                   <div className="relative">
                      <Languages className="absolute top-3 left-3 text-slate-500 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Language"
                        value={config.targetLanguage}
                        onChange={(e) => setConfig({...config, targetLanguage: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                   <div className="relative">
                      <Users className="absolute top-3 left-3 text-slate-500 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Audience"
                        value={config.targetAudience}
                        onChange={(e) => setConfig({...config, targetAudience: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                   <div className="relative">
                      <UserCheck className="absolute top-3 left-3 text-slate-500 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="Demographics"
                        value={config.demographics}
                        onChange={(e) => setConfig({...config, demographics: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                </div>
              </div>
            )}

            {/* Mode A: Generation Inputs */}
            {mode === AppMode.GENERATION && (
              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">User Goal</label>
                     <select 
                       value={config.goal}
                       onChange={(e) => setConfig({...config, goal: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                     >
                       <option>Viral Growth (Views)</option>
                       <option>Sales Conversion</option>
                       <option>Community Engagement</option>
                       <option>Brand Authority</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Voice Style</label>
                     <select 
                       value={config.style}
                       onChange={(e) => setConfig({...config, style: e.target.value})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                     >
                       <option>Authentic & Raw</option>
                       <option>Professional & Polished</option>
                       <option>Urgent & Hype</option>
                       <option>Educational & Calm</option>
                     </select>
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Input Media</label>
                  <FileUpload files={files} setFiles={setFiles} />
                </div>
              </div>
            )}

            {/* Mode B: Refine Inputs */}
            {mode === AppMode.REFINE && (
              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Original Draft</label>
                  <textarea 
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Paste your rough draft here..."
                    value={config.originalText}
                    onChange={(e) => setConfig({...config, originalText: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Target Keywords (SEO)</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. skin care, morning routine, glow up"
                    value={config.keywords}
                    onChange={(e) => setConfig({...config, keywords: e.target.value})}
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Context Media (Optional)</label>
                   <FileUpload files={files} setFiles={setFiles} />
                </div>
              </div>
            )}

            {/* Mode C: Competitor Spy Inputs */}
            {mode === AppMode.COMPETITOR_SPY && (
              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 flex items-start">
                   <Users className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                   Batch Analysis Protocol Active: Upload 3-10 competitor screenshots or videos to extract their viral pattern.
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Competitor Data Set</label>
                  <FileUpload files={files} setFiles={setFiles} multiple={true} />
                </div>
              </div>
            )}

          </div>

          {/* Action Button */}
          <div className="relative group">
            {!isAnalyzing && (
              <div className={`absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200 animate-pulse ${
                mode === AppMode.TREND_HUNTER ? 'bg-orange-500' : 'bg-indigo-500'
              }`}></div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`relative w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
                isAnalyzing 
                ? 'bg-slate-700 cursor-not-allowed' 
                : mode === AppMode.TREND_HUNTER
                  ? 'bg-orange-600 hover:bg-orange-500'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === AppMode.TREND_HUNTER ? 'Hunting Trends...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  {mode === AppMode.TREND_HUNTER ? (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Hunt Viral Topics
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Viral Strategy
                    </>
                  )}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="flex items-center justify-center p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm mt-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                 <Zap className="w-4 h-4 text-red-500 fill-red-500" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Output */}
        <div className="lg:col-span-7">
          {isAnalyzing ? (
            // CUSTOM LOADING VIEW
            <div className="h-full min-h-[500px] border border-slate-700 bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center p-8 backdrop-blur-sm animate-fade-in relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
               
               <div className="w-full max-w-md space-y-8 relative z-10 text-center">
                  {/* Central Icon */}
                  <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                      <div className="relative bg-slate-900 border-2 border-indigo-500 rounded-full w-full h-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                           <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                      </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1" /> System Active</span>
                          <span>{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
                          {/* Animated Gradient Bar */}
                          <div 
                              className={`h-full bg-gradient-to-r transition-all duration-300 ease-out relative ${mode === AppMode.TREND_HUNTER ? 'from-orange-600 via-red-500 to-orange-400' : 'from-indigo-600 via-purple-500 to-indigo-400'}`}
                              style={{ width: `${loadingProgress}%` }}
                          >
                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Phase Text */}
                  <div className="h-12 flex items-center justify-center">
                    <p className="text-slate-200 font-medium animate-pulse flex items-center bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50">
                        {loadingMessage.includes('Trends') ? (
                           <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                        ) : (
                           <FileText className="w-4 h-4 text-indigo-400 mr-2" />
                        )}
                        {loadingMessage}
                    </p>
                  </div>
               </div>
            </div>
          ) : result ? (
            <AnalysisResultView result={result} mode={mode} />
          ) : trendResults ? (
            // TREND HUNTER RESULTS GRID
            <div className="space-y-6 animate-fade-in">
              <div className="bg-orange-900/20 border border-orange-500/30 p-6 rounded-xl">
                 <h2 className="text-xl font-bold text-white flex items-center">
                   <Flame className="w-6 h-6 mr-2 text-orange-500" />
                   Viral Trends Detected for "{config.niche}"
                 </h2>
                 <p className="text-slate-400 text-sm mt-1">Select a trend below to auto-generate a content strategy.</p>
              </div>
              <div className="grid gap-4">
                {trendResults.map((trend, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 transition-all p-5 rounded-xl group relative overflow-hidden">
                    <div className="flex justify-between items-start">
                       <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">{trend.headline}</h3>
                          <div className="mb-3">
                             <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-900/30 px-2 py-1 rounded">Why it's Hot</span>
                             <p className="text-sm text-slate-300 mt-1">{trend.whyItsHot}</p>
                          </div>
                          <div>
                             <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">Content Idea</span>
                             <p className="text-sm text-slate-300 mt-1">{trend.contentIdea}</p>
                          </div>
                       </div>
                       <div className="ml-4">
                          <button 
                            onClick={() => handleUseTrend(trend)}
                            className="bg-slate-700 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors shadow-lg"
                            title="Use this Trend"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // IDLE STATE
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 p-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${mode === AppMode.TREND_HUNTER ? 'bg-orange-900/30' : 'bg-slate-800/50'}`}>
                {mode === AppMode.TREND_HUNTER ? (
                  <Flame className="w-10 h-10 text-orange-600" />
                ) : (
                  <BrainCircuit className="w-10 h-10 text-slate-700" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-500 mb-2">
                {mode === AppMode.TREND_HUNTER ? 'Ready to Hunt' : 'Ready for Ingestion'}
              </h3>
              <p className="text-center max-w-sm text-sm">
                {mode === AppMode.TREND_HUNTER 
                  ? 'Enter a niche to scour the web for the latest viral spikes.' 
                  : 'Upload content or paste text to activate the SocialSEO Andromeda Engine.'}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;