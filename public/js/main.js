const socket = io("/");

// the event in client side called connect but in server side is connection
socket.on("connect", () => {
  console.log("succesfully connected to socket.io server");
  console.log(socket.id);
});
