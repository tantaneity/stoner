import { load } from "@tauri-apps/plugin-store";
import type { AppData } from "./types";

const STORE_FILE = "stoner.json";

async function getStore() {
  return load(STORE_FILE, { autoSave: true });
}

export async function loadData(): Promise<AppData> {
  try {
    const store = await getStore();
    const habits = await store.get<AppData["habits"]>("habits");
    const language = await store.get<AppData["language"]>("language");
    return {
      habits: habits ?? [],
      language: language ?? "en",
    };
  } catch {
    return { habits: [], language: "en" };
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    const store = await getStore();
    await store.set("habits", data.habits);
    await store.set("language", data.language);
  } catch {
  }
}
