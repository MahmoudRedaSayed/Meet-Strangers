import * as store from "./store.js"
import * as ui from "./ui.js"
let socketIo=null
export const registerNewUser=(socket)=>{
// the event in client side called connect but in server side is connection
socketIo=socket;
    socket.on("connect", () => {
        console.log("succesfully connected to socket.io server");
        console.log(socket.id);
        store.setSocketId(socket.id);
        ui.updatePersonalCode(socket.id);
      });
      socket.on("pre-offer",(data)=>{
        console.log("pre offered from the server",data)
      })
}

export const sendPreOffer = (data) => {
    console.log("emmiting to server pre offer event");
    socketIo.emit("pre-offer", data);
  };