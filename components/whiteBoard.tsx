import React, { useEffect } from "react";
import { createFastboard, createUI } from "@netless/fastboard";

interface propType {
  roomData: any;
}

export default function Whiteboard(props: propType) {
  const appIdentifier = "sSUHMLjHEe2Nx9_Oi854JA/wNOqW69GeIzR0w";
  const region = "cn-hz";

  let app;
  async function mountFastboard(div: any) {
    app = await createFastboard({
      sdkConfig: {
        appIdentifier: appIdentifier,
        region: region,
      },
      joinRoom: {
        uid: Math.random().toString(36).slice(2),
        uuid:
          props.roomData.whiteBoardUuid &&
          typeof props.roomData.whiteBoardUuid === "string"
            ? props.roomData.whiteBoardUuid
            : "",
        roomToken: props.roomData.whiteBoardToken,
      },
      managerConfig: {
        cursor: true,
      },
    });
    if ("app" in window) {
      window.app = app;
    }
    return createUI(app, div);
  }
  console.log("mountttt", app);
  useEffect(() => {
    mountFastboard(document.getElementById("app"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        id="app"
        style={{
          width: "950px",
          height: "1024px",
          border: "1px solid #EAEAEA",
        }}
      ></div>
    </div>
  );
}
