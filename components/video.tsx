import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AgoraRTC, {
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import axios from "axios";

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
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import { Grid } from "@mui/material";

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

const appId: string = "b147b642a2af4b89980e7c016458fd16";

export default function VideoCallMain(props: propType) {
  const [inCall, setInCall] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [role, setRole] = useState<string>("Teacher");

  useEffect(() => {
    if (inCall) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
  }, [inCall]);

  const initStreams = async () => {
    // const clientSC = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    // clientSC.init(appId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const client = useClient();
    // initialize the screen share track

    const screenConfig = {
      encoderConfig: {
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 1500,
        orientationMode: 1,
      },
      appID: appId,
    };

    const withAudio = "auto"; // Enable, disable, or auto.

    const screenTrack = await AgoraRTC.createScreenVideoTrack(
      screenConfig,
      withAudio
    );
    // await clientSC.join('17a8bd5c2fe04b5db9c64f6c3689c041', `${props.roomData.display_name}sc`, null, null);
    setScreenTrack(screenTrack);
    console.log("screenTrack", screenTrack);
    client.unpublish();
    client.publish(screenTrack);

    client.on("stream-added", (evt: { stream: IAgoraRTCRemoteUser }) => {
      console.log("New stream added: " + 1);
      client.subscribe(evt.stream, "video");
    });
  };

  const useClient = createClient(config);
  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const client = useClient();
    client.on("stopScreenSharing", () => {
      console.log("stop sharingggggggggggggggggggggg");
      client.unpublish();
      setIsScreenSharing(false);
    });
  }, [useClient]);

  const VideoCall = () => {
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
          "stop sharingggggggggggggggggggggg outside",
          client,
          tracks
        );
        if (!isScreenSharing && tracks) {
          console.log("publish isScreenSharing", isScreenSharing);
          // client.unpublish();
          await client.publish([tracks[0], tracks[1]]);
        }
        setStart(true);
      };

      if (ready && tracks) {
        console.log("init ready");
        init();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [, /* channelName */ client, ready, tracks /* isScreenSharing */]);
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
              <AgoraVideoPlayer className="vid" videoTrack={tracks[1]} />
            </div>
            {users.length > 0 ? (
              users.map((user) => {
                if (user.videoTrack) {
                  return (
                    <div className="video-block" key={user.uid}>
                      <AgoraVideoPlayer
                        className="vid"
                        videoTrack={user.videoTrack}
                      />
                    </div>
                  );
                } else return null;
              })
            ) : (
              <div className="vid">
                <img src="/images/placeholder.png" alt="" />
              </div>
            )}
          </div>
        </div>
        <div className="saveAttachImageEnd">
          <div className="imageMainDiv">
            <div
              className="imageInnerDiv"
              onClick={() => {
                initStreams();
                setIsScreenSharing(true);
              }}
            >
              <ScreenShareIcon />
            </div>
            <div className="imageText">
              <p>img</p>
            </div>
          </div>
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

  const handleWelcome = async (e: any) => {
    e.preventDefault();
    const params = {
      classroom_id: 5,
      username: userName,
      usertype: role,
    };
    const { data } = await axios.post(
      "https://agoramobilefirstapi-production-122e.up.railway.app/api/set-user-data",
      params
    );
    if (data?.message === "User created successfully!") {
      sessionStorage.setItem("userName", userName);
      setUserName("");
      setInCall(true);
    }
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
        <input
          placeholder="Enter your name"
          type="text"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
          className="user_form_input"
        />
        <select
          placeholder="Select Role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
          }}
          className="user_form_input"
        >
          <option value={"Teacher"}>Teacher</option>
          <option value={"Student"}>Student</option>
        </select>
        <button
          onClick={(e) => handleWelcome(e)}
          style={{
            height: "56px",
            padding: "4px 20px",
            fontSize: "24px",
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
            <>
              <div className="whiteboard">
                <Grid container>
                  {/* <div className="whiteboard__screen"> */}
                  <Grid item xs={9}>
                    {props?.roomData !== null && (
                      <Whiteboard roomData={props?.roomData} />
                    )}
                  </Grid>
                  <Grid item xs={3}>
                    {/* <div className="screen__chat"> */}
                    {/* <div className="chat"> */}
                    {/* <div className="chat_content"> */}
                    <VideoCall />
                    {/* </div> */}
                    {/* <div> */}
                    <ChatRoom roomData={props.roomData} />
                    {/* </div> */}
                    {/* </div> */}
                    {/* </div> */}
                  </Grid>
                  {/* </div> */}
                </Grid>
              </div>
            </>
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
