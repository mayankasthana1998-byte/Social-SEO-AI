import React from 'react';
import { AnalysisResult, AppMode } from '../types';
import { Copy, TrendingUp, Hash, Eye, MessageSquare, AlertTriangle, Flame, Share2, Download, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  mode: AppMode;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, mode }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Prepare content for sharing/exporting
  const fullStrategyContent = `HEADLINE:\n${result.strategy.headline}\n\nCAPTION:\n${result.strategy.caption}\n\nCTA:\n${result.strategy.cta}\n\nHASHTAGS:\n${result.seo.hashtags.broad.join(' ')} ${result.seo.hashtags.niche.join(' ')}`;

  const handleSmartShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SocialSEO Strategy',
          text: fullStrategyContent,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      alert("Native sharing is not supported on this browser. Please use the copy or download buttons.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullStrategyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-strategy-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(result.strategy.headline + '\n\n' + result.strategy.caption.substring(0, 200) + '...')}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullStrategyContent)}`;
  const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(result.strategy.headline)}`; // LinkedIn often ignores pre-fill text params but we try

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Competitor Insight Banner */}
      {mode === AppMode.COMPETITOR_SPY && result.competitorInsights && (
        <div className="bg-indigo-900/30 border border-indigo-500/50 p-6 rounded-xl backdrop-blur-sm">
          <h3 className="flex items-center text-lg font-bold text-indigo-300 mb-2">
            <Eye className="w-5 h-5 mr-2" />
            Competitor DNA Decoded
          </h3>
          <p className="text-slate-300 italic">"{result.visualAudit.summary}"</p>
          <div className="mt-4 space-y-2 p-4 bg-slate-900/50 rounded-lg text-sm text-indigo-100 border border-indigo-500/20">
             <div><span className="font-bold text-indigo-300">Visual Theme:</span> {result.competitorInsights.visualTheme}</div>
             <div><span className="font-bold text-indigo-300">CTA Strategy:</span> {result.competitorInsights.ctaStrategy}</div>
             <div><span className="font-bold text-indigo-300">Winning Formula:</span> {result.competitorInsights.formula}</div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Audit */}
        <div className="bg-slate-800/40 border border-slate-700 p-5 rounded-xl backdrop-blur-sm">
          <h3 className="text-indigo-400 font-semibold mb-3 text-sm uppercase tracking-wider flex items-center">
            <Eye className="w-4 h-4 mr-2" /> Visual & Hook Audit
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500 block">Identified Hook</span>
              <span className="text-slate-200 font-medium">{result.visualAudit.hookIdentified}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Psychology Check</span>
              <p className="text-slate-300 text-sm mt-1">{result.visualAudit.psychologyCheck}</p>
            </div>
          </div>
        </div>

        {/* Virality Score */}
        <div className="bg-slate-800/40 border border-slate-700 p-5 rounded-xl backdrop-blur-sm flex flex-col justify-between">
          <h3 className="text-indigo-400 font-semibold mb-3 text-sm uppercase tracking-wider flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" /> Viral Prediction
          </h3>
          <div className="flex items-center space-x-4 mb-2">
            <div className={`text-4xl font-bold ${getScoreColor(result.virality.score)}`}>
              {result.virality.score}
            </div>
            <div className="text-xs text-slate-400">
              / 100 <br /> Viral Score
            </div>
          </div>
          
          {/* Trend Detected Badge */}
          {result.virality.trendDetected && (
             <div className="mb-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded px-2 py-1.5 flex items-start">
               <Flame className="w-3.5 h-3.5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
               <div className="text-xs text-orange-200">
                 <span className="font-bold block text-orange-400 mb-0.5">🔥 Trend Detected</span>
                 {result.virality.trendDetected}
               </div>
             </div>
          )}

          <div className="bg-slate-900/50 p-3 rounded border border-slate-700 text-sm text-slate-300">
            <AlertTriangle className="w-3 h-3 text-yellow-500 inline mr-2" />
            {result.virality.gapAnalysis}
          </div>
        </div>
      </div>

      {/* The Strategy (Glassmorphism Applied) */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 p-6 rounded-xl shadow-lg shadow-indigo-500/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
            The Strategy
          </h3>
          <button 
            onClick={() => navigator.clipboard.writeText(result.strategy.caption)}
            className="text-xs flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Copy className="w-3 h-3 mr-1" /> Copy Caption
          </button>
        </div>

        <div className="space-y-4">
           <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50 relative">
             <span className="absolute -top-2 left-4 px-2 bg-indigo-600 text-white text-[10px] uppercase font-bold rounded">Overlay Text</span>
             <p className="text-lg font-bold text-white text-center mt-2 font-outline-1">{result.strategy.headline}</p>
           </div>

           <div className="bg-slate-900 p-4 rounded-lg border border-slate-700/50">
             <span className="text-xs text-slate-500 uppercase font-bold mb-2 block">Caption / Script</span>
             <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{result.strategy.caption}</p>
           </div>

           <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-lg border border-indigo-500/20 flex items-center justify-between">
             <span className="text-xs text-indigo-300 uppercase font-bold">Call To Action</span>
             <span className="font-bold text-white">{result.strategy.cta}</span>
           </div>

           {/* Share & Export Row */}
           <div className="pt-4 mt-2 border-t border-slate-700/50 flex flex-wrap gap-3 items-center justify-between">
             <div className="flex gap-2">
               <button 
                 onClick={handleSmartShare}
                 className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
               >
                 <Share2 className="w-4 h-4 mr-2" />
                 Smart Share
               </button>
               <a 
                 href={whatsappUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors"
                 title="Share to WhatsApp"
               >
                 <MessageCircle className="w-4 h-4" />
               </a>
               <a 
                 href={twitterUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-sky-600/20 text-sky-400 border border-sky-600/30 rounded-lg hover:bg-sky-600/30 transition-colors"
                 title="Share to X (Twitter)"
               >
                 <Twitter className="w-4 h-4" />
               </a>
               <a 
                 href={linkedinUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-blue-700/20 text-blue-400 border border-blue-700/30 rounded-lg hover:bg-blue-700/30 transition-colors"
                 title="Share to LinkedIn"
               >
                 <Linkedin className="w-4 h-4" />
               </a>
             </div>

             <button 
                onClick={handleDownload}
                className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
             >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download .TXT
             </button>
           </div>
        </div>
      </div>

      {/* SEO Data */}
      <div className="bg-slate-800/40 border border-slate-700 p-5 rounded-xl backdrop-blur-sm">
        <h3 className="text-indigo-400 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center">
            <Hash className="w-4 h-4 mr-2" /> SEO & Virality Data
        </h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-xs text-slate-500 block mb-1">Alt Text (Hidden Keywords)</span>
            <div className="flex flex-wrap gap-2">
              {result.seo.hiddenKeywords.map((k, i) => (
                <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{k}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-700/50">
             <div>
               <span className="text-[10px] uppercase text-slate-500 font-bold">Broad (1M+)</span>
               <div className="flex flex-wrap gap-1 mt-1">
                 {result.seo.hashtags.broad.map((t, i) => <span key={i} className="text-xs text-blue-400">{t}</span>)}
               </div>
             </div>
             <div>
               <span className="text-[10px] uppercase text-slate-500 font-bold">Niche (100k+)</span>
               <div className="flex flex-wrap gap-1 mt-1">
                 {result.seo.hashtags.niche.map((t, i) => <span key={i} className="text-xs text-indigo-400">{t}</span>)}
               </div>
             </div>
             <div>
               <span className="text-[10px] uppercase text-slate-500 font-bold">Specific (&lt;50k)</span>
               <div className="flex flex-wrap gap-1 mt-1">
                 {result.seo.hashtags.specific.map((t, i) => <span key={i} className="text-xs text-purple-400">{t}</span>)}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;