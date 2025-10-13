import * as SQLite from 'expo-sqlite';

const DB_NAME = 'intentional_movement.db';

let db = null;

/**
 * Initialize the database connection and create tables
 */
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create downloads table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contentId TEXT NOT NULL,
        contentType TEXT NOT NULL,
        programId TEXT,
        lessonId TEXT,
        title TEXT NOT NULL,
        description TEXT,
        thumbnailUrl TEXT,
        fileUrl TEXT NOT NULL,
        localPath TEXT,
        fileSize INTEGER,
        downloadedSize INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        progress REAL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        downloadedAt INTEGER,
        lastAccessedAt INTEGER,
        UNIQUE(contentId, contentType)
      );

      CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
      CREATE INDEX IF NOT EXISTS idx_downloads_contentId ON downloads(contentId);
      CREATE INDEX IF NOT EXISTS idx_downloads_programId ON downloads(programId);
    `);

    // Create offline cache table for API responses
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cacheKey TEXT NOT NULL UNIQUE,
        data TEXT NOT NULL,
        expiresAt INTEGER,
        createdAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cache_key ON offline_cache(cacheKey);
      CREATE INDEX IF NOT EXISTS idx_cache_expires ON offline_cache(expiresAt);
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Download record operations
 */
export const downloadDB = {
  /**
   * Insert a new download record
   */
  insert: async (download) => {
    const database = getDatabase();
    const now = Date.now();

    const result = await database.runAsync(
      `INSERT INTO downloads (
        contentId, contentType, programId, lessonId, title, description,
        thumbnailUrl, fileUrl, fileSize, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        download.contentId,
        download.contentType,
        download.programId || null,
        download.lessonId || null,
        download.title,
        download.description || null,
        download.thumbnailUrl || null,
        download.fileUrl,
        download.fileSize || 0,
        'pending',
        now
      ]
    );

    return result.lastInsertRowId;
  },

  /**
   * Update download progress
   */
  updateProgress: async (id, progress, downloadedSize) => {
    const database = getDatabase();

    await database.runAsync(
      'UPDATE downloads SET progress = ?, downloadedSize = ? WHERE id = ?',
      [progress, downloadedSize, id]
    );
  },

  /**
   * Update download status
   */
  updateStatus: async (id, status, localPath = null) => {
    const database = getDatabase();
    const now = Date.now();

    if (status === 'completed' && localPath) {
      await database.runAsync(
        'UPDATE downloads SET status = ?, localPath = ?, downloadedAt = ?, progress = 100 WHERE id = ?',
        [status, localPath, now, id]
      );
    } else {
      await database.runAsync(
        'UPDATE downloads SET status = ? WHERE id = ?',
        [status, id]
      );
    }
  },

  /**
   * Get all downloads
   */
  getAll: async () => {
    const database = getDatabase();
    const result = await database.getAllAsync('SELECT * FROM downloads ORDER BY createdAt DESC');
    return result;
  },

  /**
   * Get downloads by status
   */
  getByStatus: async (status) => {
    const database = getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM downloads WHERE status = ? ORDER BY createdAt DESC',
      [status]
    );
    return result;
  },

  /**
   * Get download by ID
   */
  getById: async (id) => {
    const database = getDatabase();
    const result = await database.getFirstAsync(
      'SELECT * FROM downloads WHERE id = ?',
      [id]
    );
    return result;
  },

  /**
   * Get download by content ID
   */
  getByContentId: async (contentId, contentType) => {
    const database = getDatabase();
    const result = await database.getFirstAsync(
      'SELECT * FROM downloads WHERE contentId = ? AND contentType = ?',
      [contentId, contentType]
    );
    return result;
  },

  /**
   * Get downloads by program ID
   */
  getByProgramId: async (programId) => {
    const database = getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM downloads WHERE programId = ? ORDER BY createdAt DESC',
      [programId]
    );
    return result;
  },

  /**
   * Delete download record
   */
  delete: async (id) => {
    const database = getDatabase();
    await database.runAsync('DELETE FROM downloads WHERE id = ?', [id]);
  },

  /**
   * Delete downloads by program ID
   */
  deleteByProgramId: async (programId) => {
    const database = getDatabase();
    await database.runAsync('DELETE FROM downloads WHERE programId = ?', [programId]);
  },

  /**
   * Update last accessed time
   */
  updateLastAccessed: async (id) => {
    const database = getDatabase();
    const now = Date.now();
    await database.runAsync(
      'UPDATE downloads SET lastAccessedAt = ? WHERE id = ?',
      [now, id]
    );
  },

  /**
   * Get total downloaded size
   */
  getTotalSize: async () => {
    const database = getDatabase();
    const result = await database.getFirstAsync(
      'SELECT SUM(fileSize) as totalSize FROM downloads WHERE status = "completed"'
    );
    return result?.totalSize || 0;
  },

  /**
   * Clear all downloads
   */
  clearAll: async () => {
    const database = getDatabase();
    await database.runAsync('DELETE FROM downloads');
  },
};

/**
 * Offline cache operations
 */
export const cacheDB = {
  /**
   * Set cache data
   */
  set: async (cacheKey, data, expiresInMs = null) => {
    const database = getDatabase();
    const now = Date.now();
    const expiresAt = expiresInMs ? now + expiresInMs : null;

    await database.runAsync(
      `INSERT OR REPLACE INTO offline_cache (cacheKey, data, expiresAt, createdAt)
       VALUES (?, ?, ?, ?)`,
      [cacheKey, JSON.stringify(data), expiresAt, now]
    );
  },

  /**
   * Get cache data
   */
  get: async (cacheKey) => {
    const database = getDatabase();
    const now = Date.now();

    const result = await database.getFirstAsync(
      'SELECT * FROM offline_cache WHERE cacheKey = ?',
      [cacheKey]
    );

    if (!result) return null;

    // Check if expired
    if (result.expiresAt && result.expiresAt < now) {
      await cacheDB.delete(cacheKey);
      return null;
    }

    try {
      return JSON.parse(result.data);
    } catch (error) {
      console.error('Error parsing cached data:', error);
      return null;
    }
  },

  /**
   * Delete cache entry
   */
  delete: async (cacheKey) => {
    const database = getDatabase();
    await database.runAsync('DELETE FROM offline_cache WHERE cacheKey = ?', [cacheKey]);
  },

  /**
   * Clear expired cache
   */
  clearExpired: async () => {
    const database = getDatabase();
    const now = Date.now();
    await database.runAsync(
      'DELETE FROM offline_cache WHERE expiresAt IS NOT NULL AND expiresAt < ?',
      [now]
    );
  },

  /**
   * Clear all cache
   */
  clearAll: async () => {
    const database = getDatabase();
    await database.runAsync('DELETE FROM offline_cache');
  },
};

/**
 * Close database connection
 */
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
