export interface ChapterTemplate {
  chapterNumber: number;
  title: string;
  summary: string;
  purpose: string;
  targetWordCount: number;
}

export interface BeatTemplate {
  act: string;
  order: number;
  title: string;
  description: string;
}

export interface SceneCardTemplate {
  chapterNumber: number;
  title: string;
  summary: string;
  sceneGoal: string;
  conflict: string;
  outcome: string;
}

export interface BibleNoteTemplate {
  category: string;
  title: string;
  content: string;
}

export interface CharacterTemplate {
  name: string;
  role: string;
  description: string;
  motivation: string;
  flaw: string;
  arc: string;
}

export interface LocationTemplate {
  name: string;
  type: string;
  description: string;
}

export interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  genre: string;
  description: string;
  recommendedFor: string;
  recommendedWordCount: number;
  recommendedChapterCount: number;
  structureType: string;
  beatsJson: BeatTemplate[];
  starterChapterTitlesJson: ChapterTemplate[];
  starterSceneCardsJson: SceneCardTemplate[];
  storyBibleStarterJson: { characters: CharacterTemplate[]; locations: LocationTemplate[]; notes: BibleNoteTemplate[] };
}

export const STORY_TYPES = [
  { id: 'novel', title: 'Novel', desc: 'A complete, full-length work of fiction', recommendedWords: '50,000–100,000', useCase: 'Traditional publishing, standalone stories' },
  { id: 'webnovel', title: 'Webnovel', desc: 'Serialized story published chapter by chapter', recommendedWords: '100,000+ ongoing', useCase: 'Platforms like Wattpad, Webnovel, Royal Road' },
  { id: 'novella', title: 'Novella', desc: 'A shorter novel, focused and tight', recommendedWords: '17,500–40,000', useCase: 'Quick reads, self-contained stories' },
  { id: 'short-story', title: 'Short Story', desc: 'A single narrative arc in compact form', recommendedWords: '1,000–7,500', useCase: 'Anthologies, magazines, writing practice' },
  { id: 'series-starter', title: 'Series Starter', desc: 'First book of a planned series', recommendedWords: '60,000–90,000', useCase: 'Trilogies, sagas, multi-book arcs' },
];

export const GENRES = [
  { id: 'romance', name: 'Romance', desc: 'Love stories with emotional arcs and happy endings' },
  { id: 'fantasy', name: 'Fantasy', desc: 'Magic, worldbuilding, and epic quests' },
  { id: 'mystery', name: 'Mystery', desc: 'Crime, clues, investigation, and resolution' },
  { id: 'thriller', name: 'Thriller', desc: 'High stakes, tension, and fast-paced action' },
  { id: 'young-adult', name: 'Young Adult', desc: 'Coming-of-age stories for teen readers' },
  { id: 'historical-fiction', name: 'Historical Fiction', desc: 'Stories set in a specific historical period' },
  { id: 'science-fiction', name: 'Science Fiction', desc: 'Future tech, space, and speculative concepts' },
  { id: 'horror', name: 'Horror', desc: 'Fear, dread, and supernatural suspense' },
  { id: 'literary-fiction', name: 'Literary Fiction', desc: 'Character-driven stories with thematic depth' },
  { id: 'light-novel', name: 'Light Novel', desc: 'Japanese-style illustrated novels with shorter prose' },
  { id: 'custom', name: 'Custom', desc: 'Define your own genre' },
];

export const STRUCTURE_TEMPLATES = [
  { id: 'three-act', name: 'Three-Act Structure', desc: 'Setup, confrontation, resolution — the classic narrative arc', acts: ['Act I: Setup', 'Act II: Confrontation', 'Act III: Resolution'], estChapters: 24, estScenes: 72 },
  { id: 'heros-journey', name: "Hero's Journey", desc: 'A hero ventures into the unknown, faces trials, and returns transformed', acts: ['Departure', 'Initiation', 'Return'], estChapters: 30, estScenes: 90 },
  { id: 'save-the-cat', name: 'Save the Cat', desc: 'Blake Snyder\'s 15-beat method for structured storytelling', acts: ['Act I: The Setup', 'Act II: The Middle', 'Act III: The Climax'], estChapters: 15, estScenes: 45 },
  { id: 'romance-beats', name: 'Romance Beats', desc: 'Meet-cute, conflict, dark moment, grand gesture, happy ending', acts: ['Setup', 'Rising Action', 'Climax'], estChapters: 20, estScenes: 60 },
  { id: 'mystery-clue-map', name: 'Mystery Clue Map', desc: 'Crime, investigation, red herrings, reveal', acts: ['The Crime', 'The Investigation', 'The Resolution'], estChapters: 18, estScenes: 54 },
  { id: 'snowflake', name: 'Snowflake Method', desc: 'Start small, expand layer by layer into a full novel', acts: ['Foundation', 'Expansion', 'Refinement'], estChapters: 24, estScenes: 72 },
  { id: 'webnovel', name: 'Webnovel Arc', desc: 'Short chapters, frequent hooks, ongoing serial structure', acts: ['Arc I', 'Arc II', 'Arc III'], estChapters: 50, estScenes: 150 },
  { id: 'light-novel-structure', name: 'Light Novel Volume', desc: 'Illustration-friendly structure with shorter chapters', acts: ['Volume 1', 'Volume 2', 'Volume 3'], estChapters: 15, estScenes: 45 },
  { id: 'blank', name: 'Blank Novel', desc: 'Start with empty chapters — full freedom', acts: ['Beginning', 'Middle', 'End'], estChapters: 0, estScenes: 0 },
];

export const WRITING_STYLES = {
  pov: [
    { id: 'first-person', name: 'First Person', desc: 'Narrated by the protagonist using "I"' },
    { id: 'third-limited', name: 'Third Person Limited', desc: 'Follows one character\'s perspective using "he/she"' },
    { id: 'third-omniscient', name: 'Third Person Omniscient', desc: 'All-knowing narrator who sees all characters\' thoughts' },
  ],
  tense: [
    { id: 'past', name: 'Past Tense', desc: 'Events described as already happened (most common)' },
    { id: 'present', name: 'Present Tense', desc: 'Events described as happening now (immediate feel)' },
  ],
  tone: [
    { id: 'cinematic', name: 'Cinematic', desc: 'Visual, scene-driven, like a film' },
    { id: 'literary', name: 'Literary', desc: 'Rich prose, thematic depth, layered meaning' },
    { id: 'emotional', name: 'Emotional', desc: 'Focus on feelings, interiority, and relationships' },
    { id: 'fast-paced', name: 'Fast-Paced', desc: 'Quick scenes, short chapters, high momentum' },
    { id: 'commercial', name: 'Commercial', desc: 'Accessible, page-turning, market-oriented' },
    { id: 'dark', name: 'Dark', desc: 'Gritty, intense, exploring difficult themes' },
    { id: 'humorous', name: 'Humorous', desc: 'Light, witty, comedic voice' },
  ],
  proseStyle: [
    { id: 'clean', name: 'Clean', desc: 'Minimal, precise, every word counts' },
    { id: 'poetic', name: 'Poetic', desc: 'Lyrical, figurative, rhythmically rich' },
    { id: 'descriptive', name: 'Descriptive', desc: 'Vivid sensory detail, immersive settings' },
    { id: 'simple', name: 'Simple', desc: 'Direct and accessible, easy to read' },
    { id: 'immersive', name: 'Immersive', desc: 'Deep point of view, close narration' },
  ],
  targetAudience: [
    { id: 'adult', name: 'Adult', desc: 'Mature themes, complex narratives' },
    { id: 'young-adult', name: 'Young Adult', desc: 'Teen protagonists, coming-of-age themes' },
    { id: 'middle-grade', name: 'Middle Grade', desc: 'Ages 8–12, simpler themes, clear morality' },
    { id: 'general', name: 'General', desc: 'Appeals to all ages and backgrounds' },
  ],
};

export const WORD_COUNT_PRESETS = [
  { id: 'short', label: 'Short Story', words: 5000, chapters: 5 },
  { id: 'novella', label: 'Novella', words: 25000, chapters: 10 },
  { id: 'standard', label: 'Standard Novel', words: 70000, chapters: 20 },
  { id: 'epic', label: 'Epic', words: 120000, chapters: 30 },
  { id: 'webnovel', label: 'Webnovel', words: 0, chapters: 50 },
  { id: 'custom', label: 'Custom', words: 0, chapters: 0 },
];

export const TEMPLATES: StoryTemplate[] = [
  {
    id: 'romance-novel', name: 'Romance Novel', category: 'genre', genre: 'romance',
    description: 'A heartfelt love story with emotional arcs, meet-cute, and a satisfying happy ending.',
    recommendedFor: 'Writers who love emotional storytelling and character-driven plots',
    recommendedWordCount: 70000, recommendedChapterCount: 20, structureType: 'romance-beats',
    beatsJson: [
      { act: 'Setup', order: 1, title: 'Meet-Cute', description: 'The protagonists meet for the first time in an interesting or unexpected way.' },
      { act: 'Setup', order: 2, title: 'Initial Attraction', description: 'Sparks fly — but complications arise immediately.' },
      { act: 'Setup', order: 3, title: 'The Setup', description: 'Life circumstances that will force them together.' },
      { act: 'Rising Action', order: 4, title: 'First Date / Bonding', description: 'They spend time together and connection deepens.' },
      { act: 'Rising Action', order: 5, title: 'The Complication', description: 'An external force threatens the relationship.' },
      { act: 'Rising Action', order: 6, title: 'Growing Closer', description: 'Despite complications, they grow closer.' },
      { act: 'Rising Action', order: 7, title: 'The Conflict', description: 'Internal or external conflict tests them.' },
      { act: 'Rising Action', order: 8, title: 'The Lie', description: 'A misunderstanding or hidden truth emerges.' },
      { act: 'Climax', order: 9, title: 'Dark Moment', description: 'The relationship seems doomed. All hope is lost.' },
      { act: 'Climax', order: 10, title: 'The Gesture', description: 'A grand romantic gesture to win them back.' },
      { act: 'Climax', order: 11, title: 'The Confession', description: 'True feelings are finally expressed honestly.' },
      { act: 'Resolution', order: 12, title: 'Reunion', description: 'They come back together, stronger than before.' },
      { act: 'Resolution', order: 13, title: 'Happy Ever After', description: 'The future is bright. Love wins.' },
    ],
    starterChapterTitlesJson: [
      { chapterNumber: 1, title: 'The Unexpected Meeting', summary: 'Our protagonists cross paths.', purpose: 'Establish characters and meet-cute', targetWordCount: 3000 },
      { chapterNumber: 2, title: 'First Impressions', summary: 'Initial attraction and immediate complications.', purpose: 'Build tension and chemistry', targetWordCount: 3000 },
      { chapterNumber: 3, title: 'Forced Together', summary: 'Circumstances push them into proximity.', purpose: 'Create opportunities for bonding', targetWordCount: 3000 },
      { chapterNumber: 4, title: 'Cracks in the Surface', summary: 'Complications and conflicts arise.', purpose: 'Introduce obstacles', targetWordCount: 3000 },
      { chapterNumber: 5, title: 'The Turning Point', summary: 'The relationship deepens or fractures.', purpose: 'Midpoint twist', targetWordCount: 3500 },
      { chapterNumber: 6, title: 'Everything Falls Apart', summary: 'The dark moment before the resolution.', purpose: 'Emotional climax', targetWordCount: 3500 },
      { chapterNumber: 7, title: 'The Grand Gesture', summary: 'One last attempt to win love back.', purpose: 'Climax and resolution', targetWordCount: 3000 },
      { chapterNumber: 8, title: 'A New Beginning', summary: 'The happy ever after.', purpose: 'Satisfying conclusion', targetWordCount: 3000 },
    ],
    starterSceneCardsJson: [
      { chapterNumber: 1, title: 'The Meet-Cute', summary: 'Protagonists meet.', sceneGoal: 'Introduce both leads', conflict: 'Circumstances are awkward', outcome: 'They part with curiosity' },
      { chapterNumber: 1, title: 'First Impressions', summary: 'They each reflect.', sceneGoal: 'Show internal response', conflict: 'Mixed feelings', outcome: 'Drawn to each other despite doubts' },
      { chapterNumber: 5, title: 'The Confession', summary: 'Feelings are revealed.', sceneGoal: 'Emotional honesty', conflict: 'Fear of rejection', outcome: 'Vulnerability brings them closer' },
      { chapterNumber: 7, title: 'The Gesture', summary: 'A romantic declaration.', sceneGoal: 'Win them back', conflict: 'Pride and fear', outcome: 'Love prevails' },
    ],
    storyBibleStarterJson: {
      characters: [
        { name: 'Protagonist A', role: 'protagonist', description: 'One half of the central romance.', motivation: 'Looking for true love or healing from past hurt.', flaw: 'Afraid of vulnerability.', arc: 'Learns to open their heart.' },
        { name: 'Love Interest', role: 'supporting', description: 'The other half of the romance.', motivation: 'Also seeking connection.', flaw: 'Hides emotions behind humor or work.', arc: 'Discovers the courage to love.' },
      ],
      locations: [
        { name: 'The City', type: 'urban', description: 'Where the story unfolds — vibrant and full of possibility.' },
        { name: 'Their Favorite Spot', type: 'landmark', description: 'A meaningful location where key moments happen.' },
      ],
      notes: [
        { category: 'character', title: 'Love Language', content: 'Define how each protagonist expresses and receives love.' },
        { category: 'plot', title: 'Central Conflict', content: 'What keeps them apart? Internal and external obstacles.' },
        { category: 'worldbuilding', title: 'Setting Vibe', content: 'The mood and atmosphere of the romantic world.' },
      ],
    },
  },
  {
    id: 'fantasy-adventure', name: 'Fantasy Adventure', category: 'genre', genre: 'fantasy',
    description: 'An epic journey through a magical world with heroes, villains, and world-changing stakes.',
    recommendedFor: 'Worldbuilders and lovers of epic quests',
    recommendedWordCount: 90000, recommendedChapterCount: 30, structureType: 'heros-journey',
    beatsJson: [
      { act: 'Departure', order: 1, title: 'Ordinary World', description: 'The hero in their everyday life.' },
      { act: 'Departure', order: 2, title: 'Call to Adventure', description: 'Something disrupts the ordinary world.' },
      { act: 'Departure', order: 3, title: 'Refusal of the Call', description: 'The hero hesitates.' },
      { act: 'Departure', order: 4, title: 'Meeting the Mentor', description: 'A guide appears.' },
      { act: 'Departure', order: 5, title: 'Crossing the Threshold', description: 'The hero commits to the journey.' },
      { act: 'Initiation', order: 6, title: 'Tests, Allies, Enemies', description: 'New challenges and friends.' },
      { act: 'Initiation', order: 7, title: 'Approach to the Inmost Cave', description: 'Preparing for the biggest challenge.' },
      { act: 'Initiation', order: 8, title: 'The Ordeal', description: 'A near-fatal crisis.' },
      { act: 'Initiation', order: 9, title: 'The Reward', description: 'The hero gains what they sought.' },
      { act: 'Return', order: 10, title: 'The Road Back', description: 'The journey home.' },
      { act: 'Return', order: 11, title: 'The Resurrection', description: 'The final, greatest test.' },
      { act: 'Return', order: 12, title: 'Return with Elixir', description: 'The hero returns transformed.' },
    ],
    starterChapterTitlesJson: [
      { chapterNumber: 1, title: 'The Ordinary World', summary: 'Meet the hero in their everyday life.', purpose: 'Establish the protagonist and their world', targetWordCount: 3000 },
      { chapterNumber: 2, title: 'The Call to Adventure', summary: 'Something disrupts the ordinary.', purpose: 'Inciting incident', targetWordCount: 3000 },
      { chapterNumber: 3, title: 'The Mentor Appears', summary: 'A guide offers wisdom or a tool.', purpose: 'Introduce mentor figure', targetWordCount: 3000 },
      { chapterNumber: 4, title: 'Crossing the Threshold', summary: 'The hero leaves their familiar world.', purpose: 'Commitment to the journey', targetWordCount: 3000 },
      { chapterNumber: 5, title: 'The Road of Trials', summary: 'Challenges test the hero.', purpose: 'Build skills and alliances', targetWordCount: 3500 },
      { chapterNumber: 6, title: 'The Darkest Hour', summary: 'The hero faces their greatest fear.', purpose: 'Midpoint crisis', targetWordCount: 3500 },
      { chapterNumber: 7, title: 'The Ultimate Prize', summary: 'The hero achieves their goal.', purpose: 'Climax of the quest', targetWordCount: 3500 },
      { chapterNumber: 8, title: 'The Journey Home', summary: 'Returning to the ordinary world.', purpose: 'Falling action', targetWordCount: 3000 },
      { chapterNumber: 9, title: 'The Final Trial', summary: 'One last test awaits.', purpose: 'Final climax and transformation', targetWordCount: 3500 },
      { chapterNumber: 10, title: 'A New Beginning', summary: 'The hero, forever changed, embraces their new life.', purpose: 'Satisfying conclusion', targetWordCount: 3000 },
    ],
    starterSceneCardsJson: [
      { chapterNumber: 1, title: 'Daily Life', summary: 'The hero\'s routine.', sceneGoal: 'Show normal world', conflict: 'The hero feels something is missing', outcome: 'A hint of adventure to come' },
      { chapterNumber: 2, title: 'The Disruption', summary: 'Something strange happens.', sceneGoal: 'Inciting incident', conflict: 'The hero resists change', outcome: 'The call is clear' },
      { chapterNumber: 6, title: 'The Crisis', summary: 'Everything seems lost.', sceneGoal: 'Create emotional low point', conflict: 'The hero wants to give up', outcome: 'Finding inner strength' },
      { chapterNumber: 9, title: 'The Final Confrontation', summary: 'The ultimate battle.', sceneGoal: 'Climax', conflict: 'The hero faces their nemesis', outcome: 'Victory and transformation' },
    ],
    storyBibleStarterJson: {
      characters: [
        { name: 'The Hero', role: 'protagonist', description: 'The main character on a journey of transformation.', motivation: 'To find their purpose or save their world.', flaw: 'Self-doubt or arrogance.', arc: 'From uncertain to courageous.' },
        { name: 'The Mentor', role: 'supporting', description: 'A wise guide who aids the hero.', motivation: 'To pass on knowledge or atone for the past.', flaw: 'Carries their own regrets.', arc: 'Finds redemption through teaching.' },
        { name: 'The Antagonist', role: 'antagonist', description: 'The force that opposes the hero.', motivation: 'Power, revenge, or conviction in their own cause.', flaw: 'Hubris or blind obsession.', arc: 'Their downfall comes from their own flaw.' },
      ],
      locations: [
        { name: 'The Ordinary World', type: 'rural', description: 'The hero\'s home — safe, familiar, but limiting.' },
        { name: 'The Threshold', type: 'wilderness', description: 'The boundary between the known and unknown.' },
        { name: 'The Dark Tower', type: 'landmark', description: 'The antagonist\'s stronghold and final battleground.' },
      ],
      notes: [
        { category: 'worldbuilding', title: 'Magic System Rules', content: 'How does magic work in this world? What are its costs and limitations?' },
        { category: 'worldbuilding', title: 'World History', content: 'Key historical events that shaped the current conflict.' },
        { category: 'plot', title: 'Central Conflict', content: 'What is at stake if the hero fails?' },
        { category: 'character', title: 'Hero\'s Flaw', content: 'What must the hero overcome within themselves to succeed?' },
      ],
    },
  },
  {
    id: 'mystery-thriller', name: 'Mystery Thriller', category: 'genre', genre: 'mystery',
    description: 'A gripping puzzle with clues, suspects, and a shocking reveal.',
    recommendedFor: 'Writers who love plot twists and suspense',
    recommendedWordCount: 75000, recommendedChapterCount: 24, structureType: 'mystery-clue-map',
    beatsJson: [
      { act: 'The Crime', order: 1, title: 'The Discovery', description: 'A crime is discovered.' },
      { act: 'The Crime', order: 2, title: 'The Investigation Begins', description: 'The detective takes the case.' },
      { act: 'The Crime', order: 3, title: 'Initial Suspects', description: 'The first round of suspects emerge.' },
      { act: 'The Investigation', order: 4, title: 'Following Leads', description: 'Clues are pursued.' },
      { act: 'The Investigation', order: 5, title: 'The Red Herring', description: 'A false lead sends the investigation astray.' },
      { act: 'The Investigation', order: 6, title: 'Narrowing Down', description: 'The list of suspects shrinks.' },
      { act: 'The Investigation', order: 7, title: 'The Breakthrough', description: 'A key clue changes everything.' },
      { act: 'The Resolution', order: 8, title: 'The Reveal', description: 'The truth comes to light.' },
      { act: 'The Resolution', order: 9, title: 'The Confrontation', description: 'The detective confronts the culprit.' },
      { act: 'The Resolution', order: 10, title: 'The Aftermath', description: 'Justice is served — or not.' },
    ],
    starterChapterTitlesJson: [
      { chapterNumber: 1, title: 'The Discovery', summary: 'A crime is uncovered.', purpose: 'Hook the reader with the central mystery', targetWordCount: 2500 },
      { chapterNumber: 2, title: 'First Clues', summary: 'The investigation begins.', purpose: 'Introduce detective and initial leads', targetWordCount: 3000 },
      { chapterNumber: 3, title: 'The Suspects', summary: 'The first round of questioning.', purpose: 'Establish the suspect pool', targetWordCount: 3000 },
      { chapterNumber: 4, title: 'Dead Ends', summary: 'A lead goes nowhere.', purpose: 'Raise stakes through frustration', targetWordCount: 3000 },
      { chapterNumber: 5, title: 'The Red Herring', summary: 'A false clue misdirects the investigation.', purpose: 'Twist expectations', targetWordCount: 3000 },
      { chapterNumber: 6, title: 'The Breakthrough', summary: 'A discovery changes everything.', purpose: 'Midpoint twist', targetWordCount: 3500 },
      { chapterNumber: 7, title: 'Closing In', summary: 'The detective narrows in on the truth.', purpose: 'Build toward climax', targetWordCount: 3000 },
      { chapterNumber: 8, title: 'The Reveal', summary: 'The culprit is identified.', purpose: 'Climax and resolution', targetWordCount: 3500 },
    ],
    starterSceneCardsJson: [
      { chapterNumber: 1, title: 'The Discovery Scene', summary: 'The crime scene is found.', sceneGoal: 'Create intrigue', conflict: 'Key evidence is missing', outcome: 'The detective is called in' },
      { chapterNumber: 5, title: 'The False Lead', summary: 'A suspect seems guilty.', sceneGoal: 'Misdirect the reader', conflict: 'Evidence points one way, instinct another', outcome: 'The real killer remains hidden' },
      { chapterNumber: 6, title: 'The Puzzle Piece', summary: 'A clue connects everything.', sceneGoal: 'Shift the investigation', conflict: 'The clue contradicts earlier theories', outcome: 'A new direction emerges' },
      { chapterNumber: 8, title: 'The Final Showdown', summary: 'The detective confronts the killer.', sceneGoal: 'Climactic revelation', conflict: 'The killer has one last card to play', outcome: 'Justice prevails' },
    ],
    storyBibleStarterJson: {
      characters: [
        { name: 'The Detective', role: 'protagonist', description: 'The investigator at the heart of the mystery.', motivation: 'Justice, obsession, or personal connection.', flaw: 'Trusts their instincts too much or too little.', arc: 'Learns the cost of truth.' },
        { name: 'The Victim', role: 'supporting', description: 'The person at the center of the crime.', motivation: 'Their secrets drive the plot.', flaw: 'Had something to hide.', arc: 'Posthumous revelation of their true story.' },
        { name: 'The Culprit', role: 'antagonist', description: 'The person responsible for the crime.', motivation: 'Greed, revenge, or self-preservation.', flaw: 'Underestimates the detective.', arc: 'Exposed and brought to justice.' },
      ],
      locations: [
        { name: 'The Crime Scene', type: 'urban', description: 'Where it all began.' },
        { name: 'The Police Station', type: 'building', description: 'Base of operations for the investigation.' },
        { name: 'The Final Location', type: 'landmark', description: 'Where the climactic confrontation happens.' },
      ],
      notes: [
        { category: 'plot', title: 'The Timeline', content: 'Establish a precise timeline of events before and after the crime.' },
        { category: 'research', title: 'Forensic Details', content: 'Research key forensic or procedural elements for authenticity.' },
        { category: 'plot', title: 'Clue Map', content: 'Track every clue, who knows it, and when it\'s revealed.' },
      ],
    },
  },
];

export const BLANK_TEMPLATE: StoryTemplate = {
  id: 'blank', name: 'Blank Novel', category: 'general', genre: 'general',
  description: 'Start with empty chapters and full creative freedom.',
  recommendedFor: 'Experienced writers who already have a plan',
  recommendedWordCount: 50000, recommendedChapterCount: 1, structureType: 'blank',
  beatsJson: [],
  starterChapterTitlesJson: [
    { chapterNumber: 1, title: 'Chapter One', summary: 'Begin your story.', purpose: 'First chapter', targetWordCount: 2500 },
  ],
  starterSceneCardsJson: [],
  storyBibleStarterJson: { characters: [], locations: [], notes: [] },
};

export const STRUCTURE_BEATS: Record<string, BeatTemplate[]> = {
  'three-act': [
    { act: 'Act I: Setup', order: 1, title: 'The Ordinary World', description: 'Establish the protagonist\'s normal life.' },
    { act: 'Act I: Setup', order: 2, title: 'The Inciting Incident', description: 'An event disrupts the status quo.' },
    { act: 'Act I: Setup', order: 3, title: 'The Decision', description: 'The protagonist commits to a new path.' },
    { act: 'Act II: Confrontation', order: 4, title: 'Rising Action', description: 'Obstacles escalate and stakes rise.' },
    { act: 'Act II: Confrontation', order: 5, title: 'The Midpoint', description: 'A major twist changes everything.' },
    { act: 'Act II: Confrontation', order: 6, title: 'Things Get Worse', description: 'The protagonist faces their greatest challenge.' },
    { act: 'Act III: Resolution', order: 7, title: 'The Darkest Hour', description: 'All seems lost.' },
    { act: 'Act III: Resolution', order: 8, title: 'The Climax', description: 'The final confrontation.' },
    { act: 'Act III: Resolution', order: 9, title: 'The Resolution', description: 'A new normal is established.' },
  ],
  'heros-journey': [
    { act: 'Departure', order: 1, title: 'Ordinary World', description: 'The hero in their everyday life.' },
    { act: 'Departure', order: 2, title: 'Call to Adventure', description: 'Something disrupts the ordinary.' },
    { act: 'Departure', order: 3, title: 'Refusal of the Call', description: 'The hero hesitates.' },
    { act: 'Departure', order: 4, title: 'Meeting the Mentor', description: 'A guide appears.' },
    { act: 'Departure', order: 5, title: 'Crossing the Threshold', description: 'Commitment to the journey.' },
    { act: 'Initiation', order: 6, title: 'Tests, Allies, Enemies', description: 'New challenges and relationships.' },
    { act: 'Initiation', order: 7, title: 'Approach to the Inmost Cave', description: 'Preparing for the ordeal.' },
    { act: 'Initiation', order: 8, title: 'The Ordeal', description: 'A near-fatal crisis.' },
    { act: 'Initiation', order: 9, title: 'Reward', description: 'The hero gains what they sought.' },
    { act: 'Return', order: 10, title: 'The Road Back', description: 'The journey home begins.' },
    { act: 'Return', order: 11, title: 'The Resurrection', description: 'The final, greatest test.' },
    { act: 'Return', order: 12, title: 'Return with Elixir', description: 'Transformed, the hero returns.' },
  ],
  'save-the-cat': [
    { act: 'Act I', order: 1, title: 'Opening Image', description: 'A snapshot of the hero\'s world.' },
    { act: 'Act I', order: 2, title: 'Theme Stated', description: 'A hint of what the story is about.' },
    { act: 'Act I', order: 3, title: 'Set-Up', description: 'Introduce characters and world.' },
    { act: 'Act I', order: 4, title: 'Catalyst', description: 'The inciting incident.' },
    { act: 'Act I', order: 5, title: 'Debate', description: 'The hero questions the journey.' },
    { act: 'Act II', order: 6, title: 'Break into Two', description: 'The hero leaves the old world.' },
    { act: 'Act II', order: 7, title: 'B Story', description: 'A subplot (often a love story) begins.' },
    { act: 'Act II', order: 8, title: 'Fun and Games', description: 'The promise of the premise.' },
    { act: 'Act II', order: 9, title: 'Midpoint', description: 'A major victory or defeat.' },
    { act: 'Act II', order: 10, title: 'Bad Guys Close In', description: 'The opposition intensifies.' },
    { act: 'Act II', order: 11, title: 'All Is Lost', description: 'A devastating setback.' },
    { act: 'Act II', order: 12, title: 'Dark Night of the Soul', description: 'The hero hits bottom.' },
    { act: 'Act III', order: 13, title: 'Break into Three', description: 'A new idea or resolve emerges.' },
    { act: 'Act III', order: 14, title: 'Finale', description: 'The climax resolves the story.' },
    { act: 'Act III', order: 15, title: 'Final Image', description: 'A snapshot of the transformed world.' },
  ],
  'romance-beats': [
    { act: 'Setup', order: 1, title: 'The Meet-Cute', description: 'Protagonists meet memorably.' },
    { act: 'Setup', order: 2, title: 'Initial Attraction', description: 'Sparks fly despite complications.' },
    { act: 'Setup', order: 3, title: 'Forced Together', description: 'Circumstances push them together.' },
    { act: 'Rising Action', order: 4, title: 'Growing Closer', description: 'Bonding and deepening connection.' },
    { act: 'Rising Action', order: 5, title: 'The Complication', description: 'External force threatens the relationship.' },
    { act: 'Rising Action', order: 6, title: 'The Conflict', description: 'Internal or external conflict tests them.' },
    { act: 'Climax', order: 7, title: 'The Dark Moment', description: 'The relationship seems doomed.' },
    { act: 'Climax', order: 8, title: 'The Gesture', description: 'A romantic declaration or act.' },
    { act: 'Resolution', order: 9, title: 'The Reunion', description: 'They come back together.' },
    { act: 'Resolution', order: 10, title: 'Happy Ever After', description: 'Love wins.' },
  ],
  'mystery-clue-map': [
    { act: 'The Crime', order: 1, title: 'The Discovery', description: 'A crime is uncovered.' },
    { act: 'The Crime', order: 2, title: 'Investigation Begins', description: 'The detective takes the case.' },
    { act: 'The Crime', order: 3, title: 'Initial Suspects', description: 'The first suspects emerge.' },
    { act: 'The Investigation', order: 4, title: 'Following Leads', description: 'Clues are pursued.' },
    { act: 'The Investigation', order: 5, title: 'The Red Herring', description: 'A false lead.' },
    { act: 'The Investigation', order: 6, title: 'Narrowing Down', description: 'The suspect list shrinks.' },
    { act: 'The Investigation', order: 7, title: 'The Breakthrough', description: 'A crucial discovery.' },
    { act: 'The Resolution', order: 8, title: 'The Reveal', description: 'The truth comes out.' },
    { act: 'The Resolution', order: 9, title: 'Confrontation', description: 'The culprit is confronted.' },
    { act: 'The Resolution', order: 10, title: 'The Aftermath', description: 'Justice and resolution.' },
  ],
  'blank': [],
};

export function getTemplateById(id: string): StoryTemplate | undefined {
  return TEMPLATES.find(t => t.id === id) || (id === 'blank' ? BLANK_TEMPLATE : undefined);
}

export function getStructureBeats(structureId: string): BeatTemplate[] {
  return STRUCTURE_BEATS[structureId] || [];
}
