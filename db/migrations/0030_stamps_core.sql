-- P3-DB (03 구현). agent_04 dependency_request STAMPS-DB-04:
-- src/server/application/stamps/ports.ts의 StampsRepository 계약을 구현하기 위한 테이블.
-- migration 번호 대역 0030-0039는 03이 발급 (docs/reports/backend/db-namespace-plan.md).
-- 파괴적 변경 없음 - 신규 테이블만 추가한다.

CREATE TABLE wallet_challenges (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  consumed_at BIGINT
);

CREATE TABLE wallet_sessions (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  expires_at BIGINT NOT NULL
);
CREATE INDEX wallet_sessions_address_idx ON wallet_sessions (address);

CREATE TABLE visit_requests (
  id TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  campaign_namespace TEXT NOT NULL,
  canonical_spot_id TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('requested', 'approved', 'rejected', 'expired')),
  expires_at BIGINT NOT NULL,
  verifier_id TEXT,
  approved_at BIGINT,
  created_at BIGINT NOT NULL
);
CREATE INDEX visit_requests_wallet_idx ON visit_requests (wallet);

-- StampAuthorizationRecord (ports.ts). nonce는 "recipient당 UNIQUE" (전역 UNIQUE 아님) -
-- 대소문자 섞인 주소가 같은 지갑을 가리켜도 충돌을 감지하도록 LOWER(recipient) 기준 색인.
CREATE TABLE stamp_authorizations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visit_requests (id),
  recipient TEXT NOT NULL,
  chain_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  deadline TEXT NOT NULL,
  request_body_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  idempotency_scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('issued', 'expired', 'consumed')),
  created_at BIGINT NOT NULL,
  UNIQUE (idempotency_scope, idempotency_key)
);
CREATE UNIQUE INDEX stamp_authorizations_recipient_nonce_uidx
  ON stamp_authorizations (LOWER(recipient), nonce);
