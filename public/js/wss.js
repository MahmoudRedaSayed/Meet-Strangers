import * as store from "./store.js"
import * as ui from "./ui.js"
import * as constants from "./constants.js"

let socketIo=null
let connectedUserDetails=null;
export const registerNewUser=(socket)=>{
// the event in client side called connect but in server side is connection
socketIo=socket;
    socket.on("connect", () => {
        console.log("succesfully connected to socket.io server");
        console.log(socket.id);
        store.setSocketId(socket.id);
        ui.updatePersonalCode(socket.id);
      });
      socket.on("pre-offer",preOfferHandler)
}

export const sendPreOffer = (data) => {
    console.log("emmiting to server pre offer event");
    socketIo.emit("pre-offer", data);
  };

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

export const acceptCallHandler = () => {
    console.log("call accepted");
  };

export  const rejectCallHandler = () => {
    console.log("call rejected");
  };