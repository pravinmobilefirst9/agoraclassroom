import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import axios from "axios";

const sdkToken =
  "NETLESSSDK_YWs9X0xpa1pnY3ltcVZHeFg2TiZub25jZT01ZjYzNzRlMC1jOTdhLTExZWQtYmM3Zi1mNTJjMTZjNzkzYzYmcm9sZT0wJnNpZz0xYmMwNDM2ZTZkNmE4YzkyMjAyNmNjZjc4NTNlZGUyNTBiYWI3YWFmYmRlNDRkNzlmNjIxOTZkNDU4MTNkYTI5";
const appIdentifier = "sSUHMLjHEe2Nx9_Oi854JA/wNOqW69GeIzR0w";
const region = "cn-hz";
interface paramsType {
  uuid: string;
  roomToken: string;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (name === "" || roomId === "") {
      alert("Please fill the data of name and room id to continue.");
      return false;
    }
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
          uuid: roomUUID,
          roomToken: roomToken,
        };

        return handleSaveDetail(params);
      });
  };

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

  const handleSaveDetail = async (params: paramsType) => {
    const param = {
      displayName: name,
      uId: 10,
      roomId: Number(roomId),
      whiteBoardToken: params.roomToken,
      whiteBoardUuid: "string",
    };
    const { data } = await axios.post(
      "https://agoramobilefirstapi-production.up.railway.app/api/set-platform-data",
      param
    );

    if (data?.message === "Created successfully!") {
      window.location.href = `/room?room=${data?.id}&uuid=${params.uuid}`;
      sessionStorage.setItem("display_name", name);
    }

    console.log("data", data);
  };

  return (
    <>
      <Script
        defer
        type="text/javascript"
        src={`https://edu-sdk.vercel.app/js/agora-rtm-sdk-1.5.1.js`}
        onLoad={() => {
          console.log("agora-rtm-sdk-1.5.1 Script has loaded");
        }}
      />
      <Script src="https://edu-sdk.vercel.app/js/lobby.js" />
      <header id="nav">
        <div className="nav--list">
          <h3 id="logo">
            <span>Virtual Classroom</span>
          </h3>
        </div>
        {/* <div id="nav__links">
          <Link className="nav__link" id="create__room__btn" href="/">
            Create Room
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#ede0e0"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
            </svg>
          </Link>
        </div> */}
      </header>
      <main id="room__lobby__container">
        <div id="form__container">
          <div id="form__container__header">
            <p>Create or Join Room</p>
          </div>
          <form id="lobby__form">
            <div className="form__field__wrapper">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your display name..."
              />
            </div>
            <div className="form__field__wrapper">
              <label>Room ID</label>
              <input
                type="text"
                name="room"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                placeholder="Enter room id..."
              />
            </div>
            <div className="form__field__wrapper">
              <button type="submit" onClick={(e) => handleSubmit(e)}>
                Join Meeting
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
