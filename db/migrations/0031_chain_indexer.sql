-- P3-DB (03 구현). agent_04 dependency_request STAMPS-DB-04 (P3-06 재사용):
-- jobs/chain-indexer/ports.ts의 IndexerRepository 계약을 구현하기 위한 테이블.
-- migration 번호 대역 0030-0039 (03 발급). 신규 테이블만 추가, 파괴적 변경 없음.
--
-- block_number는 chain에서 bigint로 오지만(viem) 실제 값 범위는 int8(BIGINT)에
-- 충분히 들어간다. 애플리케이션은 파라미터 바인딩 시 문자열로 변환해 전달한다
-- (드라이버별 JS bigint 직렬화 차이를 피하기 위함).

CREATE TABLE indexer_cursors (
  chain_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  processed_block_number BIGINT NOT NULL,
  processed_block_hash TEXT NOT NULL,
  PRIMARY KEY (chain_id, contract_address)
);

-- reorg 공통 조상 탐색용 "최근 처리 블록 해시 창" (03-onchain-system.md 6절).
-- 커서 tip 하나만으로는 조상을 찾을 수 없어 별도 테이블로 최근 N개를 유지한다.
CREATE TABLE indexer_recent_blocks (
  chain_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  PRIMARY KEY (chain_id, contract_address, block_number)
);

CREATE TABLE chain_events (
  chain_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INT NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  recipient TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  canonical BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (chain_id, contract_address, transaction_hash, log_index)
);
CREATE INDEX chain_events_block_idx ON chain_events (chain_id, contract_address, block_number);
CREATE INDEX chain_events_projection_lookup_idx
  ON chain_events (chain_id, contract_address, recipient, campaign_id, spot_id, canonical, block_number);

CREATE TABLE stamp_projections (
  chain_id BIGINT NOT NULL,
  contract_address TEXT NOT NULL,
  recipient TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  claim_transaction_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  PRIMARY KEY (chain_id, contract_address, recipient, campaign_id, spot_id)
);
