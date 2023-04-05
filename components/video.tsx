import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
} from "agora-rtc-react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CircularProgress from "@mui/material/CircularProgress";

const ChatRoom = dynamic(() => import("../components/chat"), {
  ssr: false,
});

const Whiteboard = dynamic(() => import("../components/whiteBoard"), {
  ssr: false,
});

const config: ClientConfig = {
  mode: "rtc",
  codec: "vp8",
};

interface propType {
  roomData: any;
}

const appId: string = "a9a93ac27e184ee4bd333586bc90eff9";

export default function VideoCallMain(props: propType) {
  const [inCall, setInCall] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    console.log("window.innerHeight", window.innerHeight);
    if (inCall) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
  }, [inCall]);

  const useClient = createClient(config);
  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

  const VideoCall = () => {
    // const { setInCall, channelName } = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();

    useEffect(() => {
      // function to initialise the SDK
      let init = async () => {
        client.on("user-published", async (user, mediaType) => {
          console.log("client", user);
          await client.subscribe(user, mediaType);
          console.log("subscribe success");
          if (mediaType === "video") {
            setUsers((prevUsers) => {
              return [...prevUsers, user];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, type) => {
          console.log("unpublished", user, type);
          if (type === "audio") {
            user.audioTrack?.stop();
          }
          if (type === "video") {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on("user-left", (user) => {
          console.log("leaving", user);
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        });
        console.log("joinnn");
        await client.join(
          appId,
          props.roomData.display_name,
          props.roomData.videoToken,
          null
        );
        console.log(
          "client",
          client,
          typeof client
          // client.store
        );
        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
      };

      if (ready && tracks) {
        console.log("init ready");
        // if()
        init();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [, /* channelName */ client, ready, tracks]);
    return (
      <div className="App">
        {/* {ready && tracks && (
          <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
        )} */}
        {start && tracks && <Videos users={users} tracks={tracks} />}
      </div>
    );
  };

  const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  }) => {
    const client = useClient();
    const [trackState, setTrackState] = useState({ video: true, audio: true });
    const { users, tracks } = props;
    console.log("users", users, tracks);

    const leaveChannel = async () => {
      await client.leave();
      client.removeAllListeners();
      tracks[0].close();
      tracks[1].close();
      // setStart(false);
      setInCall(false);
    };

    const mute = async (type: "audio" | "video") => {
      if (type === "audio") {
        await tracks[0].setEnabled(!trackState.audio);
        setTrackState((ps) => {
          return { ...ps, audio: !ps.audio };
        });
      } else if (type === "video") {
        await tracks[1].setEnabled(!trackState.video);
        setTrackState((ps) => {
          return { ...ps, video: !ps.video };
        });
      }
    };

    return (
      <>
        <div className="sentImages">
          <div id="videos" className="video-wrapper">
            <div className="video-block">
              <div
                className="video-mute-btn video-mute-btn-first"
                onClick={() => mute("video")}
              >
                {trackState?.video ? <VideocamIcon /> : <VideocamOffIcon />}
              </div>
              <div className="video-mute-btn" onClick={() => mute("audio")}>
                {trackState?.audio ? <MicIcon /> : <MicOffIcon />}
              </div>
              <AgoraVideoPlayer
                className="vid"
                // style={{ width: "150px", height: "150px" }}
                videoTrack={tracks[1]}
              />
            </div>
            {users.length > 0 &&
              users.map((user) => {
                if (user.videoTrack) {
                  return (
                    <div className="video-block" key={user.uid}>
                      <AgoraVideoPlayer
                        className="vid"
                        // style={{ width: "150px", height: "150px" }}
                        videoTrack={user.videoTrack}
                      />
                    </div>
                  );
                } else return null;
              })}
          </div>
        </div>
        <div className="saveAttachImageEnd">
          {/* <div className="saveMainDiv">
            <div className="saveInnerDiv">
              <img src="/images/Frame (8).png" alt="" />
            </div>
            <div className="saveText">
              <p>Save</p>
            </div>
          </div>
          <div className="attachMainDiv">
            <div className="attachInnerDiv">
              <img src="/images/ant-design_paper-clip-outlined.png" alt="" />
            </div>
            <div className="attachText">
              <p>Attach</p>
            </div>
          </div>
          <div className="imageMainDiv">
            <div className="imageInnerDiv">
              <img src="/images/fluent_camera-24-regular.png" alt="" />
            </div>
            <div className="imageText">
              <p>img</p>
            </div>
          </div> */}
          <div
            className="endMainDiv"
            style={{ cursor: "pointer" }}
            onClick={() => leaveChannel()}
          >
            <div className="endInnerDiv" style={{ background: "#FF7A7A" }}>
              <img src="/images/log-in.png" alt="" />
            </div>
            <div className="endText">
              <p>End</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const Controls = (props: { tracks: any; setStart: any; setInCall: any }) => {
    const client = useClient();
    const { tracks, setStart, setInCall } = props;
    const [trackState, setTrackState] = useState({ video: true, audio: true });

    const mute = async (type: "audio" | "video") => {
      if (type === "audio") {
        await tracks[0].setEnabled(!trackState.audio);
        setTrackState((ps) => {
          return { ...ps, audio: !ps.audio };
        });
      } else if (type === "video") {
        await tracks[1].setEnabled(!trackState.video);
        setTrackState((ps) => {
          return { ...ps, video: !ps.video };
        });
      }
    };

    const leaveChannel = async () => {
      await client.leave();
      client.removeAllListeners();
      tracks[0].close();
      tracks[1].close();
      setStart(false);
      setInCall(false);
    };

    return (
      <div className="controls">
        <p
          className={trackState.audio ? "on" : ""}
          onClick={() => mute("audio")}
        >
          {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
        </p>
        <p
          className={trackState.video ? "on" : ""}
          onClick={() => mute("video")}
        >
          {trackState.video ? "MuteVideo" : "UnmuteVideo"}
        </p>
        {<p onClick={() => leaveChannel()}>Leave</p>}
      </div>
    );
  };

  const ChannelForm = () => {
    return (
      <form
        className="join"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#e990c5",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {appId === "" && (
          <p style={{ color: "red" }}>
            Please enter your Agora App ID in App.tsx and refresh the page
          </p>
        )}
        {/* <h1></h1> */}
        <input
          placeholder="Enter your name"
          type="text"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            sessionStorage.setItem("userName", userName);
            setUserName("");
            setInCall(true);
          }}
          style={{
            height: "56px",
            // width: "108px",
            padding: "4px 20px",
            fontSize: "24px",
            // margin: "auto",
            borderRadius: "8px",
            border: "none",
          }}
        >
          Welcome To Skylone
        </button>
      </form>
    );
  };

  const dots = [];

  for (let i = 1; i <= 1000; i++) {
    dots.push(<span key={`span${i + 1}`}></span>);
  }

  return (
    <>
      {inCall ? (
        <>
          {isLoading ? (
            <div
              style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <div className="whiteboard">
              {/* <div className="whiteboard__top">
              <img src="/images/Logo.png" alt="" />
            </div> */}
              <div className="whiteboard__screen">
                {props?.roomData !== null && (
                  <Whiteboard roomData={props?.roomData} />
                )}
                <div className="screen__chat">
                  <div className="chat">
                    <div className="chat_content">
                      {/*  */}
                      <VideoCall />
                    </div>
                    <div>
                      <ChatRoom roomData={props.roomData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <ChannelForm />
      )}
    </>
  );
}
function setStart(arg0: boolean) {
  throw new Error("Function not implemented.");
}
