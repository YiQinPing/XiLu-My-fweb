# 数据模型设计

## 实体关系图（核心部分）

```
User ──owns──> Project ──contains──> Volume ──contains──> Chapter ──contains──> Scene
                  │                       │
                  ├──owns──> Character ───┼────appears in──┘
                  │        │              │
                  ├──owns──> Location ────┘
                  │        │
                  ├──owns──> Faction ─────┤
                  │        │              │
                  ├──owns──> Item ────────┘
                  │
                  ├──owns──> Timeline ──> TimelineEvent
                  │
                  ├──owns──> Foreshadowing
                  │
                  ├──owns──> Inspiration
                  │
                  ├──owns──> OutlineBeat
                  │
                  └──owns──> DailyStats / WritingSession
```

## Prisma Schema (Phase 1 核心模型)

```prisma
// ==================== 用户与认证 ====================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  displayName   String
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects      Project[]
  preferences   UserPreference[]
}

model UserPreference {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  key         String   // 如 "theme", "editor.fontSize", "audio.preset"
  value       Json     // JSON 值
  updatedAt   DateTime @updatedAt

  @@unique([userId, key])
  @@index([userId])
}

// ==================== 作品管理 ====================

model Project {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String
  subtitle      String?
  seriesName    String?
  seriesPosition Int?
  genre         String[]
  targetAudience String?
  targetWordCount Int?
  language      String    @default("zh-CN")
  writingStage  WritingStage @default(PLANNING)
  description   String?
  coverUrl      String?
  startDate     DateTime?
  targetDate    DateTime?
  isArchived    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  volumes       Volume[]
  characters    Character[]
  locations     Location[]
  factions      Faction[]
  items         Item[]
  timelines     Timeline[]
  foreshadowings Foreshadowing[]
  inspirations  Inspiration[]
  outlineBeats  OutlineBeat[]
  dailyStats    DailyStats[]
  writingSessions WritingSession[]
  searchIndex   SearchIndex[]

  @@index([userId])
}

enum WritingStage {
  PLANNING
  DRAFTING
  REVISING
  BETA_READING
  EDITING
  COMPLETE
  PUBLISHED
}

// ==================== 正文写作 ====================

model Volume {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  title         String
  subtitle      String?
  sequenceNum   Int
  status        VolumeStatus @default(DRAFTING)
  synopsis      String?
  targetWordCount Int?
  actualWordCount Int      @default(0)
  coverUrl      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  chapters      Chapter[]

  @@index([projectId])
  @@unique([projectId, sequenceNum])
}

enum VolumeStatus {
  PLANNING
  DRAFTING
  REVISING
  COMPLETE
}

model Chapter {
  id            String    @id @default(uuid())
  volumeId      String
  volume        Volume    @relation(fields: [volumeId], references: [id])
  chapterNumber String    // 支持 "3.5" 格式
  title         String
  chapterType   ChapterType @default(REGULAR)
  status        ChapterStatus @default(OUTLINE)
  povCharacterId String?
  povCharacter  Character? @relation("POVChapters", fields: [povCharacterId], references: [id])
  targetWordCount Int?
  actualWordCount Int     @default(0)
  synopsis      String?
  tags          String[]  @default([])
  isLocked      Boolean   @default(false)
  authorNotes   String?
  sortOrder     Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  scenes        Scene[]
  drafts        DraftSnapshot[]
  annotations   Annotation[]
  outlineLinks  OutlineBeat[]
  foreshadowingsPlanted Foreshadowing[] @relation("PlantedIn")
  foreshadowingsRevealed Foreshadowing[] @relation("RevealedIn")
  timelineEvents TimelineEventChapter[]
  betaFeedback  BetaFeedback[]

  @@index([volumeId])
  @@index([povCharacterId])
  @@unique([volumeId, sortOrder])
}

enum ChapterType {
  PROLOGUE
  REGULAR
  INTERLUDE
  EPILOGUE
  APPENDIX
  BONUS
}

enum ChapterStatus {
  OUTLINE
  FIRST_DRAFT
  SELF_REVISED
  BETA_READY
  IN_BETA
  REVISED_POST_BETA
  LINE_EDIT
  COPY_EDIT
  PROOFREAD
  FINAL
  PUBLISHED
}

model Scene {
  id            String    @id @default(uuid())
  chapterId     String
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  title         String?
  summary       String?
  wordCount     Int       @default(0)
  povCharacterId String?
  povCharacter  Character? @relation("POVScenes", fields: [povCharacterId], references: [id])
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])
  storyTime     String?   // 故事内时间描述
  mood          String?
  tone          String?
  conflictType  String?
  sortOrder     Int
  separator     String?   // 场景分隔符，默认 "***"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  participants  SceneCharacter[]
  timelineEventId String?
  timelineEvent   TimelineEvent? @relation(fields: [timelineEventId], references: [id])

  @@index([chapterId])
  @@index([povCharacterId])
  @@index([locationId])
}

model SceneCharacter {
  id            String    @id @default(uuid())
  sceneId       String
  scene         Scene     @relation(fields: [sceneId], references: [id])
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])
  role          CharacterRole @default(PRESENT)

  @@unique([sceneId, characterId])
  @@index([characterId])
}

enum CharacterRole {
  PROTAGONIST
  POV
  MAJOR
  MINOR
  MENTIONED
  PRESENT
}

model DraftSnapshot {
  id            String    @id @default(uuid())
  chapterId     String
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  content       String    // JSON (TipTap document)
  wordCount     Int
  snapshotType  SnapshotType @default(AUTO)
  label         String?   // 用户命名版本
  description   String?
  createdAt     DateTime  @default(now())

  @@index([chapterId, createdAt(sort: Desc)])
}

enum SnapshotType {
  AUTO
  MANUAL
  NAMED
}

model Annotation {
  id            String    @id @default(uuid())
  chapterId     String
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  textRange     Json      // { from: number, to: number }
  content       String
  type          AnnotationType @default(SELF_NOTE)
  status        AnnotationStatus @default(OPEN)
  parentId      String?   // 回复链
  parent        Annotation? @relation("AnnotationReplies", fields: [parentId], references: [id])
  replies       Annotation[] @relation("AnnotationReplies")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([chapterId])
}

enum AnnotationType {
  SELF_NOTE
  TO_REVIEW
  TO_RESEARCH
  TO_REWRITE
  CONTINUITY_CHECK
}

enum AnnotationStatus {
  OPEN
  RESOLVED
  DISMISSED
}

// ==================== 大纲 ====================

model OutlineBeat {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  chapterId     String?
  chapter       Chapter?  @relation(fields: [chapterId], references: [id])
  parentId      String?
  parent        OutlineBeat? @relation("BeatHierarchy", fields: [parentId], references: [id])
  children      OutlineBeat[] @relation("BeatHierarchy")
  title         String
  description   String?
  beatType      String?   // 对应故事结构模板中的节拍名称
  structureName String?   // 所属结构模板
  positionPercent Int?    // 在故事中的位置百分比
  emotionalIntensity Int? // 1-10
  conflictLevel  Int?     // 1-10
  status        String?
  plotThread    String?   // A-plot, B-plot, etc.
  sortOrder     Int
  color         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  linkedCharacters OutlineBeatCharacter[]

  @@index([projectId])
  @@index([chapterId])
  @@index([parentId])
}

model OutlineBeatCharacter {
  id            String      @id @default(uuid())
  beatId        String
  beat          OutlineBeat @relation(fields: [beatId], references: [id])
  characterId   String
  character     Character   @relation(fields: [characterId], references: [id])

  @@unique([beatId, characterId])
}

// ==================== 人物 ====================

model Character {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])

  // 基本信息
  name          String
  aliases       String[]  @default([])
  namePronunciation String?
  gender        String?
  apparentAge   Int?
  actualAge     Int?
  birthday      String?   // 自定义日历日期
  birthPlaceId  String?
  birthPlace    Location? @relation("CharacterBirthPlace", fields: [birthPlaceId], references: [id])
  residenceId   String?
  residence     Location? @relation("CharacterResidence", fields: [residenceId], references: [id])
  species       String?
  nationality   String?
  occupations   String[]  @default([])
  socialClass   String?
  education     String?
  languages     String[]  @default([])
  status        CharacterStatus @default(ALIVE)

  // 外貌
  avatarUrl     String?
  galleryUrls   String[]  @default([])
  height        String?
  build         String?
  skinTone      String?
  hairColor     String?
  hairStyle     String?
  eyeColor      String?
  faceShape     String?
  distinguishingFeatures String?
  handedness    String?
  typicalPosture String?
  typicalExpression String?
  voice         String?
  scent         String?
  clothingStyle String?
  appearanceDesc String?  // 自由文本详细描写

  // 性格
  personalityType String? // MBTI
  enneagramType String?
  bigFiveO      Int?      // 1-10
  bigFiveC      Int?
  bigFiveE      Int?
  bigFiveA      Int?
  bigFiveN      Int?
  coreTraits    String[]  @default([])
  virtues       String[]  @default([])
  flaws         String[]  @default([])
  moralAlignment String?
  temperament   String?
  introExtro    Int?      // 1(极度内向) - 10(极度外向)

  // 背景
  childhood     String?
  familyBackground String?
  educationHistory String?
  careerHistory String?
  traumas       String[]  @default([])
  achievements  String[]  @default([])
  secrets       String?

  // 动机
  // (拆分为单独模型 CharacterGoal)
  // 技能
  // (拆分为单独模型 CharacterSkill)
  // 语言风格
  speechDialect String?
  speechVocab   String?
  speechComplexity String?
  catchphrases  String[]  @default([])
  verbalTics    String[]  @default([])
  humorStyle    String?
  speechVolume  String?
  speechTabooTopics String[]
  speechFormality String?
  swearingHabit String?

  // 习惯
  nervousHabits String[]  @default([])
  dailyRoutines String[]
  hobbies       String[]  @default([])
  petPeeves     String[]  @default([])
  sleepingHabits String?
  eatingHabits  String?
  organizingStyle String?

  // 弧光
  arcType       String?
  arcStartState String?
  arcMidpoint   String?
  arcEndState   String?

  // 元数据
  developmentStatus DevelopmentStatus @default(CONCEPT)
  firstAppearanceChapterId String?
  lastAppearanceChapterId  String?
  roleInStory   String?
  tags          String[]  @default([])
  groups        String[]  @default([])
  importance    Int       @default(1) // 1-5
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关系
  povChapters       Chapter[]           @relation("POVChapters")
  povScenes         Scene[]             @relation("POVScenes")
  sceneAppearances  SceneCharacter[]
  relationshipsFrom CharacterRelationship[] @relation("FromCharacter")
  relationshipsTo   CharacterRelationship[] @relation("ToCharacter")
  factionMemberships FactionMember[]
  ownedItems        Item[]              @relation("ItemOwner")
  previousItems     Item[]              @relation("ItemPreviousOwner")
  timelineAppearances TimelineEventCharacter[]
  foreshadowingLinks ForeshadowingCharacter[]
  skills            CharacterSkill[]
  goals             CharacterGoal[]

  @@index([projectId])
  @@index([birthPlaceId])
  @@index([residenceId])
}

enum CharacterStatus {
  ALIVE
  DEAD
  UNDEAD
  MISSING
  INCAPACITATED
  RETIRED
}

enum DevelopmentStatus {
  CONCEPT
  SKETCHED
  DETAILED
  FULLY_DEVELOPED
}

model CharacterSkill {
  id            String    @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])
  name          String
  category      String    // combat, social, knowledge, craft, magic, physical
  proficiency   Int       // 1-10
  acquired      String?   // 获取方式
  notes         String?

  @@index([characterId])
}

model CharacterGoal {
  id            String    @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])
  description   String
  type          GoalType
  priority      Int       @default(1)
  origin        String?   // 为什么想要这个
  obstacle      String?
  endState      String?
  status        GoalStatus @default(NOT_STARTED)

  @@index([characterId])
}

enum GoalType {
  SHORT_TERM
  LONG_TERM
  HIDDEN
}

enum GoalStatus {
  NOT_STARTED
  PURSUING
  ACHIEVED
  ABANDONED
  FAILED
}

model CharacterRelationship {
  id            String    @id @default(uuid())
  projectId     String
  characterAId  String
  characterA    Character @relation("FromCharacter", fields: [characterAId], references: [id])
  characterBId  String
  characterB    Character @relation("ToCharacter", fields: [characterBId], references: [id])
  type          RelationType
  subType       String?   // 自定义子类型
  direction     RelationDirection @default(MUTUAL)
  intensity     Int       @default(5) // 1-10
  status        RelationStatus @default(CURRENT)
  startEvent    String?
  endEvent      String?
  howMet        String?
  publicView    String?
  reality       String?
  description   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([characterAId, characterBId, type])
  @@index([characterAId])
  @@index([characterBId])
  @@index([projectId])
}

enum RelationType {
  // 家人
  PARENT_CHILD
  SIBLING
  SPOUSE
  COUSIN
  ADOPTED
  // 恋爱情感
  LOVER
  CRUSH
  EX
  ONE_SIDED
  // 社交
  FRIEND
  BEST_FRIEND
  ACQUAINTANCE
  RIVAL
  MENTOR_STUDENT
  COLLEAGUE
  BOSS_SUBORDINATE
  // 敌对
  ENEMY
  NEMESIS
  BETRAYER
  VICTIM
  BULLY
  // 其他
  SECRET_IDENTITY
  DOPPELGANGER
  REINCARNATION
  CUSTOM
}

enum RelationDirection {
  MUTUAL
  A_TO_B
  B_TO_A
}

enum RelationStatus {
  CURRENT
  PAST
  FUTURE
}

// ==================== 世界观 - 地点 ====================

model Location {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  parentId      String?
  parent        Location? @relation("LocationHierarchy", fields: [parentId], references: [id])
  children      Location[] @relation("LocationHierarchy")
  name          String
  type          LocationType
  description   String?
  mapX          Float?    // 地图坐标
  mapY          Float?
  population    Int?
  climate       String?
  foundedDate   String?
  destroyedDate String?
  currentStatus LocationStatus @default(THRIVING)
  controllingFactionId String?
  controllingFaction Faction? @relation(fields: [controllingFactionId], references: [id])
  architecture  String?
  landmarks     String[]
  flora         String[]
  fauna         String[]
  imports       String[]
  exports       String[]
  lore          String?
  imageUrls     String[]  @default([])
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  notableResidents Character[] @relation("CharacterResidence")
  birthPlaceChars  Character[] @relation("CharacterBirthPlace")
  scenes           Scene[]
  factionTerritory Faction[]
  factionHQ        Faction[] @relation("FactionHQ")
  timelineEvents   TimelineEvent[]
  itemOrigins      Item[]

  @@index([projectId])
  @@index([parentId])
  @@index([controllingFactionId])
}

enum LocationType {
  WORLD
  CONTINENT
  REGION
  NATION
  PROVINCE
  CITY
  DISTRICT
  SPECIFIC_LOCATION
  DUNGEON
  TEMPLE
  BATTLEFIELD
  WILDERNESS
  CUSTOM
}

enum LocationStatus {
  THRIVING
  DECLINING
  RUINS
  ABANDONED
  HIDDEN
}

// ==================== 世界观 - 势力组织 ====================

model Faction {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  parentId      String?
  parent        Faction?  @relation("FactionHierarchy", fields: [parentId], references: [id])
  children      Faction[] @relation("FactionHierarchy")
  name          String
  fullName      String?
  type          FactionType
  logoUrl       String?
  motto         String?
  foundedDate   String?
  founderId     String?
  founder       Character? @relation("FoundedFactions", fields: [founderId], references: [id])
  currentLeaderId String?
  currentLeader Character? @relation("LedFactions", fields: [currentLeaderId], references: [id])
  headquartersId String?
  headquarters  Location?  @relation("FactionHQ", fields: [headquartersId], references: [id])
  memberCount   Int?
  isPublic      Boolean   @default(true)
  alignment     String?
  description   String?
  structureJson Json?     // 组织架构 JSON
  territoryIds  String[]  @default([])
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  members       FactionMember[]
  resources     FactionResource[]
  relatedFactionsFrom FactionRelationship[] @relation("FromFaction")
  relatedFactionsTo   FactionRelationship[] @relation("ToFaction")
  timelineEvents FactionTimelineEvent[]
  items         Item[]

  @@index([projectId])
  @@index([founderId])
  @@index([currentLeaderId])
  @@index([headquartersId])
}

enum FactionType {
  KINGDOM
  EMPIRE
  GUILD
  CULT
  CORPORATION
  REBELLION
  SECRET_SOCIETY
  ACADEMY
  MERCHANT_LEAGUE
  MERCENARY_COMPANY
  RELIGIOUS_ORDER
  TRIBE
  CLAN
  FAMILY
  CUSTOM
}

model FactionMember {
  id            String    @id @default(uuid())
  factionId     String
  faction       Faction   @relation(fields: [factionId], references: [id])
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])
  rank          String?   // 职位/头衔
  department    String?
  joinDate      String?
  leaveDate     String?
  status        MemberStatus @default(ACTIVE)
  loyaltyLevel  Int?      // 1-10

  @@unique([factionId, characterId])
  @@index([characterId])
}

enum MemberStatus {
  ACTIVE
  RETIRED
  EXPELLED
  DECEASED
  UNDERCOVER
}

model FactionResource {
  id            String    @id @default(uuid())
  factionId     String
  faction       Faction   @relation(fields: [factionId], references: [id])
  resourceType  String
  description   String?
  quantity      String?

  @@index([factionId])
}

model FactionRelationship {
  id            String    @id @default(uuid())
  factionAId    String
  factionA      Faction   @relation("FromFaction", fields: [factionAId], references: [id])
  factionBId    String
  factionB      Faction   @relation("ToFaction", fields: [factionBId], references: [id])
  type          FactionRelationType
  history       String?
  notes         String?

  @@unique([factionAId, factionBId])
}

enum FactionRelationType {
  ALLIED
  FRIENDLY
  NEUTRAL
  TENSE
  ENEMIES
  AT_WAR
  SECRET_ALLIES
  PUBLIC_ENEMIES_PRIVATE_ALLIES
}

// ==================== 世界观 - 物品 ====================

model Item {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  factionId     String?
  faction       Faction?  @relation(fields: [factionId], references: [id])
  name          String
  aliases       String[]  @default([])
  type          ItemType
  description   String?
  physicalDesc  String?   // 大小、重量、材质、外观
  properties    String?   // 效果/属性描述
  powerLevel    ItemPowerLevel @default(COMMON)
  value         String?
  durability    String?
  craftRequirements String?
  creator       String?
  creationDate  String?

  // 获取与使用
  acquisitionMethod String?
  acquisitionLocationId String?
  acquisitionLocation Location? @relation(fields: [acquisitionLocationId], references: [id])
  currentOwnerId String?
  currentOwner  Character? @relation("ItemOwner", fields: [currentOwnerId], references: [id])
  usageConditions String?
  usageInstructions String?
  curse         String?
  destructionConditions String?

  // 历史
  history       String?
  lore          String?

  // 关系
  setItems      ItemSetItem[]
  counteredBy   ItemCounter[]
  counters      ItemCounter[] @relation("CounteredItem")

  // 元数据
  imageUrls     String[]  @default([])
  isKeyItem     Boolean   @default(false)
  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  previousOwners        ItemPreviousOwner[]
  foreshadowingLinks    ForeshadowingItem[]
  timelineAppearances   TimelineEventItem[]

  @@index([projectId])
  @@index([currentOwnerId])
  @@index([factionId])
  @@index([acquisitionLocationId])
}

enum ItemType {
  WEAPON
  ARMOR
  TOOL
  CONSUMABLE
  ARTIFACT
  CURRENCY
  VEHICLE
  DOCUMENT
  CLOTHING
  JEWELRY
  MAGICAL_ITEM
  TECHNOLOGY
  FOOD_DRINK
  MATERIAL
  KEY_ITEM
  CUSTOM
}

enum ItemPowerLevel {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
  MYTHIC
}

model ItemPreviousOwner {
  id            String    @id @default(uuid())
  itemId        String
  item          Item      @relation(fields: [itemId], references: [id])
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])

  @@unique([itemId, characterId])
}

model ItemSetItem {
  id            String    @id @default(uuid())
  setId         String
  itemId        String
  item          Item      @relation(fields: [itemId], references: [id])

  @@unique([setId, itemId])
}

model ItemCounter {
  id            String    @id @default(uuid())
  itemId        String
  item          Item      @relation(fields: [itemId], references: [id])
  counterId     String
  counter       Item      @relation("CounteredItem", fields: [counterId], references: [id])

  @@unique([itemId, counterId])
}

// ==================== 时间线 ====================

model Timeline {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  name          String
  description   String?
  narrativeFunction String?
  relationship  String?   // primary, prequel, concurrent, flashback, alternate
  createdAt     DateTime  @default(now())

  events        TimelineEvent[]

  @@index([projectId])
}

model TimelineEvent {
  id            String    @id @default(uuid())
  timelineId    String
  timeline      Timeline  @relation(fields: [timelineId], references: [id])
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])

  title         String
  description   String?
  date          String?   // 自定义日历日期
  approximateDate String? // 模糊日期
  relativeDate  String?   // "Chapter 3之后3天"
  duration      String?
  eventType     EventType
  importance    Int       @default(3)
  status        EventStatus @default(PLANNED)

  // 关联
  locationId    String?
  location      Location? @relation(fields: [locationId], references: [id])

  // 因果
  causeEventId  String?
  causeEvent    TimelineEvent? @relation("CauseEffect", fields: [causeEventId], references: [id])
  effectEvents  TimelineEvent[] @relation("CauseEffect")

  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  characters    TimelineEventCharacter[]
  items         TimelineEventItem[]
  factions      FactionTimelineEvent[]
  scenes        Scene[]
  chapters      TimelineEventChapter[]
  foreshadowings Foreshadowing[]

  @@index([timelineId])
  @@index([projectId])
  @@index([causeEventId])
}

enum EventType {
  PLOT
  BACKSTORY
  FLASHBACK
  FLASHFORWARD
  DREAM
  PROPHECY
  HISTORICAL
}

enum EventStatus {
  PLANNED
  DRAFTED
  WRITTEN
  REVISED
}

model TimelineEventCharacter {
  id            String        @id @default(uuid())
  eventId       String
  event         TimelineEvent @relation(fields: [eventId], references: [id])
  characterId   String
  character     Character     @relation(fields: [characterId], references: [id])
  role          String?       // protagonist, witness, mentioned, affected

  @@unique([eventId, characterId])
}

model TimelineEventItem {
  id            String        @id @default(uuid())
  eventId       String
  event         TimelineEvent @relation(fields: [eventId], references: [id])
  itemId        String
  item          Item          @relation(fields: [itemId], references: [id])

  @@unique([eventId, itemId])
}

model FactionTimelineEvent {
  id            String        @id @default(uuid())
  eventId       String
  event         TimelineEvent @relation(fields: [eventId], references: [id])
  factionId     String
  faction       Faction       @relation(fields: [factionId], references: [id])

  @@unique([eventId, factionId])
}

model TimelineEventChapter {
  id            String        @id @default(uuid())
  eventId       String
  event         TimelineEvent @relation(fields: [eventId], references: [id])
  chapterId     String
  chapter       Chapter       @relation(fields: [chapterId], references: [id])

  @@unique([eventId, chapterId])
}

// ==================== 伏笔 ====================

model Foreshadowing {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])

  title         String
  description   String?
  type          ForeshadowingType
  scope         ForeshadowingScope @default(BOOK_LEVEL)
  plantingMethod String?
  plantedChapterId String?
  plantedChapter Chapter?  @relation("PlantedIn", fields: [plantedChapterId], references: [id])
  revealedChapterId String?
  revealedChapter Chapter? @relation("RevealedIn", fields: [revealedChapterId], references: [id])
  status        ForeshadowingStatus @default(PLANTED)
  importance    Int       @default(3)
  targetAwareness ForeshadowingAwareness @default(SHARP_READERS)

  // 关联
  relatedEventId String?
  relatedEvent   TimelineEvent? @relation(fields: [relatedEventId], references: [id])

  // 自我关联（线索链）
  parentForeshadowingId String?
  parentForeshadowing   Foreshadowing? @relation("ClueChain", fields: [parentForeshadowingId], references: [id])
  childForeshadowings   Foreshadowing[] @relation("ClueChain")

  sortOrder     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  characters    ForeshadowingCharacter[]
  items         ForeshadowingItem[]
  groups        ForeshadowingGroupEntry[]

  @@index([projectId])
  @@index([plantedChapterId])
  @@index([revealedChapterId])
  @@index([relatedEventId])
}

enum ForeshadowingType {
  DIRECT
  INDIRECT_SUBTLE
  RED_HERRING
  CHEKHOVS_GUN
  DRAMATIC_IRONY
}

enum ForeshadowingScope {
  CHAPTER_LEVEL
  VOLUME_LEVEL
  BOOK_LEVEL
  SERIES_LEVEL
}

enum ForeshadowingStatus {
  PLANTED
  PARTIALLY_REVEALED
  FULLY_REVEALED
  ABANDONED
  RECONTEXTUALIZED
}

enum ForeshadowingAwareness {
  OBVIOUS_TO_ALL
  SHARP_READERS
  REREAD_ONLY
  UNCERTAIN
}

model ForeshadowingCharacter {
  id              String        @id @default(uuid())
  foreshadowingId String
  foreshadowing   Foreshadowing @relation(fields: [foreshadowingId], references: [id])
  characterId     String
  character       Character     @relation(fields: [characterId], references: [id])

  @@unique([foreshadowingId, characterId])
}

model ForeshadowingItem {
  id              String        @id @default(uuid())
  foreshadowingId String
  foreshadowing   Foreshadowing @relation(fields: [foreshadowingId], references: [id])
  itemId          String
  item            Item          @relation(fields: [itemId], references: [id])

  @@unique([foreshadowingId, itemId])
}

model ForeshadowingGroup {
  id            String    @id @default(uuid())
  projectId     String
  name          String
  description   String?

  entries       ForeshadowingGroupEntry[]
}

model ForeshadowingGroupEntry {
  id              String        @id @default(uuid())
  groupId         String
  group           ForeshadowingGroup @relation(fields: [groupId], references: [id])
  foreshadowingId String
  foreshadowing   Foreshadowing @relation(fields: [foreshadowingId], references: [id])

  @@unique([groupId, foreshadowingId])
}

// ==================== 灵感 ====================

model Inspiration {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])

  title         String?
  content       String    // 富文本
  sourceType    InspirationSource
  sourceDetail  String?   // 书名、URL、人名等
  tags          String[]  @default([])
  status        InspirationStatus @default(RAW)
  priority      Int       @default(3)
  relatedModule String?   // plot, character, world-building, etc.
  folder        String?

  // 转化追踪
  promotedEntityType String? // Character, Chapter, Location, etc.
  promotedEntityId   String?

  // 附件
  attachmentUrls String[] @default([])

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  linkedCharacters InspirationCharacter[]
  linkedChapters   InspirationChapter[]
  linkedLocations  InspirationLocation[]

  @@index([projectId])
}

enum InspirationSource {
  DREAM
  READING
  CONVERSATION
  OBSERVATION
  SHOWER_THOUGHT
  IMAGE
  MUSIC
  RESEARCH
  WRITING_EXERCISE
  RANDOM
  OTHER
}

enum InspirationStatus {
  RAW
  DEVELOPING
  READY
  INCORPORATED
  ARCHIVED
}

model InspirationCharacter {
  id            String      @id @default(uuid())
  inspirationId String
  inspiration   Inspiration @relation(fields: [inspirationId], references: [id])
  characterId   String
  character     Character   @relation(fields: [characterId], references: [id])

  @@unique([inspirationId, characterId])
}

model InspirationChapter {
  id            String      @id @default(uuid())
  inspirationId String
  inspiration   Inspiration @relation(fields: [inspirationId], references: [id])
  chapterId     String
  chapter       Chapter     @relation(fields: [chapterId], references: [id])

  @@unique([inspirationId, chapterId])
}

model InspirationLocation {
  id            String      @id @default(uuid())
  inspirationId String
  inspiration   Inspiration @relation(fields: [inspirationId], references: [id])
  locationId    String
  location      Location    @relation(fields: [locationId], references: [id])

  @@unique([inspirationId, locationId])
}

// ==================== 每日数据 ====================

model DailyStats {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  date          DateTime  // 仅日期部分
  totalWords    Int       @default(0)
  netWords      Int       @default(0)
  grossWords    Int       @default(0)
  writingTimeSec Int     @default(0)
  chapterIds    String[]  @default([])
  goalWords     Int?
  goalMet       Boolean   @default(false)

  @@unique([projectId, date])
  @@index([projectId, date(sort: Desc)])
}

model WritingSession {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  startTime     DateTime
  endTime       DateTime?
  durationSec   Int?
  wordsWritten  Int?      // 增量字数
  wpm           Float?
  chapterId     String?
  chapter       Chapter?  @relation(fields: [chapterId], references: [id])
  notes         String?

  @@index([projectId, startTime(sort: Desc)])
  @@index([chapterId])
}

// ==================== 搜索 ====================

model SearchIndex {
  id            String    @id @default(uuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  entityType    String    // "character", "chapter", "location", "faction", "item", "foreshadowing", "timeline_event", "inspiration"
  entityId      String
  title         String
  content       String    // 搜索文本（聚合关键字段）
  tsVector      Unsupported("tsvector")? // PostgreSQL FTS

  @@index([projectId, entityType])
  @@index([tsVector])
}

// ==================== 协作 (Phase 4) ====================

model BetaFeedback {
  id            String    @id @default(uuid())
  chapterId     String
  chapter       Chapter   @relation(fields: [chapterId], references: [id])
  readerEmail   String?
  readerName    String?
  content       String
  feedbackType  String?
  isResolved    Boolean   @default(false)
  createdAt     DateTime  @default(now())

  @@index([chapterId])
}
```

## 索引策略

### 高频查询索引
- `(projectId, entityType)` — 按项目加载所有实体
- `(projectId, date)` — 每日数据查询
- `(characterId)` — 角色出场/物品归属查询
- `(chapterId, sortOrder)` — 场景排序

### 全文搜索索引
- PostgreSQL `tsvector` 列 + GIN 索引
- 中文分词使用 zhparser 扩展
- 定期更新的物化视图或触发器同步

## 迁移策略

- 每次 schema 变更生成新的 migration 文件
- 开发阶段允许 `prisma migrate dev` 直接修改
- 生产阶段使用 `prisma migrate deploy`
- 大表变更（>10万行）使用分步迁移
- 所有 migration 文件纳入 Git 版本控制
