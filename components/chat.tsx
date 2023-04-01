import AgoraRTM from "agora-rtm-sdk";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface propType {
  roomData: any;
}

const APP_ID = "a9a93ac27e184ee4bd333586bc90eff9";
// const CHANNEL = "wdj";

let client = AgoraRTM.createInstance(APP_ID);

import React, { useEffect, useRef, useState } from "react";

export default function ChatRoom(props: propType) {
  const messagesRef: any = useRef();

  const [messages, setMessages] = useState<any>([]);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<any>(null);
  const [uid] = useState(uuidv4());

  const appendMessage = (message: any) => {
    setMessages((messages: any) => [...messages, message]);
  };

  async function fetchRTMToken() {
    var url = `https://agoramobilefirstapi-production.up.railway.app/api/rtm-token/${uid}`;

    let { data } = await axios.get(url);
    return { token: data?.key, uid: uid };
  }

  useEffect(() => {
    fetchRTMToken().then(function (response) {
      const connect = async () => {
        await client.login({
          uid: response?.uid,
          token: response?.token,
        });
        const channel = await client.createChannel(props.roomData.display_name);
        await channel.join();
        channel.on("ChannelMessage", (message, peerId) => {
          appendMessage({
            text: message.text,
            uid: peerId,
          });
        });
        setChannel(channel);
        return channel;
      };
      const connection = connect();
      return () => {
        const disconnect = async () => {
          const channel = await connection;
          await channel.leave();
          await client.logout();
        };
        disconnect();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (text === "") return;
    channel
      .sendMessage({ text: text }, uid)
      .then(() => {
        console.log("Message sent successfully");
      })
      .catch((err: any) => {
        console.log("Failed to send message", err);
      });
    appendMessage({
      text: text,
      uid,
    });
    setText("");
  };

  return (
    <main>
      <div className="panel">
        <div className="messages" ref={messagesRef}>
          <div className="inner">
            {messages.map((message: any, idx: any) => (
              <div key={idx} className="message">
                {message.uid === uid && (
                  <div className="user-self">
                    {props.roomData.display_name}:&nbsp;
                  </div>
                )}
                {message.uid !== uid && (
                  <div className="user-them">Them:&nbsp;</div>
                )}
                <div className="text">{message.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* <input value={text} onChange={(e) => setText(e.target.value)} />
          <button>+</button> */}
        <div className="type_message">
          <form onSubmit={sendMessage}>
            <div className="chat-input-block">
              <input
                placeholder="Type your message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button>Send</button>
            </div>
          </form>
        </div>
        {/* </form> */}
      </div>
    </main>
  );
}
