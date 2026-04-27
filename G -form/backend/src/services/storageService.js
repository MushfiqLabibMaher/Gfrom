const supabase = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'missing-person-files';

/**
 * Upload a file buffer to Supabase Storage and verify it landed correctly.
 * @param {Buffer} buffer - File data
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type
 * @param {string} folder - 'photos' | 'videos'
 * @returns {{ path: string, publicUrl: string, size: number }}
 */
async function uploadAndVerify(buffer, originalName, mimeType, folder) {
  const ext = originalName.split('.').pop();
  const fileName = `${uuidv4()}.${ext}`;
  const storagePath = `${folder}/${fileName}`;

  // 1. Upload
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 2. Verify — fetch metadata to confirm the file exists and size matches
  const { data: metaData, error: metaError } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: fileName });

  if (metaError) {
    throw new Error(`Verification failed (list error): ${metaError.message}`);
  }

  const uploaded = metaData?.find((f) => f.name === fileName);
  if (!uploaded) {
    throw new Error('Verification failed: file not found in storage after upload');
  }

  if (uploaded.metadata?.size && uploaded.metadata.size !== buffer.length) {
    throw new Error(
      `Verification failed: size mismatch (expected ${buffer.length}, got ${uploaded.metadata.size})`
    );
  }

  // 3. Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: urlData.publicUrl,
    size: buffer.length,
  };
}

module.exports = { uploadAndVerify };
