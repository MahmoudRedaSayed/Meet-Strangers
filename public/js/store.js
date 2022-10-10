import * as constants from "./constants.js"
let state={
    socketId:null,
    localStream:null,
    remoteStream:null,
    screenSharingStream:null,
    allowConnectionsFromStrangers:false,
    activeSharingScreen:false,
    callState:constants.callState.CALL_AVAILABLE_ONLY_CHAT
}
export const setSocketId=(socketId)=>{
    state={
        ...state,
        socketId
    }
}

export const setCallState=(callState)=>{
    state={
        ...state,
        callState
    }
}
export const setLocalStream=(stream)=>{
    state={
        ...state,
        localStream:stream
    }
}

export const setRemoteStream=(stream)=>{
    state={
        ...state,
        remoteStream:stream
    }
}

export const setAllowConnectionsFromStrangers=(allowConnectionsFromStrangers)=>{
    state={
        ...state,
        allowConnectionsFromStrangers
    }
}

export const SetActiveSharingScreen=(activeSharingScreen)=>{
    state={
        ...state,
        activeSharingScreen
    }
}

export const setScreenSharingStream=(screenSharingStream)=>{
    state={
        ...state,
        screenSharingStream
    }
}

export const getState=()=>{
    return state;
}
