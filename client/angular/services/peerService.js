angular.module('prosePair').service('peerService', function($location, $timeout){
	var roomies = {};

	var instanceTag;
	var me;
	var personWhoseTurn;
	var sampleFair;
	var currentMode;

	var service = {};

	service.peerLeft = function(name, callback){
		if (name in roomies){
			delete roomies[name];
		}

		ifMoveOn(function(move){
			callback();
			$timeout(function(){
				move();
			}, 800);
		});
	}

	service.setNextTurn = function(person, callback){
		personWhoseTurn = person;
		return personWhoseTurn == me;
	};

	service.showSampleFair = function(){
		return sampleFair;
	};

	service.setSampleFair = function(person){
		sampleFair = findNextPersonFrom(person);
	};

	service.whoseTurn = function(){
		return personWhoseTurn;
	};

	service.myTurn = function(){
		personWhoseTurn = me;
	};

	service.isMyTurn = function(){
		return personWhoseTurn == me;
	};

	service.isTurn = function(person){
		return person == personWhoseTurn;
	};

	service.setRoomStage = function(list, tag, mode){
		setNewRoom();

		roomies = list;
		instanceTag = tag;
		currentMode = mode;

		for (var turn in roomies){
			if (roomies[turn]){
				personWhoseTurn = turn;
			}
		}
	};

	service.addPeer = function(peer, turnStatus){
		roomies[peer] = turnStatus;
	};

	service.removePeer = function(peerName){
		for (var peer in roomies){
			if (peer == peerName){
				delete roomies[peer];
			}
		}
	};

	service.turnChange = function(callback){
		personWhoseTurn = findNextPersonFrom(personWhoseTurn);

		for(peer in roomies){
			roomies[peer] = peer == personWhoseTurn;
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

		return peers;
	}

	service.informMyself = function(mineSelf){
		me = mineSelf;
	};

	service.revealMyself = function(){
		return me; 
	};

	service.clearFair = function(){
		sampleFair = "";
	}

	service.getMyInitTurn = function(){
		return roomies[me];
	};

	function setNewRoom(){
		roomies = {};

		instanceTag = "";
		personWhoseTurn = "";
		sampleFair = ""
	}

	function findNextPersonFrom(person){

		var roomieArr = Object.keys(roomies);
		var pIndex = roomieArr.indexOf(person);
	
		if (pIndex == roomieArr.length - 1){
			return roomieArr[0];
		}else{
			return roomieArr[pIndex + 1];
		}
	}

	function ifMoveOn(callback){
		var peersLeft = service.getPeers().length;
		console.log('currentmodeCheck', currentMode);
		if (peersLeft <= 0 || (currentMode == "lightning" && peersLeft < 3)){
			if (callback){
				callback(function(){
					$location.path('/connect/' + currentMode);
				});
			}else{
				$location.path('/connect/' + currentMode);
			}
		}
	}

	return service
});