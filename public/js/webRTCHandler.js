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
    store.setCallState(constants.callState.CALL_UNAVAILABLE)
    wss.sendPreOffer(data);
  }
}


export const preOfferHandler = (data) => {
  const { callType, callerSocketId } = data;
  console.log(checkCallPossibility(callType),callType)
  if(!checkCallPossibility(callType))
  {
    console.log("ahhh la")
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
    console.log("showing call dialog");
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
}

const callingDialogRejectCallHandler = () => {
  console.log("end the call")
  const data={
    connectedUserSocketId:connectedUserDetails.socketId
  }
  wss.sendHangUp(data);
  ui.mediaStream(connectedUserDetails.callType);
}
const acceptCallHandler = () => {
  console.log("call accepted");
  console.log(store.getState().callState)
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  console.log(store.getState().callState)
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log("call rejected");
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
  // store.setCallState(constants.preOfferAnswer.CALL_UNAVAILABLE);
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;
  console.log("get answer",preOfferAnswer)

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
    ui.showCallElements(connectedUserDetails.callType);
    // send webRTC offer
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    createPeerConnection();
    sendWebRTCOffer();
  }
};


// access to media
export const getLocalPreview = () => {
  navigator.mediaDevices.getUserMedia(defaultCon).then((stream => {
    ui.updateLocalVideo(stream);
    ui.showCallButtons();
    store.setCallState(constants.callState.CALL_AVAILABLE)
    console.log("state",store.getState())
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
      console.log("from success",peerConnection)
    }
  }
  
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
  store.setCallState(constants.callState.CALL_UNAVAILABLE);
  wss.sendDataUsingWebRTCSignals(dataSent);
}


export const answerHandler=async(data)=>{
  console.log("handle answer");
  console.log(data);
  await peerConnection.setRemoteDescription(data.answer);
}

export const candidateHandler=async(data)=>{
  console.log("handle candidate");
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
  console.log("answer the hang up")
  // peerConnection.close();
  setIncomingCallAvailable();
  ui.mediaStream(connectedUserDetails.callType);
}


export const checkCallPossibility=(callType)=>{
  console.log(callType,store.getState().callState);
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
  console.log("eh henal")
  const localStream=store.getState().localStream;
  if(localStream)
  {
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }
  else{
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
}