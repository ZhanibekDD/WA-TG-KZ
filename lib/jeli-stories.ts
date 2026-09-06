export type StoryPrivacy = "everyone" | "contacts" | "close-friends" | "selected";
export type StoryDuration = 6 | 12 | 24 | 48;

export type JeliStory = {
  id: string;
  authorId: string;
  author: string;
  initials: string;
  accent: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
  privacy: StoryPrivacy;
  durationHours: StoryDuration;
  pinned: boolean;
  noScreenshots: boolean;
  mine?: boolean;
  demo?: boolean;
};

export const STORY_STORAGE_KEY = "jeli:stories:v1";

export const storySamples: JeliStory[] = [
  {
    id: "sample-aigerim",
    authorId: "aigerim",
    author: "Айгерим",
    initials: "А",
    accent: "linear-gradient(145deg,#18b5ad,#1f9fe5)",
    caption: "Новый день, новые планы ✨",
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    privacy: "contacts",
    durationHours: 24,
    pinned: false,
    noScreenshots: false,
    demo: true,
  },
  {
    id: "sample-daniyar",
    authorId: "daniyar",
    author: "Данияр",
    initials: "Д",
    accent: "linear-gradient(145deg,#23c7a7,#2187e8)",
    caption: "Алматы сегодня 🔥",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    privacy: "contacts",
    durationHours: 24,
    pinned: false,
    noScreenshots: false,
    demo: true,
  },
  {
    id: "sample-family",
    authorId: "family",
    author: "Семья",
    initials: "С",
    accent: "linear-gradient(145deg,#16b8a3,#45a4e8)",
    caption: "Вместе ❤️",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    privacy: "close-friends",
    durationHours: 24,
    pinned: false,
    noScreenshots: true,
    demo: true,
  },
];

export function readLocalStories(): JeliStory[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalStories(stories: JeliStory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(stories));
}

export function isStoryArchived(story: JeliStory, now = Date.now()) {
  return new Date(story.expiresAt).getTime() <= now;
}

export function storyPrivacyLabel(privacy: StoryPrivacy) {
  return privacy === "everyone" ? "Все" : privacy === "contacts" ? "Мои контакты" : privacy === "close-friends" ? "Близкие друзья" : "Выбранные контакты";
}
