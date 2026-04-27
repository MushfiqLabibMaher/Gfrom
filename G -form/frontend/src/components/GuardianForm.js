import React, { useState, useRef } from 'react';
import axios from 'axios';
import FileUploadField from './FileUploadField';
import SubmissionSuccess from './SubmissionSuccess';
import './GuardianForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const INITIAL_FORM = {
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  child_name: '',
  child_age: '',
  child_gender: '',
  last_seen_date: '',
  last_seen_location: '',
  description: '',
};

export default function GuardianForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submission, setSubmission] = useState(null);
  const formRef = useRef(null);

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.guardian_name.trim()) newErrors.guardian_name = 'Guardian name is required';
    if (!form.guardian_phone.trim()) newErrors.guardian_phone = 'Phone number is required';
    if (form.guardian_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardian_email)) {
      newErrors.guardian_email = 'Enter a valid email address';
    }
    if (!form.child_name.trim()) newErrors.child_name = "Child's name is required";
    if (!form.child_age || isNaN(form.child_age) || form.child_age < 0 || form.child_age > 18) {
      newErrors.child_age = 'Enter a valid age (0–18)';
    }
    if (!form.last_seen_date) newErrors.last_seen_date = 'Last seen date is required';
    if (!form.last_seen_location.trim()) newErrors.last_seen_location = 'Last seen location is required';
    return newErrors;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setProgress(0);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (photo) formData.append('photo', photo);
    if (video) formData.append('video', video);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/guardian/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      if (response.data.success) {
        setSubmission(response.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Submission failed. Please check your connection and try again.';
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submission) {
    return (
      <SubmissionSuccess
        submissionId={submission.submission_id}
        files={submission.files}
        onReset={() => {
          setSubmission(null);
          setForm(INITIAL_FORM);
          setPhoto(null);
          setVideo(null);
          setProgress(0);
        }}
      />
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form
      ref={formRef}
      className="guardian-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Missing person guardian report form"
    >
      {/* ── Guardian Information ── */}
      <section className="form-section">
        <h2>Guardian Information</h2>

        <div className="form-group">
          <label htmlFor="guardian_name">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="guardian_name"
            name="guardian_name"
            type="text"
            value={form.guardian_name}
            onChange={handleChange}
            aria-invalid={!!errors.guardian_name}
            aria-describedby={errors.guardian_name ? 'err-guardian_name' : undefined}
            placeholder="Your full name"
            autoComplete="name"
          />
          {errors.guardian_name && (
            <span id="err-guardian_name" className="field-error" role="alert">
              {errors.guardian_name}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guardian_phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="guardian_phone"
              name="guardian_phone"
              type="tel"
              value={form.guardian_phone}
              onChange={handleChange}
              aria-invalid={!!errors.guardian_phone}
              aria-describedby={errors.guardian_phone ? 'err-guardian_phone' : undefined}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />
            {errors.guardian_phone && (
              <span id="err-guardian_phone" className="field-error" role="alert">
                {errors.guardian_phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="guardian_email">Email Address</label>
            <input
              id="guardian_email"
              name="guardian_email"
              type="email"
              value={form.guardian_email}
              onChange={handleChange}
              aria-invalid={!!errors.guardian_email}
              aria-describedby={errors.guardian_email ? 'err-guardian_email' : undefined}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.guardian_email && (
              <span id="err-guardian_email" className="field-error" role="alert">
                {errors.guardian_email}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Child Information ── */}
      <section className="form-section">
        <h2>Missing Child Information</h2>

        <div className="form-group">
          <label htmlFor="child_name">
            Child's Full Name <span className="required">*</span>
          </label>
          <input
            id="child_name"
            name="child_name"
            type="text"
            value={form.child_name}
            onChange={handleChange}
            aria-invalid={!!errors.child_name}
            aria-describedby={errors.child_name ? 'err-child_name' : undefined}
            placeholder="Child's full name"
          />
          {errors.child_name && (
            <span id="err-child_name" className="field-error" role="alert">
              {errors.child_name}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="child_age">
              Age <span className="required">*</span>
            </label>
            <input
              id="child_age"
              name="child_age"
              type="number"
              min="0"
              max="18"
              value={form.child_age}
              onChange={handleChange}
              aria-invalid={!!errors.child_age}
              aria-describedby={errors.child_age ? 'err-child_age' : undefined}
              placeholder="Age"
            />
            {errors.child_age && (
              <span id="err-child_age" className="field-error" role="alert">
                {errors.child_age}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="child_gender">Gender</label>
            <select id="child_gender" name="child_gender" value={form.child_gender} onChange={handleChange}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="last_seen_date">
              Last Seen Date <span className="required">*</span>
            </label>
            <input
              id="last_seen_date"
              name="last_seen_date"
              type="date"
              value={form.last_seen_date}
              onChange={handleChange}
              aria-invalid={!!errors.last_seen_date}
              aria-describedby={errors.last_seen_date ? 'err-last_seen_date' : undefined}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.last_seen_date && (
              <span id="err-last_seen_date" className="field-error" role="alert">
                {errors.last_seen_date}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="last_seen_location">
              Last Seen Location <span className="required">*</span>
            </label>
            <input
              id="last_seen_location"
              name="last_seen_location"
              type="text"
              value={form.last_seen_location}
              onChange={handleChange}
              aria-invalid={!!errors.last_seen_location}
              aria-describedby={errors.last_seen_location ? 'err-last_seen_location' : undefined}
              placeholder="City, address, or landmark"
            />
            {errors.last_seen_location && (
              <span id="err-last_seen_location" className="field-error" role="alert">
                {errors.last_seen_location}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Additional Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Clothing, physical features, circumstances of disappearance..."
          />
        </div>
      </section>

      {/* ── File Uploads ── */}
      <section className="form-section">
        <h2>Upload Photo &amp; Video</h2>
        <p className="section-hint">
          Attach a recent photo and/or a short video to help with identification.
        </p>

        <div className="form-row uploads-row">
          <FileUploadField
            id="photo-upload"
            label="Recent Photo"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={10}
            fileType="photo"
            file={photo}
            onChange={setPhoto}
          />
          <FileUploadField
            id="video-upload"
            label="Short Video"
            accept="video/mp4,video/quicktime,video/webm"
            maxSizeMB={30}
            fileType="video"
            file={video}
            onChange={setVideo}
          />
        </div>
      </section>

      {/* ── Upload progress ── */}
      {loading && progress > 0 && (
        <div className="progress-bar-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-label">{progress}% uploaded</span>
        </div>
      )}

      {/* ── Submit error ── */}
      {submitError && (
        <div className="submit-error" role="alert">
          <strong>Error:</strong> {submitError}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit Report'}
      </button>

      <p className="required-note">
        <span className="required">*</span> Required fields
      </p>
    </form>
  );
}
