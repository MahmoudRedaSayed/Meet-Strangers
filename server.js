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
    socket.on("disconnect",()=>{
        connectedPeers=connectedPeers.filter((connected)=>connected!==socket.id)
        // connectedPeers=connectedPeersTemp;
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