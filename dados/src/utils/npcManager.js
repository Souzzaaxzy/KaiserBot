// ═══════════════════════════════════════════════════════════════
// 🤖 SISTEMA DE NPCs - GERENCIADOR COMPLETO
// ═══════════════════════════════════════════════════════════════
import { NPC_PERSONALITIES, DEFAULT_ACTIVE_NPC } from './npcPersonalities.js';
import * as ia from '../funcs/private/ia.js';
import fs from 'fs';

const DATABASE_DIR = './dados';
const NPC_CONFIG_FILE = `${DATABASE_DIR}/npc_config.json`;
const NPC_MEMORY_FILE = `${DATABASE_DIR}/npc_memory.json`;

// ═══════════════════════════════════════════════════════════════
// 🎭 NPCS COM PERSONALIDADES E RESPOSTAS
// ═══════════════════════════════════════════════════════════════
const NPC_RESPONSES = {
  kaiser: {
    level_up: [
      "Opa! {user} subiu de level! Agora é level {level} 🎉",
      "{user} tá ficandão forte hein! Level {level} já! 😏",
      "Nada mal {user}! Subiu pro level {level}! 💪"
    ],
    conquista_desbloqueada: [
      "Ooh {user} desbloqueou: {conquest}! 🏆",
      "Isso aí {user}! {conquest} conquistado! 🎊",
      "{user} conseguiu a conquista {conquest}! 👏"
    ],
    pet_adotado: [
      "Aaaw {user} adotou um pet! 🐾",
      "Que fofo {user}! Agora tem um companheiro! 🐱",
      "{user} é o novo tutor de {pet}! 🥰"
    ],
    pet_level_up: [
      "{pet} de {user} subiu de level! {level} 🔥",
      "O {pet} tá evoluindo! Level {level}! ✨",
      "{user} seu pet {pet} tá fortescendo! 💪"
    ],
    pet_derrota: [
      "Aff... {pet} de {user} perdeu... 😢",
      "{user}, {pet} foi derrotado... vai tentar de novo? 💪",
      "O {pet} de {user} não tá tendo sorte hoje... 😅"
    ],
    dungeon_vitoria: [
      "Incrível {user}! Venceu a dungeon {dungeon}! 🏆",
      "Isso aí {user}! Conquistou {dungeon}! 💪",
      "Vencedor! {user} dominou {dungeon}! 🎉"
    ],
    dungeon_derrota: [
      "{user} foi derrotado em {dungeon}... vai tentar de novo? 💪",
      "A dungeon {dungeon} venceu dessa vez... mas você volta! 🔄",
      "{user} não desiste! {dungeon} vai ser sua! 💪"
    ],
    roubar_sucesso: [
      "{user} roubou {amount} de {target}! 💰",
      "Cuidado {target}! {user} te roubou {amount}! 😱",
      "O {user} fez uma limpa em {target}! 💸"
    ],
    roubar_falhou: [
      "{user} tentou roubar {target} mas foi pego! 😂",
      "O plano de {user} falhou... {target} pegou ele! 😅",
      "{target} não caiu nessa! {user} foi flagrado! 📸"
    ],
    cassino_roleta_vitoria: [
      "{user} acertou {result} na roleta! +{amount} 💰",
      "O sorte tá com {user}! {result} saiu! 🎰",
      "{user} tá ganhando na roleta! {result}! ✨"
    ],
    cassino_roleta_perda: [
      "{user} perdeu na roleta... apostou em {bet} 😅",
      "A casa venceu dessa vez! {user} perdeu em {bet} 💸",
      "{user} não teve sorte na roleta... apostou em {bet} 🎲"
    ],
    cassino_slots_jackpot: [
      "JACKPOT! {user} inúmerou {amount} nos slots! 🎰🎰🎰",
      "MEU DEUS! {user} conseguiu {amount} no jackpot! 💎",
      "ISSO É INSANO! {user} ganhou {amount}! 🎰💰"
    ],
    cassino_slots_vitoria: [
      "{user} ganhou {amount} nos slots! 🎰",
      "Slots sortudo! {user} levou {amount}! ✨",
      "{user} tá com a mão quente! +{amount} 🎲"
    ],
    cassino_slots_perda: [
      "{user} perdeu {amount} nos slots... 💸",
      "Os slots não estavam com {user} hoje... perdeu {amount} 🎱",
      "{user} tá devendo pro cassino agora... {amount} 😅"
    ],
    eleicao_candidatura: [
      "{user} entrou na corrida eleitoral! 🗳️",
      "Novo candidato! {user} tá disputando a eleição! 📢",
      "{user} quer ser o líder! Vote nele! 🗳️"
    ],
    novo_alpha: [
      "{user} virou Alpha! 🏆",
      "O novo Alpha é {user}! 👑",
      "{user} está no topo! Alpha confirmado! ⭐"
    ],
    voto_positivo: [
      "{user} recebeu um upvote! 👍",
      "Alguém curtiu o que {user} fez! 💖",
      "{user} tá subindo no ranking! 📈"
    ],
    work_sucesso: [
      "{user} trabalhou e ganhou {amount}! 💼",
      "{user} botou pra trabalhar e faturou {amount}! 💪",
      "Trabalhador! {user} fez {amount}! 💰"
    ],
    crime_sucesso: [
      "{user} assaltou e levou {amount}! 😈",
      "Criminoso! {user} faturou {amount}! 💸",
      "{user} fez uma limpa e conseguiu {amount}! 🦹"
    ],
    crime_falhou: [
      "{user} foi preso! Levaram {amount}... 😱",
      "Ops! {user} foi pego no crime! Perdeu {amount}! 👮",
      "{user} não teve sorte... preso e perdeu {amount}! 🔒"
    ],
    daily_reward: [
      "{user} coletou o daily de {amount}! 🎁",
      "Boa! {user} pegou {amount} do daily! 🌟",
      "{user} tá rico! {amount} no bolso! 💎"
    ],
    compra_loja: [
      "{user} comprou {item}! 🛒",
      "Nova aquisição de {user}: {item}! ✨",
      "{user} fez uma compra: {item}! 🛍️"
    ],
    duelo_vitoria: [
      "{user} venceu o duelo! +{amount} 🏆",
      "Campeão! {user} ganhou {amount} no duelo! 🎉",
      "{user} destruiu o oponente e levou {amount}! 💪"
    ],
    duelo_derrota: [
      "{user} perdeu o duelo para {target}... -{amount} 💀",
      "{target} venceu {user} no duelo! -{amount} 😢",
      "{user} foi destruído no duelo... perdeu {amount}! 💸"
    ],
    transferencia: [
      "{user} transferiu {amount} para {target}! 💸",
      "Pagamento feito! {user} enviou {amount} pra {target}! 🏧",
      "{target} recebeu {amount} de {user}! ✨"
    ],
    pesca_sucesso: [
      "{user} pescou e ganhou {amount}! 🎣",
      "Pescador sortudo! {user} fez {amount}! 🐟",
      "{user} voltou com {amount} da pescaria! 🌊"
    ],
    cacada_sucesso: [
      "{user} caçou e faturou {amount}! 🏹",
      "Caçador! {user} trouxe {amount} da expedição! 🦁",
      "{user} voltou da caça com {amount}! 🎯"
    ],
    fazenda_colheita: [
      "{user} colheu {amount} da fazenda! 🌾",
      "Colheita boa! {user} faturou {amount}! 🌽",
      "{user} fez a fazenda render {amount}! 🚜"
    ],
    forjar_item: [
      "{user} forjou {item}! 🔨",
      "Artesão! {user} criou {item}! ⚔️",
      "{user} saiu da forja com {item}! 🔥"
    ],
    novo_alpha: [
      "{user} virou Alpha! 🏆",
      "O novo Alpha é {user}! 👑",
      "{user} está no topo! Alpha confirmado! ⭐"
    ],
    voto_positivo: [
      "{user} recebeu um upvote! 👍",
      "Alguém curtiu o que {user} fez! 💖",
      "{user} tá subindo no ranking! 📈"
    ],
    default: [
      "Hm... {event} aconteceu com {user} 🌙",
      "Interessante... {user} fez algo 👀",
      "Isso é novo... 👀"
    ]
  },
  luna: {
    level_up: [
      "✨ {user} subiu pro level {level}! Lindo!",
      "{user} tá ficando mais forte! Level {level} 🌟",
      "Estrela em ascensão! {user} chegou no level {level}! ✨"
    ],
    pet_adotado: [
      "Aww {user} adotou um pet! 🐾 Fofo!",
      "{user} tem um novo companheiro agora! 🐱",
      "Alerta de dono de pet! {user} adotou {pet}! 💕"
    ],
    default: [
      "Interesting... 👀",
      "I noticed that! 🌙",
      "Interesting development... ✨"
    ]
  },
  journalist: {
    default: [
      "📰 Notícia: {event} 🌙",
      "📢 Reportando: {event}...",
      "🔔 Atualização: {event}"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// 📊 CONFIGURAÇÕES DOS NPCs
// ═══════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  enabled: false,
  cooldown: 15000, // 15 segundos entre falas
  jornalEnabled: false,
  jornalHour: 20, // 8 da noite
  jornalMinute: 0,
  activeNPCs: ['kaiser'],
  autoRespond: true,
  responseChance: 0.7, // 70% de chance de responder
  useAI: true, // Usar IA para melhorar respostas
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
  } catch (e) {
    console.error('[NPC] Erro ao carregar config:', e.message);
  }
  return { ...DEFAULT_CONFIG };
};

const saveConfig = (config) => {
  try {
    fs.writeFileSync(NPC_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('[NPC] Erro ao salvar config:', e.message);
  }
};

const loadMemory = () => {
  try {
    if (fs.existsSync(NPC_MEMORY_FILE)) {
      const data = fs.readFileSync(NPC_MEMORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    return { recentEvents: [], recentNPCMessages: [] };
  }
  return { recentEvents: [], recentNPCMessages: [] };
};

const saveMemory = (memory) => {
  try {
    fs.writeFileSync(NPC_MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (e) {
    console.error('[NPC] Erro ao salvar memória:', e.message);
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎭 GERENCIADOR DE NPCs
// ═══════════════════════════════════════════════════════════════
class NPCManager {
  constructor() {
    this.config = loadConfig();
    this.memory = loadMemory();
    this.cooldowns = new Map();
    this.jornalTimer = null;
    
    // Inicializa cooldowns
    Object.keys(NPC_RESPONSES).forEach(id => {
      this.cooldowns.set(id, 0);
    });
    
    // Inicializa jornal se ativo
    if (this.config.jornalEnabled) {
      this.initJornal();
    }
  }

  isEnabled() { return this.config.enabled; }
  isAutoRespond() { return this.config.autoRespond !== false; }
  isJornalEnabled() { return this.config.jornalEnabled; }

  canSpeak(npcId) {
    const now = Date.now();
    const lastTime = this.cooldowns.get(npcId) || 0;
    return (now - lastTime) >= this.config.cooldown;
  }

  markSpoken(npcId) {
    this.cooldowns.set(npcId, Date.now());
  }

  // ═══════════════════════════════════════════════════════════════
  // 📰 JORNAL DIÁRIO
  // ═══════════════════════════════════════════════════════════════
  initJornal() {
    if (this.jornalTimer) {
      clearInterval(this.jornalTimer);
    }
    
    // Agenda envio do jornal diariamente
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
        // Repete a cada 24h
        this.jornalTimer = setInterval(() => this.sendJornal(), 24 * 60 * 60 * 1000);
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
    const recentEvents = this.memory.recentEvents?.filter(e => 
      new Date(e.time || e.data).toDateString() === today
    ) || [];
    
    if (recentEvents.length === 0) return null;
    
    // Selecionar NPC journalist
    const npc = NPC_PERSONALITIES.journalist || NPC_PERSONALITIES.kaiser;
    
    // Resumo dos eventos
    const eventsSummary = recentEvents.slice(-10).map(e => 
      `- ${e.description || e.desc || 'Evento'}`
    ).join('\n');
    
    // Tentar gerar com IA
    if (this.config.useAI) {
      try {
        const prompt = `Crie o KAISER NEWS diário com base nestes eventos de HOJE:

${eventsSummary}

Data: ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}

Formato:
📰 *KAISER NEWS - [data]*

[Bom dia/tarde/noite]

[Resumo dos principais eventos em formato de jornal - 3 a 5 manchetes]

[Encerramento]

Use tom jornalístico mas descontraído. Máximo 500 caracteres.`;
        
        const response = await ia.makeCognimaRequest(
          'moonshotai/kimi-k2.6',
          prompt,
          npc.personalidade || 'Você é Kaiser, uma vampira moderna que gosta de tecnologia e redes sociais.',
          [],
          2
        );
        
        const content = response?.data?.choices?.[0]?.message?.content?.trim();
        if (content && content.length <= 600) {
          return content;
        }
      } catch (e) {
        console.warn('[NPC] Erro ao gerar jornal com IA:', e.message);
      }
    }
    
    // Fallback: template simples
    return `📰 *KAISER NEWS - ${new Date().toLocaleDateString('pt-BR')}*

Bom dia! Aqui está o resumo dos acontecimentos de hoje:

${eventsSummary}

Isso é tudo por hoje! 🌙`;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 MÉTODO PRINCIPAL: Registrar evento E fazer NPC responder
  // ═══════════════════════════════════════════════════════════════
  async trigger(nazu, from, eventType, userId, userName, eventData = {}) {
    if (!this.isEnabled()) return null;
    
    // Chance de resposta
    if (Math.random() > this.config.responseChance) {
      return null;
    }

    // Seleciona NPC ativo
    const activeNPCs = this.config.activeNPCs || ['kaiser'];
    const npcId = activeNPCs[Math.floor(Math.random() * activeNPCs.length)];

    // Verifica cooldown
    if (!this.canSpeak(npcId)) return null;

    // Prepara dados para substituição
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
      event: eventType
    };

    // Gera resposta
    let response = await this.generateResponse(npcId, eventType, replacements);

    if (response) {
      // Marca que NPC falou
      this.markSpoken(npcId);
      
      // Salva no histórico para evitar duplicatas
      this.memory.recentNPCMessages = this.memory.recentNPCMessages || [];
      this.memory.recentNPCMessages.push({
        type: eventType,
        userId,
        time: Date.now()
      });
      
      // Mantém só últimos 50
      if (this.memory.recentNPCMessages.length > 50) {
        this.memory.recentNPCMessages = this.memory.recentNPCMessages.slice(-50);
      }
      
      // Salva evento no histórico
      this.memory.recentEvents = this.memory.recentEvents || [];
      this.memory.recentEvents.push({
        type: eventType,
        userId,
        userName: userName || userId.split('@')[0],
        description: response,
        time: Date.now(),
        data: eventData
      });
      
      if (this.memory.recentEvents.length > 100) {
        this.memory.recentEvents = this.memory.recentEvents.slice(-100);
      }
      
      saveMemory(this.memory);

      // Envia resposta
      try {
        await nazu.sendMessage(from, { text: response });
        console.log(`[NPC] ${npcId} respondeu: ${response.substring(0, 50)}...`);
        return response;
      } catch (e) {
        console.error('[NPC] Erro ao enviar:', e.message);
      }
    }

    return null;
  }

  // Alias para compatibility
  async triggerFromSystem(nazu, from, eventType, userId, description, metadata = {}) {
    const userName = metadata.userName || userId.split('@')[0];
    const eventData = {
      targetName: metadata.targetName,
      amount: metadata.amount,
      level: metadata.level,
      petName: metadata.petName,
      dungeonName: metadata.dungeonName,
      conquestName: metadata.conquestName,
      result: metadata.result,
      bet: metadata.bet
    };
    return await this.trigger(nazu, from, eventType, userId, userName, eventData);
  }

  // Alias antigo para compatibilidade
  recordEvent(type, userId, description, metadata = {}) {
    this.memory.recentEvents = this.memory.recentEvents || [];
    this.memory.recentEvents.push({
      type,
      userId,
      description,
      time: Date.now(),
      data: metadata
    });
    if (this.memory.recentEvents.length > 100) {
      this.memory.recentEvents = this.memory.recentEvents.slice(-100);
    }
    saveMemory(this.memory);
    return { type, userId, description };
  }

  // ═══════════════════════════════════════════════════════════════
  // 💬 GERAR RESPOSTA (Template + IA)
  // ═══════════════════════════════════════════════════════════════
  async generateResponse(npcId, eventType, replacements) {
    const npcResponses = NPC_RESPONSES[npcId] || NPC_RESPONSES.kaiser;
    const npcConfig = this.config.personalities?.[npcId] || NPC_PERSONALITIES[npcId];
    
    let templates;
    
    // Procura templates específicos
    if (npcResponses[eventType]) {
      templates = npcResponses[eventType];
    } else if (eventType.includes('level')) {
      templates = npcResponses.level_up || npcResponses.default;
    } else if (eventType.includes('pet') && eventType.includes('level')) {
      templates = npcResponses.pet_level_up || npcResponses.pet_adotado || npcResponses.default;
    } else if (eventType.includes('pet') && eventType.includes('derrot')) {
      templates = npcResponses.pet_derrota || npcResponses.default;
    } else if (eventType.includes('pet')) {
      templates = npcResponses.pet_adotado || npcResponses.default;
    } else if (eventType.includes('conqu')) {
      templates = npcResponses.conquista_desbloqueada || npcResponses.default;
    } else if (eventType.includes('roubar') || eventType.includes('roubo')) {
      templates = eventType.includes('falhou') ? npcResponses.roubar_falhou : npcResponses.roubar_sucesso;
    } else if (eventType.includes('cassino') || eventType.includes('slot') || eventType.includes('roleta')) {
      if (eventType.includes('jackpot')) templates = npcResponses.cassino_slots_jackpot;
      else if (eventType.includes('vitori')) templates = npcResponses.cassino_slots_vitoria;
      else if (eventType.includes('perda')) templates = npcResponses.cassino_slots_perda;
      else templates = npcResponses.cassino_slots_vitoria;
    } else if (eventType.includes('dungeon')) {
      templates = eventType.includes('vitori') ? npcResponses.dungeon_vitoria : npcResponses.dungeon_derrota;
    } else if (eventType.includes('alpha')) {
      templates = npcResponses.novo_alpha || npcResponses.default;
    } else if (eventType.includes('voto')) {
      templates = npcResponses.voto_positivo || npcResponses.default;
    } else if (eventType.includes('eleicao') || eventType.includes('candidatura')) {
      templates = npcResponses.eleicao_candidatura || npcResponses.default;
    } else {
      templates = npcResponses.default;
    }
    
    // Seleciona template aleatório
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Substitui placeholders
    let response = template;
    for (const [key, value] of Object.entries(replacements)) {
      response = response.replace(new RegExp(`{${key}}`, 'gi'), value);
    }
    
    // Tenta melhorar com IA (opcional)
    if (this.config.useAI && Math.random() < 0.5) {
      try {
        const aiResponse = await this.enhanceWithAI(response, eventType, npcConfig);
        if (aiResponse && aiResponse !== response && aiResponse.length <= 150) {
          return aiResponse;
        }
      } catch (e) {
        // Falhou IA, usa template direto
      }
    }
    
    return response;
  }

  // Melhora resposta com IA usando a personalidade do NPC
  async enhanceWithAI(baseResponse, eventType, npcConfig) {
    try {
      const personality = npcConfig?.personalidade || NPC_PERSONALITIES.kaiser.personalidade;
      
      const prompt = `Melhore esta mensagem de NPC de forma natural (máx 120 caracteres):
"${baseResponse}"
Evento: ${eventType}

Retorne apenas a mensagem melhorada, sem explicações. Use a personalidade do NPC.`;
      
      const response = await ia.makeCognimaRequest(
        'moonshotai/kimi-k2.6',
        prompt,
        personality,
        [],
        1
      );
      
      const content = response?.data?.choices?.[0]?.message?.content?.trim();
      if (content && content.length <= 150) {
        return content;
      }
    } catch (e) {
      // Silent fail
    }
    return baseResponse;
  }

  // ═══════════════════════════════════════════════════════════════
  // ⚙️ COMANDOS ADMINISTRATIVOS
  // ═══════════════════════════════════════════════════════════════
  toggle(enabled) {
    this.config.enabled = enabled;
    saveConfig(this.config);
    return enabled ? '✅ NPCs ativados!' : '❌ NPCs desativados!';
  }

  setCooldown(seconds) {
    this.config.cooldown = seconds * 1000;
    saveConfig(this.config);
    return `⏱️ Cooldown definido para ${seconds}s!`;
  }

  setResponseChance(chance) {
    this.config.responseChance = Math.min(1, Math.max(0, chance));
    saveConfig(this.config);
    return `🎯 Chance de resposta: ${Math.round(this.config.responseChance * 100)}%`;
  }

  toggleJornal(enabled) {
    this.config.jornalEnabled = enabled;
    saveConfig(this.config);
    
    if (enabled) {
      this.initJornal();
      return '✅ Jornal diário ativado! 📰';
    } else {
      if (this.jornalTimer) {
        clearInterval(this.jornalTimer);
        this.jornalTimer = null;
      }
      return '❌ Jornal diário desativado!';
    }
  }

  setJornalTime(hour, minute = 0) {
    this.config.jornalHour = hour;
    this.config.jornalMinute = minute;
    saveConfig(this.config);
    
    if (this.config.jornalEnabled) {
      this.initJornal();
    }
    
    return `⏰ Jornal agendado para ${hour}:${minute.toString().padStart(2, '0')}!`;
  }

  getStatus() {
    return {
      ativo: this.config.enabled,
      autoRespond: this.isAutoRespond(),
      cooldown: `${this.config.cooldown / 1000}s`,
      chance: `${Math.round(this.config.responseChance * 100)}%`,
      jornal: this.config.jornalEnabled ? `Ativo (${this.config.jornalHour}:${(this.config.jornalMinute || 0).toString().padStart(2, '0')})` : 'Inativo',
      useAI: this.config.useAI ? 'Sim' : 'Não',
      eventos: this.memory.recentEvents?.length || 0,
      personalities: Object.keys(this.config.personalities || NPC_PERSONALITIES)
    };
  }
}

// Instância única
const npcManager = new NPCManager();
export default npcManager;
export { NPCManager, NPC_RESPONSES, NPC_PERSONALITIES };