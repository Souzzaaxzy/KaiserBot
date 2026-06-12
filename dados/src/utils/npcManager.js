// ═══════════════════════════════════════════════════════════════
// 🤖 SISTEMA DE NPCs - 10 FRASES POR EVENTO (TOTAL: 240 frases)
// ═══════════════════════════════════════════════════════════════
import { NPC_PERSONALITIES } from './npcPersonalities.js';
import fs from 'fs';

const DATABASE_DIR = './dados';
const NPC_CONFIG_FILE = `${DATABASE_DIR}/npc_config.json`;
const NPC_MEMORY_FILE = `${DATABASE_DIR}/npc_memory.json`;
const NPC_EVENTS_FILE = `${DATABASE_DIR}/npc_events.json`;

// ═══════════════════════════════════════════════════════════════
// 📊 10 FRASES PARA CADA EVENTO (TODOS OS EVENTOS DO BOT)
// ═══════════════════════════════════════════════════════════════
const ALL_EVENTS = {
  // ═══════════════════════════════════════════════════════════════
  // 🎮 CASSINO
  // ═══════════════════════════════════════════════════════════════
  cassino_roleta_vitoria: {
    templates: [
      "{user} acertou {result} na roleta! +{amount} 💰",
      "Sortudo! {result} saiu! {user} ganhou {amount}! 🎰",
      "{user} tá em alta! {result}! +{amount} ✨",
      "DEU CERTO! {user} ganhou {amount} na roleta! 🎰",
      "{user} tá com sorte! Acertou {result}! +{amount}! 💎",
      "Roleta sortuda! {user} levou {amount}! 🎰",
      "{user} é sortudo mesmo! {result} saiu! {amount}! ✨",
      "VITÓRIA! {user} ganhou {amount}! {result}! 🏆",
      "{user} tá ganhando! {result} saiu! +{amount}! 🎲",
      "ACERTOU! {user} fez {amount}! {result}! 💰"
    ],
    keywords: ['roleta', 'acertou', 'sorte']
  },

  cassino_roleta_perda: {
    templates: [
      "{user} perdeu na roleta... apostou em {bet} 💸",
      "A casa venceu! {user} perdeu em {bet}! 🎲",
      "{user} não teve sorte... {bet}! 😢",
      "Aff... {user} perdeu na roleta! 💸",
      "{user} apostou em {bet} e perdeu! 😱",
      "Roleta traiçoeira! {user} perdeu! 💀",
      "{user} tá devendo pro cassino! {bet}! 😅",
      "DEU RUIM! {user} perdeu {bet}! 💸",
      "{user} não acertou {bet}! 😢",
      "Roleta cruel! {user} perdeu! 💸"
    ],
    keywords: ['roleta', 'perdeu', 'perda']
  },

  cassino_slots_vitoria: {
    templates: [
      "{user} ganhou {amount} nos slots! 🎰",
      "Slots sortudo! {user} levou {amount}! ✨",
      "{user} tá com a mão quente! +{amount} 🎲",
      "DEU CERTO! {user} ganhou {amount}! 🎰",
      "{user} tá lucrando! {amount}! 💰",
      "Slots nice! {user} fez {amount}! 🎰",
      "{user} tá on fire! +{amount}! 🔥",
      "Vitória nos slots! {user} {amount}! ✨",
      "{user} ganhou no slot! {amount}! 🎲",
      "DEU BOM! {user} levou {amount}! 💎"
    ],
    keywords: ['slots', 'ganhou', 'vitoria']
  },

  cassino_slots_jackpot: {
    templates: [
      "JACKPOT! {user} algunstra {amount}! 🎰🎰🎰",
      "MEU DEUS! {user} conseguiu {amount}! 💎",
      "INSANO! {user} ganhou {amount} no jackpot! 🎰💰",
      "{user} hit the JACKPOT! {amount}! 🎰🎰🎰",
      "LIT! {user} algunstra {amount}! 🔥🔥🔥",
      "JACKPOT! {user} tá bilionário! {amount}! 💰",
      "DEU JACKPOT! {user} {amount}! 🎰💎",
      "{user} é sortudo demais! {amount}! 🎰",
      "JACKPOT SENTOU! {user} {amount}! 🔥",
      "MEGA JACKPOT! {user} {amount}! 💰🎰"
    ],
    keywords: ['jackpot', 'slots', 'premio']
  },

  cassino_slots_perda: {
    templates: [
      "{user} perdeu {amount} nos slots... 💸",
      "Slots traiçoeiros! {user} perdeu {amount}! 🎱",
      "{user} tá devendo pro cassino... {amount} 😅",
      "DEU RUIM! {user} perdeu {amount}! 🎰",
      "{user} não teve sorte nos slots! 💸",
      "Slots heartless! {user} perdeu {amount}! 💀",
      "{user} tá quebrado! {amount}! 📉",
      "DEU MAL! {user} perdeu nos slots! 😱",
      "{user} não ganhou nada! {amount}! 💸",
      "Slots cold! {user} perdeu {amount}! ❄️"
    ],
    keywords: ['slots', 'perdeu', 'perda']
  },

  // ═══════════════════════════════════════════════════════════════
  // 📈 PROGRESSÃO
  // ═══════════════════════════════════════════════════════════════
  level_up: {
    templates: [
      "{user} subiu de level! Agora é level {level} 🎉",
      "{user} tá ficandão forte! Level {level}! 💪",
      "Power up! {user} chegou no level {level}! ⚡",
      "{user} level up! {level}! 🔥",
      "Subiu mais um! {user} level {level}! ⬆️",
      "{user} tá evolutionando! {level}! ✨",
      "Mais força! {user} level {level}! 💪",
      "{user} no próximo nível! {level}! 🎯",
      "Up up! {user} é level {level}! 📈",
      "{user} tá ficando perigoso! {level}! ⚠️"
    ],
    keywords: ['subiu', 'level up', 'subiu de nível']
  },

  conquista_desbloqueada: {
    templates: [
      "{user} desbloqueou: {conquest}! 🏆",
      "Conquista! {user} conseguiu {conquest}! 🎊",
      "{user} é o dono de {conquest}! 👏",
      "OOOH! {user} unlocked {conquest}! 🏆",
      "Conquista rara! {user} {conquest}! 💎",
      "{user} conseguiu algo! {conquest}! 🎉",
      "Achievement! {user} {conquest}! 🏅",
      "{user} é top! {conquest}! ⭐",
      "DEU SHOW! {user} desbloqueou {conquest}! 💪",
      "{user} tá de parabéns! {conquest}! 🎊"
    ],
    keywords: ['conquista', 'achievement', 'desbloqueou']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🏰 DUNGEON
  // ═══════════════════════════════════════════════════════════════
  dungeon_vitoria: {
    templates: [
      "Incrível! {user} venceu {dungeon}! 🏆",
      "Conquistador! {user} dominou {dungeon}! 💪",
      "Vencedor! {user} limpou {dungeon}! 🎉",
      "{user} cleared {dungeon}! 🏆",
      "Boss defeated! {user} {dungeon}! ⚔️",
      "{user} dominou a dungeon! {dungeon}! 🏅",
      "Herói! {user} venceu {dungeon}! 🗡️",
      "{user} é lenda! Conquistou {dungeon}! 🏆",
      "Dungeon limpa! {user} {dungeon}! ✅",
      "{user} no topo! Venceu {dungeon}! 👑"
    ],
    keywords: ['dungeon', 'venceu', 'conquistou']
  },

  dungeon_derrota: {
    templates: [
      "{user} foi derrotado em {dungeon}... 💪",
      "{dungeon} venceu {user} dessa vez! 🔄",
      "{user} volta pra {dungeon} em breve! 💪",
      "Aff... {user} perdeu! {dungeon}! 💀",
      "{user} não venceu {dungeon}! 😢",
      "Dungeon too strong! {user}! 😱",
      "{user} foi KOed! {dungeon}! 🥊",
      "DEU RUIM! {user} perdeu! {dungeon}! 💸",
      "{dungeon} é forte! {user} perdeu! 😢",
      "{user} tá fora! {dungeon}! 💪"
    ],
    keywords: ['dungeon', 'derrotado', 'morreu']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🐾 PETS
  // ═══════════════════════════════════════════════════════════════
  pet_adotado: {
    templates: [
      "{user} adotou um pet! 🐾",
      "Novo amigo! {user} tem {pet} agora! 🐱",
      "{user} é o novo tutor de {pet}! 🥰",
      "{user} gained a companion! {pet}! 🐕",
      "Adoção confirmada! {user} + {pet}! 🐾",
      "{user} tem um novo buddy! {pet}! 🐶",
      "{pet} encontrou um lar! {user}! 🏠",
      "{user} resgatou {pet}! ❤️",
      "Pet novo! {user} é dono de {pet}! 🐾",
      "{user} adoptou! {pet}! 🐱"
    ],
    keywords: ['adotou', 'pet', 'companheiro']
  },

  pet_level_up: {
    templates: [
      "{pet} de {user} tá evoluindo! Level {level}! ✨",
      "{user} seu pet {pet} subiu! Level {level}! 💪",
      "{pet} tá fortescendo! {user} level {level}! 🔥",
      "{pet} UP! {user} level {level}! ⬆️",
      "Evoluiu! {pet} de {user} level {level}! 🦋",
      "{pet} tá mais forte! {user} {level}! 💪",
      "Power up! {pet} {user} level {level}! ⚡",
      "{pet} de {user} éggz! {level}! 🏆",
      "Evoluindo! {pet} {user} {level}! ✨",
      "{pet} tá evoluindo! {user} {level}! 🐣"
    ],
    keywords: ['pet', 'level up', 'evoluiu']
  },

  pet_derrota: {
    templates: [
      "Aff... {pet} de {user} perdeu... 😢",
      "{user}, {pet} foi derrotado! Vai tentar de novo? 💪",
      "{pet} de {user} não teve sorte hoje... 😅",
      "Pet down! {pet} {user}! 😢",
      "{pet} de {user} foi embora... 💀",
      "Pet knoc ked out! {pet} {user}! 🥊",
      "Aff... {pet}输了! {user}! 😢",
      "{pet} de {user} tá fora! 💸",
      "Pet KO! {pet} {user}! 😵",
      "{user} seu {pet} perdeu! 😢"
    ],
    keywords: ['pet', 'derrotado', 'perdeu']
  },

  // ═══════════════════════════════════════════════════════════════
  // 💰 ROUBO
  // ═══════════════════════════════════════════════════════════════
  roubar_sucesso: {
    templates: [
      "{user} roubou {amount} de {target}! 💰",
      "Cuidado {target}! {user} te roubou {amount}! 😱",
      "O {user} fez uma limpa em {target}! 💸",
      "LADRÃO! {user} levou {amount}! 💰",
      "{user} assaltou {target}! {amount}! 😈",
      "DEU CERTO! {user} roubou {amount}! 💸",
      "{target} perdeu {amount}! {user} levou! 😱",
      "CRIMINOSO! {user} fez {amount}! 💰",
      "{user} é o bicho! Roubou {target}! 💸",
      "LIMPEZA! {user} levou {amount}! 💰"
    ],
    keywords: ['roubou', 'assaltou', 'sucesso']
  },

  roubar_falhou: {
    templates: [
      "{user} tentou roubar {target} mas foi pego! 😂",
      "O plano de {user} falhou... {target} pegou ele! 😅",
      "{target} não caiu nessa! {user} foi flagrado! 📸",
      "PEGOU! {user} tentou roubar e falhou! 😂",
      "{target} é esperto! {user} não conseguiu! 😅",
      "DEU RUIM! {user} foi pego! 💀",
      "{target} ficou esperto! {user} falhou! 😂",
      "PLANO FALHOU! {user} foi pego! 💸",
      "{user} não conseguiu! {target} venceu! 😱",
      "DEU MAL! {user} foi flagrado! 📸"
    ],
    keywords: ['roubou', 'falhou', 'pego']
  },

  // ═══════════════════════════════════════════════════════════════
  // 👑 SOCIAL
  // ═══════════════════════════════════════════════════════════════
  novo_alpha: {
    templates: [
      "{user} virou Alpha! 🏆",
      "O novo Alpha é {user}! 👑",
      "{user} está no topo! Alpha confirmado! ⭐",
      "ALPHA NOVO! {user} é o rei! 👑",
      "{user} tá no topo! Alpha! 🏆",
      "O BRABO! {user} Alpha! 💪",
      "ALPHA! {user} chegou! 👑",
      "{user} é o líder agora! ⭐",
      "TOP DEMAIS! {user} Alpha! 🏆",
      "{user} tá on top! Alpha! 👑"
    ],
    keywords: ['alpha', 'novo líder', 'promovido']
  },

  eleicao_candidatura: {
    templates: [
      "{user} entrou na corrida eleitoral! 🗳️",
      "Novo candidato! {user} quer ser líder! 📢",
      "{user} tá na eleição! Vote nele! 🗳️",
      "CANDIDATO! {user} quer poder! 👑",
      "{user} tá correndo! Eleição! 🗳️",
      "DEU NOVO! {user} candidato! 💪",
      "{user} quer ser o jefe! 🗳️",
      "ELEIÇÃO! {user} tá na corrida! 📢",
      "{user} tá candidate! Vote! 🗳️",
      "NOVO CANDIDATO! {user}! 👑"
    ],
    keywords: ['candidatura', 'candidato', 'eleição']
  },

  voto_positivo: {
    templates: [
      "{user} recebeu um upvote! 👍",
      "Alguém curtiu o que {user} fez! 💖",
      "{user} tá subindo no ranking! 📈",
      "UPVOTE! {user} ganhou! 👍",
      "Curtiram {user}! 💖",
      "{user} tá popular! 👍",
      "DEU LIKE! {user}! 📈",
      "{user} éggz! Upvote! 💖",
      "Alguém curte {user}! 👍",
      "{user} no top! 📈"
    ],
    keywords: ['upvote', 'curtiu', 'voto']
  },

  // ═══════════════════════════════════════════════════════════════
  // 📷 MÍDIA
  // ═══════════════════════════════════════════════════════════════
  foto_enviada: {
    templates: [
      "{user} enviou uma foto! 📷",
      "Nova imagem! {user} mandou! 🖼️",
      "{user} compartilhou algo! 📸",
      "FOTO! {user} mandou! 📷",
      "{user} tá enviando foto! 🖼️",
      "Imagem de {user}! 📷",
      "{user} compartilhou foto! 📸",
      "DEU FOTO! {user}! 🖼️",
      "{user} tá mandando imagem! 📷",
      "FOTO NOVA! {user}! 📸"
    ],
    keywords: ['foto', 'imagem', 'photo']
  },

  video_enviado: {
    templates: [
      "{user} enviou um vídeo! 🎬",
      "Novo vídeo! {user} mandou! 📹",
      "{user} compartilhou! 🎥",
      "VÍDEO! {user} mandou! 🎬",
      "{user} tá enviando vídeo! 📹",
      "Vídeo de {user}! 🎥",
      "{user} compartilhou vídeo! 🎬",
      "DEU VÍDEO! {user}! 📹",
      "{user} tá mandando vídeo! 🎥",
      "VÍDEO NOVO! {user}! 🎬"
    ],
    keywords: ['vídeo', 'video']
  },

  audio_enviado: {
    templates: [
      "{user} enviou um áudio! 🎵",
      "Áudio novo! {user} mandou! 🔊",
      "{user} compartilhou! 🎙️",
      "ÁUDIO! {user} mandou! 🎵",
      "{user} tá enviando áudio! 🔊",
      "Áudio de {user}! 🎙️",
      "{user} compartilhou áudio! 🎵",
      "DEU ÁUDIO! {user}! 🔊",
      "{user} tá mandando áudio! 🎙️",
      "ÁUDIO NOVO! {user}! 🎵"
    ],
    keywords: ['áudio', 'audio', 'nota de voz']
  },

  sticker_enviado: {
    templates: [
      "{user} enviou um sticker! 🎭",
      "Sticker do {user}! 😂",
      "{user} mandou sticker! 💫",
      "STICKER! {user} mandou! 🎭",
      "{user} tá enviando sticker! 😂",
      "Sticker de {user}! 💫",
      "{user} compartilhou sticker! 🎭",
      "DEU STICKER! {user}! 😂",
      "{user} tá mandando sticker! 💫",
      "STICKER NOVO! {user}! 🎭"
    ],
    keywords: ['sticker', 'figurinha']
  },

  documento_enviado: {
    templates: [
      "{user} enviou um documento! 📄",
      "Documento de {user}! 📋",
      "{user} mandou arquivo! 📎",
      "ARQUIVO! {user} mandou! 📄",
      "{user} tá enviando documento! 📋",
      "Documento novo! {user}! 📎",
      "{user} compartilhou arquivo! 📄",
      "DEU ARQUIVO! {user}! 📋",
      "{user} tá mandando documento! 📎",
      "DOCUMENTO NOVO! {user}! 📄"
    ],
    keywords: ['documento', 'arquivo', 'pdf']
  },

  link_compartilhado: {
    templates: [
      "{user} compartilhou um link! 🔗",
      "Link de {user}! 🌐",
      "{user} mandou algo! 🔗",
      "LINK! {user} mandou! 🌐",
      "{user} tá compartilhando link! 🔗",
      "Link de {user}! 🌐",
      "{user} compartilhou link! 🔗",
      "DEU LINK! {user}! 🌐",
      "{user} tá mandando link! 🔗",
      "LINK NOVO! {user}! 🌐"
    ],
    keywords: ['link', 'http', 'www']
  },

  // ═══════════════════════════════════════════════════════════════
  // 💬 INTERAÇÃO
  // ═══════════════════════════════════════════════════════════════
  mensagem_enviada: {
    templates: [
      "{user} tá ativo! 💬",
      "Algo aconteceu... 👀",
      "{user} não para! 💪",
      "{user} tá na vibe! ✨",
      "Algo de interessante... 👀",
      "{user} tá movimentando! 📈",
      "{user} tá causando! 😏",
      "{user} tá na correria! 🔥",
      "Algo está rolando! 🌟",
      "{user} tá agindo! 💪"
    ],
    keywords: []
  },

  // DEFAULT - para eventos não mapeados
  default: {
    templates: [
      "Hm... {user} fez algo 🌙",
      "Interessante... {user} 👀",
      "Isso é novo... {event} 👀",
      "Algo aconteceu... 🌟",
      "{user} não para! 💪",
      "Interessante! 🌙",
      "Algo rolando... 👀",
      "{user} tá causando! ✨",
      "Isso é diferente... 👀",
      "Hm... {user} 👀"
    ],
    keywords: []
  }
};

// ═══════════════════════════════════════════════════════════════
// 📊 CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  enabled: false,
  cooldown: 8000,
  jornalEnabled: false,
  jornalHour: 20,
  jornalMinute: 0,
  activeNPCs: ['kaiser'],
  autoRespond: true,
  responseChance: 0.5,
  useAI: true,
  logAllEvents: true,
  respondToAll: true,
  maxEventsPerMinute: 10,
  personalities: NPC_PERSONALITIES
};

// ═══════════════════════════════════════════════════════════════
// 💾 FUNÇÕES DE PERSISTÊNCIA
// ═══════════════════════════════════════════════════════════════
const loadConfig = () => {
  try {
    if (fs.existsSync(NPC_CONFIG_FILE)) {
      const data = fs.readFileSync(NPC_CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) { console.error('[NPC] Erro ao carregar config:', e.message); }
  return { ...DEFAULT_CONFIG };
};

const saveConfig = (config) => {
  try {
    fs.writeFileSync(NPC_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (e) { console.error('[NPC] Erro ao salvar config:', e.message); }
};

const loadMemory = () => {
  try {
    if (fs.existsSync(NPC_MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(NPC_MEMORY_FILE, 'utf-8'));
    }
  } catch (e) { }
  return { recentEvents: [], eventCounts: {}, recentNPCMessages: [] };
};

const saveMemory = (memory) => {
  try {
    fs.writeFileSync(NPC_MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (e) { console.error('[NPC] Erro ao salvar memória:', e.message); }
};

const loadEvents = () => {
  try {
    if (fs.existsSync(NPC_EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(NPC_EVENTS_FILE, 'utf-8'));
    }
  } catch (e) { }
  return { allEvents: [] };
};

const saveEvents = (events) => {
  try {
    fs.writeFileSync(NPC_EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (e) { console.error('[NPC] Erro ao salvar eventos:', e.message); }
};

// ═══════════════════════════════════════════════════════════════
// 🎭 GERENCIADOR DE NPCs
// ═══════════════════════════════════════════════════════════════
class NPCManager {
  constructor() {
    this.config = loadConfig();
    this.memory = loadMemory();
    this.events = loadEvents();
    this.cooldowns = new Map();
    this.eventCounts = {};
    this.lastMinuteEvents = [];
    
    Object.keys(ALL_EVENTS).forEach(id => {
      this.cooldowns.set(id, 0);
    });
    
    if (this.config.jornalEnabled) {
      this.initJornal();
    }
  }

  isEnabled() { return this.config.enabled; }
  isAutoRespond() { return this.config.autoRespond !== false; }

  canSpeak(npcId = 'kaiser') {
    const now = Date.now();
    const lastTime = this.cooldowns.get(npcId) || 0;
    return (now - lastTime) >= this.config.cooldown;
  }

  markSpoken(npcId = 'kaiser') {
    this.cooldowns.set(npcId, Date.now());
  }

  canTrigger() {
    const now = Date.now();
    this.lastMinuteEvents = this.lastMinuteEvents.filter(t => now - t < 60000);
    
    if (this.lastMinuteEvents.length >= this.config.maxEventsPerMinute) {
      return false;
    }
    
    this.lastMinuteEvents.push(now);
    return true;
  }

  async trigger(nazu, from, eventType, userId, userName, eventData = {}) {
    if (!this.isEnabled()) return null;
    if (!this.canTrigger()) return null;
    
    if (Math.random() > this.config.responseChance) return null;
    
    const npcId = 'kaiser';
    if (!this.canSpeak(npcId)) return null;

    const replacements = {
      user: userName || userId.split('@')[0],
      target: eventData.targetName || 'alguém',
      amount: eventData.amount ? eventData.amount.toLocaleString() : '0',
      level: eventData.level || '?',
      pet: eventData.petName || 'pet',
      dungeon: eventData.dungeonName || 'dungeon',
      conquest: eventData.conquestName || 'conquista',
      result: eventData.result || '?',
      bet: eventData.bet || '?',
      event: eventType,
      item: eventData.item || 'item',
      streak: eventData.streak || '?',
      newnick: eventData.newnick || '?'
    };

    let response = this.generateResponse(eventType, replacements);

    if (response) {
      this.markSpoken(npcId);
      
      this.memory.recentNPCMessages = this.memory.recentNPCMessages || [];
      this.memory.recentNPCMessages.push({ type: eventType, userId, time: Date.now() });
      if (this.memory.recentNPCMessages.length > 50) {
        this.memory.recentNPCMessages = this.memory.recentNPCMessages.slice(-50);
      }
      
      this.memory.recentEvents = this.memory.recentEvents || [];
      this.memory.recentEvents.push({ type: eventType, userId, userName, description: response, time: Date.now(), data: eventData });
      if (this.memory.recentEvents.length > 100) {
        this.memory.recentEvents = this.memory.recentEvents.slice(-100);
      }
      
      saveMemory(this.memory);
      
      if (this.config.logAllEvents) {
        this.events.allEvents = this.events.allEvents || [];
        this.events.allEvents.push({ type: eventType, userId, userName, time: Date.now() });
        if (this.events.allEvents.length > 500) {
          this.events.allEvents = this.events.allEvents.slice(-500);
        }
        saveEvents(this.events);
      }

      try {
        await nazu.sendMessage(from, { text: response });
        console.log(`[NPC] ${npcId}: ${response.substring(0, 50)}...`);
        return response;
      } catch (e) {
        console.error('[NPC] Erro ao enviar:', e.message);
      }
    }

    return null;
  }

  async triggerFromSystem(nazu, from, eventType, userId, description, metadata = {}) {
    const userName = metadata.userName || userId.split('@')[0];
    return await this.trigger(nazu, from, eventType, userId, userName, metadata);
  }

  recordEvent(type, userId, description, metadata = {}) {
    this.memory.recentEvents = this.memory.recentEvents || [];
    this.memory.recentEvents.push({ type, userId, description, time: Date.now(), data: metadata });
    if (this.memory.recentEvents.length > 100) {
      this.memory.recentEvents = this.memory.recentEvents.slice(-100);
    }
    saveMemory(this.memory);
    return { type, userId, description };
  }

  generateResponse(eventType, replacements) {
    let eventConfig = ALL_EVENTS[eventType];
    
    if (!eventConfig) {
      const eventTypeLower = eventType.toLowerCase();
      
      for (const [key, config] of Object.entries(ALL_EVENTS)) {
        if (config.keywords && config.keywords.some(k => eventTypeLower.includes(k))) {
          eventConfig = config;
          eventType = key;
          break;
        }
      }
      
      if (!eventConfig) {
        eventConfig = ALL_EVENTS.default;
      }
    }
    
    const templates = eventConfig.templates;
    let template = templates[Math.floor(Math.random() * templates.length)];
    
    let response = template;
    for (const [key, value] of Object.entries(replacements)) {
      response = response.replace(new RegExp(`{${key}}`, 'gi'), value);
    }
    
    return response;
  }

  detectEvent(text, userId, userName) {
    const textLower = text.toLowerCase();
    
    const eventMappings = {
      'subiu de level': 'level_up',
      'level up': 'level_up',
      'subiu para o level': 'level_up',
      'ganhou': 'work_sucesso',
      'trabalhou': 'work_sucesso',
      'daily': 'daily_reward',
      'diário': 'daily_reward',
      'venceu': 'duelo_vitoria',
      'perdeu': 'duelo_derrota',
      'jackpot': 'cassino_slots_jackpot'
    };
    
    for (const [keyword, eventType] of Object.entries(eventMappings)) {
      if (textLower.includes(keyword)) {
        return eventType;
      }
    }
    
    return null;
  }

  initJornal() {
    const scheduleJornal = () => {
      const now = new Date();
      const targetHour = this.config.jornalHour || 20;
      const targetMinute = this.config.jornalMinute || 0;
      
      const nextJornal = new Date();
      nextJornal.setHours(targetHour, targetMinute, 0, 0);
      
      if (nextJornal <= now) {
        nextJornal.setDate(nextJornal.getDate() + 1);
      }
      
      const delay = nextJornal - now;
      console.log(`[NPC] Jornal agendado para ${nextJornal.toLocaleString('pt-BR')}`);
      
      setTimeout(() => {
        this.sendJornal();
        setInterval(() => this.sendJornal(), 24 * 60 * 60 * 1000);
      }, delay);
    };
    
    scheduleJornal();
  }

  async sendJornal() {
    const news = await this.generateDailyNews();
    if (news && global.nazu && global.from) {
      try {
        await global.nazu.sendMessage(global.from, { text: news });
        console.log('[NPC] 📰 Jornal enviado!');
      } catch (e) {
        console.error('[NPC] Erro ao enviar jornal:', e.message);
      }
    }
  }

  async generateDailyNews() {
    const today = new Date().toDateString();
    const todayEvents = (this.events.allEvents || []).filter(e => 
      new Date(e.time).toDateString() === today
    );
    
    if (todayEvents.length === 0) return null;
    
    const eventCounts = {};
    todayEvents.forEach(e => {
      eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
    });
    
    const topEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const eventsSummary = topEvents.map(([type, count], i) => 
      `${i+1}. ${type.replace(/_/g, ' ')} (${count}x)`
    ).join('\n');
    
    return `📰 *KAISER NEWS - ${new Date().toLocaleDateString('pt-BR')}*

Bom dia! Resumo dos eventos de HOJE:

${eventsSummary}

Total: ${todayEvents.length} eventos! 🌙`;
  }

  toggle(enabled) {
    this.config.enabled = enabled;
    saveConfig(this.config);
    return enabled ? '✅ NPCs ativados!' : '❌ NPCs desativados!';
  }

  setCooldown(seconds) {
    this.config.cooldown = seconds * 1000;
    saveConfig(this.config);
    return `⏱️ Cooldown: ${seconds}s`;
  }

  setResponseChance(chance) {
    this.config.responseChance = Math.min(1, Math.max(0, chance));
    saveConfig(this.config);
    return `🎯 Chance: ${Math.round(this.config.responseChance * 100)}%`;
  }

  toggleJornal(enabled) {
    this.config.jornalEnabled = enabled;
    saveConfig(this.config);
    if (enabled) this.initJornal();
    return enabled ? '✅ Jornal ativado!' : '❌ Jornal desativado!';
  }

  getStatus() {
    return {
      ativo: this.config.enabled,
      cooldown: `${this.config.cooldown / 1000}s`,
      chance: `${Math.round(this.config.responseChance * 100)}%`,
      jornal: this.config.jornalEnabled ? 'Ativo' : 'Inativo',
      eventosRegistrados: this.events.allEvents?.length || 0,
      eventosMapeados: Object.keys(ALL_EVENTS).length
    };
  }

  getAllEventTypes() {
    return Object.keys(ALL_EVENTS).filter(k => k !== 'default');
  }
}

const npcManager = new NPCManager();
export default npcManager;
export { NPCManager, ALL_EVENTS };