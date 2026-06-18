import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface WizardInput {
  storyType: string;
  genre: string;
  idea?: string;
  style: string;
  language: string;
}

const GENRE_TEMPLATES: Record<string, { protagonists: string[]; antagonists: string[]; conflicts: string[]; openings: string[]; themes: string[] }> = {
  Romance: {
    protagonists: ['a hopeless romantic baker', 'a cynical wedding planner', 'a small-town bookstore owner'],
    antagonists: ['a rival with a secret', 'a disapproving family member', 'circumstances that keep them apart'],
    conflicts: ['a secret that threatens their connection', 'a misunderstanding that drives them apart', 'opposing life goals'],
    openings: ['The first time they met was an accident', 'She never believed in love at first sight', 'The wedding was perfect, except for the best man'],
    themes: ['Love requires vulnerability', 'Second chances', 'Finding home in another person'],
  },
  Fantasy: {
    protagonists: ['a young apprentice with a hidden power', 'a reluctant heir to a forgotten throne', 'a wandering mage seeking the truth'],
    antagonists: ['a corrupted king', 'an ancient evil awakening', 'a rival sorcerer'],
    conflicts: ['a prophecy that cannot be avoided', 'a war between realms', 'a dark power growing within'],
    openings: ['The sky turned violet the night everything changed', 'Legends spoke of the one who would return', 'The old magic had been sleeping for centuries'],
    themes: ['Power comes with responsibility', 'Finding strength in unity', 'The battle between light and dark'],
  },
  'Mystery / Thriller': {
    protagonists: ['a retired detective pulled back', 'a journalist chasing a lead', 'an ordinary witness to a crime'],
    antagonists: ['a killer hiding in plain sight', 'a corrupt official', 'a shadow organization'],
    conflicts: ['the truth is buried deep', 'no one can be trusted', 'time is running out'],
    openings: ['The body was found at dawn', 'She knew too much to stay silent', 'The case was closed. Until now.'],
    themes: ['Justice must prevail', 'The truth will set you free', 'Trust nothing'],
  },
  'Literary Fiction': {
    protagonists: ['an artist confronting their past', 'a teacher in a small town', 'a writer seeking inspiration'],
    antagonists: ['their own doubt', 'societal expectations', 'a painful memory'],
    conflicts: ['reconciling with the past', 'finding meaning in ordinary life', 'a relationship on the edge'],
    openings: ['The letter arrived on a rainy Tuesday', 'Years later, she still remembered the garden', 'Some stories begin with an ending'],
    themes: ['The beauty of imperfection', 'Memory and identity', 'Human connection'],
  },
  'Sci-Fi': {
    protagonists: ['a colony ship captain', 'an AI researcher', 'a spacer discovering a signal'],
    antagonists: ['a hostile alien race', 'a rogue AI', 'a corrupt corporation'],
    conflicts: ['survival against impossible odds', 'first contact gone wrong', 'technology controlling humanity'],
    openings: ['The signal came from beyond the mapped galaxy', 'The colony ship had been drifting for decades', 'They thought they were alone'],
    themes: ['What makes us human', 'Progress has a cost', 'Exploration and discovery'],
  },
  'Young Adult': {
    protagonists: ['a high school outsider', 'a teen discovering their power', 'a young dreamer'],
    antagonists: ['a popular clique', 'an oppressive system', 'their own insecurity'],
    conflicts: ['fitting in vs standing out', 'first love and heartbreak', 'standing up for what is right'],
    openings: ['High school was hard enough without the secret', 'Nobody noticed her until the day she spoke', 'The summer everything changed'],
    themes: ['Being yourself is enough', 'Friendship conquers all', 'Growing up is hard'],
  },
  Horror: {
    protagonists: ['a skeptical investigator', 'a family in a new home', 'a lone survivor'],
    antagonists: ['an ancient entity', 'a cursed object', 'the darkness itself'],
    conflicts: ['reality bending', 'trusting your own mind', 'the evil that lurks beneath'],
    openings: ['The house had been empty for years', 'It started with small things', 'The nightmares began the same night'],
    themes: ['Fear of the unknown', 'Evil wears many faces', 'The darkness within'],
  },
  Historical: {
    protagonists: ['a scholar uncovering a conspiracy', 'a resistance fighter', 'a merchant traveling ancient routes'],
    antagonists: ['a powerful dynasty', 'a secret society', 'an invading force'],
    conflicts: ['honor vs survival', 'love in a time of war', 'preserving the truth'],
    openings: ['The year was 1842 when the stranger arrived', 'War had changed everything', 'The manuscript was hidden for good reason'],
    themes: ['History repeats itself', 'Courage in dark times', 'The cost of freedom'],
  },
  Other: {
    protagonists: ['a curious explorer', 'a person seeking a fresh start', 'an unlikely hero'],
    antagonists: ['a powerful adversary', 'a difficult circumstance', 'their own fear'],
    conflicts: ['a journey of self-discovery', 'overcoming the odds', 'a race against time'],
    openings: ['It began like any other day', 'The invitation changed everything', 'Nobody expected what happened next'],
    themes: ['The journey is the destination', 'Courage comes in many forms', 'Change begins with a single step'],
  },
};

const STORY_TYPE_DEFAULTS: Record<string, { chapters: number; wordTarget: number }> = {
  novel: { chapters: 20, wordTarget: 50000 },
  novella: { chapters: 10, wordTarget: 25000 },
  'short story': { chapters: 5, wordTarget: 7500 },
  series: { chapters: 20, wordTarget: 50000 },
  'not sure': { chapters: 15, wordTarget: 40000 },
};

function generateStarterData(input: WizardInput) {
  const template = GENRE_TEMPLATES[input.genre] || GENRE_TEMPLATES.Other;
  const typeDefaults = STORY_TYPE_DEFAULTS[input.storyType] || STORY_TYPE_DEFAULTS.novel;

  const protagonistName = generateName(input.language);
  const antagonistName = generateName(input.language);
  const supportingName = generateName(input.language);

  const idea = input.idea || `${template.protagonists[0]} discovers ${template.conflicts[0]}.`;
  const premise = `${idea} In a world where ${template.themes[0].toLowerCase()}, our protagonist must face ${template.antagonists[0].toLowerCase()} while navigating ${template.conflicts[1].toLowerCase()}.`;

  const chapterCount = typeDefaults.chapters;
  const chapterOutline = Array.from({ length: chapterCount }, (_, i) => {
    const chNum = i + 1;
    const isFirst = i === 0;

    return {
      chapter: chNum,
      title: isFirst ? 'The Beginning' : generateChapterTitle(chNum, input.genre),
      purpose: isFirst ? 'Introduce the protagonist and establish the world' : `Advance the story through new developments and rising stakes`,
      openingImage: isFirst ? template.openings[0] : `Chapter ${chNum} opens with new challenges`,
      conflict: isFirst ? template.conflicts[0] : 'The stakes continue to rise',
      firstParagraphSuggestion: isFirst
        ? `${template.openings[0]}. ${premise.slice(0, 100)}... The air was thick with anticipation as ${protagonistName} took the first step into the unknown.`
        : '',
    };
  });

  return {
    title: input.idea ? input.idea.slice(0, 40) + (input.idea.length > 40 ? '...' : '') : `Untitled ${input.genre} ${input.storyType}`,
    logline: premise.slice(0, 120),
    premise,
    theme: template.themes[0],
    targetReader: input.genre === 'Young Adult' ? 'Young adult readers' : `Readers of ${input.genre}`,
    tone: getToneDescription(input.style),
    protagonist: {
      name: protagonistName,
      role: 'protagonist',
      description: template.protagonists[Math.floor(Math.random() * template.protagonists.length)],
      desire: 'To find the truth and overcome the odds',
      conflict: template.conflicts[0],
      emotionalWound: 'A past loss that drives their actions',
    },
    antagonist: {
      name: antagonistName,
      role: 'antagonist',
      description: template.antagonists[Math.floor(Math.random() * template.antagonists.length)],
      motivation: 'To protect their own interests at any cost',
    },
    supportingCharacter: {
      name: supportingName,
      role: 'supporting',
      description: 'A loyal friend who provides guidance and support',
    },
    beginning: template.openings[0],
    middle: 'The conflict deepens as the protagonist uncovers hidden truths and faces greater challenges.',
    ending: 'A climactic confrontation leads to resolution and growth for the protagonist.',
    majorTurningPoints: [
      'The inciting incident that changes everything',
      'A betrayal that shifts alliances',
      'The dark moment before the final stand',
    ],
    stakes: 'If the protagonist fails, everything they care about will be lost.',
    climaxIdea: 'A final confrontation that tests everything the protagonist has learned.',
    chapterOutline,
    firstScene: {
      goal: 'Introduce the protagonist in their ordinary world and hint at the change to come',
      openingImage: template.openings[0],
      conflict: template.conflicts[0],
      firstParagraph: `${template.openings[0]}. ${protagonistName} could feel it in their bones — something was about to change. The world around them seemed ordinary, but deep down, they knew nothing would ever be the same.`,
    },
    storyBibleNotes: [
      { title: 'World Overview', content: `A world shaped by ${template.themes[0].toLowerCase()} where our story unfolds.`, category: 'worldbuilding' },
      { title: 'Main Character Arc', content: `${protagonistName} must grow from uncertainty to strength, learning that ${template.themes[0].toLowerCase()} is key.`, category: 'character' },
      { title: 'Central Question', content: 'What does it truly mean to overcome your fears?', category: 'general' },
    ],
    plotBeats: [
      { act: 'act1', order: 1, title: 'Ordinary World', description: 'The protagonist\'s life before the adventure begins' },
      { act: 'act1', order: 2, title: 'Call to Adventure', description: 'Something disrupts the status quo' },
      { act: 'act1', order: 3, title: 'Refusal of the Call', description: 'The protagonist hesitates to embrace change' },
      { act: 'act1', order: 4, title: 'Meeting the Mentor', description: 'Guidance appears from an unexpected source' },
      { act: 'act2', order: 5, title: 'Crossing the Threshold', description: 'No turning back now' },
      { act: 'act2', order: 6, title: 'Tests and Trials', description: 'The protagonist faces challenges' },
      { act: 'act2', order: 7, title: 'Approach to the Cave', description: 'Preparing for the biggest challenge yet' },
      { act: 'act2', order: 8, title: 'The Ordeal', description: 'A major crisis tests the protagonist' },
      { act: 'act2', order: 9, title: 'Reward', description: 'A hard-won victory brings new insight' },
      { act: 'act3', order: 10, title: 'The Road Back', description: 'The journey toward resolution begins' },
      { act: 'act3', order: 11, title: 'The Climax', description: 'The final confrontation' },
      { act: 'act3', order: 12, title: 'Return with Elixir', description: 'The protagonist returns transformed' },
    ],
  };
}

function generateName(language: string): string {
  const names = language === 'id'
    ? ['Ayu', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hana', 'Indra', 'Joko', 'Kartika', 'Lestari']
    : ['Alex', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Sage', 'Rowan', 'Ellis', 'Parker', 'Blake'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateChapterTitle(num: number, genre: string): string {
  const titles: Record<string, string[]> = {
    Romance: ['A Chance Meeting', 'Unexpected Feelings', 'Doubt and Desire', 'The Confession', 'A New Beginning'],
    Fantasy: ['The Awakening', 'Secrets Revealed', 'The Journey Begins', 'Allies and Enemies', 'The Battle'],
    'Mystery / Thriller': ['The First Clue', 'Deeper Waters', 'The Suspect', 'Hidden Truths', 'The Chase'],
    'Literary Fiction': ['The Ordinary World', 'A Shift', 'Reflections', 'The Conversation', 'Change'],
    'Sci-Fi': ['The Discovery', 'Departure', 'Unknown Territory', 'The Signal', 'Encounter'],
    'Young Adult': ['First Day', 'Something New', 'The Secret', 'Friends and Foes', 'The Truth'],
    Horror: ['The Whisper', 'Footsteps', 'The Basement', 'What Lurks Below', 'No Escape'],
    Historical: ['The Proclamation', 'A Visitor', 'Conspiracy', 'The Resistance', 'Freedom'],
    Other: ['The Beginning', 'Discovery', 'The Challenge', 'Turning Point', 'Resolution'],
  };
  const genreTitles = titles[genre] || titles.Other;
  return genreTitles[num % genreTitles.length] || `Chapter ${num}`;
}

function getToneDescription(style: string): string {
  const tones: Record<string, string> = {
    emotional: 'Rich description, deep feelings, cinematic and evocative',
    fast: 'Quick pacing, commercial, page-turner with short chapters',
    literary: 'Beautiful prose, layered meaning, reflective and thoughtful',
    dark: 'Tension, mystery, edge-of-seat suspense',
    light: 'Comfort, charm, feel-good and heartwarming',
    epic: 'Large scope, detailed world-building, immersive',
  };
  return tones[style] || 'Engaging and immersive';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: WizardInput = await request.json();
    const { storyType, genre, idea, style, language } = body;

    if (!storyType || !genre || !style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = generateStarterData({ storyType, genre, idea, style, language });

    return NextResponse.json({ success: true, data, language });
  } catch (error) {
    console.error('Onboarding generate error:', error);
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
  }
}
