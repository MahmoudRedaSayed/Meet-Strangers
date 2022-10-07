import * as elements from "./elements.js"
import * as constants from "./constants.js"
export const updatePersonalCode=(code)=>{
    const personalCode=document.getElementById("personal_code_paragraph");
    personalCode.innerHTML=code;
}

export const showIncomingCallDialog = (
    callType,
    acceptCallHandler,
    rejectCallHandler
  ) => {
      const callTypeInfo =
      callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
      
      console.log("here")
      const incomingCallDialog = elements.getIncomingCallDialog(
          callTypeInfo,
          acceptCallHandler,
          rejectCallHandler
          );
    console.log(incomingCallDialog)
  
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