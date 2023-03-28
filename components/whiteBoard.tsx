import React, { useEffect, useState } from "react";
//import { WhiteWebSdk, RoomWhiteboard } from "white-react-sdk";
import { createFastboard, createUI } from "@netless/fastboard";
// import { useFastboard, Fastboard } from "@netless/fastboard-react";
import Script from "next/script";

interface paramsType {
  uid: string;
  uuid: string;
  roomToken: string;
}

interface propType {
  uuid: string | string[] | undefined;
  roomData: any;
}

export default function Whiteboard(props: propType) {
  const sdkToken =
    "NETLESSSDK_YWs9X0xpa1pnY3ltcVZHeFg2TiZub25jZT01ZjYzNzRlMC1jOTdhLTExZWQtYmM3Zi1mNTJjMTZjNzkzYzYmcm9sZT0wJnNpZz0xYmMwNDM2ZTZkNmE4YzkyMjAyNmNjZjc4NTNlZGUyNTBiYWI3YWFmYmRlNDRkNzlmNjIxOTZkNDU4MTNkYTI5";
  const appIdentifier = "sSUHMLjHEe2Nx9_Oi854JA/wNOqW69GeIzR0w";
  const region = "cn-hz";

  //   const apps = useFastboard(() => ({
  //     sdkConfig: {
  //       appIdentifier: "sSUHMLjHEe2Nx9_Oi854JA/wNOqW69GeIzR0w",
  //       region: "cn-hz",
  //     },
  //     joinRoom: {
  //       uid: "59259290c97311edb6f821a90336bb0e",
  //       uuid: "59259290c97311edb6f821a90336aa0e",
  //       roomToken:
  //         "NETLESSROOM_YWs9X0xpa1pnY3ltcVZHeFg2TiZleHBpcmVBdD0xNjc5NTc2OTEwNzA4Jm5vbmNlPTE2Nzk1NzMzMTA3MDgwMCZyb2xlPTAmc2lnPWNjYjA3N2RiMTY2ZjAwYjkzYjE5ZDVhOGRmMzBkYzJkMjg2NDczZTc2MjNjODJhMjdjZmUyYzEyYjE0YzE5OGEmdXVpZD01OTI1OTI5MGM5NzMxMWVkYjZmODIxYTkwMzM2YWEwZQ",
  //     },
  //   }));

  //   const [room, setRoom] = useState<any>(null);

  function createRoom() {
    var url = "https://shunt-api.netless.link/v5/rooms";
    var requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        token: sdkToken,
        region: region,
      },
    };
    return window.fetch(url, requestInit).then(function (response) {
      return response.json();
    });
  }

  function createRoomToken(roomUUID: string) {
    var url = "https://shunt-api.netless.link/v5/tokens/rooms/" + roomUUID;
    var requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        token: sdkToken,
        region: region,
      },
      body: JSON.stringify({
        lifespan: 0, // indicates that the Room Token will never expire
        role: "admin", // indicates that Room Token has Admin authority
      }),
    };
    return window.fetch(url, requestInit).then(function (response) {
      return response.json();
    });
  }

  let app;
  async function mountFastboard(div: any, params: paramsType) {
    app = await createFastboard({
      sdkConfig: {
        appIdentifier: appIdentifier,
        region: region,
      },
      joinRoom: {
        uid: Math.random().toString(36).slice(2),
        uuid: props.uuid && typeof props.uuid === "string" ? props.uuid : "",
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
    var roomUUID = "";

    createRoom()
      .then(function (roomJSON) {
        // The room is created successfully, get the roomJSON describing the content of the room
        roomUUID = roomJSON.uuid;
        return createRoomToken(roomUUID);
      })
      .then(function (roomToken) {
        // The roomToken of the room has been checked out
        let params: paramsType = {
          uid: Math.random().toString(36).slice(2),
          uuid: roomUUID,
          roomToken: roomToken,
        };

        return mountFastboard(document.getElementById("app"), params);
      });
    //   .then(function (room) {
    //     console.log("testtest", room);
    //     // room.setMemberState({ currentApplianceName: "eraser" });
    //     console.log("testtestss", room);
    //     let element: HTMLElement | null = document.getElementById("whiteboard");
    //     const divElement: HTMLDivElement | null = element as HTMLDivElement;
    //     if (element !== null) {
    //       room.bindHtmlElement(divElement);
    //     }
    //     var toolbar: any = document.getElementById("toolbar");
    //     var toolNames = [
    //       "clicker",
    //       "selector",
    //       "rectangle",
    //       "eraser",
    //       "text",
    //       "arrow",
    //       "ellipse",
    //       "hand",
    //       "laserPointer",
    //       "shape",
    //       "straight",
    //     ];

    //     for (var idx in toolNames) {
    //       var toolName = toolNames[idx];
    //       var btn = document.createElement("BUTTON");
    //       btn.setAttribute("id", "btn" + toolName);
    //       var t = document.createTextNode(toolName);
    //       btn.appendChild(t);

    //       // Listen for the event of clicking a button.
    //       btn.addEventListener("click", function (obj) {
    //         console.log("clicked", obj);
    //         var ele: any = obj.target;
    //         // Call the setMemberState method to set the whiteboard tool.
    //         room.setMemberState({
    //           currentApplianceName: ele.getAttribute("id").substring(3),
    //           shapeType: "pentagram",
    //           strokeColor: [255, 182, 200],
    //           strokeWidth: 12,
    //           textSize: 40,
    //         });
    //       });
    //       setRoom({ room: room });
    //       toolbar.appendChild(btn);
    //       console.log(btn.getAttribute("id"));
    //     }

    //     setRoom({ room: room });
    //   })
    //   .catch(function (err) {
    //     // failed to create room
    //     console.error(err);
    //   });
  }, []);

  //   var whiteboardView = null;

  //   console.log("room", room);

  // Creating and joining a room is an asynchronous operation.
  // If this.state.room is not ready, the whiteboard will not be displayed.
  //   if (room) {
  //     whiteboardView = (
  //       <RoomWhiteboard
  //         room={room}
  //         style={{
  //           width: "100%",
  //           height: "100vh",
  //         }}
  //       />
  //     );
  //   }

  return (
    <div>
      {/* {whiteboardView} */}
      {/* <div
        id="whiteboard"
        className="white-board"
        // style={{ height: "1000px" }}
        style={{ width: "600px", height: "400px", border: "1px solid" }}
      ></div>
      <div
        id="toolbar"
        style={{
          position: "relative",
          top: "40px",
          height: "100px",
          zIndex: "10",
        }}
      ></div> */}
      <div
        id="app"
        style={{ width: "750px", height: "500px", border: "1px solid" }}
      ></div>
      {/* <Fastboard app={apps} /> */}
    </div>
  );
}