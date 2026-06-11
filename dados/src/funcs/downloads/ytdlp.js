/**
 * YT-DLP Download Module - Download de vídeos usando yt-dlp
 * Alta performance com cache e downloads assíncronos
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';

const execAsync = promisify(exec);

// Cache para resultados recentes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const TMP_DIR = os.tmpdir();

// Verifica se yt-dlp está instalado
async function isYtDlpInstalled() {
  try {
    await execAsync('which yt-dlp');
    return true;
  } catch {
    return false;
  }
}

// Obtém URL de download direto
async function getDirectUrl(url, format = 'bestaudio/bestvideo') {
  const cacheKey = `url:${url}:${format}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Extrai info do vídeo sem baixar
    const { stdout } = await execAsync(
      `yt-dlp --no-playlist --dump-json --no-warnings -f "${format}" "${url}" 2>/dev/null`,
      { timeout: 30000 }
    );

    const info = JSON.parse(stdout);
    const result = {
      url: info.url || info.direct_url,
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      description: info.description || '',
      uploader: info.uploader || info.channel || 'Unknown',
      filename: `${(info.title || 'download').replace(/[^\w\s\-]/gi, '')}.mp3`
    };

    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch (err) {
    throw new Error(`Falha ao obter URL: ${err.message}`);
  }
}

// Busca vídeos
async function search(query) {
  // Verificar se yt-dlp est00e1 instalado
  try {
    await execAsync('which yt-dlp');
  } catch {
    return { ok: false, msg: '⚠️ YT-DLP não está instalado! Use: pip install yt-dlp' };
  }
  const cacheKey = `search:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const { stdout } = await execAsync(
      `yt-dlp --no-playlist --dump-json --no-warnings --max-results 5 "ytsearch:${query}" 2>/dev/null`,
      { timeout: 30000 }
    );

    const lines = stdout.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      return { ok: false, msg: 'Nenhum vídeo encontrado' };
    }

    const results = [];
    for (const line of lines) {
      try {
        const info = JSON.parse(line);
        results.push({
          videoId: info.id,
          url: `https://www.youtube.com/watch?v=${info.id}`,
          title: info.title,
          description: info.description || '',
          thumbnail: info.thumbnail || '',
          seconds: Math.floor(info.duration || 0),
          timestamp: formatDuration(info.duration || 0),
          views: info.view_count || 0,
          ago: info.upload_date ? formatDate(info.upload_date) : '',
          author: info.uploader || info.channel || 'Unknown'
        });
      } catch {}
    }

    if (results.length === 0) {
      return { ok: false, msg: 'Nenhum vídeo encontrado' };
    }

    const result = { ok: true, data: results[0] };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch (err) {
    return { ok: false, msg: `Erro na busca: ${err.message}` };
  }
}

// Download MP3
async function mp3(url) {
  try {
    // Primeiro tenta obter URL direta
    let videoInfo;
    try {
      videoInfo = await getDirectUrl(url, 'bestaudio/best');
    } catch {
      // Fallback: download completo
      const tempFile = path.join(TMP_DIR, `ytdl_${Date.now()}.mp3`);
      
      await execAsync(
        `yt-dlp --no-playlist -x --audio-format mp3 --audio-quality 0 -o "${tempFile}" --no-warnings "${url}"`,
        { timeout: 120000 }
      );

      const buffer = fs.readFileSync(tempFile);
      fs.unlinkSync(tempFile);

      return {
        ok: true,
        buffer,
        title: 'YouTube Audio',
        thumbnail: '',
        filename: `audio_${Date.now()}.mp3`
      };
    }

    // Download via URL direta
    const response = await axios.get(videoInfo.url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const buffer = Buffer.from(response.data);

    return {
      ok: true,
      buffer,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      filename: videoInfo.filename
    };
  } catch (err) {
    return { ok: false, msg: `Erro no download: ${err.message}` };
  }
}

// Download MP4
async function mp4(url) {
  try {
    const tempFile = path.join(TMP_DIR, `ytdl_${Date.now()}.mp4`);

    // Download direto em alta qualidade
    await execAsync(
      `yt-dlp --no-playlist -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${tempFile}" --no-warnings "${url}"`,
      { timeout: 180000 }
    );

    const buffer = fs.readFileSync(tempFile);
    fs.unlinkSync(tempFile);

    // Tenta obter info do vídeo
    let title = 'Video';
    try {
      const { stdout } = await execAsync(
        `yt-dlp --no-playlist --get-title --no-warnings "${url}"`,
        { timeout: 10000 }
      );
      title = stdout.trim() || 'Video';
    } catch {}

    return {
      ok: true,
      buffer,
      title,
      thumbnail: '',
      filename: `${title.replace(/[^\w\s\-]/gi, '')}.mp4`
    };
  } catch (err) {
    return { ok: false, msg: `Erro no download: ${err.message}` };
  }
}

// Utilitários
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return '';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${day}/${month}/${year}`;
}

export { search, mp3, mp4, isYtDlpInstalled };
export const ytmp3 = mp3;
export const ytmp4 = mp4;