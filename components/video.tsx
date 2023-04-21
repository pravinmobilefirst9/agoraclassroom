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
import { Grid, Dialog } from "@mui/material";
import CropFreeIcon from "@mui/icons-material/CropFree";

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

const appId: string = "e019f704e66540649e26ab6842ed88bd";

export default function VideoCallMain(props: propType) {
  const [inCall, setInCall] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isStartScreenSharing, setIsStartScreenSharing] = useState(false);
  const [role, setRole] = useState<string>("Teacher");
  const [isUserJoin, setIsUserJoin] = useState<boolean>(false);
  const [usersTemp, setUsersTemp] = useState<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    if (inCall) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
  }, [inCall]);

  const useClient = createClient(config);

  const initStreams = async (e: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const client = useClient();
    // // initialize the screen share track

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

    const screenTrack: any = await AgoraRTC.createScreenVideoTrack(
      screenConfig,
      withAudio
    );

    setScreenTrack(screenTrack);
    console.log("screenTrack", screenTrack);
    client.unpublish();
    client.publish(screenTrack);

    client.on("stream-added", (evt: { stream: IAgoraRTCRemoteUser }) => {
      console.log("New stream added: " + 1);
      client.subscribe(evt.stream, "video");
    });
  };

  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

  const VideoCall = () => {
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();

    useEffect(() => {
      // function to initialise the SDK
      let init = async () => {
        client.on("user-published", async (user, mediaType) => {
          console.log(" ", user);
          await client.subscribe(user, mediaType);
          console.log("subscribe success");
          if (mediaType === "video") {
            setUsers((prevUsers) => {
              return [user];
            });
            // setUsersTemp((prevUsers) => {
            //   return [user];
            // });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          setIsUserJoin(true);
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

        await client.join(
          appId,
          props.roomData.display_name,
          props.roomData.videoToken,
          null
        );
        if (!isStartScreenSharing && tracks) {
          console.log("publish isStartScreenSharing", isStartScreenSharing);
          await client.publish([tracks[0], tracks[1]]);
        }
        setStart(true);
      };

      if (ready && tracks) {
        console.log("init ready");
        init();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, ready, tracks]);
    return (
      <div className="App">
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
    console.log("users", users);
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
            {users.length > 0
              ? users.map((user) => {
                  if (user.videoTrack) {
                    return (
                      <div style={{ position: "relative" }} key={user.uid}>
                        <CropFreeIcon
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "8px",
                            width: "38px",
                            height: "24px",
                            background: "#c4c4c4",
                            zIndex: "999",
                            padding: "2px",
                          }}
                          onClick={() => setIsScreenSharing(true)}
                        />
                        <div className="video-block">
                          <AgoraVideoPlayer
                            className="vid"
                            videoTrack={user.videoTrack}
                          />
                        </div>
                      </div>
                    );
                  } else return null;
                })
              : isUserJoin && (
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
              onClick={(e) => {
                initStreams(e);
                setIsStartScreenSharing(true);
              }}
            >
              <ScreenShareIcon style={{ color: "#fff" }} />
            </div>
            <div className="imageText">
              <p>Share</p>
            </div>
          </div>
          <div
            className="endMainDiv"
            style={{ cursor: "pointer" }}
            onClick={() => {
              leaveChannel();
              setIsUserJoin(false);
            }}
          >
            <div className="endInnerDiv" style={{ background: "#FF7A7A" }}>
              <img src="/images/log-in.png" alt="" />
            </div>
            <div className="endText">
              <p>End</p>
            </div>
          </div>
        </div>
        <Dialog
          open={isScreenSharing}
          onClose={() => setIsScreenSharing(false)}
          className="screen-share-modal"
        >
          {users.length > 0 &&
            users.map((user) => {
              if (user.videoTrack) {
                return (
                  <div
                    className="video-block"
                    style={{
                      width: "75vw",
                    }}
                    key={user.uid}
                  >
                    <AgoraVideoPlayer
                      className="vid"
                      videoTrack={user.videoTrack}
                      style={{ height: "100vh" }}
                    />
                  </div>
                );
              } else return null;
            })}{" "}
        </Dialog>
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
      "https://agoramobilefirstapi-production-2d06.up.railway.app/api/set-user-data",
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
                  <Grid item xs={9}>
                    {props?.roomData !== null && (
                      <Whiteboard roomData={props?.roomData} />
                    )}
                  </Grid>
                  <Grid item xs={3}>
                    <VideoCall />
                    <ChatRoom roomData={props.roomData} />
                  </Grid>
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
