import * as elements from "./elements.js"
import * as constants from "./constants.js"
export const updatePersonalCode=(code)=>{
    const personalCode=document.getElementById("personal_code_paragraph");
    personalCode.innerHTML=code;
}

export const updateLocalVideo=(stream)=>{
  const localvideo=document.getElementById("local_video");
  localvideo.srcObject=stream;
  localvideo.addEventListener("loadedmetadata",()=>{
    localvideo.play();
  })
}

export const setRemoteStream=(stream)=>{
  const remotevideo=document.getElementById("remote_video");
  remotevideo.srcObject=stream;
}

export const showIncomingCallDialog = (
    callType,
    acceptCallHandler,
    rejectCallHandler
  ) => {
      const callTypeInfo =
      callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
      
      console.log("here")
      const incomingCallDialog = elements.getIncomingCallDialog(
          callTypeInfo,
          acceptCallHandler,
          rejectCallHandler
          );
    console.log(incomingCallDialog)
  
    // removing all dialogs inside HTML dialog element
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  
    dialog.appendChild(incomingCallDialog);
  };
  
  
export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
  
    // removing all dialogs inside HTML dialog element
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  
    dialog.appendChild(callingDialog);
  };


  
export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;
  
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
      infoDialog = elements.getInfoDialog(
        "Call rejected",
        "Callee rejected your call"
      );
    }
  
    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
      infoDialog = elements.getInfoDialog(
        "Callee not found",
        "Please check personal code"
      );
    }
  
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
      infoDialog = elements.getInfoDialog(
        "Call is not possible",
        "Probably callee is busy. Please try againg later"
      );
    }
  
    if (infoDialog) {
      const dialog = document.getElementById("dialog");
      dialog.appendChild(infoDialog);
  
      setTimeout(() => {
        removeAllDialogs();
      }, [4000]);
    }
  };
  
  export const removeAllDialogs = () => {
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  };
  
  export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CODE) {
      showChatCallElements();
    }
  
    if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
      showVideoCallElements();
    }
  };
  
  const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = document.getElementById(
      "finish_chat_button_container"
    );
    showElement(finishConnectionChatButtonContainer);
  
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
  };
  
  const showVideoCallElements = () => {
    const callButtons = document.getElementById("call_buttons");
    showElement(callButtons);
  
    const placeholder = document.getElementById("video_placeholder");
    hideElement(placeholder);
  
    const remoteVideo = document.getElementById("remote_video");
    showElement(remoteVideo);
  
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    //block panel
    disableDashboard();
  };
  
  // ui helper functions
  
  const enableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if (!dashboardBlocker.classList.contains("display_none")) {
      dashboardBlocker.classList.add("display_none");
    }
  };
  
  const disableDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur");
    if (dashboardBlocker.classList.contains("display_none")) {
      dashboardBlocker.classList.remove("display_none");
    }
  };
  
  const hideElement = (element) => {
    if (!element.classList.contains("display_none")) {
      element.classList.add("display_none");
    }
  };
  
  const showElement = (element) => {
    if (element.classList.contains("display_none")) {
      element.classList.remove("display_none");
    }
  };
  

  // ui call buttons

const micOnImgSrc = "./utils/images/mic.png";
const micOffImgSrc = "./utils/images/micOff.png";

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src="none"
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};