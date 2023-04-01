import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import axios from "axios";
//import {AgoraEduSDK} from 'agora-classNameroom-sdk'

const inter = Inter({ subsets: ["latin"] });
//import "../styles/main.css";
//import "../styles/lobby.css";
import Script from "next/script";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Whiteboard = dynamic(() => import("../components/whiteBoard"), {
  ssr: false,
});

export default function Home() {
  const [roomData, setRoomData] = useState<any>(null);

  const router = useRouter();

  const { room, uuid } = router.query;
  //   AgoraEduSDK.config({
  //     appId: 'a9a93ac27e184ee4bd333586bc90eff9',
  //     region: 'NA'
  // });

  console.log(uuid, room);

  const timestamp = new Date().getTime();

  useEffect(() => {
    if (room !== undefined) {
      getRoomDetails();
    }
  }, [room]);

  const getRoomDetails = async () => {
    const { data } = await axios.get(
      `https://agoramobilefirstapi-production.up.railway.app/api/get-room-by-id/${room}`
    );

    console.log("data", data);
    setRoomData(data);
  };

  return (
    <>
      <Script
        defer
        type="text/javascript"
        src={`https://edu-sdk.vercel.app/js/AgoraRTC_N-4.14.0.js?v=${timestamp}`}
        onLoad={() => {
          console.log("AgoraRTC_N-4.14.0 Script has loaded");
        }}
        onError={() => {
          console.log("AgoraRTC_N-4.14.0 Script has Error");
        }}
      />
      <Script
        type="text/javascript"
        src={`https://edu-sdk.vercel.app/js/room.js?v=${timestamp}`}
        onLoad={() => {
          console.log("room Script has loaded");
        }}
        onError={() => {
          console.log("room Script has Error");
        }}
      />
      <Script
        type="text/javascript"
        src={`https://edu-sdk.vercel.app/js/room_rtm.js?v=${timestamp}`}
        onLoad={() => {
          console.log("room_rtm Script has loaded");
        }}
        onError={() => {
          console.log("room_rtm Script has Error");
        }}
      />
      <Script
        type="module"
        src={`https://edu-sdk.vercel.app/js/room_rtc_local.js?v=${timestamp}`}
        onLoad={() => {
          console.log("room_rtc Script has loaded");
        }}
        onError={() => {
          console.log("room_rtc Script has Error");
        }}
      />

      <header id="nav">
        <div className="nav--list">
          <button id="members__button">
            {/* <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clip-rule="evenodd"><path d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z" fill="#ede0e0"><path d="M24 19h-24v-1h24v1zm0-6h-24v-1h24v1zm0-6h-24v-1h24v1z"/></svg> */}
          </button>

          <Link href="index.tsx">
            <h3 id="logo">
              <span>Virtual Classroom</span>
            </h3>
          </Link>
        </div>

        <div id="nav__links">
          <button id="chat__button">
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              fill="#ede0e0"
              clipRule="evenodd"
            >
              <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-15.667-6l-5.333 4v-4h-3v-14.001l18 .001v14h-9.667zm-6.333-2h3v2l2.667-2h8.333v-10l-14-.001v10.001z" />
            </svg>
          </button>

          {/* <a className="nav__link" id="create__room__btn" href="index.html">
                Create Room
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ede0e0" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/></svg>
            </a> */}
        </div>
      </header>

      <main className="container">
        <div id="room__container">
          <section id="members__container">
            <div id="members__header">
              <p>Participants</p>
              <strong id="members__count">0</strong>
            </div>

            <div id="member__list"></div>
          </section>
          <section id="stream__container">
            <div id="stream__box"></div>

            <div id="streams__container"></div>

            <div className="stream__actions">
              <button id="camera-btn" className="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 7l4-4v14l-4-4v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v3zm-8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                </svg>
              </button>
              <button id="mic-btn" className="active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2c1.103 0 2 .897 2 2v7c0 1.103-.897 2-2 2s-2-.897-2-2v-7c0-1.103.897-2 2-2zm0-2c-2.209 0-4 1.791-4 4v7c0 2.209 1.791 4 4 4s4-1.791 4-4v-7c0-2.209-1.791-4-4-4zm8 9v2c0 4.418-3.582 8-8 8s-8-3.582-8-8v-2h2v2c0 3.309 2.691 6 6 6s6-2.691 6-6v-2h2zm-7 13v-2h-2v2h-4v2h10v-2h-4z" />
                </svg>
              </button>
              <button id="screen-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z" />
                </svg>
              </button>
              <button id="leave-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 10v-5l8 7-8 7v-5h-8v-4h8zm-16-8v20h14v-2h-12v-16h12v-2h-14z" />
                </svg>
              </button>
            </div>

            <button id="join-btn">Join Room</button>

            {/* {roomData !== null && (
              <Whiteboard uuid={uuid} roomData={roomData} />
            )} */}
          </section>

          <section id="messages__container">
            <div id="messages"></div>

            <form id="message__form">
              <input
                type="text"
                name="message"
                placeholder="Send a message...."
              />
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
