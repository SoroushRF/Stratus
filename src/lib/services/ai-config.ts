import { supabaseAdmin } from '@/lib/supabase';

interface AIPrompt {
  slug: string;
  prompt_text: string;
  model_override?: string;
}

interface AIConfig {
  key: string;
  value: any;
}

// Simple in-memory cache to prevent excessive DB calls
// 5 minute TTL
let cache: {
  prompts: Record<string, AIPrompt>;
  configs: Record<string, any>;
  lastFetched: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000;

class AIConfigService {
  private static async refreshCache() {
    try {
      const [promptsRes, configsRes] = await Promise.all([
        supabaseAdmin.from('ai_prompts').select('*').eq('is_active', true),
        supabaseAdmin.from('ai_configs').select('*')
      ]);

      if (promptsRes.error) throw promptsRes.error;
      if (configsRes.error) throw configsRes.error;

      const promptsMap: Record<string, AIPrompt> = {};
      promptsRes.data.forEach((p: any) => {
        promptsMap[p.slug] = p;
      });

      const configsMap: Record<string, any> = {};
      configsRes.data.forEach((c: any) => {
        configsMap[c.key] = c.value;
      });

      cache = {
        prompts: promptsMap,
        configs: configsMap,
        lastFetched: Date.now()
      };
    } catch (error) {
      console.error('Failed to refresh AI Config Cache:', error);
      // If we have old cache, keep it. If not, we'll hit errors.
    }
  }

  static async getPrompt(slug: string, variables?: Record<string, any>): Promise<string> {
    if (!cache || (Date.now() - cache.lastFetched > CACHE_TTL)) {
      await this.refreshCache();
    }
    let prompt = cache?.prompts[slug]?.prompt_text || '';
    
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        prompt = prompt.replace(regex, String(value));
      });
    }
    
    return prompt;
  }

  static async getModel(slug: string): Promise<string> {
    if (!cache || (Date.now() - cache.lastFetched > CACHE_TTL)) {
      await this.refreshCache();
    }
    return cache?.prompts[slug]?.model_override || cache?.configs['default_model'] || 'gemini-1.5-flash';
  }

  static async getConfig(key: string): Promise<any> {
    if (!cache || (Date.now() - cache.lastFetched > CACHE_TTL)) {
      await this.refreshCache();
    }
    return cache?.configs[key];
  }

  static async logExecution(logData: {
    slug: string;
    inputType?: string;
    rawInput?: string;
    rawOutput?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
    latencyMs?: number;
    modelUsed?: string;
  }) {
    try {
      await supabaseAdmin.from('ai_logs').insert(logData);
    } catch (error) {
      console.error('Failed to log AI execution:', error);
    }
  }
}

export default AIConfigService;
