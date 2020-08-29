const { tileConfig } = require('../config');
const Tile38 = require('tile38');

const tileClient = new Tile38(tileConfig);

const isOpen = async () => await tileClient.ping();

const close = async () => await tileClient.quit();

const status = async () => await tileClient.status();

const flushDb = async () => await tileClient.flushdb();

module.exports = {
  tileClient,
  isOpen,
  close,
  status,
  flushDb,
};
