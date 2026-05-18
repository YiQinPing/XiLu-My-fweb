-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "genre" TEXT NOT NULL DEFAULT '',
    "targetWordCount" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "writingStage" TEXT NOT NULL DEFAULT 'PLANNING',
    "description" TEXT,
    "coverUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Volume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "sequenceNum" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFTING',
    "synopsis" TEXT,
    "targetWordCount" INTEGER,
    "actualWordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Volume_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "volumeId" TEXT NOT NULL,
    "chapterNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chapterType" TEXT NOT NULL DEFAULT 'REGULAR',
    "status" TEXT NOT NULL DEFAULT 'OUTLINE',
    "povCharacterId" TEXT,
    "targetWordCount" INTEGER,
    "actualWordCount" INTEGER NOT NULL DEFAULT 0,
    "synopsis" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "authorNotes" TEXT,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chapter_povCharacterId_fkey" FOREIGN KEY ("povCharacterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "povCharacterId" TEXT,
    "locationId" TEXT,
    "storyTime" TEXT,
    "mood" TEXT,
    "tone" TEXT,
    "conflictType" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "separator" TEXT DEFAULT '***',
    "timelineEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scene_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Scene_povCharacterId_fkey" FOREIGN KEY ("povCharacterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Scene_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Scene_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SceneCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PRESENT',
    CONSTRAINT "SceneCharacter_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SceneCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DraftSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "snapshotType" TEXT NOT NULL DEFAULT 'AUTO',
    "label" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DraftSnapshot_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "textRange" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SELF_NOTE',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Annotation_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Annotation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Annotation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutlineBeat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "beatType" TEXT,
    "structureName" TEXT,
    "positionPercent" INTEGER,
    "emotionalIntensity" INTEGER,
    "conflictLevel" INTEGER,
    "status" TEXT,
    "plotThread" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutlineBeat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutlineBeat_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OutlineBeat_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OutlineBeat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutlineBeatCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beatId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    CONSTRAINT "OutlineBeatCharacter_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "OutlineBeat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutlineBeatCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "gender" TEXT,
    "apparentAge" INTEGER,
    "actualAge" INTEGER,
    "birthday" TEXT,
    "birthPlaceId" TEXT,
    "residenceId" TEXT,
    "species" TEXT,
    "nationality" TEXT,
    "occupations" TEXT NOT NULL DEFAULT '[]',
    "socialClass" TEXT,
    "characterStatus" TEXT NOT NULL DEFAULT 'ALIVE',
    "avatarUrl" TEXT,
    "height" TEXT,
    "build" TEXT,
    "skinTone" TEXT,
    "hairColor" TEXT,
    "hairStyle" TEXT,
    "eyeColor" TEXT,
    "distinguishingFeatures" TEXT,
    "appearanceDesc" TEXT,
    "personalityType" TEXT,
    "coreTraits" TEXT NOT NULL DEFAULT '[]',
    "virtues" TEXT NOT NULL DEFAULT '[]',
    "flaws" TEXT NOT NULL DEFAULT '[]',
    "moralAlignment" TEXT,
    "childhood" TEXT,
    "familyBackground" TEXT,
    "traumas" TEXT NOT NULL DEFAULT '[]',
    "secrets" TEXT,
    "speechDialect" TEXT,
    "catchphrases" TEXT NOT NULL DEFAULT '[]',
    "nervousHabits" TEXT NOT NULL DEFAULT '[]',
    "hobbies" TEXT NOT NULL DEFAULT '[]',
    "arcType" TEXT,
    "arcStartState" TEXT,
    "arcMidpoint" TEXT,
    "arcEndState" TEXT,
    "developmentStatus" TEXT NOT NULL DEFAULT 'CONCEPT',
    "roleInStory" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "groups" TEXT NOT NULL DEFAULT '[]',
    "importance" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_birthPlaceId_fkey" FOREIGN KEY ("birthPlaceId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "acquired" TEXT,
    "notes" TEXT,
    CONSTRAINT "CharacterSkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SHORT_TERM',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "origin" TEXT,
    "obstacle" TEXT,
    "endState" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    CONSTRAINT "CharacterGoal_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "characterAId" TEXT NOT NULL,
    "characterBId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'MUTUAL',
    "intensity" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'CURRENT',
    "startEvent" TEXT,
    "endEvent" TEXT,
    "howMet" TEXT,
    "publicView" TEXT,
    "reality" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CharacterRelationship_characterAId_fkey" FOREIGN KEY ("characterAId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterRelationship_characterBId_fkey" FOREIGN KEY ("characterBId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "climate" TEXT,
    "currentStatus" TEXT NOT NULL DEFAULT 'THRIVING',
    "controllingFactionId" TEXT,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Location_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Location_controllingFactionId_fkey" FOREIGN KEY ("controllingFactionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "type" TEXT NOT NULL,
    "motto" TEXT,
    "foundedDate" TEXT,
    "founderId" TEXT,
    "currentLeaderId" TEXT,
    "headquartersId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "alignment" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Faction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Faction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Faction_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Faction_currentLeaderId_fkey" FOREIGN KEY ("currentLeaderId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Faction_headquartersId_fkey" FOREIGN KEY ("headquartersId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactionMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factionId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "rank" TEXT,
    "department" TEXT,
    "joinDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "loyaltyLevel" INTEGER,
    CONSTRAINT "FactionMember_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FactionMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "factionId" TEXT,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "type" TEXT NOT NULL,
    "description" TEXT,
    "physicalDesc" TEXT,
    "properties" TEXT,
    "powerLevel" TEXT NOT NULL DEFAULT 'COMMON',
    "value" TEXT,
    "acquisitionMethod" TEXT,
    "acquisitionLocationId" TEXT,
    "currentOwnerId" TEXT,
    "usageConditions" TEXT,
    "history" TEXT,
    "lore" TEXT,
    "imageUrls" TEXT NOT NULL DEFAULT '[]',
    "isKeyItem" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Item_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_acquisitionLocationId_fkey" FOREIGN KEY ("acquisitionLocationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_currentOwnerId_fkey" FOREIGN KEY ("currentOwnerId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "narrativeFunction" TEXT,
    "relationship" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Timeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timelineId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "approximateDate" TEXT,
    "relativeDate" TEXT,
    "duration" TEXT,
    "eventType" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "locationId" TEXT,
    "causeEventId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TimelineEvent_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "Timeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_causeEventId_fkey" FOREIGN KEY ("causeEventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEventChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    CONSTRAINT "TimelineEventChapter_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEventChapter_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foreshadowing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'BOOK_LEVEL',
    "plantingMethod" TEXT,
    "plantedChapterId" TEXT,
    "revealedChapterId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANTED',
    "importance" INTEGER NOT NULL DEFAULT 3,
    "targetAwareness" TEXT NOT NULL DEFAULT 'SHARP_READERS',
    "relatedEventId" TEXT,
    "parentForeshadowingId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Foreshadowing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Foreshadowing_plantedChapterId_fkey" FOREIGN KEY ("plantedChapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Foreshadowing_revealedChapterId_fkey" FOREIGN KEY ("revealedChapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Foreshadowing_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Foreshadowing_parentForeshadowingId_fkey" FOREIGN KEY ("parentForeshadowingId") REFERENCES "Foreshadowing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inspiration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'RAW',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "relatedModule" TEXT,
    "folder" TEXT,
    "promotedEntityType" TEXT,
    "promotedEntityId" TEXT,
    "attachmentUrls" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inspiration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "netWords" INTEGER NOT NULL DEFAULT 0,
    "writingTimeSec" INTEGER NOT NULL DEFAULT 0,
    "goalWords" INTEGER,
    "goalMet" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DailyStats_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "durationSec" INTEGER,
    "wordsWritten" INTEGER,
    "wpm" REAL,
    "chapterId" TEXT,
    "notes" TEXT,
    CONSTRAINT "WritingSession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WritingSession_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "SearchIndex_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key_key" ON "UserPreference"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Volume_projectId_sequenceNum_key" ON "Volume"("projectId", "sequenceNum");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_volumeId_sortOrder_key" ON "Chapter"("volumeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SceneCharacter_sceneId_characterId_key" ON "SceneCharacter"("sceneId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "OutlineBeatCharacter_beatId_characterId_key" ON "OutlineBeatCharacter"("beatId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterRelationship_characterAId_characterBId_type_key" ON "CharacterRelationship"("characterAId", "characterBId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FactionMember_factionId_characterId_key" ON "FactionMember"("factionId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEventChapter_eventId_chapterId_key" ON "TimelineEventChapter"("eventId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_projectId_date_key" ON "DailyStats"("projectId", "date");
