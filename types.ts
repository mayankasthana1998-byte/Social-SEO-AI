
export enum AppMode {
  GENERATION = 'GENERATION', // Mode A
  REFINE = 'REFINE', // Mode B
  COMPETITOR_SPY = 'COMPETITOR_SPY', // Mode C
  TREND_HUNTER = 'TREND_HUNTER', // New Mode: Find Trends
}

export enum Platform {
  INSTAGRAM = 'Instagram',
  TIKTOK = 'TikTok',
  YOUTUBE = 'YouTube',
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter (X)',
  FACEBOOK = 'Facebook',
}

export enum HookType {
  INTRIGUING_QUESTIONS = 'Intriguing Questions',
  BOLD_STATEMENTS = 'Bold/Startling Statements',
  COMPELLING_VISUALS = 'Compelling Visuals',
  STORYTELLING_SNIPPETS = 'Storytelling Snippets',
  URGENCY_SCARCITY = 'Urgency/Scarcity',
  PROBLEM_SOLUTION = 'Problem/Solution',
  AUTHORITY = 'Authority',
}

export interface AnalysisResult {
  visualAudit: {
    summary: string;
    hookIdentified: HookType;
    psychologyCheck: string;
  };
  strategy: {
    headline: string;
    caption: string;
    cta: string;
  };
  seo: {
    hiddenKeywords: string[];
    hashtags: {
      broad: string[];
      niche: string[];
      specific: string[];
    };
  };
  virality: {
    score: number;
    gapAnalysis: string;
    trendDetected?: string; 
    vibe?: string; 
  };
  competitorInsights?: {
    visualTheme: string;
    ctaStrategy: string;
    formula: string;
  }; 
}

export interface TrendItem {
  headline: string;
  whyItsHot: string;
  contentIdea: string;
}

export interface FileInput {
  file: File;
  preview: string;
  type: 'image' | 'video';
}
