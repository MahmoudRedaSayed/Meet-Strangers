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
      
      const incomingCallDialog = elements.getIncomingCallDialog(
          callTypeInfo,
          acceptCallHandler,
          rejectCallHandler
          );
  
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
        "Callee rejected your call",
        "Callee unavailable"
      );
    }
    if (preOfferAnswer === constants.preOfferAnswer.NO_STRANGERS) {
      infoDialog = elements.getInfoDialog(
        "Callee not found",
        "no strangers available");
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
    if (callType === constants.callType.CHAT_PERSONAL_CODE||callType === constants.callType.CHAT_STRANGER) {
      showChatCallElements();
    }
  
    if (callType === constants.callType.VIDEO_STRANGER||callType===constants.callType.VIDEO_PERSONAL_CODE) {
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


// ui messages
export const appendMessage = (message, right = false) => {
  const messagesContainer = document.getElementById("messages_container");
  const messageElement = right
    ? elements.getRightMessage(message)
    : elements.getLeftMessage(message);
  messagesContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
  const messagesContainer = document.getElementById("messages_container");
  messagesContainer.querySelectorAll("*").forEach((n) => n.remove());
};


// recording
export const showRecordingPanel = () => {
  const recordingButtons = document.getElementById("video_recording_buttons");
  showElement(recordingButtons);

  // hide start recording button if it is active
  const startRecordingButton = document.getElementById(
    "start_recording_button"
  );
  hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
  const startRecordingButton = document.getElementById(
    "start_recording_button"
  );
  const recordingButtons = document.getElementById("video_recording_buttons");

  hideElement(recordingButtons);
  showElement(startRecordingButton);
};

export const switchRecordingButtons = (switchForResumeButton = false) => {
  const resumeButton = document.getElementById("resume_recording_button");
  const pauseButton = document.getElementById("pause_recording_button");

  if (switchForResumeButton) {
    hideElement(pauseButton);
    showElement(resumeButton);
  } else {
    hideElement(resumeButton);
    showElement(pauseButton);
  }
};

export const mediaStream=(callType)=>{
  const finishConnectionChatButtonContainer = document.getElementById(
    "finish_chat_button_container"
  );
  hideElement(finishConnectionChatButtonContainer);

  if(callType===constants.callType.VIDEO_PERSONAL_CODE||callType===constants.callType.VIDEO_STRANGER)
  {
    const callButtons = document.getElementById("call_buttons");
      hideElement(callButtons);
    
      const placeholder = document.getElementById("video_placeholder");
      showElement(placeholder);

  }
  
    const newMessageInput = document.getElementById("new_message");
    showElement(newMessageInput);
    clearMessenger();
    const newMessage=document.getElementById("new_message");
    hideElement(newMessage);
    // if the caller end the call before the response
    const dialog = document.getElementById("dialog");
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
    //block panel
    enableDashboard();
}

export const showCallButtons=()=>{
  const personal=document.getElementById("personal_code_video_button");
  const stranger=document.getElementById("stranger_video_button");
  showElement(personal);
  showElement(stranger);
}
// put the arrow on the click
export const updateStrangerCheckbox = (allowConnections) => {
  const checkboxCheckImg = document.getElementById('allow_strangers_checkbox_image');
  allowConnections ? showElement(checkboxCheckImg) : hideElement(checkboxCheckImg);
}
