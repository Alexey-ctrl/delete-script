const https = require('https');
const Queue = require('./AsyncQueue');

const BASE_URL = '';
const ACCESS_TOKEN = '';
const REQUESTS_LIMIT = 20;

const api = {
  get: '/entity',
  delete: '/entity/by-identifier/'
};

const deleteQueue = new Queue(REQUESTS_LIMIT, async(entity, next) => {
  await deleteEntity(entity);
  next();
});

(async () => {
  const entities = await request(api.get, 'GET');
  const regExp = new RegExp(process.argv[2]);

  for (const entity of entities) {
    if (entity.name.match(regExp)) {
      deleteQueue.add(entity);
    }
  }
})();

async function deleteEntity(entity) {
    try {
      await request(api.delete + entity.id, 'DELETE');
    } catch (e) {
      console.error(e);
    }
}

async function request(path, method) {
  return new Promise((resolve, reject) => {
    console.log(`${method} ${path}`);
    const req = https.request({
      hostname: BASE_URL,
      path,
      method,
      headers: {
        'Content-type': 'application/json',
        'X-Access-Token': ACCESS_TOKEN
      }
    }, res => {
      const chunks = [];

      res.on('data', chunk => chunks.push(chunk));

      res.on('end', () => {
        resolve(JSON.parse(chunks.join('')));
      });
    });

    req.on('error', reject);
    req.end();
  });
}