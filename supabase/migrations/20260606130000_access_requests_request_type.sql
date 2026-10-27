-- Optional request classification for access_requests (SOF vs general intake).
alter table access_requests add column if not exists request_type text default 'general';

create index if not exists access_requests_request_type_idx on access_requests (request_type);
