import React from 'react';
import './SubmissionSuccess.css';

/**
 * Shown after a successful form submission.
 * Displays the submission ID and confirms which files were uploaded and verified.
 */
export default function SubmissionSuccess({ submissionId, files, onReset }) {
  return (
    <div className="success-card" role="status" aria-live="polite">
      <div className="success-icon">✅</div>
      <h2>Report Submitted Successfully</h2>
      <p>
        Your report has been received. Authorities will review it as soon as possible.
        Please keep your phone accessible for follow-up contact.
      </p>

      <div className="submission-id">
        <span>Reference ID:</span>
        <strong>{submissionId}</strong>
      </div>

      {/* File upload verification summary */}
      <div className="file-status-section">
        <h3>File Upload Status</h3>
        <ul className="file-status-list">
          <li className={files?.photo ? 'status-ok' : 'status-none'}>
            {files?.photo ? (
              <>
                🖼️ <strong>Photo</strong> — uploaded &amp; verified
                <span className="file-size-badge">
                  {(files.photo.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </>
            ) : (
              <>🖼️ <strong>Photo</strong> — not provided</>
            )}
          </li>
          <li className={files?.video ? 'status-ok' : 'status-none'}>
            {files?.video ? (
              <>
                🎥 <strong>Video</strong> — uploaded &amp; verified
                <span className="file-size-badge">
                  {(files.video.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </>
            ) : (
              <>🎥 <strong>Video</strong> — not provided</>
            )}
          </li>
        </ul>
      </div>

      <button className="reset-btn" onClick={onReset}>
        Submit Another Report
      </button>
    </div>
  );
}
