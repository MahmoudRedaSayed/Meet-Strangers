let state={
    socketId:null,
    localStream:null,
    remoteStream:null,
    screenSharingStream:null,
    AllowOtherToConnect:false,
    activeSharingScreen:false
}
export const setSocketId=(socketId)=>{
    state={
        ...state,
        socketId
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

export const setAllowOtherToConnect=(AllowOtherToConnect)=>{
    state={
        ...state,
        AllowOtherToConnect
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
