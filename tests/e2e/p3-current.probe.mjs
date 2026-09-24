// Independent provisional-code probes: no external RPC, DB, key or real signatures.
import { build } from 'esbuild';
const result = await build({stdin:{contents:`
export {AuthorizationService} from './src/server/application/stamps/authorizationService';
export {VisitService,MockVisitVerifierAuthorizer} from './src/server/application/stamps/visitService';
export {InMemoryStampsRepository} from './src/server/application/stamps/testing/inMemoryStampsRepository';
export {createStampsController} from './src/server/controllers/stamps/stampsController';
export {ChainIndexer} from './jobs/chain-indexer/indexer';
export {FakeIndexerChain} from './jobs/chain-indexer/testing/fakeIndexerChain';
export {InMemoryIndexerRepository} from './jobs/chain-indexer/testing/inMemoryIndexerRepository';
`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const m=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const recipient='0x2222222222222222222222222222222222222222';
const contract='0x1111111111111111111111111111111111111111';
const bytes='0x'+'11'.repeat(32);
let now=1000, nonce=0;
const repo=new m.InMemoryStampsRepository();
const clock={nowSeconds:()=>now};
const wallet={requireSession:async()=>({address:recipient})};
const visits=new m.VisitService(repo,clock,new m.MockVisitVerifierAuthorizer('synthetic-test-only'),wallet);
const visit=await visits.requestVisitChallenge('synthetic-session','busan-alley:demo:jeonpo:v1','jp-f1');
await visits.approveVisit(visit.id,'synthetic-test-only');
const rpc={chainId:31337,contractAddress:contract,hasStamp:async()=>false};
const service=new m.AuthorizationService(repo,clock,{generate:()=>String(++nonce)},{signClaim:async()=> '0x00'},rpc,visits);
const first=await service.issueAuthorization(recipient,visit.id,'key-1');
const second=await service.issueAuthorization(recipient,visit.id,'key-2');
now=1301;
let retryError=null;
try {await service.issueAuthorization(recipient,visit.id,'key-1');} catch(e) {retryError=e.code;}
let passedPending;
const controller=m.createStampsController({walletAuth:wallet,visits,authorizations:service,rpcProvider:rpc,status:{getStatus:async(a,b,c,p)=>{passedPending=p;return {status:p?'pending':'not_issued'};}}});
await controller.getStampStatus({address:recipient,campaignId:'busan-alley:demo:jeonpo:v1',spotId:'jp-f1'});
const chain=new m.FakeIndexerChain();
const ir=new m.InMemoryIndexerRepository();
chain.mineBlock();
chain.mineBlock([{recipient,campaignId:bytes,spotId:bytes,nonce:1n}]);
chain.mineBlock();
const indexer=new m.ChainIndexer(chain,ir,{chainId:31337,contractAddress:contract,deploymentBlockNumber:1n,confirmations:1n,maxBlockRange:100n});
await indexer.syncOnce();
chain.reorgAfter(1n);
const reorg=await indexer.syncOnce();
const cursor=await ir.getCursor(31337,contract);
const findings=[
 {id:'same-visit-new-key',violated:first.payload.nonce!==second.payload.nonce,actual:{firstNonce:first.payload.nonce,secondNonce:second.payload.nonce},expected:'same visit retry reuses active authorization'},
 {id:'retry-with-valid-authorization-after-visit-ttl',violated:retryError!==null,actual:{now,claimDeadline:first.payload.deadline,error:retryError},expected:'replay existing unexpired authorization without rechecking expired visit challenge'},
 {id:'pending-hardcoded-false',violated:passedPending===false,actual:{passedPending},expected:'derive pending from matching persisted authorization/tx state'},
 {id:'shorter-chain-stale-cursor',violated:cursor?.processedBlockNumber===2n,actual:{outcome:reorg.status,cursor:cursor?.processedBlockNumber.toString(),tip:'1'},expected:'invalidate orphaned projection or explicit unavailable state; never up_to_date with orphaned records'},
];
console.log(JSON.stringify({kind:'provisional-p3-probe',findings,violationCount:findings.filter(f=>f.violated).length},null,2));
process.exitCode=findings.some(f=>f.violated)?1:0;
