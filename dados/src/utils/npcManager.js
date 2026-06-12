// ═══════════════════════════════════════════════════════════════
// 🤖 SISTEMA DE NPCs - 100% AUTOMÁTICO
// Captura TODOS os eventos do bot automaticamente
// ═══════════════════════════════════════════════════════════════
import { NPC_PERSONALITIES } from './npcPersonalities.js';
import * as ia from '../funcs/private/ia.js';
import fs from 'fs';

const DATABASE_DIR = './dados';
const NPC_CONFIG_FILE = `${DATABASE_DIR}/npc_config.json`;
const NPC_MEMORY_FILE = `${DATABASE_DIR}/npc_memory.json`;
const NPC_EVENTS_FILE = `${DATABASE_DIR}/npc_events.json`;

// ═══════════════════════════════════════════════════════════════
// 📊 TEMPLATES DE RESPOSTA PARA TODOS OS EVENTOS
// ═══════════════════════════════════════════════════════════════
const ALL_EVENTS = {
  // ═══════════════════════════════════════════════════════════════
  // 💰 ECONOMIA E RPG
  // ═══════════════════════════════════════════════════════════════
  work_sucesso: {
    templates: [
      "{user} trabalha que é uma beleza! +{amount} 💼",
      "{user} botou pra trabalhar e faturou {amount}! 💪",
      "Trabalhador modelo! {user} ganhou {amount}! 💰"
    ],
    keywords: ['trabalhou', 'ganhou', 'trabalhar']
  },
  work_falhou: {
    templates: [
      "{user} tentou trabalhar mas não deu... 😅",
      "O emprego não quis {user} hoje... 💸",
      "{user} ficou sem trabalho... sem grana! 😢"
    ],
    keywords: ['cooldown', 'aguarde', 'precisa esperar']
  },
  crime_sucesso: {
    templates: [
      "{user} assaltou e levou {amount}! 😈",
      "Criminoso profissional! {user} fez {amount}! 💸",
      "{user} fez uma limpa e conseguiu {amount}! 🦹"
    ],
    keywords: ['assaltou', 'sucesso', 'roubou']
  },
  crime_falhou: {
    templates: [
      "{user} foi preso! Levaram {amount}... 👮",
      "Ops! {user} foi pego no crime! Perdeu {amount}! 🔒",
      "{user} não teve sorte... preso e perdeu {amount}! 😱"
    ],
    keywords: ['preso', 'prisão', 'capturado', 'falhou']
  },
  minerar_sucesso: {
    templates: [
      "{user} minerou e achou {amount}! ⛏️",
      "Minerador sortudo! {user} encontrou {amount}! 💎",
      "{user} foi na mina e voltou com {amount}! 🪨"
    ],
    keywords: ['minerou', 'minerar']
  },
  pescar_sucesso: {
    templates: [
      "{user} pescou e ganhou {amount}! 🎣",
      "Pescador profissional! {user} fez {amount}! 🐟",
      "{user} voltou com {amount} da pescaria! 🌊"
    ],
    keywords: ['pescou', 'pescar']
  },
  cacada_sucesso: {
    templates: [
      "{user} caçou e faturou {amount}! 🏹",
      "Caçador de elite! {user} trouxe {amount}! 🦁",
      "{user} voltou da expedição com {amount}! 🎯"
    ],
    keywords: ['caçou', 'caçar', 'hunt']
  },
  daily_reward: {
    templates: [
      "{user} coletou o daily de {amount}! 🎁",
      "Boa! {user} pegou {amount} do daily! 🌟",
      "{user} tá rico hoje! {amount} no bolso! 💎"
    ],
    keywords: ['daily', 'diário', 'recompensa diária']
  },
  streak_bonus: {
    templates: [
      "{user} tá em sequência! +{amount} por streak! 🔥",
      "Streak de {streak} dias! {user} ganhou {amount}! ⭐",
      "{user} não quebra! Bônus de {amount}! 💪"
    ],
    keywords: ['streak', 'sequência', 'consecutivo']
  },
  depositou: {
    templates: [
      "{user} depositou {amount} no banco! 🏦",
      "Poupando! {user} guardou {amount}! 💰",
      "{user} fez um depósito de {amount}! 📈"
    ],
    keywords: ['depositou', 'depósito']
  },
  saque: {
    templates: [
      "{user} sacou {amount} do banco! 💵",
      "{user} resgatou {amount}! 🏧",
      "{user} tirou {amount} da poupança! 💸"
    ],
    keywords: ['sacou', 'saque']
  },
  transferencia_enviada: {
    templates: [
      "{user} enviou {amount} para {target}! 💸",
      "Transferência feita! {user} → {target}: {amount}! 🏧",
      "{target} recebeu {amount} de {user}! ✨"
    ],
    keywords: ['transferiu', 'enviou', 'pix']
  },
  compra_loja: {
    templates: [
      "{user} comprou {item}! 🛒",
      "Nova aquisição! {user} comprou {item}! 🛍️",
      "{user} fez uma compra: {item}! ✨"
    ],
    keywords: ['comprou', 'adquiriu']
  },
  venda_sucesso: {
    templates: [
      "{user} vendeu {item} por {amount}! 💰",
      "Negociação feita! {user} lucrou {amount}! 📈",
      "{user} vendeu {item} e faturou {amount}! 🏪"
    ],
    keywords: ['vendeu', 'venda', 'lucrou']
  },
  fazenda_colheita: {
    templates: [
      "{user} colheu {amount} da fazenda! 🌾",
      "Colheita boa! {user} faturou {amount}! 🌽",
      "{user} fez a fazenda render {amount}! 🚜"
    ],
    keywords: ['colheu', 'colheita', 'coletou']
  },
  plantar_sucesso: {
    templates: [
      "{user} plantou {item}! 🌱",
      "Novo plantio! {user} cultivou {item}! 🌿",
      "{user} plantou e vai colher em breve! 🌻"
    ],
    keywords: ['plantou', 'plantar', 'semeou']
  },
  cozinhar_sucesso: {
    templates: [
      "{user} cozinhou {item}! 🍳",
      "Chef {user} preparou {item}! 🍽️",
      "{user} fez uma receita deliciosa: {item}! 👨‍🍳"
    ],
    keywords: ['cozinhou', 'cozinhar', 'receita']
  },
  forjar_sucesso: {
    templates: [
      "{user} forjou {item}! 🔨",
      "Artesão! {user} criou {item}! ⚔️",
      "{user} saiu da forja com {item}! 🔥"
    ],
    keywords: ['forjou', 'forjar', 'craftou']
  },
  propriedade_comprada: {
    templates: [
      "{user} comprou uma propriedade! 🏠",
      "Investidor! {user} acquired {item}! 🏘️",
      "{user} é dono de {item} agora! 💎"
    ],
    keywords: ['propriedade', 'comprou', 'adquiriu']
  },
  emprestimo: {
    templates: [
      "{user} pegou empréstimo de {amount}! 💳",
      "Devendo! {user} deve {amount} agora! 📉",
      "{user} pediu {amount} emprestado... 🤔"
    ],
    keywords: ['empréstimo', 'pegou', 'dívida']
  },
  aposta_ganhou: {
    templates: [
      "{user} ganhou {amount} na aposta! 🎰",
      "Apostador sortudo! {user} faturou {amount}! 💰",
      "{user} acertou e levou {amount}! 🎲"
    ],
    keywords: ['apostou', 'ganhou', 'acerto']
  },
  aposta_perdeu: {
    templates: [
      "{user} perdeu {amount} na aposta... 💸",
      "A casa venceu! {user} perdeu {amount}! 🎱",
      "{user} não teve sorte... {amount} gone! 😢"
    ],
    keywords: ['apostou', 'perdeu', 'perda']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎮 JOGOS E ENTRETENIMENTO
  // ═══════════════════════════════════════════════════════════════
  level_up: {
    templates: [
      "{user} subiu de level! Agora é level {level} 🎉",
      "{user} tá ficandão forte! Level {level}! 💪",
      "Power up! {user} chegou no level {level}! ⚡"
    ],
    keywords: ['subiu', 'level up', 'subiu de nível']
  },
  conquista_desbloqueada: {
    templates: [
      "{user} desbloqueou: {conquest}! 🏆",
      "Conquista! {user} conseguiu {conquest}! 🎊",
      "{user} é o dono de {conquest}! 👏"
    ],
    keywords: ['conquista', 'achievement', 'desbloqueou']
  },
  pet_adotado: {
    templates: [
      "{user} adotou um pet! 🐾",
      "Novo amigo! {user} tem {pet} agora! 🐱",
      "{user} é o novo tutor de {pet}! 🥰"
    ],
    keywords: ['adotou', 'pet', 'companheiro']
  },
  pet_level_up: {
    templates: [
      "{pet} de {user} tá evoluindo! Level {level}! 🔥",
      "{user} seu pet {pet} subiu! Level {level}! ✨",
      "{pet} tá fortescendo! {user} level {level}! 💪"
    ],
    keywords: ['pet', 'level up', 'evoluiu']
  },
  pet_derrota: {
    templates: [
      "Aff... {pet} de {user} perdeu... 😢",
      "{user}, {pet} foi derrotado! Vai tentar de novo? 💪",
      "{pet} de {user} não teve sorte hoje... 😅"
    ],
    keywords: ['pet', 'derrotado', 'perdeu']
  },
  pet_vitoria: {
    templates: [
      "{pet} de {user} venceu! 🏆",
      "Pet Fighter! {user} é o campeão! 🎉",
      "{pet} de {user} ganhou a batalha! 💪"
    ],
    keywords: ['pet', 'venceu', 'vitória', 'batalha']
  },
  dungeon_vitoria: {
    templates: [
      "Incrível! {user} venceu {dungeon}! 🏆",
      "Conquistador! {user} dominou {dungeon}! 💪",
      "Vencedor! {user} limpou {dungeon}! 🎉"
    ],
    keywords: ['dungeon', 'venceu', 'conquistou']
  },
  dungeon_derrota: {
    templates: [
      "{user} foi derrotado em {dungeon}... 💪",
      "{dungeon} venceu {user} dessa vez! 🔄",
      "{user} volta pra {dungeon} em breve! 💪"
    ],
    keywords: ['dungeon', 'derrotado', 'morreu']
  },
  duelo_vitoria: {
    templates: [
      "{user} venceu o duelo! +{amount} 🏆",
      "Campeão! {user} ganhou {amount}! 🎉",
      "{user} destruiu o oponente! {amount}! 💪"
    ],
    keywords: ['duelo', 'venceu', 'vitória']
  },
  duelo_derrota: {
    templates: [
      "{user} perdeu o duelo para {target}! 💀",
      "{target} humilhou {user} no duelo! 😅",
      "{user} foi destruído... perdeu {amount}! 😢"
    ],
    keywords: ['duelo', 'perdeu', 'derrota']
  },
  quiz_vitoria: {
    templates: [
      "{user} acertou o quiz! 🧠",
      "Gênio! {user} respondeu corretamente! 💡",
      "{user} é o campeão do quiz! 🏆"
    ],
    keywords: ['quiz', 'acertou', 'correto']
  },
  quiz_derrota: {
    templates: [
      "{user} errou o quiz... 😅",
      "Quase! {user} errou essa! 🤔",
      "{user} não sabe essa... próxima vez! 💪"
    ],
    keywords: ['quiz', 'errou', 'incorreto']
  },
  roleta_vitoria: {
    templates: [
      "{user} acertou {result} na roleta! +{amount} 💰",
      "Sortudo! {result} saiu! {user} ganhou {amount}! 🎰",
      "{user} tá em alta! {result}! +{amount} ✨"
    ],
    keywords: ['roleta', 'acertou', 'sorte']
  },
  roleta_perda: {
    templates: [
      "{user} perdeu na roleta... apostou em {result} 💸",
      "A casa venceu! {user} perdeu em {result}! 🎲",
      "{user} não teve sorte... {result}! 😢"
    ],
    keywords: ['roleta', 'perdeu']
  },
  slots_jackpot: {
    templates: [
      "JACKPOT! {user} inúmerou {amount}! 🎰🎰🎰",
      "MEU DEUS! {user} conseguiu {amount}! 💎",
      "INSANO! {user} ganhou {amount} no jackpot! 🎰💰"
    ],
    keywords: ['jackpot', 'slots', 'premio']
  },
  slots_vitoria: {
    templates: [
      "{user} ganhou {amount} nos slots! 🎰",
      "Slots sortudo! {user} levou {amount}! ✨",
      "{user} tá com a mão quente! +{amount} 🎲"
    ],
    keywords: ['slots', 'ganhou']
  },
  slots_perda: {
    templates: [
      "{user} perdeu {amount} nos slots... 💸",
      "Slots traiçoeiros! {user} perdeu {amount}! 🎱",
      "{user} tá devendo pro cassino... {amount} 😅"
    ],
    keywords: ['slots', 'perdeu']
  },
  blackjack_vitoria: {
    templates: [
      "{user} venceu no blackjack! +{amount} 🃏",
      "21! {user} fez blackjack e ganhou {amount}! 🎉",
      "{user} bateu o dealer! +{amount} 💪"
    ],
    keywords: ['blackjack', 'venceu']
  },
  blackjack_perda: {
    templates: [
      "{user} perdeu no blackjack... 💸",
      "Estourou! {user} passou de 21! 😢",
      "{user} não conseguiu contra o dealer! 💀"
    ],
    keywords: ['blackjack', 'perdeu', 'estourou']
  },
  rps_vitoria: {
    templates: [
      "{user} venceu no pedra papel tesoura! ✊",
      "{user} ganhou a partida! 🪨📄✂️",
      "Vitória de {user} no RPS! 💪"
    ],
    keywords: ['rps', 'pedra', 'papel', 'tesoura']
  },
  rps_derrota: {
    templates: [
      "{user} perdeu no RPS... 😢",
      "{user} foi derrotado no pedra papel tesoura! 😅",
      "Próxima vez {user}! 🪨📄✂️"
    ],
    keywords: ['rps', 'perdeu']
  },

  // ═══════════════════════════════════════════════════════════════
  // 👑 SOCIAL E HIERARQUIA
  // ═══════════════════════════════════════════════════════════════
  novo_alpha: {
    templates: [
      "{user} virou Alpha! 🏆",
      "O novo Alpha é {user}! 👑",
      "{user} está no topo! Alpha confirmado! ⭐"
    ],
    keywords: ['alpha', 'novo líder', 'promovido']
  },
  alpha_removido: {
    templates: [
      "{user} perdeu o título de Alpha... 👑",
      "Alpha {user} foi removido do poder! 💔",
      "{user} não é mais Alpha... ⬇️"
    ],
    keywords: ['alpha', 'removido', 'destituido']
  },
  eleicao_candidatura: {
    templates: [
      "{user} entrou na corrida eleitoral! 🗳️",
      "Novo candidato! {user} quer ser líder! 📢",
      "{user} tá na eleição! Vote nele! 🗳️"
    ],
    keywords: ['candidatura', 'candidato', 'eleição']
  },
  eleicao_vitoria: {
    templates: [
      "{user} venceu a eleição! 🏆",
      "Novo líder! {user} ganhou a eleição! 👑",
      "{user} é o povo escolhido! 🗳️"
    ],
    keywords: ['eleição', 'venceu', 'ganhou']
  },
  adm_promovido: {
    templates: [
      "{user} virou administrador! 🔥",
      "{user} tem poder agora! Admin! ⚡",
      "Novo admin! {user} no comando! 💪"
    ],
    keywords: ['admin', 'administrador', 'promoveu']
  },
  adm_removido: {
    templates: [
      "{user} perdeu o cargo de admin... 💔",
      "{user} não é mais admin! ⬇️",
      "{user} foi rebaixado! 😅"
    ],
    keywords: ['admin', 'removido', 'rebaixado']
  },
  membro_novo: {
    templates: [
      "Novo membro! {user} entrou no grupo! 👋",
      "Alguém novo! {user} chegou! 🌟",
      "Bem-vindo {user}! 🎉"
    ],
    keywords: ['entrou', 'novo membro', 'chegou']
  },
  membro_saiu: {
    templates: [
      "{user} saiu do grupo... 👋",
      "Adeus {user}! 😢",
      "{user} partiu... até mais! 💔"
    ],
    keywords: ['saiu', 'partiu', 'foi removido']
  },
  bem_vindo: {
    templates: [
      "Bem-vindo {user}! 🎊",
      "{user} tá entre nós! 👋",
      "Recebendo {user} com carinho! 🌸"
    ],
    keywords: ['bem-vindo', 'welcome', 'boas vindas']
  },
  votacao_criada: {
    templates: [
      "{user} criou uma votação! 🗳️",
      "Hora de votar! {user} iniciou! 📊",
      "Enquete de {user}! Participem! 📢"
    ],
    keywords: ['votação', 'enquete', 'votar']
  },
  voto_positivo: {
    templates: [
      "{user} recebeu um upvote! 👍",
      "Alguém curtiu {user}! 💖",
      "{user} tá subindo no ranking! 📈"
    ],
    keywords: ['upvote', 'curtiu', 'voto']
  },
  voto_negativo: {
    templates: [
      "{user} recebeu um downvote... 👎",
      "Alguém não curtiu {user}... 😢",
      "{user} perdeu pontos... 📉"
    ],
    keywords: ['downvote', 'não curtiu']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🔧 SISTEMA E COMANDOS
  // ═══════════════════════════════════════════════════════════════
  comando_criado: {
    templates: [
      "{user} criou um novo comando! ⚙️",
      "Novo atalho! {user} configurou! 🔧",
      "{user} adicionou um comando personalizado! ✨"
    ],
    keywords: ['comando', 'criou', 'adicionou']
  },
  automidia_adicionada: {
    templates: [
      "{user} adicionou uma auto-mídia! 🖼️",
      "Nova mídia automática! {user} configurou! 📷",
      "{user} criou um trigger de mídia! 🎬"
    ],
    keywords: ['automidia', 'auto', 'mídia']
  },
  auto_resp_adicionada: {
    templates: [
      "{user} adicionou auto-resposta! 💬",
      "Novo gatilho! {user} configurou resposta! 📝",
      "{user} criou uma automação! 🤖"
    ],
    keywords: ['auto resposta', 'automação', 'trigger']
  },
  nickname_alterado: {
    templates: [
      "{user} mudou o nickname! ✏️",
      "Novo nome! {user} alterou! 📝",
      "{user} é conhecido como {newnick} agora! 👀"
    ],
    keywords: ['nickname', 'nome', 'alterou']
  },
  perfil_alterado: {
    templates: [
      "{user} atualizou o perfil! 📸",
      "Novo visual! {user} mudou! 💫",
      "{user} renovou o perfil! ✨"
    ],
    keywords: ['perfil', 'alterou', 'atualizou']
  },
  bio_alterada: {
    templates: [
      "{user} atualizou a bio! ✏️",
      "Nova descrição! {user} mudou! 📝",
      "{user} tem uma nova bio! 👀"
    ],
    keywords: ['bio', 'descrição', 'alterou']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🎉 EVENTOS ESPECIAIS
  // ═══════════════════════════════════════════════════════════════
  sorteio_criado: {
    templates: [
      "{user} criou um sorteio! 🎁",
      "Sorteio no ar! {user} está dando {item}! 🎰",
      "Participem! {user} está sorteando! 🎉"
    ],
    keywords: ['sorteio', 'giveaway', 'sorteando']
  },
  sorteio_vencedor: {
    templates: [
      "{user} venceu o sorteio! 🎉",
      "Sorteudo! {user} ganhou {item}! 🎁",
      "{user} foi o escolhido! 🎊"
    ],
    keywords: ['sorteio', 'vencedor', 'ganhou']
  },
  presente_enviado: {
    templates: [
      "{user} enviou um presente para {target}! 🎁",
      "Generoso! {user} deu {item} para {target}! 💝",
      "{target} recebeu {item} de {user}! 🎀"
    ],
    keywords: ['presente', 'gift', 'enviou']
  },
  desafio_concluido: {
    templates: [
      "{user} completou o desafio! 🏆",
      "Desafiante! {user} venceu! 💪",
      "{user} dominou o desafio! 🎉"
    ],
    keywords: ['desafio', 'completou', 'concluiu']
  },
  missao_concluida: {
    templates: [
      "{user} completou a missão! 🎯",
      "Agente {user} completou a missão! 🕵️",
      "{user} finished a missão! ⭐"
    ],
    keywords: ['missão', 'completou', 'finished']
  },
  evento_especial: {
    templates: [
      "{user} participated de evento especial! 🎊",
      "Evento! {user} tá na vibe! 🎉",
      "{user} aproveitou o evento! ✨"
    ],
    keywords: ['evento', 'especial', 'celebração']
  },
  streak_quebrado: {
    templates: [
      "{user} quebrou o streak de {streak} dias... 💔",
      "Aff... {user} perdeu a sequência... 😢",
      "{user} vai ter que recomeçar... 💪"
    ],
    keywords: ['streak', 'quebrou', 'perdeu']
  },
  primeira_vez: {
    templates: [
      "{user} fez algo pela primeira vez! 🌟",
      "Novato sortsudo! {user} estreou! 🎉",
      "{user} experimentou algo novo! ✨"
    ],
    keywords: ['primeira vez', 'estreou', 'debut']
  },

  // ═══════════════════════════════════════════════════════════════
  // 💎 EVENTOS RAROS E ÚNICOS
  // ═══════════════════════════════════════════════════════════════
  raridade_alta: {
    templates: [
      "{user} encontrou algo raro! 💎",
      "SUPER RARO! {user} encontrou {item}! ✨",
      "{user} teve sorte rara! {item}! 🌟"
    ],
    keywords: ['raro', 'raridade', 'raríssima']
  },
  crafting_raro: {
    templates: [
      "{user} criou algo épico! ⚔️",
      "Craft de elite! {user} fez {item}! 💫",
      "{user} legendary crafted {item}! 🔥"
    ],
    keywords: ['craft', 'épico', 'lendário']
  },
  milestone: {
    templates: [
      "{user} alcançou um marco! 🏆",
      "Marcos alcançados! {user} chegou em {item}! ⭐",
      "{user} está de parabéns! 🎉"
    ],
    keywords: ['marco', 'milestone', 'alcançou']
  },

  // ═══════════════════════════════════════════════════════════════
  // 🔥 EVENTOS NEGATIVOS
  // ═══════════════════════════════════════════════════════════════
  banido: {
    templates: [
      "{user} foi banido do grupo! 🚫",
      "{user} não pode mais ficar... 💔",
      "Adeus {user}! 🚷"
    ],
    keywords: ['banido', 'removido', 'expulso']
  },
  advertencia: {
    templates: [
      "{user} recebeu uma advertência! ⚠️",
      "Cuidado {user}! Está perdendo pontos! 📉",
      "{user} foi avisado! ⏰"
    ],
    keywords: ['advertência', 'aviso', 'warning']
  },
  mute: {
    templates: [
      "{user} foi mutado! 🤫",
      "Silêncio! {user} não pode falar! 🔇",
      "{user} foi calado! 😅"
    ],
    keywords: ['mutado', 'silenciado', 'calado']
  },

  // ═══════════════════════════════════════════════════════════════
  // 📊 INTERAÇÃO GERAL (fallback para tudo)
  // ═══════════════════════════════════════════════════════════════
  mensagem_enviada: {
    templates: [
      "{user} está ativo no grupo! 💬",
      "{user} tá conversando! 👀",
      "Mensagem de {user}! 💬"
    ],
    keywords: []
  },
  foto_enviada: {
    templates: [
      "{user} enviou uma foto! 📷",
      "Nova imagem! {user} mandou! 🖼️",
      "{user} compartilhou algo! 📸"
    ],
    keywords: ['foto', 'imagem', 'photo']
  },
  video_enviado: {
    templates: [
      "{user} enviou um vídeo! 🎬",
      "Novo vídeo! {user} mandou! 📹",
      "{user} compartilhou! 🎥"
    ],
    keywords: ['vídeo', 'video']
  },
  audio_enviado: {
    templates: [
      "{user} enviou um áudio! 🎵",
      "Áudio novo! {user} mandou! 🔊",
      "{user} compartilhou! 🎙️"
    ],
    keywords: ['áudio', 'audio', 'nota de voz']
  },
  sticker_enviado: {
    templates: [
      "{user} enviou um sticker! 🎭",
      "Sticker do {user}! 😂",
      "{user} mandou sticker! 💫"
    ],
    keywords: ['sticker', 'figurinha']
  },
  link_compartilhado: {
    templates: [
      "{user} compartilhou um link! 🔗",
      "Link de {user}! 🌐",
      "{user} mandou algo! 🔗"
    ],
    keywords: ['link', 'http', 'www']
  },
  
  // DEFAULT - para eventos não mapeados
  default: {
    templates: [
      "Hm... {user} fez algo 🌙",
      "Interessante... {user} 👀",
      "Isso é novo... {event} 👀"
    ],
    keywords: []
  }
};

// ═══════════════════════════════════════════════════════════════
// 📊 CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  enabled: false,
  cooldown: 8000, // 8 segundos
  jornalEnabled: false,
  jornalHour: 20,
  jornalMinute: 0,
  activeNPCs: ['kaiser'],
  autoRespond: true,
  responseChance: 0.5, // 50% de chance
  useAI: true,
  logAllEvents: true, // Registrar todos os eventos
  respondToAll: true, // Responder a qualquer mensagem
  maxEventsPerMinute: 10, // Limite de eventos por minuto
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
// 🎭 GERENCIADOR DE NPCs - 100% AUTOMÁTICO
// ═══════════════════════════════════════════════════════════════
class NPCManager {
  constructor() {
    this.config = loadConfig();
    this.memory = loadMemory();
    this.events = loadEvents();
    this.cooldowns = new Map();
    this.eventCounts = {};
    this.lastMinuteEvents = [];
    
    // Inicializa cooldowns
    Object.keys(ALL_EVENTS).forEach(id => {
      this.cooldowns.set(id, 0);
    });
    
    // Inicializa jornal
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

  // Limita eventos por minuto
  canTrigger() {
    const now = Date.now();
    // Limpa eventos velhos (mais de 1 minuto)
    this.lastMinuteEvents = this.lastMinuteEvents.filter(t => now - t < 60000);
    
    if (this.lastMinuteEvents.length >= this.config.maxEventsPerMinute) {
      return false;
    }
    
    this.lastMinuteEvents.push(now);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 MÉTODO PRINCIPAL - Captura qualquer evento automaticamente
  // ═══════════════════════════════════════════════════════════════
  async trigger(nazu, from, eventType, userId, userName, eventData = {}) {
    if (!this.isEnabled()) return null;
    if (!this.canTrigger()) return null;
    
    // Chance de resposta
    if (Math.random() > this.config.responseChance) return null;
    
    const npcId = 'kaiser';
    if (!this.canSpeak(npcId)) return null;

    // Prepara replacements
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

    // Gera resposta
    let response = this.generateResponse(eventType, replacements);

    if (response) {
      this.markSpoken(npcId);
      
      // Salva no histórico
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
      
      // Registra no log de eventos
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

  // Alias para compatibilidade
  async triggerFromSystem(nazu, from, eventType, userId, description, metadata = {}) {
    const userName = metadata.userName || userId.split('@')[0];
    return await this.trigger(nazu, from, eventType, userId, userName, metadata);
  }

  // Alias antigo para compatibilidade
  recordEvent(type, userId, description, metadata = {}) {
    this.memory.recentEvents = this.memory.recentEvents || [];
    this.memory.recentEvents.push({ type, userId, description, time: Date.now(), data: metadata });
    if (this.memory.recentEvents.length > 100) {
      this.memory.recentEvents = this.memory.recentEvents.slice(-100);
    }
    saveMemory(this.memory);
    return { type, userId, description };
  }

  // ═══════════════════════════════════════════════════════════════
  // 💬 GERAR RESPOSTA - Com fallback inteligente
  // ═══════════════════════════════════════════════════════════════
  generateResponse(eventType, replacements) {
    // Procura template específico
    let eventConfig = ALL_EVENTS[eventType];
    
    // Se não encontrou, procura por similaridade
    if (!eventConfig) {
      const eventTypeLower = eventType.toLowerCase();
      
      // Tenta encontrar por palavras-chave
      for (const [key, config] of Object.entries(ALL_EVENTS)) {
        if (config.keywords && config.keywords.some(k => eventTypeLower.includes(k))) {
          eventConfig = config;
          eventType = key;
          break;
        }
      }
      
      // Último recurso: usar default
      if (!eventConfig) {
        eventConfig = ALL_EVENTS.default;
      }
    }
    
    // Seleciona template aleatório
    const templates = eventConfig.templates;
    let template = templates[Math.floor(Math.random() * templates.length)];
    
    // Substitui placeholders
    let response = template;
    for (const [key, value] of Object.entries(replacements)) {
      response = response.replace(new RegExp(`{${key}}`, 'gi'), value);
    }
    
    return response;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔍 DETECTAR EVENTO AUTOMATICAMENTE (por análise de texto)
  // ═══════════════════════════════════════════════════════════════
  detectEvent(text, userId, userName) {
    const textLower = text.toLowerCase();
    
    // Mapeamento de texto para evento
    const eventMappings = {
      'subiu de level': 'level_up',
      'level up': 'level_up',
      'subiu para o level': 'level_up',
      'adicionou': 'comando_criado',
      'criou comando': 'comando_criado',
      'ganhou': 'work_sucesso',
      'trabalhou': 'work_sucesso',
      'minerou': 'minerar_sucesso',
      'pescou': 'pescar_sucesso',
      'caçou': 'cacada_sucesso',
      'daily': 'daily_reward',
      'depositou': 'depositou',
      'sacu': 'saque',
      'transferiu': 'transferencia_enviada',
      'comprou': 'compra_loja',
      'vendeu': 'venda_sucesso',
      'plantou': 'plantar_sucesso',
      'colheu': 'fazenda_colheita',
      'cozinhou': 'cozinhar_sucesso',
      'forjou': 'forjar_sucesso',
      'adotou': 'pet_adotado',
      'venceu': 'duelo_vitoria',
      'perdeu': 'duelo_derrota',
      'assaltou': 'crime_sucesso',
      'preso': 'crime_falhou',
      'vitória': 'level_up',
      'conquista': 'conquista_desbloqueada',
      'desbloqueou': 'conquista_desbloqueada',
      'alpha': 'novo_alpha',
      'eleição': 'eleicao_candidatura',
      'candidatou': 'eleicao_candidatura',
      'votou': 'voto_positivo',
      'jackpot': 'slots_jackpot',
      'roleta': 'roleta_vitoria'
    };
    
    for (const [keyword, eventType] of Object.entries(eventMappings)) {
      if (textLower.includes(keyword)) {
        return eventType;
      }
    }
    
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // 📰 JORNAL DIÁRIO
  // ═══════════════════════════════════════════════════════════════
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
    
    // Conta eventos por tipo
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

// Instância única
const npcManager = new NPCManager();
export default npcManager;
export { NPCManager, ALL_EVENTS };