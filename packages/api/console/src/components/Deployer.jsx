import React, { useEffect, useRef } from 'react'
import Terminal from 'react-console-emulator'
import Button from '@material-ui/core/Button';

import { v4 } from "uuid";

function Deployer(props) {
  const { target } = props;

  var terminal = useRef(null);
  var _ws;
  
  useEffect(() => {

    _ws = new WebSocket('ws://' + ip + ':' + port);

    if (!_ws.on) {
      _ws.on = _ws.addEventListener;
    }

    _ws.on('open', () => terminal.current && terminal.current.pushToStdout("Connection established..."));
    _ws.on('close', () => terminal.pushToStdout(event.data));
    _ws.on('error', () => terminal.pushToStdout(event.data));

    _ws.on('message', function (event) {
      var data = event.data;
      console.log("data is");
      console.log(data);
        if (terminal.current) terminal.current.pushToStdout(JSON.parse(data).data);
    });

    console.log("Loaded")
  }, []);


  var port = 3033;
  var ip = 'localhost';

  const _sendCommand = function (command) {
    console.log('on -> sendMessage: ' + JSON.stringify(command, undefined, 2));
    var message = JSON.stringify(command);
    _ws.send(message);
  };

  let children = {};

  class Stdin {
    open = false;
    constructor(uuid) {
      this.uuid = uuid;
    }
    write = function (data) {
      var self = this;

      var _write = function () {
        console.log('push', self.uuid)
        _sendCommand({
          action: 'stdin.write', uuid: self.uuid, data: data
        });
      };

      if (!this.open) {
        this.once('open', function () {
          console.log('child.open');
          _write();
        });
      } else {
        _write();
      }
    }
    end = function () {
      console.log('end', this.uuid);

      _sendCommand({
        action: 'stdin.end', uuid: this.uuid
      });
    }
  }

  class Stdout {

  }
  class Stderr {

  }

  class Child {
    constructor(uuid) {
      this.uuid = uuid;
      this.pid = null;
      this.connected = false;
      this.stdout = new Stdout();
      this.stderr = new Stderr();
      this.stdin = new Stdin(uuid);
    }

    kill = function (signal) {
      console.log('kill', this.uuid);

      _sendCommand({
        action: 'kill', uuid: this.uuid, signal: signal
      });
    }
  }

  function exec(args) {
    var uuid = v4();
    var child = new Child(uuid);
    children[uuid] = child;

    var _exec = function () {
      _sendCommand({
        action: 'exec', uuid: uuid, args: args
      });
    };

    _exec();


    return child;
  };

  return (
    <div className="Deployer">
        <Terminal
          commands={{}}
          ref={terminal} // Assign ref to the terminal here
          welcomeMessage={"Ready to deploy contracts on " + target}
          readOnly
        />
        <Button variant="contained" style={{ margin: "1em" }} color="primary" onClick={() => exec(target)}>
          Deploy
        </Button>
    </div>
  )
}

export default Deployer
