const http = require('http');
const websocketServer = require("websocket").server
const _ = require('lodash')

//server setup
const httpServer = http.createServer();
const wsServer = new websocketServer({
    "httpServer": httpServer
})
httpServer.listen('8080', () => console.log('Node server running on http://localhost:8080'));

//states
let connections = {}
let clients = {};

//Websocket handshake
wsServer.on("request", request => {
    const connection = request.accept(null, request.origin)
    const clientID = uuid();
    
    const connectParams = new URLSearchParams(request.resource.substring(2));

    connections[clientID] = connection
    
    // On initial connection, send this to new connection
    connection.send(JSON.stringify({
        action: 'join',
        content: {
            id: clientID,
            clients 
        }
    }))

    clients[clientID] = {
        "id": clientID,
        "name": connectParams.get('name'),
        "avatar": connectParams.get('avatar'),
        "position": {x: 0, y: 0}
    };

    // On initial connection, send this to everyone
    messageEveryone({
        action: 'user_add',
        from: clientID,
        content: clients[clientID]
    })

    // On disconnect
    connection.on('close', () => {
        delete clients[clientID] 
        delete connections[clientID]
        messageEveryone({
            action: 'user_remove',
            from: clientID,
            content: clientID,
        })
    })

    const sendUpdate = _.debounce(function(payload) {
        messageEveryone({
            action: payload.action,
            from: payload.from,
            content: clients, //inefficient af, don't care rn.
        })
    }, 25)

    connection.on('message', message => {
        const payload = JSON.parse(message.utf8Data);
        if (payload.action === 'user_update') { 
            //these should't necessarily be throttled
            clients[payload.from].position.x = payload.content.position.x
            clients[payload.from].position.y = payload.content.position.y

            sendUpdate(payload);
        }
    })
})


// HELPER FUNCTIONS
function messageEveryone(json) {
    Object.values(connections).forEach(connection => {
        connection.send(JSON.stringify(json))
    })
}

//simple and quick uuid generator, only for testing and stuff. I found it on  stack overflow
function uuid() {
    var u='',i=0;
    while(i++<36) {
        var c='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i-1],r=Math.random()*16|0,v=c=='x'?r:(r&0x3|0x8);
        u+=(c=='-'||c=='4')?c:v.toString(16)
    }
    return u;
}