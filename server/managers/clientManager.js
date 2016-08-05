var clientManager = {
	'allUsersConnected': {},
	'allSocketsConnected': {},
	'roomByTag': {},
	'roomsBySocketID':{},
	'pairQueue':[],
	'lightingQueue': []
};

clientManager.connectClient = function(data, socket, callback){
	checkSetDataForSocket(data.name, socket);
	var handledData = handleClientConnect(data.type)

	if (handledData.proceed){
		var room = socket.id;
		var turn = clientManager.allSocketsConnected[socket.id];

		socket.join(room);
		this.roomsBySocketID[socket.id].push(room);
		var roomList = [data.name];
		var roomTag = generateRoomTag();

		for (var i = 0; i < handledData.max; i ++){
			var peer = clientManager[handledData.connectType].pop();
			console.log('peer id', peer.id) 
			var peerName = clientManager.allSocketsConnected[peer.id];
			peer.join(room)
			this.roomsBySocketID[peer.id].push(room)
			roomList.push(peerName);
		}

		clientManager.roomByTag[roomTag] = room;

		callback({'success':true, 'room': room, 'roomList': roomList, 'turn': turn, 'roomTag': roomTag});
	}else{
		clientManager[handledData.connectType].push(socket)
		callback({'success':false})
	}
}

clientManager.scrubUser = function(socketID, callback){
	var name = this.allSocketsConnected[socketID];
	var roomArr = this.roomsBySocketID[socketID];

	delete this.allSocketsConnected[socketID];
	delete this.allUsersConnected[name];
	delete this.roomsBySocketID[socketID];

	var qArr = [this.pairQueue, this.lightingQueue];

	for (var i = 0; i < qArr.length; i++){
		for (var sock = 0; sock < qArr[i].length; sock++){
			if (qArr[i][sock].id = socketID){
				qArr[i].splice(sock,1);
			}
		}
	}

	callback(name, roomArr);
}

function checkSetDataForSocket(name, socket){
	if (!(name in clientManager.allUsersConnected )){
		clientManager.allUsersConnected[name] = socket;
		clientManager.allSocketsConnected[socket.id] = name;
		clientManager.roomsBySocketID[socket.id] = [];
	}
}

function handleClientConnect(clientConnect){
	var info = {
		'connectType': clientConnect + "Queue"
	};

	if (info.connectType == "pairQueue"){
		info.proceed = clientManager[info.connectType].length > 0
		info.max = 1;
	}else if (connectType == "lightingQueue"){
		var lightLength = clientManager[info.connectType].length;
		info.proceed = lightLength > 2;
		if (proceed && clientManager[info.connectType].length < 4){
			info.max = lightLength;
		}else{
			info.max = 4;
		}
	}

	return info;
}

function generateRoomTag(){
    var charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var tag;

    for (var finite = 0; finite < 800; finite++){
    	tag = "";

    	for (var c = 0; c < 8; c++){
        	tag += charList.charAt(Math.floor(Math.random() * charList.length));
    	}

    	if (!(tag in clientManager.roomByTag)){
    		return tag;
    	}
    }
}



module.exports = clientManager