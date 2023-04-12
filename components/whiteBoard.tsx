import React, { useEffect } from "react";
import { createFastboard, createUI, register, apps } from "@netless/fastboard";
import GeoGebra from "@netless/app-geogebra";
import Countdown from "@netless/app-countdown";
import { AppContext } from "@netless/window-manager";

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
        const taskId = "73cceb3365f44264a5bdb3907bf16056";
        app.insertDocs({
          fileType: "pptx",
          scenePath: `/pptx/${taskId}`,
          taskId,
          title: "a.pptx",
        });
      },
    });

    apps.push({
      icon: "https://api.iconify.design/ic:baseline-image.svg?color=currentColor",
      kind: "Image",
      label: "Image",
      onClick: (app) => {
        app.insertImage("https://placekitten.com/g/200/300");
      },
    });

    apps.push({
      icon: "https://api.iconify.design/material-symbols:video-stable-outline.svg?color=currentColor",
      kind: "Media",
      label: "Media",
      onClick: (app) => {
        app.insertMedia(
          "a.mp4",
          "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
        );
      },
    });

    // apps.push({
    //   icon: "https://api.iconify.design/logos:youtube-icon.svg?color=currentColor",
    //   kind: "Plyr",
    //   label: "YouTube",
    //   onClick(app) {
    //     const url = window.prompt(
    //       "Enter YouTube URL",
    //       "https://www.youtube.com/watch?v=bTqVqk7FSmY"
    //     );
    //     if (!url) return;
    //     app.manager.addApp({
    //       kind: "Plyr",
    //       options: { title: "YouTube" },
    //       attributes: {
    //         src: url,
    //         provider: "youtube",
    //       },
    //     });
    //   },
    // });

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

    // apps.push({
    //   icon: "https://api.iconify.design/material-symbols:download-rounded.svg?color=currentColor",
    //   kind: "SavePDF",
    //   label: "Save PDF",
    //   onClick(app) {
    //     const slides = app.manager
    //       .queryAll()
    //       .filter((app) => app.kind === "Slide");
    //     if (slides.length === 0) {
    //       alert("No slide found, please add a slide first.");
    //       return;
    //     }
    //     const dialog = document.createElement("section");
    //     dialog.className = "dialog";
    //     const closeBtn = document.createElement("button");
    //     closeBtn.innerHTML = "&cross;";
    //     closeBtn.title = "close dialog";
    //     closeBtn.onclick = function closeDialog() {
    //       if (dialog.parentElement) dialog.remove();
    //     };
    //     const info = document.createElement("p");
    //     info.textContent = `Found ${slides.length} ${
    //       slides.length > 1 ? "slides" : "slide"
    //     }, please select the slide you want to export.`;
    //     info.appendChild(closeBtn);
    //     dialog.appendChild(info);
    //     const section = document.createElement("div");
    //     const select = document.createElement("select");
    //     slides.forEach((slide) => {
    //       const option = document.createElement("option");
    //       option.value = slide.id;
    //       option.textContent =
    //         (slide.box?.title || "Untitled") + " (" + slide.id + ")";
    //       select.appendChild(option);
    //     });
    //     section.appendChild(select);
    //     section.appendChild(document.createTextNode(" "));
    //     const btn = document.createElement("button");
    //     btn.textContent = "Start";
    //     section.appendChild(btn);
    //     section.appendChild(document.createElement("br"));
    //     const progress = document.createElement("progress");
    //     progress.max = 100;
    //     progress.value = 0;
    //     section.appendChild(progress);
    //     const status = document.createElement("span");
    //     section.appendChild(document.createTextNode(" "));
    //     section.appendChild(status);
    //     dialog.appendChild(section);
    //     const link = document.createElement("a");
    //     link.href =
    //       "https://github.com/netless-io/window-manager/blob/master/docs/export-pdf.md";
    //     link.target = "_blank";
    //     link.textContent = "API Doc";
    //     dialog.appendChild(link);
    //     btn.onclick = function savePDF() {
    //       btn.disabled = true;
    //       status.innerText = "0%";
    //       postMessage({
    //         type: "@netless/_request_save_pdf_",
    //         appId: select.value,
    //       });
    //       const handler = (ev: MessageEvent) => {
    //         if (ev.data.type === "@netless/_result_save_pdf_") {
    //           const value = (progress.value = ev.data.progress);
    //           status.innerText = value + "%";
    //           if (value === 100) {
    //             if (ev.data.result) {
    //               console.log(ev.data.result);
    //               const a = document.createElement("a");
    //               const buffer = ev.data.result.pdf as ArrayBuffer;
    //               a.href = URL.createObjectURL(
    //                 new Blob([buffer], { type: "application/pdf" })
    //               );
    //               a.title = ev.data.result.title;
    //               a.download = "download.pdf";
    //               a.innerText = "Download";
    //               link.before(a);
    //             } else {
    //               status.innerText = "Failed";
    //             }
    //           }
    //         }
    //       };
    //       window.addEventListener("message", handler);
    //     };
    //     document.body.appendChild(dialog);
    //   },
    // });
    mountFastboard(document.getElementById("app"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="app"
      style={{
        width: "100%",
        height: "100vh",
      }}
    ></div>
  );
}
