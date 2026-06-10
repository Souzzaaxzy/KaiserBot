// 🎭 SISTEMA DE REAÇÕES POR NOME
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATABASE_DIR = path.join(__dirname, '../../database');
const REACTIONS_FILE = `${DATABASE_DIR}/name_reactions.json`;

function loadReactions() {
  try {
    if (fs.existsSync(REACTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(REACTIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('[NameReactions] Erro ao carregar:', e.message);
  }
  return { enabled: true, reactions: {} };
}

function saveReactions(data) {
  try {
    fs.writeFileSync(REACTIONS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('[NameReactions] Erro ao salvar:', e.message);
    return false;
  }
}

class NameReactions {
  constructor() {
    this.data = loadReactions();
  }

  checkMessage(message) {
    if (!this.data.enabled || !message) return null;
    const text = message.toLowerCase();
    for (const [name, config] of Object.entries(this.data.reactions)) {
      if (!config.enabled) continue;
      const regex = new RegExp(`\\b${name.toLowerCase()}\\b`, 'i');
      if (regex.test(text)) return { emoji: config.emoji, name };
    }
    return null;
  }

  toggle() {
    this.data.enabled = !this.data.enabled;
    saveReactions(this.data);
    return this.data.enabled;
  }

  add(name, emoji) {
    const nameClean = name.toLowerCase().trim();
    if (!nameClean || !emoji) return false;
    this.data.reactions[nameClean] = { emoji, enabled: true, createdAt: new Date().toISOString() };
    saveReactions(this.data);
    return true;
  }

  remove(name) {
    const nameClean = name.toLowerCase().trim();
    if (this.data.reactions[nameClean]) {
      delete this.data.reactions[nameClean];
      saveReactions(this.data);
      return true;
    }
    return false;
  }

  list() {
    return Object.entries(this.data.reactions).map(([name, config]) => ({ name, emoji: config.emoji, enabled: config.enabled }));
  }

  getStatus() {
    return { enabled: this.data.enabled, totalReactions: Object.keys(this.data.reactions).length };
  }
}

export default new NameReactions();
