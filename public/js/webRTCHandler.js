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
    store.setCallState(constants.callState.CALL_UNAVAILABLE)
    wss.sendPreOffer(data);
  }
  if(callType === constants.callType.CHAT_STRANGER || callType === constants.callType.VIDEO_STRANGER){
    const data = {
      callType,
      calleePersonalCode,
    };

    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
}


export const preOfferHandler = (data) => {
  const { callType, callerSocketId } = data;
  if(!checkCallPossibility(callType))
  {
    return  sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE,callerSocketId);
  }
  
  store.setCallState(constants.preOfferAnswer.CALL_UNAVAILABLE);
  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }

  if (
    callType === constants.callType.CHAT_STRANGER ||
    callType === constants.callType.VIDEO_STRANGER
  ) {
    createPeerConnection();
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType)
  }
}

const callingDialogRejectCallHandler = () => {
  const data={
    connectedUserSocketId:connectedUserDetails.socketId
  }
  wss.sendHangUp(data);
  ui.mediaStream(connectedUserDetails.callType);
}
const acceptCallHandler = () => {
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  sendPreOfferAnswer();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};


const sendPreOfferAnswer = (preOfferAnswer,SocketId=null) => {
  const callerSocketId=SocketId?SocketId:connectedUserDetails.socketId;
  const data = {
    callerSocketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    setIncomingCallAvailable();
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee has not been found
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    setIncomingCallAvailable();
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee is not able to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    setIncomingCallAvailable();
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that call is rejected by the callee
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    createPeerConnection();
    sendWebRTCOffer();
    ui.showCallElements(connectedUserDetails.callType);
    // send webRTC offer
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
  }
};


// access to media
export const getLocalPreview = () => {
  navigator.mediaDevices.getUserMedia(defaultCon).then((stream => {
    ui.updateLocalVideo(stream);
    ui.showCallButtons();
    store.setCallState(constants.callState.CALL_AVAILABLE)
    store.setLocalStream(stream)
  })).catch()
  {
    store.getState().callState=constants.callState.CALL_AVAILABLE_ONLY_CHAT;
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
    }
  }
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.setRemoteStream(remoteStream);
  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track)
  }


  if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE||connectedUserDetails.callType === constants.callType.VIDEO_STRANGER) {
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) { 
      peerConnection.addTrack(track, localStream) }
  }
}

const sendWebRTCOffer=async()=>{
  const offer=await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const data={
    connectedUserSocketId:connectedUserDetails.socketId,
    type:"OFFER",
    offer
  }
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  wss.sendDataUsingWebRTCSignals(data)
}

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};
export const offerHandler=async(data)=>{
  peerConnection = new RTCPeerConnection(configurations);
  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected to the other user")
    }
  }
  
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.setRemoteStream(remoteStream);
  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track)
  }

  if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE||connectedUserDetails.callType === constants.callType.VIDEO_STRANGER) {
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) { 
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
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  wss.sendDataUsingWebRTCSignals(dataSent);
}


export const answerHandler=async(data)=>{
  await peerConnection.setRemoteDescription(data.answer);
}

export const candidateHandler=async(data)=>{
  try {
    await peerConnection.addIceCandidate(data.candidate);
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


export const hangUpHandler=()=>{
  const data={
    connectedUserSocketId:connectedUserDetails.socketId
  }
  wss.sendHangUp(data);
  peerConnection.close();
  setIncomingCallAvailable();
  ui.mediaStream(connectedUserDetails.callType);
}

export const hangUpHandlerAnswer=()=>{
  setIncomingCallAvailable();
  ui.mediaStream(connectedUserDetails.callType);
}


export const checkCallPossibility=(callType)=>{
  if(store.getState().callState===constants.callState.CALL_AVAILABLE)
  {
    return true;
  }
  if(store.getState().callState===constants.callState.CALL_AVAILABLE_ONLY_CHAT&&(callType===constants.callType.VIDEO_PERSONAL_CODE||callType===constants.callType.VIDEO_STRANGER))
  {
    return false;
  }
  return false;
}

const setIncomingCallAvailable=()=>{
  const localStream=store.getState().localStream;
  if(localStream)
  {
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }
  else{
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
}