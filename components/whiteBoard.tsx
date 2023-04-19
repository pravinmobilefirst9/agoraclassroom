import React, { useEffect, useState } from "react";
import { createFastboard, createUI, register, apps } from "@netless/fastboard";
import GeoGebra from "@netless/app-geogebra";
import Countdown from "@netless/app-countdown";
import { Dialog } from "@mui/material";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface propType {
  roomData: any;
}

export default function Whiteboard(props: propType) {
  const [open, setOpen] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<any>("img");
  const [appState, setAppState] = useState<any>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = async (e: any) => {
    const selectedFile = e.target.files[0];
    const storageRef = ref(storage, selectedFile.name);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log("download url", downloadURL, selectedFile);
      if (uploadType === "docs") {
        const taskId = "73cceb3365f44264a5bdb3907bf16056";
        appState.insertDocs({
          fileType: "pptx",
          scenePath: `/pptx/${taskId}`,
          taskId: taskId,
          title: selectedFile.name,
          url: downloadURL,
          // url: "https://docs.google.com/presentation/d/1kB8UMHAxs8zODno3meBCAXkadKDFaRNU2hy8D8ZDHcc/edit#slide=id.p",
        });
      } else if (uploadType === "video") {
        appState.insertMedia(selectedFile.name, downloadURL);
      } else {
        appState.insertImage(downloadURL);
      }

      handleClose();
    });
  };

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
    register({
      kind: "Monaco",
      src: "https://netless-app.oss-cn-hangzhou.aliyuncs.com/@netless/app-monaco/0.1.14-beta.1/dist/main.iife.js",
    });

    register({ kind: "GeoGebra", src: GeoGebra });

    register({
      kind: "Countdown",
      src: Countdown,
    });

    apps.push({
      icon: "https://api.iconify.design/ic:outline-slideshow.svg?color=currentColor",
      kind: "Slide",
      label: "Slide",
      onClick: (app) => {
        setAppState(app);
        setUploadType("docs");
        handleClickOpen();
      },
    });

    apps.push({
      icon: "https://api.iconify.design/ic:baseline-image.svg?color=currentColor",
      kind: "Image",
      label: "Image",
      onClick: (app: any) => {
        setAppState(app);
        setUploadType("img");
        handleClickOpen();
      },
    });

    apps.push({
      icon: "https://api.iconify.design/material-symbols:video-stable-outline.svg?color=currentColor",
      kind: "Media",
      label: "Media",
      onClick: (app) => {
        setAppState(app);
        setUploadType("video");
        handleClickOpen();
      },
    });

    apps.push({
      icon: "https://api.iconify.design/logos:youtube-icon.svg?color=currentColor",
      kind: "Plyr",
      label: "YouTube",
      onClick(app) {
        const url = window.prompt(
          "Enter YouTube URL",
          "https://www.youtube.com/watch?v=bTqVqk7FSmY"
        );
        if (!url) return;
        app.manager.addApp({
          kind: "Plyr",
          options: { title: "YouTube" },
          attributes: {
            src: url,
            provider: "youtube",
          },
        });
      },
    });

    apps.push({
      icon: "https://api.iconify.design/mingcute:screenshot-line.svg?color=currentColor",
      kind: "Snapshot",
      label: "Screenshot",
      onClick(app) {
        const view = app.manager.mainView;
        const canvas = document.createElement("canvas");
        canvas.width = view.size.width;
        canvas.height = view.size.height;
        const c = canvas.getContext("2d");
        if (!c) {
          alert("canvas.getContext('2d') failed!");
          return;
        }
        view.screenshotToCanvas(
          c,
          view.focusScenePath || "/init",
          view.size.width,
          view.size.height,
          view.camera
        );
        try {
          canvas.toBlob((blob) => {
            if (!blob) {
              alert("context.toBlob() failed!");
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "screenshot.png";
            a.click();
          });
        } catch (err) {
          const dialog = document.createElement("section");
          dialog.className = "dialog";
          const header = document.createElement("p");
          header.textContent =
            "This image contains CORS resources that cannot be exported to URL, you can right click and save this image manually.";
          const closeBtn = document.createElement("button");
          closeBtn.innerHTML = "&cross;";
          closeBtn.title = "close dialog";
          closeBtn.onclick = function closeDialog() {
            if (dialog.parentElement) dialog.remove();
          };
          header.appendChild(closeBtn);
          dialog.appendChild(header);
          dialog.appendChild(canvas);
          document.body.appendChild(dialog);
        }
      },
    });
    mountFastboard(document.getElementById("app"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("apps", apps);

  return (
    <>
      <div
        id="app"
        style={{
          width: "100%",
          height: "100vh",
        }}
      ></div>
      <Dialog open={open} onClose={handleClose}>
        <input type="file" onChange={handleFileChange} />
      </Dialog>
    </>
  );
}
