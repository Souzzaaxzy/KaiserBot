// ═══════════════════════════════════════════════════════════════
// 🏆 HANDLER DE COMANDOS DE FUTEBOL - KAISERBOT
// ═══════════════════════════════════════════════════════════════

import db from './database/index.js';
import { 
  getMenuFut, 
  getEnterMessage, 
  getProfileMessage, 
  getStatsMessage,
  getDivisionsMessage,
  getSkillsMessage,
  getSkillsShopMessage,
  getTopGlobalMessage,
  getClubRankingMessage,
  getClubMessage,
  getProposalMessage,
  getTrainingMessage,
  getX1ChallengeMessage,
  getX1ResultMessage,
  ATTR_NAMES
} from './menu.js';

// Armazena desafios pendentes
const pendingX1 = new Map();

export async function handleFutCommand(args, messageInfo, reply) {
  const { sender, senderName, from, nazu } = messageInfo;
  const command = args[0]?.toLowerCase() || '';
  const subCommand = args[1]?.toLowerCase();
  
  const player = db.getPlayer(sender);
  
  switch (command) {
    // ═══════════════════════════════════════════════════════════════
    // ENTRAR
    // ═══════════════════════════════════════════════════════════════
    case 'entrar':
    case 'registrar':
      if (player) {
        return reply('⚠️ Você já está registrado no sistema de futebol!');
      }
      
      const newPlayer = db.createPlayer(sender, senderName);
      return reply(getEnterMessage(senderName));
    
    // ═══════════════════════════════════════════════════════════════
    // MENU
    // ═══════════════════════════════════════════════════════════════
    case 'menu':
    case 'ajuda':
      return reply(getMenuFut(senderName));
    
    // ═══════════════════════════════════════════════════════════════
    // PERFIL
    // ═══════════════════════════════════════════════════════════════
    case 'perfil':
    case 'profile':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      return reply(getProfileMessage(player));
    
    case 'stats':
    case 'estatisticas':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      return reply(getStatsMessage(player));
    
    // ═══════════════════════════════════════════════════════════════
    // TREINOS
    // ═══════════════════════════════════════════════════════════════
    case 'treinar':
    case 'treino':
    case 'tre':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      
      const validAttrs = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
      const attrName = ATTR_NAMES[subCommand];
      
      if (!attrName) {
        let text = '🏋️ *TREINOS*\n\n⚡ Custo: 30 de energia\n📈 Ganho: 1-3 pontos\n\n';
        
        Object.entries(ATTR_NAMES).forEach(([key, name]) => {
          text += `• !fut tre ${key}\n`;
        });
        
        return reply(text);
      }
      
      const result = db.trainAttribute(sender, subCommand);
      if (!result.success) {
        return reply(`❌ ${result.error}`);
      }
      
      return reply(getTrainingMessage(result));
    
    // ═══════════════════════════════════════════════════════════════
    // DIVISÕES
    // ═══════════════════════════════════════════════════════════════
    case 'divisoes':
    case 'divisao':
    case 'division':
      return reply(getDivisionsMessage());
    
    case 'ranking':
      db.updateGlobalRanking();
      return reply(getTopGlobalMessage());
    
    // ═══════════════════════════════════════════════════════════════
    // HABILIDADES
    // ═══════════════════════════════════════════════════════════════
    case 'habilidades':
    case 'hab':
    case 'skills':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      return reply(getSkillsMessage(player));
    
    case 'loja':
    case 'shop':
      if (subCommand === 'habilidades' || subCommand === 'skills') {
        if (!player) {
          return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
        }
        return reply(getSkillsShopMessage(player));
      }
      return reply('📌 Use: *!fut loja habilidades*');
    
    case 'comprar':
      if (subCommand === 'hab' || subCommand === 'skill') {
        if (!player) {
          return reply('❌ Você não está registrado!');
        }
        
        const skillId = args[2]?.toLowerCase();
        if (!skillId) {
          return reply('📌 Use: *!fut comprar hab [id]*\nEx: *!fut comprar hab 1*');
        }
        
        // Converter ID numérico para nome da habilidade
        const skillMap = {
          '1': 'aprendizado_rapido',
          '2': 'recuperacao_fisica',
          '3': 'competidor',
          '4': 'veterano',
          '5': 'líder',
          '6': 'finalizador',
          '7': 'maestro',
          '8': 'muralha',
          '9': 'reflexo_felino',
          '10': 'drible_mestra'
        };
        
        const skillToBuy = skillMap[skillId] || skillId;
        const buyResult = db.buySkill(sender, skillToBuy);
        
        if (!buyResult.success) {
          return reply(`❌ ${buyResult.error}`);
        }
        
        return reply(`✅ Habilidade adquirida com sucesso!\n\n💪 *${skillToBuy.replace(/_/g, ' ').toUpperCase()}* - Nível ${buyResult.newLevel}`);
      }
      return reply('📌 Use: *!fut comprar hab [id]*');
    
    // ═══════════════════════════════════════════════════════════════
    // X1
    // ═══════════════════════════════════════════════════════════════
    case 'x1':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      
      // Pegar usuário mencionado
      const mentionedX1 = messageInfo.mentionedJid?.[0];
      if (!mentionedX1) {
        return reply('📌 Use: *!fut x1 @usuario*');
      }
      
      if (mentionedX1 === sender) {
        return reply('❌ Você não pode se desafiar!');
      }
      
      const targetPlayer = db.getPlayer(mentionedX1);
      if (!targetPlayer) {
        return reply('❌ Jogador não encontrado!\nUse *!fut entrar* para se registrar.');
      }
      
      // Verificar se já existe desafio pendente
      const existingChallenge = pendingX1.get(`${mentionedX1}_${sender}`);
      if (existingChallenge) {
        return reply('⚠️ Você já tem um desafio pendente com este jogador!');
      }
      
      // Criar desafio
      const match = db.createX1Match(sender, mentionedX1);
      pendingX1.set(`${sender}_${mentionedX1}`, match.id);
      
      return reply(getX1ChallengeMessage(player, targetPlayer, match.id));
    
    case 'aceitarx1':
    case 'ax1':
    case 'aceitar':
      // Buscar desafio pendente usando o banco de dados
      const pendingChallenge = db.getPendingChallengeForPlayer(sender);
      
      if (!pendingChallenge) {
        return reply('❌ Nenhum desafio pendente!\n\nUse *!fut x1 @usuario* para desafiar.');
      }
      
      // Atualizar status para accepted
      pendingChallenge.status = 'accepted';
      db.save();
      
      // Simular partida
      const matchResult = db.simulateX1Match(pendingChallenge.id);
      if (!matchResult) {
        return reply('❌ Erro ao processar partida!');
      }
      
      return reply(getX1ResultMessage(matchResult));
    
    case 'recusarx1':
    case 'rx1':
      const refuseChallenge = db.getPendingChallengeForPlayer(sender);
      if (refuseChallenge) {
        refuseChallenge.status = 'declined';
        db.save();
        return reply('❌ Desafio recusado.');
      }
      return reply('❌ Você não tem desafios pendentes.');
    
    // ═══════════════════════════════════════════════════════════════
    // SALDO
    // ═══════════════════════════════════════════════════════════════
    case 'saldo':
    case 'coins':
    case 'dinheiro':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      return reply(`💰 *SEU SALDO*\n\n💎 FC Coins: ${player.economy.fcCoins.toLocaleString()}\n⚡ Energia: ${player.energy.current}/${player.energy.max}`);
    
    case 'energia':
    case 'energy':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      return reply(`⚡ *SUA ENERGIA*\n\n${player.energy.current}/${player.energy.max}\n\n💡 Use *!fut descansar* para recuperar energia!`);
    
    case 'descansar':
    case 'rest':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      const restResult = db.quickRest(sender);
      if (!restResult.success) {
        return reply(`❌ ${restResult.error}`);
      }
      return reply(`😴 *DESCANSO COMPLETO*\n\n⚡ Energia recuperada: +${restResult.energyGained}\n⚡ Energia atual: ${restResult.currentEnergy}/${restResult.maxEnergy} (100%)`);
    
    // ═══════════════════════════════════════════════════════════════
    // CLUBE
    // ═══════════════════════════════════════════════════════════════
    case 'criarclube':
    case 'criar':
    case 'cc':
      if (!player) {
        return reply('❌ Você não está registrado!\nUse *!fut entrar* para começar.');
      }
      
      if (player.currentClub) {
        return reply('❌ Você já está em um clube!\nSaias primeiro com *!fut sair*.');
      }
      
      const clubName = args.slice(1).join(' ');
      if (!clubName || clubName.length < 3) {
        return reply('📌 Use: *!fut criar [nome]*\n\nMínimo 3 caracteres, máximo 20.');
      }
      
      if (clubName.length > 20) {
        return reply('❌ Nome muito longo! Máximo: 20 caracteres.');
      }
      
      // Verificar se já existe clube com este nome
      if (db.getClubByName(clubName)) {
        return reply('❌ Já existe um clube com este nome!');
      }
      
      const newClub = db.createClub(clubName, sender, senderName);
      return reply(`✅ *CLUBE CRIADO!* ✅\n\n⚽ ${clubName}\n👑 Presidente: ${senderName}\n\nUse *!fut prop @user [salário]* para contratar!`);
    
    case 'clube':
    case 'meuclube':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      if (!player.currentClub) {
        return reply('❌ Você não está em nenhum clube!\n\n📌 Use: *!fut criar [nome]*');
      }
      
      const club = db.getClub(player.currentClub);
      if (!club) {
        return reply('❌ Clube não encontrado!');
      }
      
      return reply(getClubMessage(club, db.players));
    
    case 'membros':
    case 'jogadores':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      if (!player.currentClub) {
        return reply('❌ Você não está em nenhum clube!');
      }
      
      const clubForMembers = db.getClub(player.currentClub);
      if (!clubForMembers) {
        return reply('❌ Clube não encontrado!');
      }
      
      let membersText = `👥 *MEMBROS DO CLUBE ${clubForMembers.name}*\n\n`;
      clubForMembers.players.forEach((m, i) => {
        const pData = db.players[m.id];
        membersText += `${i + 1}. ${m.name} ${m.role === 'President' ? '👑' : ''}\n`;
        membersText += `   OVR: ${pData?.ovr || '?'} | Salário: ${m.salary.toLocaleString()}/sem\n\n`;
      });
      
      return reply(membersText);
    
    case 'sairclube':
    case 'sair':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      if (!player.currentClub) {
        return reply('❌ Você não está em nenhum clube!');
      }
      
      const leaveResult = db.removePlayerFromClub(player.currentClub, sender);
      if (!leaveResult.success) {
        return reply(`❌ ${leaveResult.error}`);
      }
      
      return reply('✅ Você saiu do clube!');
    
    // ═══════════════════════════════════════════════════════════════
    // NEGOCIAÇÕES
    // ═══════════════════════════════════════════════════════════════
    case 'proposta':
    case 'prop':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      if (!player.currentClub) {
        return reply('❌ Você não está em nenhum clube!');
      }
      
      const userClub = db.getClub(player.currentClub);
      if (userClub.president.id !== sender) {
        return reply('❌ Apenas o presidente pode fazer propostas!');
      }
      
      if (userClub.players.length >= 5) {
        return reply('❌ Seu clube já está completo (5 jogadores)!');
      }
      
      const targetUser = messageInfo.mentionedJid?.[0];
      if (!targetUser) {
        return reply('📌 Use: *!fut proposta @usuario [salário]*');
      }
      
      const targetP = db.getPlayer(targetUser);
      if (!targetP) {
        return reply('❌ Jogador não encontrado!');
      }
      
      if (targetP.currentClub) {
        return reply('❌ Jogador já está em um clube!');
      }
      
      const salary = parseInt(args[2]) || 5000;
      if (salary < 100) {
        return reply('❌ Salário mínimo: 100 FC Coins/semana');
      }
      
      const negotiation = db.createNegotiation(player.currentClub, targetUser, salary, false);
      
      return reply(`⚽ *NOVA PROPOSTA!* ⚽\n\n📤 De: ${userClub.name}\n💰 Salário: ${salary.toLocaleString()}/sem\n\n📩 Enviada para @${targetUser.split('@')[0]}!\n\n⏳ Aguardando resposta...`);
    
    case 'negociacoes':
    case 'negs':
    case 'negociar':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      if (player.currentClub) {
        // Ver negociações do clube (presidente)
        const clubNegs = db.getClubNegotiations(player.currentClub);
        const club = db.getClub(player.currentClub);
        
        if (club.president.id !== sender) {
          return reply('❌ Apenas o presidente pode ver as negociações!');
        }
        
        if (clubNegs.length === 0) {
          return reply('📭 Nenhuma negociação pendente.');
        }
        
        let negsText = `📝 *NEGOCIAÇÕES (${clubNegs.length})*\n\n`;
        clubNegs.forEach((n, i) => {
          negsText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          negsText += `${i + 1}. @${n.playerName}\n`;
          negsText += `   💰 ${n.salary.toLocaleString()}/sem\n`;
          negsText += `   ${n.counterOffer ? '🔄 Contra-oferta' : '📤 Proposta'}\n`;
          negsText += `   ID: ${n.id}\n`;
        });
        negsText += `\n📌 *AÇÕES:*\n`;
        negsText += `• !fut ace [id] - Contratar\n`;
        negsText += `• !fut repro [id] - Recusar\n`;
        negsText += `• !fut cnt [id] [valor] - Contra-oferta`;
        
        return reply(negsText);
      } else {
        // Ver negociações do jogador
        const playerNegs = db.getPlayerNegotiations(sender);
        
        if (playerNegs.length === 0) {
          return reply('📭 Você não tem negociações pendentes.');
        }
        
        let playerNegsText = `📝 *SUAS NEGOCIAÇÕES (${playerNegs.length})*\n\n`;
        playerNegs.forEach((n, i) => {
          playerNegsText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          playerNegsText += `${i + 1}. ${n.clubName}\n`;
          playerNegsText += `   💰 ${n.salary.toLocaleString()}/sem\n`;
          playerNegsText += `   ${n.counterOffer ? '🔄 Contra-oferta' : '📤 Proposta'}\n`;
          playerNegsText += `   ID: ${n.id}\n`;
        });
        playerNegsText += `\n📌 *AÇÕES:*\n`;
        playerNegsText += `• !fut ace [id] - Aceitar\n`;
        playerNegsText += `• !fut repro [id] - Recusar\n`;
        playerNegsText += `• !fut cnt [id] [valor] - Contra-oferta`;
        
        return reply(playerNegsText);
      }
    
    case 'aceitar':
    case 'ace':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      const negId = args[1];
      if (!negId) {
        return reply('📌 Use: *!fut ace [id]*');
      }
      
      const acceptResult = db.acceptNegotiation(negId);
      if (!acceptResult.success) {
        return reply(`❌ ${acceptResult.error}`);
      }
      
      return reply(`✅ *CONTRATADO!* ✅\n\n⚽ Clube: ${acceptResult.negotiation.clubName}\n💰 Salário: ${acceptResult.negotiation.salary.toLocaleString()}/sem\n\nBem-vindo! 🏆`);
    
    case 'reprovar':
    case 'repro':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      const rejectNegId = args[1];
      if (!rejectNegId) {
        return reply('📌 Use: *!fut repro [id]*');
      }
      
      const rejectResult = db.rejectNegotiation(rejectNegId);
      if (!rejectResult.success) {
        return reply(`❌ ${rejectResult.error}`);
      }
      
      return reply('❌ Negociação reprovada.');
    
    case 'contraprop':
    case 'cnt':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      const negToCounterId = args[1];
      const counterSalary = parseInt(args[2]);
      
      if (!negToCounterId || !counterSalary) {
        return reply('📌 Use: *!fut cnt [id] [valor]*');
      }
      
      const existingNeg = db.getNegotiation(negToCounterId);
      if (!existingNeg) {
        return reply('❌ Negociação não encontrada!');
      }
      if (existingNeg.status !== 'pending') {
        return reply('❌ Esta negociação já foi encerrada!');
      }
      
      if (player.currentClub) {
        // Presidente fazendo contra-oferta
        if (player.currentClub !== existingNeg.clubId) {
          return reply('❌ Esta negociação não é do seu clube!');
        }
        
        const counterNeg = db.createNegotiation(player.currentClub, existingNeg.playerId, counterSalary, true);
        
        return reply(`🔄 *CONTRA-OFERTA ENVIADA!* 🔄\n\n📤 Para: @${existingNeg.playerName}\n💰 Novo salário: ${counterSalary.toLocaleString()}/sem\n\nAguardando resposta...`);
      } else {
        // Jogador fazendo contra-oferta
        if (existingNeg.playerId !== sender) {
          return reply('❌ Esta negociação não é sua!');
        }
        
        const counterNegFromPlayer = db.createNegotiation(existingNeg.clubId, sender, counterSalary, true);
        
        return reply(`🔄 *CONTRA-OFERTA ENVIADA!* 🔄\n\n📤 Para: ${existingNeg.clubName}\n💰 Salário proposto: ${counterSalary.toLocaleString()}/sem\n\nAguardando resposta...`);
      }
    
    case 'minhaspropostas':
    case 'verpropostas':
    case 'props':
      if (!player) {
        return reply('❌ Você não está registrado!');
      }
      
      const myNegs = db.getPlayerNegotiations(sender);
      if (myNegs.length === 0) {
        return reply('📭 Você não tem propostas.\n\n💡 Presidentes: use *!fut prop @user [salário]*');
      }
      
      let myProposalsText = `📝 *SUAS PROPOSTAS*\n\n`;
      myNegs.forEach((n, i) => {
        myProposalsText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        myProposalsText += `${i + 1}. ${n.clubName}\n`;
        myProposalsText += `💰 ${n.salary.toLocaleString()}/sem\n`;
        myProposalsText += `${n.counterOffer ? '🔄 Contra-oferta' : '📤 Nova'}\n`;
        myProposalsText += `ID: ${n.id}\n`;
      });
      
      return reply(myProposalsText);
    
    // ═══════════════════════════════════════════════════════════════
    // GLOBAL
    // ═══════════════════════════════════════════════════════════════
    case 'topglobal':
      db.updateGlobalRanking();
      return reply(getTopGlobalMessage());
    
    case 'rankingclubes':
      db.updateGlobalRanking();
      return reply(getClubRankingMessage());
    
    // ═══════════════════════════════════════════════════════════════
    // COMANDO INVÁLIDO
    // ═══════════════════════════════════════════════════════════════
    default:
      return reply(getMenuFut(senderName));
  }
}

// Handler para o comando principal !fut
export async function handleFut(args, messageInfo, reply) {
  // Verificar se o jogador existe
  const { sender } = messageInfo;
  const player = db.getPlayer(sender);
  
  const command = args[0]?.toLowerCase() || '';
  
  if (!player && command !== 'entrar' && command !== 'registrar') {
    // Redirecionar para comando de entrada
    return handleFutCommand(['entrar'], messageInfo, reply);
  }
  
  return handleFutCommand(args, messageInfo, reply);
}