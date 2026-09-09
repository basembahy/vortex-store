const app = require('../server/src/server');
const { initDb } = require('../server/src/config/initDb');

let isInitialized = false;
let initPromise = null;

module.exports = async (req, res) => {
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = initDb()
        .then(() => {
          isInitialized = true;
          console.log('✅ Vortex Store Database initialized on Vercel');
        })
        .catch((err) => {
          console.error('⚠️ Database init error on Vercel:', err);
          isInitialized = true;
        });
    }
    await initPromise;
  }
  return app(req, res);
};
