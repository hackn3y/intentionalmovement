import * as FileSystem from 'expo-file-system';
import { downloadDB } from '../utils/database';
import { API_URL } from '../config/constants';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;
const MAX_CONCURRENT_DOWNLOADS = 3;
const MIN_STORAGE_SPACE = 100 * 1024 * 1024; // 100MB in bytes

class DownloadService {
  constructor() {
    this.activeDownloads = new Map();
    this.downloadQueue = [];
    this.eventListeners = new Map();
  }

  /**
   * Initialize download service
   */
  async initialize() {
    try {
      // Create downloads directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
      }

      // Resume any pending downloads
      await this.resumePendingDownloads();

      console.log('Download service initialized');
    } catch (error) {
      console.error('Error initializing download service:', error);
      throw error;
    }
  }

  /**
   * Check available storage space
   */
  async checkStorageSpace() {
    try {
      const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
      return {
        freeSpace: freeDiskStorage,
        hasEnoughSpace: freeDiskStorage > MIN_STORAGE_SPACE,
        minRequired: MIN_STORAGE_SPACE,
      };
    } catch (error) {
      console.error('Error checking storage space:', error);
      return { freeSpace: 0, hasEnoughSpace: false, minRequired: MIN_STORAGE_SPACE };
    }
  }

  /**
   * Get file size from URL
   */
  async getFileSize(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Start a download
   */
  async startDownload(downloadInfo) {
    try {
      // Check storage space
      const storageInfo = await this.checkStorageSpace();
      if (!storageInfo.hasEnoughSpace) {
        throw new Error('Not enough storage space. Please free up at least 100MB.');
      }

      // Get file size if not provided
      if (!downloadInfo.fileSize) {
        downloadInfo.fileSize = await this.getFileSize(downloadInfo.fileUrl);
      }

      // Check if enough space for this file
      if (downloadInfo.fileSize > storageInfo.freeSpace - MIN_STORAGE_SPACE) {
        throw new Error('Not enough storage space for this download.');
      }

      // Check if already downloading or downloaded
      const existing = await downloadDB.getByContentId(
        downloadInfo.contentId,
        downloadInfo.contentType
      );

      if (existing) {
        if (existing.status === 'completed') {
          throw new Error('Content already downloaded');
        }
        if (existing.status === 'downloading') {
          throw new Error('Download already in progress');
        }
      }

      // Insert or update download record
      let downloadId;
      if (existing) {
        downloadId = existing.id;
        await downloadDB.updateStatus(downloadId, 'pending');
      } else {
        downloadId = await downloadDB.insert(downloadInfo);
      }

      // Add to queue
      this.addToQueue({ ...downloadInfo, id: downloadId });

      // Process queue
      await this.processQueue();

      return downloadId;
    } catch (error) {
      console.error('Error starting download:', error);
      throw error;
    }
  }

  /**
   * Add download to queue
   */
  addToQueue(download) {
    this.downloadQueue.push(download);
    this.emit('queueUpdated', this.downloadQueue);
  }

  /**
   * Process download queue
   */
  async processQueue() {
    while (
      this.downloadQueue.length > 0 &&
      this.activeDownloads.size < MAX_CONCURRENT_DOWNLOADS
    ) {
      const download = this.downloadQueue.shift();
      this.executeDownload(download);
    }
  }

  /**
   * Execute a download
   */
  async executeDownload(download) {
    const { id, fileUrl, contentType, contentId } = download;

    try {
      // Mark as downloading
      await downloadDB.updateStatus(id, 'downloading');
      this.emit('downloadStarted', { id, contentId, contentType });

      // Determine file extension
      const fileExtension = contentType === 'video' ? '.mp4' : '.pdf';
      const fileName = `${contentId}${fileExtension}`;
      const localPath = `${DOWNLOAD_DIR}${fileName}`;

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          const progressPercent = Math.floor(progress * 100);

          // Update database
          downloadDB.updateProgress(
            id,
            progressPercent,
            downloadProgress.totalBytesWritten
          );

          // Emit progress event
          this.emit('downloadProgress', {
            id,
            contentId,
            contentType,
            progress: progressPercent,
            downloadedSize: downloadProgress.totalBytesWritten,
            totalSize: downloadProgress.totalBytesExpectedToWrite,
          });
        }
      );

      // Store download resumable
      this.activeDownloads.set(id, downloadResumable);

      // Download file
      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        // Mark as completed
        await downloadDB.updateStatus(id, 'completed', result.uri);
        this.emit('downloadCompleted', { id, contentId, contentType, localPath: result.uri });
      }

      // Remove from active downloads
      this.activeDownloads.delete(id);

      // Process next in queue
      await this.processQueue();
    } catch (error) {
      console.error('Error executing download:', error);

      // Mark as failed
      await downloadDB.updateStatus(id, 'failed');
      this.emit('downloadFailed', { id, contentId, contentType, error: error.message });

      // Remove from active downloads
      this.activeDownloads.delete(id);

      // Process next in queue
      await this.processQueue();
    }
  }

  /**
   * Pause a download
   */
  async pauseDownload(id) {
    try {
      const downloadResumable = this.activeDownloads.get(id);
      if (downloadResumable) {
        await downloadResumable.pauseAsync();
        await downloadDB.updateStatus(id, 'paused');
        this.emit('downloadPaused', { id });
      }
    } catch (error) {
      console.error('Error pausing download:', error);
      throw error;
    }
  }

  /**
   * Resume a download
   */
  async resumeDownload(id) {
    try {
      const download = await downloadDB.getById(id);
      if (!download) {
        throw new Error('Download not found');
      }

      if (download.status === 'paused') {
        await downloadDB.updateStatus(id, 'pending');
        this.addToQueue(download);
        await this.processQueue();
      }
    } catch (error) {
      console.error('Error resuming download:', error);
      throw error;
    }
  }

  /**
   * Cancel a download
   */
  async cancelDownload(id) {
    try {
      const downloadResumable = this.activeDownloads.get(id);
      if (downloadResumable) {
        await downloadResumable.pauseAsync();
        this.activeDownloads.delete(id);
      }

      // Delete from database
      await downloadDB.delete(id);

      // Remove from queue
      this.downloadQueue = this.downloadQueue.filter(d => d.id !== id);

      this.emit('downloadCancelled', { id });
    } catch (error) {
      console.error('Error cancelling download:', error);
      throw error;
    }
  }

  /**
   * Delete a downloaded file
   */
  async deleteDownload(id) {
    try {
      const download = await downloadDB.getById(id);
      if (!download) {
        throw new Error('Download not found');
      }

      // Delete file if it exists
      if (download.localPath) {
        const fileInfo = await FileSystem.getInfoAsync(download.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(download.localPath);
        }
      }

      // Delete from database
      await downloadDB.delete(id);

      this.emit('downloadDeleted', { id });
    } catch (error) {
      console.error('Error deleting download:', error);
      throw error;
    }
  }

  /**
   * Delete all downloads for a program
   */
  async deleteProgramDownloads(programId) {
    try {
      const downloads = await downloadDB.getByProgramId(programId);

      for (const download of downloads) {
        if (download.localPath) {
          const fileInfo = await FileSystem.getInfoAsync(download.localPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(download.localPath);
          }
        }
      }

      await downloadDB.deleteByProgramId(programId);

      this.emit('programDownloadsDeleted', { programId });
    } catch (error) {
      console.error('Error deleting program downloads:', error);
      throw error;
    }
  }

  /**
   * Get all downloads
   */
  async getAllDownloads() {
    try {
      return await downloadDB.getAll();
    } catch (error) {
      console.error('Error getting all downloads:', error);
      return [];
    }
  }

  /**
   * Get downloads by status
   */
  async getDownloadsByStatus(status) {
    try {
      return await downloadDB.getByStatus(status);
    } catch (error) {
      console.error('Error getting downloads by status:', error);
      return [];
    }
  }

  /**
   * Get download by content ID
   */
  async getDownloadByContentId(contentId, contentType) {
    try {
      return await downloadDB.getByContentId(contentId, contentType);
    } catch (error) {
      console.error('Error getting download by content ID:', error);
      return null;
    }
  }

  /**
   * Get total storage used
   */
  async getTotalStorageUsed() {
    try {
      return await downloadDB.getTotalSize();
    } catch (error) {
      console.error('Error getting total storage used:', error);
      return 0;
    }
  }

  /**
   * Clear all downloads
   */
  async clearAllDownloads() {
    try {
      // Delete all files
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(DOWNLOAD_DIR);
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
      }

      // Clear database
      await downloadDB.clearAll();

      // Clear active downloads
      this.activeDownloads.clear();
      this.downloadQueue = [];

      this.emit('allDownloadsCleared');
    } catch (error) {
      console.error('Error clearing all downloads:', error);
      throw error;
    }
  }

  /**
   * Resume pending downloads on app restart
   */
  async resumePendingDownloads() {
    try {
      const pendingDownloads = await downloadDB.getByStatus('downloading');

      for (const download of pendingDownloads) {
        // Reset to pending status
        await downloadDB.updateStatus(download.id, 'pending');
        this.addToQueue(download);
      }

      if (pendingDownloads.length > 0) {
        await this.processQueue();
      }
    } catch (error) {
      console.error('Error resuming pending downloads:', error);
    }
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export default new DownloadService();
