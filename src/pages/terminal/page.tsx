import Page from "@/context/page-context";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { AttachAddon } from "@xterm/addon-attach";
import "@xterm/xterm/css/xterm.css";

const WS_URL = "ws://" + location.host + "/ws";

const TerminalPage = () => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const container = terminalContainerRef.current;
    if (!container || wsRef.current) {
      return;
    }

    const url = WS_URL + "/terminal";
    const ws = new WebSocket(url);
    wsRef.current = ws;

    const term = new Terminal();
    const attachAddon = new AttachAddon(ws);
    term.loadAddon(attachAddon);
    term.open(container);

    // return () => {
    //   term.dispose();
    //   ws.close();
    // };
  }, []);

  return (
    <div className="container">
      <Page title="Terminal" />
      <div ref={terminalContainerRef}></div>
    </div>
  );
};

export default TerminalPage;
