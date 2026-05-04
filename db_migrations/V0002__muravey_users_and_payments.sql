-- Ð¢Ð°Ð±Ð»Ð¸ÑÐ° Ð°Ð½Ð¾Ð½Ð¸Ð¼Ð½ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÐµÐ¹ ÐÑÑÐ°Ð²ÑÑ (Ð¸Ð´ÐµÐ½ÑÐ¸ÑÐ¸ÐºÐ°ÑÐ¸Ñ Ð¿Ð¾ device_id Ð¸Ð»Ð¸ email)
CREATE TABLE IF NOT EXISTS muravey_users (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  free_requests_used INTEGER NOT NULL DEFAULT 0,
  paid_requests_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_muravey_users_device_id ON muravey_users(device_id);
CREATE INDEX IF NOT EXISTS idx_muravey_users_email ON muravey_users(email);

-- Ð¢Ð°Ð±Ð»Ð¸ÑÐ° Ð¿Ð»Ð°ÑÐµÐ¶ÐµÐ¹
CREATE TABLE IF NOT EXISTS muravey_payments (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  package_id VARCHAR(20) NOT NULL,        -- '20req', '40req', '100req'
  requests_count INTEGER NOT NULL,        -- ÐºÐ¾Ð»-Ð²Ð¾ Ð·Ð°Ð¿ÑÐ¾ÑÐ¾Ð² Ð² Ð¿Ð°ÐºÐµÑÐµ
  amount INTEGER NOT NULL,               -- ÑÑÐ¼Ð¼Ð° Ð² ÐºÐ¾Ð¿ÐµÐ¹ÐºÐ°Ñ
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, paid, failed
  payment_id VARCHAR(255) NULL,          -- ID Ð¿Ð»Ð°ÑÐµÐ¶Ð° Ð¾Ñ Ð¢-ÐÐ¸Ð·Ð½ÐµÑ
  sbp_qr_url TEXT NULL,                  -- ÑÑÑÐ»ÐºÐ° Ð½Ð° QR-ÐºÐ¾Ð´ Ð¡ÐÐ
  sbp_payload TEXT NULL,                 -- payload Ð´Ð»Ñ Ð¡ÐÐ
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_muravey_payments_device_id ON muravey_payments(device_id);
CREATE INDEX IF NOT EXISTS idx_muravey_payments_payment_id ON muravey_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_muravey_payments_status ON muravey_payments(status);
