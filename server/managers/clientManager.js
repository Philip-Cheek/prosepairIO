var clientManager = {};

clientManager.allUsersConnected = {};
clientManager.allSocketsConnected = {};

clientManager.pairQueue = [];
clientManager.lightingQueue = [];

clientManager.connectClient = function(data, socket, callback){
	if (!(data.name in clientManager.allUsersConnected )){
		this.allUsersConnected[data.name] = socket;
		this.allSocketsConnected[socket.id] = data.name
	}

	var connectType = data.type + "Queue";
	var proceed;
	var max;

	if (connectType == "pairQueue"){
		proceed = clientManager[connectType].length > 0
		max = 1;
	}else if (connectType == "lightingQueue"){
		var lightLength = clientManager[connectType].length;
		proceed = lightLength > 2;
		if (proceed && clientManager[connectType].length < 4){
			max = lightLength;
		}else{
			max = 4;
		}
	}

	if (proceed){
		var room = socket.id;
		socket.join(room);
		var roomList = [socket.id]

		for (var i = 0; i < max; i ++){
			var peer = clientManager[connectType].pop();
			console.log('peer id', peer.id) 
			var peerName = clientManager.allSocketsConnected[peer.id];
			peer.join(room)
			roomList.push(peer.id);
		}

		callback({'success':true, 'room': room, 'roomList': roomList});
	}else{
		console.log(socket.id)
		console.log('whaaat')
		console.log(connectType)
		clientManager[connectType].push(socket)
		callback({'success':false})
	}
}


module.exports = clientManager