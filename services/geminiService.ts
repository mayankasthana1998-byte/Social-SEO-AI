import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AppMode, Platform, TrendItem } from "../types";
import { SYSTEM_INSTRUCTION, MODE_PROMPTS, TREND_HUNTER_INSTRUCTION, BRAND_GUARD_INSTRUCTION } from "../constants";

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to convert small files to Base64 (InlineData)
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to upload large files via File API
const uploadLargeFile = async (ai: GoogleGenAI, file: File): Promise<{ fileData: { fileUri: string; mimeType: string } }> => {
  try {
    const uploadResult = await ai.files.upload({
      file: file,
      config: { 
        displayName: file.name,
        mimeType: file.type 
      }
    });

    let fileInfo = await ai.files.get({ name: uploadResult.name });
    
    // Poll until active
    let attempts = 0;
    while (fileInfo.state === 'PROCESSING' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      fileInfo = await ai.files.get({ name: uploadResult.name });
      attempts++;
    }

    if (fileInfo.state === 'FAILED') {
      throw new Error("File processing failed on Gemini server.");
    }

    return {
      fileData: {
        fileUri: fileInfo.uri,
        mimeType: fileInfo.mimeType
      }
    };
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload large file to Gemini. Please try a smaller file.");
  }
};

const cleanJson = (text: string) => {
  let clean = text.trim();
  // Remove markdown code blocks if present
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
};

export const analyzeContent = async (
  files: File[],
  mode: AppMode,
  platform: Platform,
  config: { 
    goal?: string; 
    style?: string; 
    keywords?: string; 
    originalText?: string;
    geography?: string;
    targetAudience?: string;
    targetLanguage?: string;
    demographics?: string;
    enableLiveTrends?: boolean;
    brandGuidelines?: string;
    niche?: string; // For Trend Hunter
  },
  apiKey: string
): Promise<AnalysisResult | TrendItem[]> => {
  try {
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const currentDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // 1. Prepare Prompt based on Mode
    const targeting = [
      config.geography ? `Target Geography: ${config.geography}` : '',
      config.targetAudience ? `Target Audience: ${config.targetAudience}` : '',
      config.targetLanguage ? `Target Language: ${config.targetLanguage}` : '',
      config.demographics ? `Target Demographics: ${config.demographics}` : ''
    ].filter(Boolean).join('\n');

    let promptText = "";

    // Trend Hunter Mode Logic
    if (mode === AppMode.TREND_HUNTER) {
      if (!config.niche) throw new Error("Niche is required for Trend Hunter.");
      promptText = MODE_PROMPTS.TREND_HUNTER(config.niche, currentDate);
    } 
    // Standard Modes
    else {
      // Inject Live Trend Instructions if enabled
      if (config.enableLiveTrends) {
          promptText += TREND_HUNTER_INSTRUCTION(currentDate, platform) + "\n\n";
      }

      // Inject Brand Guidelines if provided
      if (config.brandGuidelines) {
        promptText += BRAND_GUARD_INSTRUCTION(config.brandGuidelines) + "\n\n";
      }

      promptText += "IMPORTANT: You MUST return a valid JSON object matching the AnalysisResult structure. Do not include markdown formatting.\n\n";

      if (mode === AppMode.GENERATION) {
        promptText += MODE_PROMPTS.GENERATION(platform, config.goal || 'Viral Growth', config.style || 'Authentic', targeting);
      } else if (mode === AppMode.REFINE) {
        promptText += MODE_PROMPTS.REFINE(config.originalText || '', config.keywords || '', targeting);
      } else if (mode === AppMode.COMPETITOR_SPY) {
        promptText += MODE_PROMPTS.COMPETITOR_SPY(files.length, targeting);
      }
    }

    // 2. Prepare Multimedia Parts
    const parts: any[] = [{ text: promptText }];
    
    // Only process files if NOT in Trend Hunter mode
    if (mode !== AppMode.TREND_HUNTER) {
      const FILE_SIZE_THRESHOLD = 20 * 1024 * 1024; 
      for (const file of files) {
        if (file.size > FILE_SIZE_THRESHOLD) {
          const part = await uploadLargeFile(ai, file);
          parts.push(part);
        } else {
          const part = await fileToPart(file);
          parts.push(part);
        }
      }
    }

    // 3. Configure Request
    const generateConfig: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 1024 }
    };

    // LOGIC: If Trend Hunter OR Live Trends is enabled, we need Google Search.
    // When Google Search is enabled, we cannot use responseSchema.
    const useSearch = mode === AppMode.TREND_HUNTER || config.enableLiveTrends;

    if (useSearch) {
      generateConfig.tools = [{ googleSearch: {} }];
      // NO responseSchema allowed with search tools in current version
    } else {
      // Standard Schema for Generation/Refine/Spy without search
      generateConfig.responseMimeType = "application/json";
      generateConfig.responseSchema = {
        type: Type.OBJECT,
        properties: {
          visualAudit: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              hookIdentified: { type: Type.STRING },
              psychologyCheck: { type: Type.STRING },
            },
            required: ['summary', 'hookIdentified', 'psychologyCheck']
          },
          strategy: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              caption: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ['headline', 'caption', 'cta']
          },
          seo: {
            type: Type.OBJECT,
            properties: {
              hiddenKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: {
                type: Type.OBJECT,
                properties: {
                  broad: { type: Type.ARRAY, items: { type: Type.STRING } },
                  niche: { type: Type.ARRAY, items: { type: Type.STRING } },
                  specific: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              }
            }
          },
          virality: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              gapAnalysis: { type: Type.STRING },
              trendDetected: { type: Type.STRING },
              vibe: { type: Type.STRING },
            },
            required: ['score', 'gapAnalysis']
          },
          competitorInsights: { 
            type: Type.OBJECT,
            properties: {
              visualTheme: { type: Type.STRING },
              ctaStrategy: { type: Type.STRING },
              formula: { type: Type.STRING },
            }
          }
        },
        required: ['visualAudit', 'strategy', 'seo', 'virality']
      };
    }

    // 5. Call API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts },
        config: generateConfig
      });

      clearTimeout(timeoutId);

      const resultText = response.text;
      if (!resultText) throw new Error("No response from AI");

      const cleanText = cleanJson(resultText);
      const parsed = JSON.parse(cleanText);

      // 6. Return based on Mode
      if (mode === AppMode.TREND_HUNTER) {
        if (parsed.trends && Array.isArray(parsed.trends) && parsed.trends.length > 0) {
          return parsed.trends as TrendItem[];
        }
        // Fallback: create synthetic trends from response if parsing fails
        if (parsed.trend || parsed.contentIdea || parsed.headline) {
          return [{
            headline: parsed.headline || "Trend Detected",
            whyItsHot: parsed.whyItsHot || "Currently trending in your niche",
            contentIdea: parsed.contentIdea || "Create content around this trend"
          }];
        }
        throw new Error("No valid trends found. Please try again with a different niche or check your internet connection.");
      } else {
        return parsed as AnalysisResult;
      }
    } catch (timeoutError: any) {
      if (timeoutError.name === 'AbortError') {
        throw new Error("Request timed out. The API took too long to respond. Please try again with a smaller file or simpler request.");
      }
      throw timeoutError;
    }

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.message?.includes('413') || error.message?.includes('too large')) {
      throw new Error("The file is too large for the current connection. Please try a smaller file.");
    }
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      throw new Error("Request timed out. Please check your internet connection and try again.");
    }
    throw new Error("Connection Failed. Please check your API Key or Internet connection.");
  }
};