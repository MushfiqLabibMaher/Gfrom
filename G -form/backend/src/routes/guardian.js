const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { upload, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_PHOTO_SIZE, MAX_VIDEO_SIZE } = require('../middleware/upload');
const { uploadAndVerify } = require('../services/storageService');

// Accept one photo and one video per submission
const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

/**
 * POST /api/guardian/submit
 * Submit a missing person guardian form with optional photo and video.
 */
router.post('/submit', uploadFields, async (req, res, next) => {
  try {
    // ── 1. Validate required text fields ──────────────────────────────────
    const {
      guardian_name,
      guardian_phone,
      guardian_email,
      child_name,
      child_age,
      child_gender,
      last_seen_date,
      last_seen_location,
      description,
    } = req.body;

    const missing = [];
    if (!guardian_name?.trim()) missing.push('guardian_name');
    if (!guardian_phone?.trim()) missing.push('guardian_phone');
    if (!child_name?.trim()) missing.push('child_name');
    if (!child_age) missing.push('child_age');
    if (!last_seen_date?.trim()) missing.push('last_seen_date');
    if (!last_seen_location?.trim()) missing.push('last_seen_location');

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // ── 2. Validate & upload photo ────────────────────────────────────────
    let photoResult = null;
    if (req.files?.photo?.[0]) {
      const photo = req.files.photo[0];

      if (!ALLOWED_IMAGE_TYPES.includes(photo.mimetype)) {
        return res.status(400).json({ success: false, message: 'Photo must be JPEG, PNG, or WebP' });
      }
      if (photo.size > MAX_PHOTO_SIZE) {
        return res.status(400).json({ success: false, message: 'Photo must be under 10 MB' });
      }

      photoResult = await uploadAndVerify(photo.buffer, photo.originalname, photo.mimetype, 'photos');
    }

    // ── 3. Validate & upload video ────────────────────────────────────────
    let videoResult = null;
    if (req.files?.video?.[0]) {
      const video = req.files.video[0];

      if (!ALLOWED_VIDEO_TYPES.includes(video.mimetype)) {
        return res.status(400).json({ success: false, message: 'Video must be MP4, MOV, or WebM' });
      }
      if (video.size > MAX_VIDEO_SIZE) {
        return res.status(400).json({ success: false, message: 'Video must be under 100 MB' });
      }

      videoResult = await uploadAndVerify(video.buffer, video.originalname, video.mimetype, 'videos');
    }

    // ── 4. Save submission to Supabase DB ─────────────────────────────────
    const { data, error: dbError } = await supabase
      .from('guardian_submissions')
      .insert([
        {
          guardian_name: guardian_name.trim(),
          guardian_phone: guardian_phone.trim(),
          guardian_email: guardian_email?.trim() || null,
          child_name: child_name.trim(),
          child_age: parseInt(child_age, 10),
          child_gender: child_gender?.trim() || null,
          last_seen_date,
          last_seen_location: last_seen_location.trim(),
          description: description?.trim() || null,
          photo_url: photoResult?.publicUrl || null,
          photo_path: photoResult?.path || null,
          video_url: videoResult?.publicUrl || null,
          video_path: videoResult?.path || null,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // ── 5. Respond ────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Submission received successfully',
      submission_id: data.id,
      files: {
        photo: photoResult
          ? { url: photoResult.publicUrl, size: photoResult.size, verified: true }
          : null,
        video: videoResult
          ? { url: videoResult.publicUrl, size: videoResult.size, verified: true }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/guardian/:id
 * Retrieve a single submission by ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('guardian_submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
