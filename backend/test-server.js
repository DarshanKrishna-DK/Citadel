const express = require('express');
const { createServer } = require('http');

console.log('🔧 Testing basic server startup...');

const app = express();
const server = createServer(app);
const PORT = 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

server.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Test for 10 seconds then exit
setTimeout(() => {
  console.log('🛑 Test complete, shutting down...');
  server.close();
  process.exit(0);
}, 10000);