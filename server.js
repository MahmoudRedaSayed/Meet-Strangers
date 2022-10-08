const express=require("express");
const app=express();
const http=require("http")
const server=http.createServer(app);
const io=require("socket.io")(server)
let connectedPeers=[];
io.on("connection",(socket)=>{
    connectedPeers.push(socket.id);
    console.log("the server is connected");
    console.log("the id of the socket",socket.id);
    console.log("connected",connectedPeers);
    socket.on("pre-offer",(data)=>{
        const{callType,calleePersonalCode}=data;
        const calleepersonal=connectedPeers.find(person=>
            person===data.calleePersonalCode)
        console.log("the user is ",calleepersonal)
        if(calleepersonal)
        {
            const data = {
                callerSocketId: socket.id,
                callType,
              };
              io.to(calleepersonal).emit("pre-offer",data)
        }
        else
        {
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND",
              };
              io.to(socket.id).emit("pre-offer-answer", data);
        }
    })
    socket.on("pre-offer-answer", (data) => {
        const { callerSocketId } = data;
    
        const connectedPeer = connectedPeers.find(
          (peerSocketId) => peerSocketId === callerSocketId
        );
    
        if (connectedPeer) {
          io.to(data.callerSocketId).emit("pre-offer-answer", data);
        }
      });

      socket.on("WebRTC-Signal", (data) => {
        const connectedUserSocketId=connectedPeers.find(person=>
            person===data.connectedUserSocketId)
        if(connectedUserSocketId)
        {
            io.to(connectedUserSocketId).emit("WebRTC-Signal",data)
        }

      })
    socket.on("disconnect",()=>{
        connectedPeers=connectedPeers.filter((connected)=>connected!==socket.id)
        console.log("disconnect",connectedPeers);
    })
})
const port=process.env.PORT||5000;
app.use(express.static("public"));
app.get("/",(res,req)=>{
    res.sendFile(__dirname+"/public/index.html")
})
server.listen(port,()=>{
    console.log("the server is running on port 5000");
})