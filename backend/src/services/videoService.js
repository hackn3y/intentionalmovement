const Mux = require('@mux/mux-node');
const logger = require('../utils/logger');

// Initialize Mux client
let muxVideo = null;
let muxData = null;

const initializeMux = () => {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    logger.warn('MUX credentials not configured. Video service will be disabled.');
    return false;
  }

  try {
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET
    });

    muxVideo = mux.video;
    muxData = mux.data;

    logger.info('Mux video service initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Mux:', error);
    return false;
  }
};

// Initialize on module load
const isInitialized = initializeMux();

/**
 * Create a video asset from a URL
 * @param {string} url - URL of the video file to upload
 * @param {object} options - Additional options (title, playbackPolicy, etc.)
 * @returns {Promise<object>} - Mux asset object
 */
const createAssetFromUrl = async (url, options = {}) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    const asset = await muxVideo.assets.create({
      input: [{ url }],
      playback_policy: [options.playbackPolicy || 'public'],
      // mp4_support removed - deprecated for basic assets
      max_resolution_tier: options.maxResolution || '1080p',
      test: process.env.NODE_ENV !== 'production',
      ...options
    });

    logger.info(`Mux asset created: ${asset.id}`);
    return {
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio
    };
  } catch (error) {
    logger.error('Error creating Mux asset from URL:', error);
    throw error;
  }
};

/**
 * Create a direct upload URL for client-side uploads
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload URL and ID
 */
const createDirectUpload = async (options = {}) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    const upload = await muxVideo.uploads.create({
      new_asset_settings: {
        playback_policy: [options.playbackPolicy || 'public'],
        // mp4_support removed - deprecated for basic assets
        max_resolution_tier: options.maxResolution || '1080p',
        test: process.env.NODE_ENV !== 'production'
      },
      cors_origin: options.corsOrigin || process.env.API_URL || '*',
      ...options
    });

    logger.info(`Mux direct upload created: ${upload.id}`);
    return {
      uploadId: upload.id,
      uploadUrl: upload.url,
      status: upload.status
    };
  } catch (error) {
    logger.error('Error creating Mux direct upload:', error);
    throw error;
  }
};

/**
 * Get asset details
 * @param {string} assetId - Mux asset ID
 * @returns {Promise<object>} - Asset details
 */
const getAsset = async (assetId) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    const asset = await muxVideo.assets.retrieve(assetId);

    return {
      assetId: asset.id,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      playbackIds: asset.playback_ids,
      createdAt: asset.created_at,
      tracks: asset.tracks,
      errors: asset.errors
    };
  } catch (error) {
    logger.error(`Error retrieving Mux asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Get playback URL for an asset
 * @param {string} playbackId - Mux playback ID
 * @param {object} options - Playback options (thumbnail, gif, etc.)
 * @returns {string} - Playback URL
 */
const getPlaybackUrl = (playbackId, options = {}) => {
  if (options.thumbnail) {
    // Return thumbnail URL
    const time = options.time || 0;
    const width = options.width || 640;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=${width}`;
  }

  if (options.gif) {
    // Return animated GIF URL
    const start = options.start || 0;
    const end = options.end || 5;
    const width = options.width || 640;
    return `https://image.mux.com/${playbackId}/animated.gif?start=${start}&end=${end}&width=${width}`;
  }

  // Return standard playback URL (HLS)
  return `https://stream.mux.com/${playbackId}.m3u8`;
};

/**
 * Delete an asset
 * @param {string} assetId - Mux asset ID
 * @returns {Promise<void>}
 */
const deleteAsset = async (assetId) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    await muxVideo.assets.delete(assetId);
    logger.info(`Mux asset deleted: ${assetId}`);
  } catch (error) {
    logger.error(`Error deleting Mux asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Get video analytics metrics
 * @param {string} assetId - Mux asset ID
 * @returns {Promise<object>} - Analytics data
 */
const getAnalytics = async (assetId) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    // Get asset views
    const metrics = await muxData.metrics.breakdown({
      metric_id: 'video_startup_time',
      filters: [`asset_id:${assetId}`],
      timeframe: ['7:days']
    });

    return {
      assetId,
      metrics: metrics.data
    };
  } catch (error) {
    logger.error(`Error retrieving Mux analytics for asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Create signed playback URL (for private videos)
 * @param {string} playbackId - Mux playback ID
 * @param {object} options - Signing options
 * @returns {string} - Signed playback URL
 */
const createSignedUrl = (playbackId, options = {}) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    // For signed URLs, you'll need to use Mux's JWT signing
    // This is a simplified version - implement full JWT signing for production
    const baseUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    // In production, add JWT token for private playback
    // See: https://docs.mux.com/guides/video/secure-video-playback

    return baseUrl;
  } catch (error) {
    logger.error('Error creating signed URL:', error);
    throw error;
  }
};

/**
 * List all assets
 * @param {object} options - Pagination options
 * @returns {Promise<array>} - List of assets
 */
const listAssets = async (options = {}) => {
  try {
    if (!isInitialized) {
      throw new Error('Mux not initialized');
    }

    const assets = await muxVideo.assets.list({
      limit: options.limit || 25,
      page: options.page || 1
    });

    return assets.data.map(asset => ({
      assetId: asset.id,
      status: asset.status,
      duration: asset.duration,
      playbackIds: asset.playback_ids,
      createdAt: asset.created_at
    }));
  } catch (error) {
    logger.error('Error listing Mux assets:', error);
    throw error;
  }
};

module.exports = {
  initializeMux,
  createAssetFromUrl,
  createDirectUpload,
  getAsset,
  getPlaybackUrl,
  deleteAsset,
  getAnalytics,
  createSignedUrl,
  listAssets
};
