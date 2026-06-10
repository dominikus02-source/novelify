-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "plan" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "wordCountUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyWordCount" INTEGER NOT NULL DEFAULT 0,
    "dailyWordDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "penName" TEXT,
    "authorBio" TEXT,
    "defaultAuthorName" TEXT,
    "website" TEXT,
    "defaultSourceLanguage" TEXT NOT NULL DEFAULT 'id',
    "defaultTargetLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultAiOutputLanguage" TEXT NOT NULL DEFAULT 'en',
    "alwaysUseProjectTargetLanguage" BOOLEAN NOT NULL DEFAULT true,
    "translationStyle" TEXT NOT NULL DEFAULT 'literary',
    "preserveCharacterNames" BOOLEAN NOT NULL DEFAULT true,
    "preservePlaceNames" BOOLEAN NOT NULL DEFAULT true,
    "glossaryBehavior" TEXT NOT NULL DEFAULT 'preserve',
    "defaultGenre" TEXT,
    "defaultPOV" TEXT NOT NULL DEFAULT 'third_person_limited',
    "defaultTense" TEXT NOT NULL DEFAULT 'past',
    "defaultChapterWordTarget" INTEGER NOT NULL DEFAULT 3000,
    "defaultDailyWordGoal" INTEGER NOT NULL DEFAULT 1000,
    "autosaveInterval" INTEGER NOT NULL DEFAULT 2000,
    "defaultWritingMode" TEXT NOT NULL DEFAULT 'chapter',
    "manuscriptFont" TEXT NOT NULL DEFAULT 'serif',
    "editorDensity" TEXT NOT NULL DEFAULT 'comfortable',
    "aiCreativity" TEXT NOT NULL DEFAULT 'balanced',
    "defaultTone" TEXT NOT NULL DEFAULT 'literary',
    "proseStyle" TEXT NOT NULL DEFAULT 'clean',
    "contentLevel" TEXT NOT NULL DEFAULT 'general',
    "aiSuggestionMode" TEXT NOT NULL DEFAULT 'append_after_confirmation',
    "includeStoryBibleContext" BOOLEAN NOT NULL DEFAULT true,
    "includePreviousChapterContext" BOOLEAN NOT NULL DEFAULT true,
    "includeStyleGuideContext" BOOLEAN NOT NULL DEFAULT true,
    "defaultExportFormat" TEXT NOT NULL DEFAULT 'epub',
    "pageSize" TEXT NOT NULL DEFAULT '6x9',
    "includeTableOfContents" BOOLEAN NOT NULL DEFAULT true,
    "includeCopyrightPage" BOOLEAN NOT NULL DEFAULT true,
    "defaultCopyrightText" TEXT,
    "publisherName" TEXT,
    "isbn" TEXT,
    "authorBioForExport" TEXT,
    "frontMatterTemplate" TEXT,
    "backMatterTemplate" TEXT,
    "writingReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "writingReminderTime" TEXT NOT NULL DEFAULT '18:00',
    "dailyGoalReminder" BOOLEAN NOT NULL DEFAULT true,
    "weeklyProgressEmail" BOOLEAN NOT NULL DEFAULT false,
    "exportCompletedNotification" BOOLEAN NOT NULL DEFAULT true,
    "aiTaskCompletedNotification" BOOLEAN NOT NULL DEFAULT true,
    "marketingReminder" BOOLEAN NOT NULL DEFAULT false,
    "manuscriptPrivacy" TEXT NOT NULL DEFAULT 'private',
    "allowAITrainingOnMyManuscript" BOOLEAN NOT NULL DEFAULT false,
    "dataExportRequested" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "accentColor" TEXT NOT NULL DEFAULT 'gold',
    "editorPaper" TEXT NOT NULL DEFAULT 'warm',
    "editorFont" TEXT NOT NULL DEFAULT 'serif',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "compactSidebar" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'free',
    "provider" TEXT,
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "aiCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "starterOutlinesUsed" INTEGER NOT NULL DEFAULT 0,
    "revisionChecksUsed" INTEGER NOT NULL DEFAULT 0,
    "fullRevisionChecksUsed" INTEGER NOT NULL DEFAULT 0,
    "translationWordsUsed" INTEGER NOT NULL DEFAULT 0,
    "exportsUsed" INTEGER NOT NULL DEFAULT 0,
    "marketingAssetsUsed" INTEGER NOT NULL DEFAULT 0,
    "projectsCreated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'id',
    "targetLanguage" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "plotOutline" TEXT,
    "styleGuide" TEXT,
    "coverImage" TEXT,
    "wordTarget" INTEGER NOT NULL DEFAULT 50000,
    "chaptersTarget" INTEGER NOT NULL DEFAULT 20,
    "templateId" TEXT,
    "premise" TEXT,
    "logline" TEXT,
    "theme" TEXT,
    "targetAudience" TEXT,
    "pov" TEXT,
    "tense" TEXT,
    "tone" TEXT,
    "centralConflict" TEXT,
    "stakes" TEXT,
    "endingIdea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "contentOriginal" TEXT NOT NULL DEFAULT '',
    "contentTranslated" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "sceneNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "goal" TEXT NOT NULL DEFAULT '',
    "conflict" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "emotionalShift" TEXT NOT NULL DEFAULT '',
    "povCharacterId" TEXT,
    "locationId" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "targetWordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingGoal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'daily',
    "targetWords" INTEGER NOT NULL DEFAULT 1000,
    "currentWords" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManuscriptVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "sceneId" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManuscriptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "linkedCharacterId" TEXT,
    "linkedLocationId" TEXT,
    "linkedChapterId" TEXT,
    "linkedSceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "description" TEXT NOT NULL DEFAULT '',
    "mood" TEXT,
    "importance" TEXT NOT NULL DEFAULT 'minor',
    "rules" TEXT,
    "history" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "eventDateOrOrder" DOUBLE PRECISION,
    "eventDateText" TEXT,
    "type" TEXT NOT NULL DEFAULT 'main_plot',
    "linkedChapterId" TEXT,
    "linkedSceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "sceneId" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "authorType" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'supporting',
    "age" TEXT,
    "gender" TEXT,
    "occupation" TEXT,
    "physicalDescription" TEXT,
    "personality" TEXT,
    "motivation" TEXT,
    "fear" TEXT,
    "secret" TEXT,
    "flaw" TEXT,
    "strength" TEXT,
    "backstory" TEXT,
    "characterArc" TEXT,
    "relationshipToProtagonist" TEXT,
    "firstAppearanceChapter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'alive',
    "notes" TEXT,
    "imageUrl" TEXT,
    "colorTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'epub',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileName" TEXT,
    "fileUrl" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "optionsJson" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingMetadata" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bookTitle" TEXT,
    "subtitle" TEXT,
    "seriesTitle" TEXT,
    "seriesNumber" INTEGER,
    "authorName" TEXT,
    "publisherName" TEXT,
    "language" TEXT,
    "genre" TEXT,
    "subgenre" TEXT,
    "keywordsJson" TEXT,
    "targetAudience" TEXT,
    "ageRange" TEXT,
    "isbn" TEXT,
    "copyrightYear" INTEGER,
    "copyrightHolder" TEXT,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "logline" TEXT,
    "tagline" TEXT,
    "synopsis" TEXT,
    "blurb" TEXT,
    "amazonDescription" TEXT,
    "goodreadsDescription" TEXT,
    "authorBio" TEXT,
    "authorWebsite" TEXT,
    "authorSocialJson" TEXT,
    "coverImageUrl" TEXT,
    "coverAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishingMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontMatter" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "includeTitlePage" BOOLEAN NOT NULL DEFAULT true,
    "includeCopyrightPage" BOOLEAN NOT NULL DEFAULT true,
    "copyrightNotice" TEXT,
    "includeDedication" BOOLEAN NOT NULL DEFAULT false,
    "dedication" TEXT,
    "includeEpigraph" BOOLEAN NOT NULL DEFAULT false,
    "epigraph" TEXT,
    "includeForeword" BOOLEAN NOT NULL DEFAULT false,
    "foreword" TEXT,
    "includePreface" BOOLEAN NOT NULL DEFAULT false,
    "preface" TEXT,
    "includeAcknowledgments" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgments" TEXT,
    "includeTableOfContents" BOOLEAN NOT NULL DEFAULT true,
    "alsoByAuthor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontMatter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackMatter" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "includeAboutAuthor" BOOLEAN NOT NULL DEFAULT true,
    "aboutAuthor" TEXT,
    "includeAuthorWebsite" BOOLEAN NOT NULL DEFAULT false,
    "authorWebsite" TEXT,
    "includeReviewRequest" BOOLEAN NOT NULL DEFAULT false,
    "reviewRequest" TEXT,
    "includeNewsletterSignup" BOOLEAN NOT NULL DEFAULT false,
    "newsletterSignup" TEXT,
    "includeThankYou" BOOLEAN NOT NULL DEFAULT false,
    "thankYouNote" TEXT,
    "includeNextBookTeaser" BOOLEAN NOT NULL DEFAULT false,
    "nextBookTeaser" TEXT,
    "includeAlsoByAuthor" BOOLEAN NOT NULL DEFAULT false,
    "alsoByAuthor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackMatter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingChecklist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "metadataComplete" BOOLEAN NOT NULL DEFAULT false,
    "coverReady" BOOLEAN NOT NULL DEFAULT false,
    "synopsisReady" BOOLEAN NOT NULL DEFAULT false,
    "blurbReady" BOOLEAN NOT NULL DEFAULT false,
    "frontMatterReady" BOOLEAN NOT NULL DEFAULT false,
    "backMatterReady" BOOLEAN NOT NULL DEFAULT false,
    "manuscriptReady" BOOLEAN NOT NULL DEFAULT false,
    "revisionReady" BOOLEAN NOT NULL DEFAULT false,
    "exportReady" BOOLEAN NOT NULL DEFAULT false,
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotBeat" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'three-act',
    "act" TEXT NOT NULL DEFAULT 'act1',
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "linkedChapterId" TEXT,
    "linkedSceneId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlotBeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "characterAId" TEXT NOT NULL,
    "characterBId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'complicated',
    "description" TEXT NOT NULL DEFAULT '',
    "conflict" TEXT,
    "evolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "summary" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "relevance" TEXT NOT NULL DEFAULT 'moderate',
    "linkedCharacterId" TEXT,
    "linkedLocationId" TEXT,
    "linkedChapterId" TEXT,
    "linkedSceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "UsageTracking_userId_idx" ON "UsageTracking"("userId");

-- CreateIndex
CREATE INDEX "UsageTracking_periodStart_periodEnd_idx" ON "UsageTracking"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "UsageEvent_userId_idx" ON "UsageEvent"("userId");

-- CreateIndex
CREATE INDEX "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Chapter_projectId_idx" ON "Chapter"("projectId");

-- CreateIndex
CREATE INDEX "Scene_chapterId_idx" ON "Scene"("chapterId");

-- CreateIndex
CREATE INDEX "Scene_locationId_idx" ON "Scene"("locationId");

-- CreateIndex
CREATE INDEX "WritingGoal_projectId_idx" ON "WritingGoal"("projectId");

-- CreateIndex
CREATE INDEX "ManuscriptVersion_projectId_idx" ON "ManuscriptVersion"("projectId");

-- CreateIndex
CREATE INDEX "StoryNote_projectId_idx" ON "StoryNote"("projectId");

-- CreateIndex
CREATE INDEX "Location_projectId_idx" ON "Location"("projectId");

-- CreateIndex
CREATE INDEX "TimelineEvent_projectId_idx" ON "TimelineEvent"("projectId");

-- CreateIndex
CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");

-- CreateIndex
CREATE INDEX "Character_projectId_idx" ON "Character"("projectId");

-- CreateIndex
CREATE INDEX "ExportJob_projectId_idx" ON "ExportJob"("projectId");

-- CreateIndex
CREATE INDEX "ExportJob_userId_idx" ON "ExportJob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingMetadata_projectId_key" ON "PublishingMetadata"("projectId");

-- CreateIndex
CREATE INDEX "PublishingMetadata_projectId_idx" ON "PublishingMetadata"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "FrontMatter_projectId_key" ON "FrontMatter"("projectId");

-- CreateIndex
CREATE INDEX "FrontMatter_projectId_idx" ON "FrontMatter"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BackMatter_projectId_key" ON "BackMatter"("projectId");

-- CreateIndex
CREATE INDEX "BackMatter_projectId_idx" ON "BackMatter"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingChecklist_projectId_key" ON "PublishingChecklist"("projectId");

-- CreateIndex
CREATE INDEX "PublishingChecklist_projectId_idx" ON "PublishingChecklist"("projectId");

-- CreateIndex
CREATE INDEX "PlotBeat_projectId_idx" ON "PlotBeat"("projectId");

-- CreateIndex
CREATE INDEX "Relationship_projectId_idx" ON "Relationship"("projectId");

-- CreateIndex
CREATE INDEX "ResearchItem_projectId_idx" ON "ResearchItem"("projectId");

