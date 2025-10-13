const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Check if S3 is configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    BUCKET_NAME
  );
};

// Upload file to S3
exports.uploadFile = async (file, folder = 'uploads') => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Upload multiple files
exports.uploadFiles = async (files, folder = 'uploads') => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const uploadPromises = files.map(file => exports.uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error('Error uploading files to S3:', error);
    throw error;
  }
};

// Delete file from S3
exports.deleteFile = async (fileKey) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();

    return { success: true, key: fileKey };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Delete multiple files
exports.deleteFiles = async (fileKeys) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: fileKeys.map(key => ({ Key: key }))
      }
    };

    const result = await s3.deleteObjects(params).promise();

    return {
      deleted: result.Deleted,
      errors: result.Errors
    };
  } catch (error) {
    console.error('Error deleting files from S3:', error);
    throw error;
  }
};

// Get signed URL for private file access
exports.getSignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: expiresIn // URL expires in seconds
    };

    const url = await s3.getSignedUrlPromise('getObject', params);

    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Get presigned POST URL for direct upload from client
exports.getPresignedPost = async (folder = 'uploads', fileType, maxSize = 10485760) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const fileName = `${folder}/${uuidv4()}`;

    const params = {
      Bucket: BUCKET_NAME,
      Fields: {
        key: fileName
      },
      Expires: 300, // 5 minutes
      Conditions: [
        ['content-length-range', 0, maxSize], // Max file size
        ['starts-with', '$Content-Type', fileType || '']
      ]
    };

    const presignedPost = await s3.createPresignedPost(params);

    return {
      url: presignedPost.url,
      fields: presignedPost.fields,
      fileUrl: `${presignedPost.url}/${fileName}`
    };
  } catch (error) {
    console.error('Error generating presigned POST:', error);
    throw error;
  }
};

// Upload image with optimization (requires sharp library)
exports.uploadImage = async (file, folder = 'images', options = {}) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const sharp = require('sharp');

    const {
      width = 1200,
      height = null,
      quality = 80,
      format = 'jpeg'
    } = options;

    // Process image
    let imageBuffer = await sharp(file.buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(format, { quality })
      .toBuffer();

    const fileName = `${folder}/${uuidv4()}.${format}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: imageBuffer,
      ContentType: `image/${format}`,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    // Generate thumbnail if requested
    if (options.createThumbnail) {
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover'
        })
        .toFormat(format, { quality: 70 })
        .toBuffer();

      const thumbnailName = `${folder}/thumbnails/${uuidv4()}.${format}`;

      const thumbnailParams = {
        Bucket: BUCKET_NAME,
        Key: thumbnailName,
        Body: thumbnailBuffer,
        ContentType: `image/${format}`,
        ACL: 'public-read'
      };

      const thumbnailResult = await s3.upload(thumbnailParams).promise();

      return {
        url: result.Location,
        key: result.Key,
        thumbnailUrl: thumbnailResult.Location,
        thumbnailKey: thumbnailResult.Key
      };
    }

    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw error;
  }
};

// Upload video
exports.uploadVideo = async (file, folder = 'videos') => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    console.error('Error uploading video to S3:', error);
    throw error;
  }
};

// List files in a folder
exports.listFiles = async (folder, maxKeys = 1000) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Prefix: folder,
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(params).promise();

    return {
      files: result.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`
      })),
      isTruncated: result.IsTruncated,
      nextContinuationToken: result.NextContinuationToken
    };
  } catch (error) {
    console.error('Error listing files from S3:', error);
    throw error;
  }
};

// Copy file within S3
exports.copyFile = async (sourceKey, destinationKey) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
      ACL: 'public-read'
    };

    const result = await s3.copyObject(params).promise();

    return {
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${destinationKey}`,
      key: destinationKey,
      copySource: sourceKey
    };
  } catch (error) {
    console.error('Error copying file in S3:', error);
    throw error;
  }
};

// Check if file exists
exports.fileExists = async (fileKey) => {
  try {
    if (!isS3Configured()) {
      throw new Error('AWS S3 is not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

module.exports = exports;
