import * as wss from './wss.js';
import * as webRTCHandler from './webRTCHandler.js';
import * as ui from "./ui.js"
import * as constants from "./constants.js"

let strangerCallType;

export const changeStrangerConnectionStatus = (status) => {
    const data = { status};
    wss.changeStrangerConnectionStatus(data)
}


//get the socket of the stranger 

export const getStrangerSocketIdAndConnect = (callType) => {
    strangerCallType = callType;
    wss.getStrangerSocketId();
}
export const connectWithStranger = (data) => {
    if(data.randomStrangerSocketId){
        webRTCHandler.sendPreOffer(strangerCallType, data.randomStrangerSocketId);
    } 
    else{
        ui.showInfoDialog(constants.preOfferAnswer.NO_STRANGERS);
    }
}
