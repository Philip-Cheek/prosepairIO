angular.module('prosePair').service('peerService', function(){
	var roomies = {};
	var instanceTag;
	var me;

	var service = {};

	service.addPeersNTag = function(list, tag){
		roomies = list;
		instanceTag = tag;
		console.log('this might lead the roomie  way', roomies)
	}

	service.addPeer = function(peer, turnStatus){
		roomies[peer] = turnStatus;
	}

	service.removePeer = function(peerName){
		for (var peer in roomies){
			if (peer == peerName){
				delete roomies[peer];
			}
		}
	}

	service.turnChange = function(callback){
		var roomiesArr = Object.keys(roomies);
		var mIndex = roomiesArr.indexOf(me);
		var personWhoseTurn;
		console.log("just testing mindex", mIndex)
		console.log("justTesting roomies",roomiesArr)
		if (mIndex == roomiesArr.length - 1){
			personWhoseTurn = roomiesArr[0];
		}else{
			personWhoseTurn = roomiesArr[mIndex + 1];
		}

		for(peer in roomies){
			if (peer = personWhoseTurn){
				roomies[peer] = true;
			}else{
				roomies[peer] = false;
			}

		}

		callback(personWhoseTurn, instanceTag)
	}

	service.showTag = function(){
		return instanceTag;
	}

	service.getPeers = function(){
		var peers = [];

		for (var peer in roomies){
			if (me && peer != me){
				peers.push(peer)
			}
		};

		console.log("lets look for missing peers,",peers)

		return peers;
	}

	service.informMyself = function(mineSelf){
		me = mineSelf;
		console.log("let us CHECK ON MYSELFs", me)
	}

	service.revealMyself = function(){
		return me; 
	}

	service.getMyInitTurn = function(){
		return roomies[me];
	}

	return service
});