-- Set the file size limit for the missing-person-files bucket to 30 MB
update storage.buckets
set file_size_limit = 31457280  -- 30 MB in bytes (30 * 1024 * 1024)
where id = 'missing-person-files';
