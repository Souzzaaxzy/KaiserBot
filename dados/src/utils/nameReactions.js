// 🎭 SISTEMA DE REAÇÕES POR NOME - POR GRUPO
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRUPOS_DIR = path.join(__dirname, '../../database/grupos');

// Normalizar texto - remover acentos e pontuação
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Gerar todas as variações de um nome
function generateVariations(name) {
  const normalized = normalize(name);
  const variations = new Set();
  
  // Variação base normalizada
  variations.add(normalized);
  
  // Variações com vogais duplicadas (leo, leoo)
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (const v of vowels) {
    if (normalized.includes(v)) {
      variations.add(normalized.replace(new RegExp(v, 'g'), v + v));
    }
  }
  
  // Adicionar versão original com acentos possíveis
  variations.add(name.toLowerCase().trim());
  
  return [...variations];
}

// Carregar configurações do grupo
function loadGroupSettings(groupId) {
  try {
    const groupFilePath = path.join(GRUPOS_DIR, `${groupId}.json`);
    if (fs.existsSync(groupFilePath)) {
      return JSON.parse(fs.readFileSync(groupFilePath, 'utf-8'));
    }
  } catch (e) {
    console.error('[NameReactions] Erro ao carregar grupo:', e.message);
  }
  return { nameReactions: { enabled: true, reactions: {}, aliasMap: {} } };
}

// Salvar configurações do grupo
function saveGroupSettings(groupId, data) {
  try {
    if (!fs.existsSync(GRUPOS_DIR)) {
      fs.mkdirSync(GRUPOS_DIR, { recursive: true });
    }
    const groupFilePath = path.join(GRUPOS_DIR, `${groupId}.json`);
    const currentData = fs.existsSync(groupFilePath) ? JSON.parse(fs.readFileSync(groupFilePath, 'utf-8')) : {};
    const newData = { ...currentData, ...data };
    fs.writeFileSync(groupFilePath, JSON.stringify(newData, null, 2));
    return true;
  } catch (e) {
    console.error('[NameReactions] Erro ao salvar grupo:', e.message);
    return false;
  }
}

// Reconstrói o mapa de alias para um grupo
function rebuildAliasMap(reactions) {
  const aliasMap = {};
  for (const [name, config] of Object.entries(reactions)) {
    const variations = generateVariations(name);
    for (const v of variations) {
      aliasMap[v] = name;
    }
  }
  return aliasMap;
}

class NameReactions {
  // Verificar mensagem em um grupo específico
  checkMessage(message, groupId) {
    if (!message || !groupId) return null;
    
    const groupData = loadGroupSettings(groupId);
    const reactions = groupData.nameReactions?.reactions || {};
    const aliasMap = groupData.nameReactions?.aliasMap || rebuildAliasMap(reactions);
    const enabled = groupData.nameReactions?.enabled !== false;
    
    if (!enabled) return null;
    
    const textNorm = normalize(message);
    
    // Verificar se alguma reação está contida em qualquer lugar do texto
    for (const [alias, name] of Object.entries(aliasMap)) {
      if (textNorm.includes(alias)) {
        const config = reactions[name];
        if (config && config.enabled !== false) {
          return { emoji: config.emoji, name };
        }
      }
    }
    
    return null;
  }

  // Toggle sistema no grupo
  toggle(groupId) {
    const groupData = loadGroupSettings(groupId);
    groupData.nameReactions = groupData.nameReactions || { enabled: true, reactions: {}, aliasMap: {} };
    groupData.nameReactions.enabled = !groupData.nameReactions.enabled;
    saveGroupSettings(groupId, groupData);
    return groupData.nameReactions.enabled;
  }

  // Adicionar reação no grupo
  add(groupId, name, emoji) {
    const nameClean = name.toLowerCase().trim();
    if (!nameClean || !emoji || !groupId) return false;
    
    const groupData = loadGroupSettings(groupId);
    groupData.nameReactions = groupData.nameReactions || { enabled: true, reactions: {}, aliasMap: {} };
    
    // Se já existe, atualiza o emoji
    groupData.nameReactions.reactions[nameClean] = { emoji, enabled: true, createdAt: new Date().toISOString() };
    
    // Gerar e salvar variações no aliasMap
    const variations = generateVariations(name);
    for (const v of variations) {
      groupData.nameReactions.aliasMap[v] = nameClean;
    }
    
    saveGroupSettings(groupId, groupData);
    return true;
  }

  // Remover reação no grupo
  remove(groupId, name) {
    const nameClean = name.toLowerCase().trim();
    if (!nameClean || !groupId) return false;
    
    const groupData = loadGroupSettings(groupId);
    if (!groupData.nameReactions?.reactions) return false;
    
    if (groupData.nameReactions.reactions[nameClean]) {
      delete groupData.nameReactions.reactions[nameClean];
      
      // Remover do aliasMap
      if (groupData.nameReactions.aliasMap) {
        for (const [alias, target] of Object.entries(groupData.nameReactions.aliasMap)) {
          if (target === nameClean) {
            delete groupData.nameReactions.aliasMap[alias];
          }
        }
      }
      
      saveGroupSettings(groupId, groupData);
      return true;
    }
    return false;
  }

  // Listar reações do grupo
  list(groupId) {
    const groupData = loadGroupSettings(groupId);
    const reactions = groupData.nameReactions?.reactions || {};
    return Object.entries(reactions).map(([name, config]) => ({ name, emoji: config.emoji, enabled: config.enabled !== false }));
  }

  // Status do grupo
  getStatus(groupId) {
    const groupData = loadGroupSettings(groupId);
    const reactions = groupData.nameReactions?.reactions || {};
    return { 
      enabled: groupData.nameReactions?.enabled !== false, 
      totalReactions: Object.keys(reactions).length 
    };
  }
}

export default new NameReactions();
