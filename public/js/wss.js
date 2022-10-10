import * as store from "./store.js"
import * as ui from "./ui.js"
import * as constants from "./constants.js"
import * as webRTCHandler from "./webRTCHandler.js"
import * as stranger from "./strangers.js"
let socketIo=null
export const registerNewUser=(socket)=>{
// the event in client side called connect but in server side is connection
socketIo=socket;
    socket.on("connect", () => {
        store.setSocketId(socket.id);
        ui.updatePersonalCode(socket.id);
      });
      socket.on("pre-offer",webRTCHandler.preOfferHandler)
      socket.on("pre-offer-answer", (data) => {
        webRTCHandler.handlePreOfferAnswer(data);
      });
      socket.on("WebRTC-Signal",(data)=>{
        switch(data.type)
        {
          case constants.WebRTCSignaling.OFFER:
            webRTCHandler.offerHandler(data)
            break;

          case constants.WebRTCSignaling.ANSWER:
            webRTCHandler.answerHandler(data)
            break;

          case constants.WebRTCSignaling.ICECANDIDATE:
            webRTCHandler.candidateHandler(data)
            break;
          default:
            ui.showInfoDialog(constants.preOfferAnswer.CALL_UNAVAILABLE);
            return;

        }
      })
      socket.on("hang-Up",()=>{
        webRTCHandler.hangUpHandlerAnswer();
      })
      socket.on("stranger-socket-id",(data)=>{
        stranger.connectWithStranger(data);
      })
}

export const sendPreOffer = (data) => {
    socketIo.emit("pre-offer", data);
  };

  export const sendPreOfferAnswer = (data) => {
    socketIo.emit("pre-offer-answer", data);
  };


export const sendDataUsingWebRTCSignals=(data)=>{
  socketIo.emit("WebRTC-Signal",data);
}

export const sendHangUp=(data)=>{
  socketIo.emit("hang-Up",data)
}


export const changeStrangerConnectionStatus = (data) => {
  socketIo.emit('stranger-connection-status', data)
}

export const getStrangerSocketId = () => {
  socketIo.emit('get-stranger-socket-id');
}