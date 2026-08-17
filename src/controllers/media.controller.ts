import { Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import { Media } from '../models/Media';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { CloudinaryFolder } from '@today-digitech/shared';

// Helper to upload buffer to Cloudinary
const uploadBufferToCloudinary = (
  buffer: Buffer,
  folderName: string,
  publicId?: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `today-digitech/${folderName}`,
        public_id: publicId,
        overwrite: !!publicId,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

export const uploadSingleMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No file provided for upload', 400, 'FILE_MISSING'));
    }

    const folder = (req.body.folder as CloudinaryFolder) || 'branding';
    const altText = req.body.altText || '';
    const caption = req.body.caption || '';
    const credit = req.body.credit || '';

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    // Create DB record
    const media = await Media.create({
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      folder,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      width: result.width,
      height: result.height,
      altText,
      caption,
      credit,
      uploadedBy: req.adminUser?.id,
    });

    await logAuditAction(req, 'UPLOAD_MEDIA', 'Media', { mediaId: media.id, publicId: media.publicId, folder });

    sendSuccess(res, media, 'Media uploaded successfully to Cloudinary', 201);
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return next(new AppError('No files provided for upload', 400, 'FILES_MISSING'));
    }

    const folder = (req.body.folder as CloudinaryFolder) || 'branding';
    const uploadedRecords = [];

    for (const file of files) {
      const result = await uploadBufferToCloudinary(file.buffer, folder);
      const media = await Media.create({
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        folder,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        width: result.width,
        height: result.height,
        uploadedBy: req.adminUser?.id,
      });
      uploadedRecords.push(media);
    }

    await logAuditAction(req, 'UPLOAD_MULTIPLE_MEDIA', 'Media', { count: uploadedRecords.length, folder });

    sendSuccess(res, uploadedRecords, `${uploadedRecords.length} files uploaded successfully`, 201);
  } catch (error) {
    next(error);
  }
};

export const getMediaList = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const features = new QueryFeatures(Media.find(), req.query)
      .filter(['fileName', 'altText', 'caption'])
      .sort()
      .limitFields();

    const { meta } = await features.paginate();
    const mediaList = await features.query;

    sendSuccess(res, mediaList, 'Media library fetched successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const updateMediaMetadata = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { altText, caption, credit } = req.body;

    const media = await Media.findById(id);
    if (!media) {
      return next(new AppError('Media asset not found', 404, 'MEDIA_NOT_FOUND'));
    }

    if (altText !== undefined) media.altText = altText;
    if (caption !== undefined) media.caption = caption;
    if (credit !== undefined) media.credit = credit;

    await media.save();
    await logAuditAction(req, 'UPDATE_MEDIA_METADATA', 'Media', { mediaId: id });

    sendSuccess(res, media, 'Media metadata updated successfully');
  } catch (error) {
    next(error);
  }
};

export const replaceMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return next(new AppError('Replacement file missing', 400, 'FILE_MISSING'));
    }

    const media = await Media.findById(id);
    if (!media) {
      return next(new AppError('Media asset not found', 404, 'MEDIA_NOT_FOUND'));
    }

    // Overwrite existing Cloudinary asset
    const result = await uploadBufferToCloudinary(req.file.buffer, media.folder, media.publicId);

    media.url = result.url;
    media.secureUrl = result.secure_url;
    media.fileSize = req.file.size;
    media.fileType = req.file.mimetype;
    media.width = result.width;
    media.height = result.height;
    await media.save();

    await logAuditAction(req, 'REPLACE_MEDIA', 'Media', { mediaId: id, publicId: media.publicId });

    sendSuccess(res, media, 'Media asset replaced successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return next(new AppError('Media asset not found', 404, 'MEDIA_NOT_FOUND'));
    }

    // Delete asset from Cloudinary
    await cloudinary.uploader.destroy(media.publicId);

    // Delete record from DB
    await Media.findByIdAndDelete(id);

    await logAuditAction(req, 'DELETE_MEDIA', 'Media', { mediaId: id, publicId: media.publicId });

    sendSuccess(res, null, 'Media asset deleted successfully from Cloudinary and database');
  } catch (error) {
    next(error);
  }
};
