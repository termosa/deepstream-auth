var DeepstreamServer = require('deepstream.io');
var server = new DeepstreamServer();

server.set('host', 'deepstream');
server.set('port', 6020);
server.set('permissionHandler', {
  isValidUser: function (connectionData, authData, callback) {
    if (authData.username === authData.password) {
      callback(null, authData.username || 'Guest');
    } else {
      callback('can not match such user');
    }
  },
  canPerformAction: function (username, message, callback) {
    console.log('validate');
    callback(null, true);
  },
  onClientDisconnect: function (username) {
    console.log('Goodbye, ' + username + '!');
  }
});

server.start();
