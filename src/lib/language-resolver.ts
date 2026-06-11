import { db } from '@/lib/db';

export interface LanguageContext {
  appLanguage: string;
  sourceLanguage: string;
  targetLanguage: string;
  aiOutputLanguage: string;
  translationStyle: string;
  preserveCharacterNames: boolean;
  preservePlaceNames: boolean;
}

export async function resolveLanguageContext(
  userId: string,
  projectId?: string | null,
): Promise<LanguageContext> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      settings: {
        select: {
          defaultSourceLanguage: true,
          defaultTargetLanguage: true,
          defaultAiOutputLanguage: true,
          translationStyle: true,
          preserveCharacterNames: true,
          preservePlaceNames: true,
          alwaysUseProjectTargetLanguage: true,
        },
      },
    },
  });

  const settings = user?.settings;
  const plan = user?.plan || 'free';

  // Defaults
  let appLanguage = 'en';
  let sourceLanguage = 'id';
  let targetLanguage = 'en';
  let aiOutputLanguage = 'en';
  let translationStyle = 'literary';
  let preserveCharacterNames = true;
  let preservePlaceNames = true;

  if (settings) {
    appLanguage = settings.defaultSourceLanguage || 'en';
    sourceLanguage = settings.defaultSourceLanguage || 'id';
    targetLanguage = settings.defaultTargetLanguage || 'en';
    aiOutputLanguage = settings.defaultAiOutputLanguage || 'en';
    translationStyle = settings.translationStyle || 'literary';
    preserveCharacterNames = settings.preserveCharacterNames;
    preservePlaceNames = settings.preservePlaceNames;

    // Project language override
    if (projectId && settings.alwaysUseProjectTargetLanguage) {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });
      if (project?.targetLanguage) {
        aiOutputLanguage = project.targetLanguage;
        sourceLanguage = project.sourceLanguage || sourceLanguage;
        targetLanguage = project.targetLanguage;
      }
    }
  }

  // Final fallback
  if (!aiOutputLanguage) aiOutputLanguage = 'en';

  return {
    appLanguage,
    sourceLanguage,
    targetLanguage,
    aiOutputLanguage,
    translationStyle,
    preserveCharacterNames,
    preservePlaceNames,
  };
}

export function buildLanguageInstruction(language: LanguageContext): string {
  const {
    aiOutputLanguage,
    sourceLanguage,
    targetLanguage,
    preserveCharacterNames,
    preservePlaceNames,
  } = language;

  const langName = languageName(aiOutputLanguage);
  const sourceName = languageName(sourceLanguage);
  const targetName = languageName(targetLanguage);

  let instruction = `You must write the final answer/output in ${langName} (${aiOutputLanguage}). This rule overrides the user's input language. If the user gives instructions in another language, understand the instruction but produce the requested creative writing output in ${langName}. Do not switch languages unless the user explicitly asks to translate into another language.`;

  if (preserveCharacterNames) {
    instruction += ` Preserve all character names in their original form.`;
  }
  if (preservePlaceNames) {
    instruction += ` Preserve all place names in their original form.`;
  }

  if (sourceLanguage !== targetLanguage) {
    instruction += ` The source text is in ${sourceName} (${sourceLanguage}). Understand the source but always write the output in ${langName} (${aiOutputLanguage}).`;
  }

  return instruction;
}

export function buildNovelSystemPrompt(
  role: 'writer' | 'translator' | 'marketer' | 'critic' | 'synopsis',
  language: LanguageContext,
  genre?: string | null,
): string {
  const langInstruction = buildLanguageInstruction(language);
  const genreNote = genre ? ` The genre is ${genre}.` : '';

  let roleDesc = '';
  switch (role) {
    case 'writer':
      roleDesc = 'You are a professional novel-writing assistant.';
      break;
    case 'translator':
      roleDesc = `You are a professional literary translator specializing in novels.`;
      break;
    case 'marketer':
      roleDesc = 'You are a professional book marketing copywriter.';
      break;
    case 'critic':
      roleDesc = 'You are a professional literary editor and critic.';
      break;
    case 'synopsis':
      roleDesc = 'You are a professional book marketing copywriter specializing in Amazon KDP listings.';
      break;
  }

  return `${roleDesc}${genreNote}

${langInstruction}

RULES:
- Write natural, publishable prose
- Preserve the author's voice, tone, and emotional impact
- Dialogue must sound natural
- Never add or remove story content unless requested
- Maintain narrative flow and literary style
- If the user submits existing text for polishing, improve the language without changing the story content.`;
}

function languageName(code: string): string {
  const names: Record<string, string> = {
    id: 'Indonesian', en: 'English', es: 'Spanish', fr: 'French',
    de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
    ar: 'Arabic', pt: 'Portuguese', hi: 'Hindi', nl: 'Dutch',
    it: 'Italian', ru: 'Russian', sv: 'Swedish', da: 'Danish',
    pl: 'Polish', tr: 'Turkish', vi: 'Vietnamese', th: 'Thai',
  };
  return names[code] || code;
}

export { languageName };
