import http from 'http';
import { apiHandler } from './app';

const PORT = Number(process.env.PORT) || 3001;

const server = http.createServer((req, res) => {
  apiHandler(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 [exCor 백엔드 API 서버] http://localhost:${PORT}/api 실행 중`);
});

export default server;
