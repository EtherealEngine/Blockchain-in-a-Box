import React, { useEffect, useRef } from "react";
import Terminal from "react-console-emulator";
import Button from "@material-ui/core/Button";
import { v4 } from "uuid";

interface DeployerProps {
  /**
   * Target to display.
   */
  target: string;
}

const Deployer: React.FunctionComponent<DeployerProps> = (
  props: DeployerProps
) => {
  const { target } = props;

  let terminal = useRef(null);
  let _ws: WebSocket;

  useEffect(() => {
    _ws = new WebSocket("ws://" + ip + ":" + port);

    _ws.addEventListener(
      "open",
      () =>
        terminal.current &&
        terminal.current.pushToStdout("Connection established...")
    );
    _ws.addEventListener("close", () => terminal.pushToStdout(event.data));
    _ws.addEventListener("error", () => terminal.pushToStdout(event.data));

    _ws.addEventListener("message", function (event) {
      let data = event.data;
      console.log("data is");
      console.log(data);
      if (terminal.current)
        terminal.current.pushToStdout(JSON.parse(data).data);
    });

    console.log("Loaded");
  }, []);

  let port = 3033;
  let ip = "localhost";

  const _sendCommand = function (command: any) {
    console.log("on -> sendMessage: " + JSON.stringify(command, undefined, 2));
    let message = JSON.stringify(command);
    _ws.send(message);
  };

  // Reference: https://stackoverflow.com/a/15879330/2077741
  let children: { [id: string]: Child } = {};

  class Stdin {
    open = false;
    uuid: string;
    constructor(uuid: string) {
      this.uuid = uuid;
    }
    public write(data: any) {
      let self = this;

      let _write = function () {
        console.log("push", self.uuid);
        _sendCommand({
          action: "stdin.write",
          uuid: self.uuid,
          data: data,
        });
      };

      if (!this.open) {
        this.once("open", function () {
          console.log("child.open");
          _write();
        });
      } else {
        _write();
      }
    }
    public end() {
      console.log("end", this.uuid);

      _sendCommand({
        action: "stdin.end",
        uuid: this.uuid,
      });
    }
  }

  class Stdout { }
  class Stderr { }

  class Child {
    uuid: string;
    pid: string | null;
    connected: boolean;
    stdout: Stdout;
    stderr: Stderr;
    stdin: Stdin;

    constructor(uuid: string) {
      this.uuid = uuid;
      this.pid = null;
      this.connected = false;
      this.stdout = new Stdout();
      this.stderr = new Stderr();
      this.stdin = new Stdin(uuid);
    }

    public kill(signal: any) {
      console.log("kill", this.uuid);

      _sendCommand({
        action: "kill",
        uuid: this.uuid,
        signal: signal,
      });
    }
  }

  function exec(args: any) {
    let uuid = v4();
    let child = new Child(uuid);
    children[uuid] = child;

    let _exec = function () {
      _sendCommand({
        action: "exec",
        uuid: uuid,
        args: args,
      });
    };

    _exec();

    return child;
  }

  return (
    <div className="Deployer">
      <Terminal
        commands={{}}
        ref={terminal} // Assign ref to the terminal here
        welcomeMessage={"Ready to deploy contracts on " + target}
        readOnly
      />
      {/* <Button
        style={{
          width: 300,
          marginTop: 10,
        }}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => exec(target)}
      >
        Deploy
      </Button> */}
    </div>
  );
};

export default Deployer;
