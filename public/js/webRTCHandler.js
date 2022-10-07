import * as wss from "./wss.js"
import * as ui from "./ui.js"
import * as constants from "./constants.js"
let connectedUserDetails=null;

export const sendPreOffer=(callType,calleePersonalCode)=>{
    console.log(callType,calleePersonalCode)
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


export const preOfferHandler=(data)=>{
    console.log("the handler of the pre offer")
    console.log("data",data)
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

const callingDialogRejectCallHandler=()=>{
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
    }
  };