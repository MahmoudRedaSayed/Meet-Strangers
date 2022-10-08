import * as wss from "./wss.js"
import * as ui from "./ui.js"
import * as constants from "./constants.js"
import * as store from "./store.js"
let connectedUserDetails = null;
let peerConnection;
let dataChannel;
const defaultCon = {
  audio: true,
  video: true
}
const configurations = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

export const sendPreOffer = (callType, calleePersonalCode) => {
  console.log(callType, calleePersonalCode)
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };
    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
}


export const preOfferHandler = (data) => {
  console.log("the handler of the pre offer")
  console.log("data", data)
  const { callType, callerSocketId } = data;

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    console.log("showing call dialog");
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
}

const callingDialogRejectCallHandler = () => {
  console.log("end the call")
}
const acceptCallHandler = () => {
  console.log("call accepted");
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};


const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee has not been found
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee is not able to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that call is rejected by the callee
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    // send webRTC offer
    createPeerConnection();
    sendWebRTCOffer();
  }
};


// access to media
export const getLocalPreview = () => {
  navigator.mediaDevices.getUserMedia(defaultCon).then((stream => {
    ui.updateLocalVideo(stream);
    store.setLocalStream(stream)
  })).catch()
  {
    console.log("error in access devices");
  }
}


export const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configurations);
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      console.log("message came from data channel");
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // send it to the other user
      wss.sendDataUsingWebRTCSignals({
        connectedUserSocketId:connectedUserDetails.socketId,
        type:"ICECANDIDATE",
        candidate:event.candidate
      })

    }
  }
  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected to the other user")
      console.log("from success",peerConnection)
    }
  }
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.setRemoteStream(remoteStream);
  peerConnection.ontrack = (event) => {
    console.log("get track");
    remoteStream.addTrack(event.track)
  }


  if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const localStream = store.getState().localStream;
    console.log(localStream,peerConnection);
    for (const track of localStream.getTracks()) { 
    console.log("add track");
      peerConnection.addTrack(track, localStream) }
  }
}

const sendWebRTCOffer=async()=>{
  const offer=await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("offer",offer)
  const data={
    connectedUserSocketId:connectedUserDetails.socketId,
    type:"OFFER",
    offer
  }
  wss.sendDataUsingWebRTCSignals(data)
}

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};
export const offerHandler=async(data)=>{
  peerConnection = new RTCPeerConnection(configurations);
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      console.log("message came from data channel");
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.setRemoteStream(remoteStream);
  peerConnection.ontrack = (event) => {
    console.log("get track");
    remoteStream.addTrack(event.track)
  }

  if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const localStream = store.getState().localStream;
    console.log(localStream,peerConnection);
    for (const track of localStream.getTracks()) { 
    console.log("add track");
      peerConnection.addTrack(track, localStream) }
  }
  await peerConnection.setRemoteDescription(data.offer);

  const answer=await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(answer);

  const dataSent={
    connectedUserSocketId:connectedUserDetails.socketId,
    type:"ANSWER",
    answer
  }
  wss.sendDataUsingWebRTCSignals(dataSent);
}


export const answerHandler=async(data)=>{
  console.log("handle answer");
  console.log(data);
  await peerConnection.setRemoteDescription(data.answer);
}

export const candidateHandler=async(data)=>{
  console.log("handle candidate");
  // console.log(data);
  try {
    await peerConnection.addIceCandidate(data.candidate);
    console.log("from candidate",peerConnection);
} catch (e) {
    console.error('Error adding received ice candidate', e);
}
}


let screenSharingStream;
export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;
    const senders = peerConnection.getSenders();

    const sender = senders.find((sender) => {
      return sender.track.kind === localStream.getVideoTracks()[0].kind;
    });

    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    // stop screen sharing stream

    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());

    store.SetActiveSharingScreen(!screenSharingActive);

    ui.updateLocalVideo(localStream);
  } else {
    console.log("switching for screen sharing");
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);

      // replace track which sender is sending
      const senders = peerConnection.getSenders();

      const sender = senders.find((sender) => {
        return (
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
        );
      });

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.SetActiveSharingScreen(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (err) {
      console.error(
        "error occured when trying to get screen sharing stream",
        err
      );
    }
  }
};