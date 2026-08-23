# Production D1 audit — 2026-08-24

Read-only Cloudflare D1 metadata was queried from the connected account. Database: `givethra-auth`, UUID `5ad1094c-3288-4519-aeec-0446d82126f6`, production version. The query reported `rows_written: 0` and `changed_db: false`.

The production `deposits` table columns are: `id`, `user_id`, `method`, `amount`, `currency`, `transaction_id`, `proof_url`, `status`, `credits`, `submitted_at`, `reviewed_at`, `reviewed_by`, and `rejection_reason`. The current Worker deposit route incorrectly inserts legacy field names `payment_method`, `payment_reference`, `deposit_date`, and `created_at`, which are not in this table.

The production `user_settings` table columns are: `user_id`, `language`, `theme`, `currency`, `timezone`, `email_notifications`, `inapp_notifications`, `weekly_digest`, `high_contrast`, `larger_text`, `reduced_animations`, and `updated_at`. The current Worker user-settings route only persists `currency`, `language`, `notifications_enabled`, and `theme`, so most Settings page values are discarded and `notifications_enabled` is not a production column.

The production `support_messages` table columns are: `id`, `user_id`, `sender`, `message`, `attachment_url`, `language`, `is_read`, and `created_at`. The current Worker unread-count route filters on nonexistent `is_from_user` instead of `sender`, and the Admin open-chat action calls the reply endpoint with `mark_read: true`, which currently inserts an Admin message rather than marking messages read.

The production `notifications` table columns are: `id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, and `created_at`.

The production `users` table includes `user_id`, `email`, `full_name`, `avatar_url`, `signed_up_at`, KYC/case counters, `balance`, `updated_at`, and `last_community_visit`. The production `profiles` table includes `user_id`, `full_name`, phone, location, bio, language, avatar/cover URLs, timestamps, and suspension fields. The production `case_submissions` table includes complete case metadata plus `photo_urls`, `selfie_url`, `video_url`, `category_details`, and `paid_receipt_url`.

Source supplied by the user: `/home/ubuntu/upload/pasted_content.txt`. Its attachment-label guidance uses URL key parsing, explicit original filename metadata, duplicate-by-URL filtering, and recursive traversal of nested case payloads. The canonical Admin case card already contains that general recursive walker and filename logic; remaining verification should preserve it rather than replace it.

The live `wallets` table schema was verified read-only: primary key `user_id` TEXT, `balance` REAL default 0, and `updated_at` TEXT. The query returned `changed_db: false`, `rows_written: 0`, and HTTP 200.
