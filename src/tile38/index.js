const { tileClient, isOpen, close, status, flushDb } = require('./connection');

isOpen().then(() => {
  console.log('Tile38 Connection is Open');
}).catch(error => {
  console.log(error);
  close();
});

module.exports = {
  tileClient,
  status,
  flushDb,
};
