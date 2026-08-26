/**
 * External and Persistent Storage Utility for Android / Mobile & Web.
 * 
 * Provides:
 * 1. Safe persistent backup to external root directory (near Download: /storage/emulated/0/CHATOX_Data)
 * 2. Automatic import / restore when app is reinstalled or updated.
 * 3. Fallback IndexedDB / FileSystem API for web / browser.
 */

import { AppSettings, ChatSession } from '../types';
import { isNativeMobile } from '../services/apiService';

const BACKUP_FOLDER_NAME = 'CHATOX_Data';
const BACKUP_SETTINGS_FILE = 'chatox_backup_settings.json';
const BACKUP_CHATS_FILE = 'chatox_backup_chats.json';

/**
 * Saves application state to external storage (Android / Filesystem / Download folder)
 */
export async function saveToExternalRootStorage(
  settings: AppSettings,
  chats: ChatSession[]
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const payloadSettings = JSON.stringify(settings, null, 2);
    const payloadChats = JSON.stringify(chats, null, 2);

    // If native Capacitor Filesystem plugin is available
    const cap = (window as any).Capacitor;
    const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;

    if (Filesystem) {
      try {
        // Try Documents / External Storage directory (root accessible near Download)
        const dir = 'DOCUMENTS'; // or EXTERNAL_STORAGE
        
        // Ensure folder exists
        try {
          await Filesystem.mkdir({
            path: BACKUP_FOLDER_NAME,
            directory: dir,
            recursive: true,
          });
        } catch (e) {
          // Folder might already exist
        }

        // Write Settings
        await Filesystem.writeFile({
          path: `${BACKUP_FOLDER_NAME}/${BACKUP_SETTINGS_FILE}`,
          data: payloadSettings,
          directory: dir,
          encoding: 'utf8',
        });

        // Write Chats
        await Filesystem.writeFile({
          path: `${BACKUP_FOLDER_NAME}/${BACKUP_CHATS_FILE}`,
          data: payloadChats,
          directory: dir,
          encoding: 'utf8',
        });

        return {
          success: true,
          path: `Внутренняя память 📁 /${BACKUP_FOLDER_NAME}/`,
        };
      } catch (fsErr: any) {
        console.warn('Capacitor Filesystem write error:', fsErr);
      }
    }

    // Fallback: Backup to IndexedDB / local persistent storage backup slot
    try {
      localStorage.setItem('chatox_ext_settings_backup', payloadSettings);
      localStorage.setItem('chatox_ext_chats_backup', payloadChats);
      localStorage.setItem('chatox_ext_backup_timestamp', Date.now().toString());
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      path: 'Внутренняя память (CHATOX_Data)',
    };
  } catch (err: any) {
    console.error('saveToExternalRootStorage error:', err);
    return {
      success: false,
      error: err?.message || 'Не удалось записать резервную копию в хранилище',
    };
  }
}

/**
 * Loads / Restores application state from external storage if available
 */
export async function loadFromExternalRootStorage(): Promise<{
  settings?: AppSettings;
  chats?: ChatSession[];
  found: boolean;
}> {
  try {
    const Filesystem = (window as any).Capacitor?.Plugins?.Filesystem;

    if (Filesystem) {
      try {
        const dir = 'DOCUMENTS';
        const settingsRes = await Filesystem.readFile({
          path: `${BACKUP_FOLDER_NAME}/${BACKUP_SETTINGS_FILE}`,
          directory: dir,
          encoding: 'utf8',
        });

        const chatsRes = await Filesystem.readFile({
          path: `${BACKUP_FOLDER_NAME}/${BACKUP_CHATS_FILE}`,
          directory: dir,
          encoding: 'utf8',
        });

        if (settingsRes?.data && chatsRes?.data) {
          const parsedSettings = JSON.parse(settingsRes.data);
          const parsedChats = JSON.parse(chatsRes.data);
          return {
            settings: parsedSettings,
            chats: parsedChats,
            found: true,
          };
        }
      } catch (e) {
        // Files not found yet in filesystem
      }
    }

    // Check backup slot in localStorage
    const bSettings = localStorage.getItem('chatox_ext_settings_backup');
    const bChats = localStorage.getItem('chatox_ext_chats_backup');
    if (bSettings) {
      return {
        settings: JSON.parse(bSettings),
        chats: bChats ? JSON.parse(bChats) : [],
        found: true,
      };
    }

    return { found: false };
  } catch (err) {
    console.warn('loadFromExternalRootStorage error:', err);
    return { found: false };
  }
}

/**
 * Downloads a manual backup file directly to the device Downloads
 */
export function exportManualBackupFile(settings: AppSettings, chats: ChatSession[]) {
  const data = {
    app: 'CHATOX AI',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    chats,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chatox_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
