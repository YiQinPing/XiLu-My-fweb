import api from "./client";

export interface CharacterBrief {
  id: string;
  projectId: string;
  name: string;
  gender: string | null;
  apparentAge: number | null;
  species: string | null;
  characterStatus: string;
  roleInStory: string | null;
  tags: string;
  groups: string;
  importance: number;
  sortOrder: number;
  developmentStatus: string;
  avatarUrl: string | null;
  occupations: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterDetail {
  id: string;
  projectId: string;
  name: string;
  aliases: string;
  gender: string | null;
  apparentAge: number | null;
  actualAge: number | null;
  birthday: string | null;
  birthPlaceId: string | null;
  residenceId: string | null;
  species: string | null;
  nationality: string | null;
  occupations: string;
  socialClass: string | null;
  characterStatus: string;
  avatarUrl: string | null;
  height: string | null;
  build: string | null;
  skinTone: string | null;
  hairColor: string | null;
  hairStyle: string | null;
  eyeColor: string | null;
  distinguishingFeatures: string | null;
  appearanceDesc: string | null;
  personalityType: string | null;
  coreTraits: string;
  virtues: string;
  flaws: string;
  moralAlignment: string | null;
  childhood: string | null;
  familyBackground: string | null;
  traumas: string;
  secrets: string | null;
  speechDialect: string | null;
  catchphrases: string;
  nervousHabits: string;
  hobbies: string;
  arcType: string | null;
  arcStartState: string | null;
  arcMidpoint: string | null;
  arcEndState: string | null;
  developmentStatus: string;
  roleInStory: string | null;
  tags: string;
  groups: string;
  importance: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  birthPlace?: { id: string; name: string } | null;
  residence?: { id: string; name: string } | null;
  skills?: { id: string; name: string; category: string; proficiency: number }[];
  goals?: { id: string; description: string; type: string; status: string }[];
  factionMemberships?: { faction: { id: string; name: string } }[];
  ownedItems?: { id: string; name: string; type: string }[];
}

export interface CreateCharacterInput {
  projectId: string;
  name: string;
  gender?: string;
  apparentAge?: number;
  roleInStory?: string;
  tags?: string;
  sortOrder?: number;
  [key: string]: any;
}

export async function listCharacters(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: CharacterBrief[] }>(`/projects/${projectId}/characters`);
  return data.data;
}

export async function createCharacter(input: CreateCharacterInput) {
  const { data } = await api.post<{ success: boolean; data: CharacterBrief }>(`/projects/${input.projectId}/characters`, input);
  return data.data;
}

export async function getCharacter(id: string) {
  const { data } = await api.get<{ success: boolean; data: CharacterDetail }>(`/characters/${id}`);
  return data.data;
}

export async function updateCharacter(id: string, input: Partial<CharacterDetail>) {
  const { data } = await api.patch<{ success: boolean; data: CharacterDetail }>(`/characters/${id}`, input);
  return data.data;
}

export async function deleteCharacter(id: string) {
  await api.delete(`/characters/${id}`);
}
