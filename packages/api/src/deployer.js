var cp = require('child_process');
var WebSocket = require('ws');

function createDeployer(wsPort = 3033){
var ws;

var children = {};

var wss = new WebSocket.Server({
  port: wsPort
});

var sendEvent = function (event) {
  var message = JSON.stringify(event);
  console.log('ws -> send: ' + message);
  ws.send(message);
};

var onMessage = function (message) {
  console.log('ws -> message: ' + message);
  var messageObj = JSON.parse(message);
  var action = messageObj.action;
  var uuid = messageObj.uuid;

  var args = messageObj.args;

  var data = messageObj.data;
  var signal = messageObj.signal;

  if(action === 'exec'){
    _exec(uuid, args);
  }else if(action === 'stdin.write') {
    children[uuid].stdin.write(data);
  }else if(action === 'stdin.end') {
    children[uuid].stdin.end();
  }else if(action === 'kill'){
    children[uuid].kill(signal);
  }

}

wss.on('connection', function (ws_) {
  console.log('ws -> connection');
  ws = ws_;
  ws.on('message', onMessage);

  ws.on('close', function () {
    console.log('ws -> close');
  });
});

var _exec = function (uuid, args) {
  var child = cp.exec('npm run '+args, args, function(error, stdout, stderr){
    sendEvent({
      type: 'exec',
      error: error ? error.message : null,
      stdout: stdout,
      stderr: stderr,
      uuid: uuid
    });
  });

  children[uuid] = child;

  child.stdout.on('data', function (data) {
    console.log('exec stdout.data ' + uuid + data);
    sendEvent({
      type: 'stdout.data', data: data, typeOf: typeof data, uuid: uuid
    });
  });

  child.stderr.on('data', function (data) {
    console.log('exec stderr.data ' + uuid + data);
    sendEvent({
      type: 'stderr.data', data: data, uuid: uuid
    });
  });

  child.on('exit', function (code, signal) {
    console.log('exec exit ' + uuid + code + signal);
    sendEvent({
      type: 'exit', code: code, signal: signal, uuid: uuid
    });
  });

  child.on('close', function (code, signal) {
    console.log('exec close ' + uuid + code + signal);
    sendEvent({
      type: 'close', code: code, signal: signal, uuid: uuid
    });
  });

  console.log('open ' + uuid);
  sendEvent({
    type: 'open', uuid: uuid
  });

};

return wss;
}

module.exports = createDeployer;