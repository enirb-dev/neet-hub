
// ----------------------------------------------------------------
// ----------------------------------------------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
	getDatabase,
	ref,
	set,
	get,
	push,
	onValue,
	remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	setPersistence,
	inMemoryPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
	apiKey: "AIzaSyAZZ7Rima-d6qFOUeiWKykUI_5yqW4vKig",
	authDomain: "neet-hub-33eef.firebaseapp.com",
	databaseURL: "https://neet-hub-33eef-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "neet-hub-33eef",
	storageBucket: "neet-hub-33eef.firebasestorage.app",
	messagingSenderId: "654893266181",
	appId: "1:654893266181:web:a6509fd16c469c47e5336c",
	measurementId: "G-HPRY0H6ZKX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

await setPersistence(auth, inMemoryPersistence).catch(err => console.error("Persistence error:", err));
await signOut(auth);

// ----------------------------------------------------------------
// ----------------------------------------------------------------

let currentUser = null;
let currentUsername = null;
let currentRoom = null;
let currentRoomData = null;

let stopMessageListener = null;


let peerConnection = null;
let localStream = null;
let currentCallId = null;
let currentCallData = null;
let stopCallListener = null;
let stopCallerCandidateListener = null;
let stopReceiverCandidateListener = null;
let callingBySelf = false;
let isMuted = false;
let pendingRemoteCandidates = [];


// ----------------------------------------------------------------
// ----------------------------------------------------------------

const BASE = "";
const REF = {
	secure: BASE + "/secure",
	users: BASE + "/users",
	globalChat: BASE + "/messages",
	frozen: BASE + "/frozen",
	newReg: BASE + "/reg",
	rooms: BASE + "/rooms",
	calls: BASE + "/calls",
	log: BASE + "/log"
};

function GE(element) { return document.getElementById(element); }
function CE(element) { return document.createElement(element); }
function usernameToEmail(uname) { return uname + "@neethub.enirb.in" }

async function update(key, value) {
	await set(ref(db, key), value);
}

async function fetch(key) {
	const snap = await get(ref(db, key));
	if (snap.exists()) {
		return snap.val();
	}
	
	return null;
}

async function Log(txt, format=0, inf=0) {
	let data; let pref3; let pref2; let pref1;
	const map = {
		0: '[I]',
		1: '[E]',
	}
	
	pref3 = format === null ? '' : (map[format] ?? '[U]')
	
	pref2 = currentUser ? `${currentUser.uid}:${currentUsername}` : 'SYSTEM';
	pref1 = new Date().toLocaleString();
	
	data = `${pref1} ${pref2} ${pref3} ----- ${txt}`;
	if ( inf == 1) { console.log(data); }
	
	await push(ref(db, REF.log), data);
}

function waitForClick(button) {
	return new Promise(function(resolve) {
		button.onclick = function() {
			resolve();
		};
	});
}


// ----------------------------------------------------------------
// ----------------------------------------------------------------


function setLoginStatus(txt) {
	GE("loginStatus").textContent = txt;
}

let emergencyTriggered = false;
const emergencyBubble = GE("emergencyBubble");

let dragging = false;
let moved = false;
let offsetX = 0;
let offsetY = 0;

emergencyBubble.addEventListener("pointerdown", function(event) {
	dragging = true;
	moved = false;
	
	const rect = emergencyBubble.getBoundingClientRect();
	
	offsetX = event.clientX - rect.left;
	offsetY = event.clientY - rect.top;
	
	emergencyBubble.setPointerCapture(event.pointerId);
});

emergencyBubble.addEventListener("pointermove", function(event) {
	if (!dragging) {return;}
	
	moved = true;
	let x = event.clientX - offsetX;
	let y = event.clientY - offsetY;
	
	const maxX = window.innerWidth - emergencyBubble.offsetWidth;
	const maxY = window.innerHeight - emergencyBubble.offsetHeight;
	
	x = Math.max(0, Math.min(x, maxX));
	y = Math.max(0, Math.min(y, maxY));
	
	emergencyBubble.style.left = x + "px";
	emergencyBubble.style.top = y + "px";
	
	emergencyBubble.style.right = "auto";
	emergencyBubble.style.bottom = "auto";
});

emergencyBubble.addEventListener("pointerup", function(event) {
	dragging = false;
	
	emergencyBubble.releasePointerCapture(event.pointerId);
	
	if (!moved) {
		emergency();
	}
});

document.addEventListener("visibilitychange", function() {
	if (document.hidden && currentUser) {
		emergency();
	}
});

window.addEventListener("blur", function() {
	if (currentUser) {
		emergency();
	}
});

window.clearhistory = async function() {
	await update(REF.globalChat, {});
	Log("History Cleared.");
};

window.emergency = function() {
	if (emergencyTriggered) { return; }
	
	emergencyTriggered = true;
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	currentUser = null;
	
	GE("chatPage").style.display = "none";
	GE("adminPage").style.display = "none";
	Array.from(GE("adminPage").children).forEach(child => {
	  child.style.display = "none";
	});
	
	GE("messages").innerHTML = "";
	
	GE("username").value = "";
	GE("password").value = "";
	
	GE("loginPage").style.display = "block";
	
	Log("Emergency Triggered.");
	logout();
};

window.addEventListener("deviceorientation", function(event) {
	const beta = event.beta;
	const alpha = event.alpha;
	const gamma = event.gamma;
	
	if (beta === null && alpha === null && gamma === null) {
		return;
	}
	
	// GE("sensorDebug").textContent = `α = ${alpha}<br>β = ${beta}<br>γ = ${gamma}`;
	if (
		(beta !== null && Math.abs(beta) > 150) ||
		(gamma !== null && Math.abs(gamma) > 75 && Math.abs(beta) < 30)
	) {
		Log("Orientation Logout!", 0, 1);
		emergency();
	}
});

window.addEventListener("devicemotion", function(event) {
	const acc = event.accelerationIncludingGravity;
	if (!acc) return;
	
	const x = acc.x;
	const y = acc.y;
	const z = acc.z;
	
	// GE("sensorDebug").textContent = `X: ${x?.toFixed(1) ?? "null"} | Y: ${y?.toFixed(1) ?? "null"} | Z: ${z?.toFixed(1) ?? "null"}`;
	
	if (x === null || y === null || z === null) return;
	
	const isFacedown = z < -5.0;
	const isTiltedSideways = Math.abs(x) > 8.0 && Math.abs(z) < 4.0;
	
	if (isFacedown || isTiltedSideways) {
		Log("Motion Emergency Triggered!", 0, 1);
		emergency();
	}
});



// ----------------------------------------------------------------
// ----------------------------------------------------------------

window.register = async function() {
	const user = GE("username").value.trim().toLowerCase();
	const pass = GE("password").value.trim();
	
	if (!user || !pass) {
		setLoginStatus("Enter username and Password.");
		return;
	}
	
	if (await fetch(REF.newReg) === false) {
		setLoginStatus("Registrations Closed By Admin.");
		return;
	}
	
	if (
		!/^[a-z0-9_]{3,20}$/.test(user)
	) {
		setLoginStatus(
			"username must contain only letters, numbers or _. 3-20 characters."
		);
		return;
	}
	
	const email = usernameToEmail(user);
	
	try {
		const cred = await createUserWithEmailAndPassword(
			auth,
			email,
			pass
		);
		
		currentUser = cred.user;
		currentUsername = user;
		
		await update(
			REF.users + "/" + currentUser.uid,
			
			{
				username: currentUsername,
				createdAt: Date.now()
			}
			
		);
		
		setLoginStatus("Account Created! You can now login.");
		Log(`User Registered: ${currentUser.uid}:${currentUsername}`);
	} catch (err) {
		setLoginStatus("Error Registering User: " + err.message);
	}
};


window.login = async function() {
	emergencyTriggered = false;
	
	const user = GE("username").value.trim().toLowerCase();
	const pass = GE("password").value.trim();
	
	if (!user || !pass) {
		setLoginStatus("Enter username and Password.");
		return;
	}
	
	if ((await fetch(REF.frozen) === true) && (user !== "admin")) {
		setLoginStatus("System Frozen by Admin.");
		return;
	}
	const email = usernameToEmail(user)
	
	try {
		await signInWithEmailAndPassword(
			auth,
			email,
			pass
		);
	
	} catch (err) {
		setLoginStatus("Error Loggin In: " + err.message);
	}
	
	Log(`Login Attempted User: ${currentUsername}`);
}

onAuthStateChanged(
	auth,
	async function(user) {
		if (user) {
			currentUser = user;
			const data = await fetch(REF.users + "/" + user.uid);
			
			if (data) {
				currentUsername = data.username;
			}
		
		
		if (currentUsername == "admin") {
			GE("loginPage").style.display = "none";
			GE("chatPage").style.display = "none";
			GE("adminPage").style.display = "block";
			GE("callPage").style.display = "none";
			GE("adminPanel").style.display = "block";
			
			Log("ADMIN LOGGED IN.");
			return;
		} else {
			Log(`Logged User: ${currentUsername}`);
		}
		
		GE("currentUser").textContent = currentUsername;
		
		GE("loginPage").style.display = "none";
		GE("adminPage").style.display = "none";
		
		GE("chatPage").style.display = "block";
		
		startIncomingCallListener();
		openRoom(REF.globalChat);
		
		setLoginStatus("Logged In.");
		
		} else {
			currentUser = null;
			currentUsername = null;
			if (stopMessageListener) {
				stopMessageListener();
				stopMessageListener = null;
			}
		}
	}
);



// ----------------------------------------------------------------
// ----------------------------------------------------------------

window.sendMessage = async function() {
	if (!currentUser || !currentRoom) {
		return;
	}
	
	const input = GE("messageInput");
	const text = input.value.trim();
	
	if (!text) {
		return;
	}
	
	const message = {
		sender: currentUser.uid,
		senderName: currentUsername,
		type: "text",
		data: text,
		tstamp: Date.now()
	};
	
	const messageRef = push(
		ref(db, currentRoom + "/messages")
	);
	
	await set(messageRef, message);
	
	input.value = "";
}


function startMessageListener(messageRef) {
	
	stopMessageListener =
		onValue(
			messageRef,
			function(snap) {
				
				const cont = GE("messages");
				cont.innerHTML = "";
				
				const data = snap.val();
				
				if (!data) {
					return;
				}
				
				const messages = Object.values(data);
				
				messages.sort(
					(a, b) => a.tstamp - b.tstamp
				);
				
				for (const message of messages) {
					const div = CE("div");
					div.className = "message";
					
					const name = CE("b");
					name.textContent =
						message.senderName || "Unknown";
					
					let dat;
					if (message.type == "text") {
						dat = CE("span");
						dat.textContent = message.data;
					} else if (message.type == "image") {
						dat = CE("img");
						dat.src = message.data;
					} else if (message.type == "video") {
						dat = CE("video");
						dat.src = message.data;
						dat.controls = true;
					} else {
						continue;
					}
					
					div.appendChild(name);
					div.appendChild(dat);
					
					cont.appendChild(div);
				}
				
				cont.scrollTop = cont.scrollHeight;
			}
		);
}

window.logout = async function() {
	await endCall(true);
	
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	stopIncomingCallListener();
	
	currentUser = null;
	
	Array.from(GE("adminPage").children).forEach(child => {
	  child.style.display = "none";
	});
	
	GE("chatPage").style.display = "none";
	GE("adminPage").style.display = "none";
	GE("loginPage").style.display = "block";
	GE("callPage").style.display = "none";
	GE("logPage").style.display = "none";
	
	GE("messages").innerHTML = "";
	
	GE("username").value = "";
	GE("password").value = "";
	
	Log("Logged Out.");
	setLoginStatus("");
	await signOut(auth);
};

window.backToAdmin = function() {
	Array.from(GE("adminPage").children).forEach(child => {
	  child.style.display = "none";
	});
	GE("adminPanel").style.display = "block";
}

window.backToGlobal = function() {
	GE("roomsPage").style.display = "none";
	GE("chatPage").style.display = "block";
	
	if(GE("cRoom")) { GE("cRoom").remove(); }
	
	openRoom(REF.globalChat)
}

window.showLog = async function() {
	GE("adminPanel").style.display = "none";
	GE("logPage").style.display = "block";
	
	const cont = GE("logDiv");
	cont.innerHTML = "Loading logs...";
	
	try {
		const data = await fetch(REF.log);
		cont.innerHTML = "";
		
		if (!data) {
			cont.textContent = "No logs yet.";
			return;
		}
		
		const logs = Object.entries(data);
		logs.sort((a, b) => {
			const timeA =
				typeof a[1] === "object"
					? a[1].timestamp
					: 0;
			
			const timeB =
				typeof b[1] === "object"
					? b[1].timestamp
					: 0;
			
			return timeB - timeA;
		});
		
		for (const [logID, log] of logs) {
			const div = CE("div");
			
			div.style.padding = "8px";
			div.style.margin = "5px 0";
			div.style.borderBottom = "1px solid #ccc";
			if (typeof log === "object") {
				div.textContent =
					log.text || "Invalid log";
			} else {
				div.textContent = log;
			}
			
			cont.appendChild(div);
		}
		Log("Opened Log");
	} catch (err) {
		console.error("Could not load logs:", err);
		cont.textContent = "Error loading logs: " + err.message;
	}
};

window.manageAccounts = async function() {
	GE("adminPanel").style.display = "none";
	GE("accountManager").style.display = "block";
	
	const cont = GE("accounts");
	cont.innerHTML = "";
	
	const data = await fetch(REF.users);
	
	if (!data) {
		cont.textContent = "No accounts found.";
		return;
	}
	
	const accounts = Object.entries(data);
	
	for (const [uid, account] of accounts) {
		if (account.username == "admin") { continue; }
		const div = CE("div");
		div.className = "account";
		
		const name = CE("span");
		name.textContent = account.username;
		
		const brk = CE("br");
		const hrk = CE("hr");
		const but = CE("button");
		
		but.className = "B";
		but.textContent = "Delete";
		but.onclick = function() {
			deleteAccount(uid);
		};
		
		div.appendChild(name);
		div.appendChild(brk);
		div.appendChild(but);
		div.appendChild(hrk);
		
		cont.appendChild(div);
	}
	
	Log("Account Manager Opened.");
};


window.managehistory = async function() {
	GE("adminPanel").style.display = "none";
	GE("historyManager").style.display = "block";
	
	const cont = GE("history");
	cont.innerHTML = "";
	
	const data = await fetch(REF.globalChat);
	
	if (!data) {
		cont.textContent = "No history Yet.";
		return;
	}
	
	const history = Object.entries(data);
	
	for (const [msgID, msgData] of history) {
		const div = CE("div");
		div.className = "historyEntry";
		
		const brk = CE("br");
		const hrk = CE("hr");
		
		const name = CE("b");
		name.textContent = msgData.senderName;
		
		let dat;
		if (msgData.type == "text") {
			dat = CE("p");
			dat.textContent = msgData.data;
		}
		
		if (msgData.type == "image") {
			dat = CE("img");
			dat.src = msgData.data;
		}
		
		if (msgData.type == "video") {
			dat = CE("video");
			dat.src = msgData.data;
		}
		
		const stamp = CE("p");
		const date = new Date(msgData.tstamp);
		stamp.textContent = date.toLocaleString();
		
		const but = CE("button");
		
		but.textContent = "Delete";
		but.onclick = function() {
			deleteMessage(msgID);
		};
		
		div.appendChild(name);
		div.appendChild(dat);
		div.appendChild(stamp);
		div.appendChild(but); div.appendChild(hrk);
		
		cont.appendChild(div);
	}
	
	Log("History Manager Opened.");
};

async function deleteAccount(acc) {
	await remove(ref(db, REF.secure + "/" + acc));
	await remove(ref(db, REF.users + "/" + acc));
	
	Log(`Deleted Account: ${acc}`);
	manageAccounts();
}

async function deleteMessage(msgID) {
	await remove(ref(db, REF.globalChat + "/" + msgID));
	
	Log(`Deleted Message: ${msgID}`);
	managehistory();
}

window.system = async function(hash) {
	if (hash == 1) { await update(REF.newReg, true); Log("New User Registration Enabled."); }
	if (hash == 2) { await update(REF.newReg, false); Log("New User Registration Disabled."); }
	if (hash == 3) { await update(REF.frozen, true); Log("System Frozen."); }
	if (hash == 4) { await update(REF.frozen, false); Log("System Unfrozen."); }
	if (hash == 5) { await remove(ref(db, REF.log)); showLog(); }
	
	Log(`System Call Observed: ${hash}`);
};

window.createRoom = async function() {
	const div = CE("div");
	div.id = "cRoom";
	div.className = "pageStyleB";
	
	const room = {
		uid: null,
		users: [],
		messages: {},
		name: null
	}
	
	const txt = CE("span");
	txt.textContent = "Enter Room Name:"
	
	const inp = CE("input");
	inp.id = "rInput";
	
	const but = CE("button");
	but.textContent = "Ok";
	
	div.appendChild(txt); div.appendChild(inp); div.appendChild(but);
	div.style.display = "block";
	
	GE("roomsPage").appendChild(div);
	
	await waitForClick(but);
	
	room.name = inp.value.trim();
	
	txt.textContent = "Enter Member Username (leave blank to finish):";
	inp.value = "";
	
	while (true) {
		await waitForClick(but);
		const memberName = inp.value.trim().toLowerCase();
		
		if (memberName == "") {
			break;
		}
		
		const users = await fetch(REF.users);
		let found = false;
		
		if (users) {
			for (const [uid, user] of Object.entries(users)) {
				if (user.username == memberName) {
					room.users.push(uid);
					found = true;
					break;
				}
			}
		}
		
		if (!found) {
			txt.textContent = "User not found. Enter Member Username:";
			inp.value = "";
			continue;
		}
		
		txt.textContent = "Enter Member Username (leave blank to finish):";
		inp.value = "";
	}
	
	room.users.push(currentUser.uid);
	
	const roomRef = push(ref(db, REF.rooms));
	room.uid = roomRef.key;
	
	await set(roomRef, room);
	div.style.display = "none";
	
	Log(`Room Created: ${room.uid}:${room.name}`);
}

async function openRoom(roomHash) {
	GE("roomsPage").style.display = "none";
	GE("chatPage").style.display = "block";
	
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	currentRoom = roomHash;
	currentRoomData = null;
	
	if (roomHash === REF.globalChat) {
		GE("callButton").disabled = true;
	} else {
		const room = await fetch(roomHash);
		currentRoomData = room;
		
		if (room && room.users && room.users.length >= 2) {
			GE("callButton").disabled = false;
		} else {
			GE("callButton").disabled = true;
		}
	}
	
	startMessageListener(ref(db, roomHash + "/messages"));
}

window.showRooms = async function() {
	GE("chatPage").style.display = "none";
	GE("roomsPage").style.display = "block";
	
	const rooms = await fetch(REF.rooms);
	
	const cont = GE("rooms");
	cont.innerHTML = "";
	
	if (!rooms) {
		cont.textContent = "No Rooms.";
		return;
	}
	
	const data = Object.values(rooms);
	
	for (const room of data) {
		if (!room.users || !room.users.includes(currentUser.uid)) { continue; }
		
		const div = CE("div");
		
		const name = CE("b");
		name.textContent = room.name || "Private Chat";
		
		const last = CE("span");
		if (room.messages) {
			const messages = Object.values(room.messages);
			messages.sort(
				(a, b) => a.tstamp - b.tstamp
			);
			
			const latest = messages[messages.length - 1];
			if (latest) {
				last.textContent =
					"\n" + latest.data.slice(0, 15);
			} else {
				last.textContent = "\nNo Messages.";
			}
		} else {
			last.textContent = "\nNo Messages.";
		}
		
		const but = CE("button");
		but.className = "B";
		but.textContent = "Open";
		but.onclick = function() { openRoom(REF.rooms + "/" + room.uid); }
		
		const hrk = CE("hr");
		const brk = CE("br");
		
		div.appendChild(name); div.appendChild(last); div.appendChild(brk);
		div.appendChild(but); div.appendChild(hrk);
		cont.appendChild(div);
	}
}


GE("messageInput").addEventListener(
	"keydown",
	function(event) {
		if (event.key === "Enter") { sendMessage(); }
	}
);


// ----------------------------------------------------------------
// ----------------------------------------------------------------

const rtcConfiguration = {
	iceServers: [
		{
			urls:
				"stun:stun.l.google.com:19302"
		},
		{
			urls:
				"stun:stun1.l.google.com:19302"
		}
	]
};


function showCallPage(
	heading,
	person,
	buttonText
) {
	GE("chatPage").style.display = "none";
	GE("roomsPage").style.display = "none";
	GE("callPage").style.display = "block";
	GE("callHead").textContent = heading;
	GE("callPerson").textContent = person;
	GE("callStatus").textContent = "";
	
	const button = GE("callButton");
	button.textContent = buttonText;
	button.disabled = false;
}

function hideCallPage() {
	GE("callPage").style.display = "none";
	GE("chatPage").style.display = "block";
}

async function getOtherUser() {
	if ( !currentRoomData || !currentRoomData.users ) { return null; }
	
	const otherUID = currentRoomData.users.find( uid => uid !== currentUser.uid );
	if (!otherUID) { return null; }
	
	const userData = await fetch( REF.users + "/" + otherUID );
	if (!userData) { return null; }
	
	return {
		uid: otherUID,
		username: userData.username
	};
}


window.callUser =
	async function() {
		if (!currentUser) { return; }
		
		if (!currentRoomData) {
			alert("Calling is available only in private chats.");
			return;
		}
		
		if (currentRoomData.users.length !== 2) {
			alert("Calling currently supports exactly 2 users per room.");
			return;
		}
		
		if (peerConnection) { return; }
		
		const otherUser = await getOtherUser();

		if (!otherUser) {
			alert("Could not find the other user.");
			return;
		}
		
		const existingCalls = await fetch(REF.calls);
		
		Log(`Call Attempted: to ${otherUser.uid}:${otherUser.username}`);
		if (existingCalls) {
			for (const call of Object.values(existingCalls)) {
				if (call.status === "active" || call.status === "ringing") {
					if (call.caller === otherUser.uid || call.receiver === otherUser.uid) {
						alert("That user is already on a call.");
						return;
					}
				}
			}
		}
		
		callingBySelf = true;
		
		showCallPage("Outgoing Call",
			otherUser.username,
			"End"
		);
		
		GE("callStatus").textContent = "Calling...";
		
		const callRef =
			push(ref(db, REF.calls));
		
		currentCallId = callRef.key;
		currentCallData = {
			caller: currentUser.uid,
			callerName: currentUsername,
			receiver: otherUser.uid,
			receiverName: otherUser.username,
			room: currentRoom,
			status: "ringing",
			createdAt: Date.now()
		};
		
		await set(callRef, currentCallData);
		
		
		await createPeerConnection();
		
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
		
		await set(
			ref(db, REF.calls + "/" + currentCallId + "/offer"),
			{
				type: offer.type,
				sdp: offer.sdp
			}
		);
		
		stopCallListener = onValue(
				ref(db, REF.calls + "/" + currentCallId),
				async function(snapshot) {
					const data = snapshot.val();
					if (!data) { return; }
					
					if (data.status === "rejected") {
						GE("callStatus").textContent = "Call rejected.";
						await cleanupCall(false);
						return;
					}
					
					if (data.status === "ended") {
						GE("callStatus").textContent = "Call ended.";
						await cleanupCall(false);
						return;
					}
					
					if (data.answer && peerConnection.currentRemoteDescription === null) {
						try {
							await peerConnection.setRemoteDescription(
									new RTCSessionDescription(data.answer)
							);
							
							GE("callStatus").textContent = "Connected";
						} catch (err) { console.error(err); }
					}
				}
			);
		
		stopCallerCandidateListener =
			onValue(
				ref(db, REF.calls + "/" + currentCallId + "/receiverCandidates"),
				async function(snapshot) {
					const data = snapshot.val();

					if (!data) { return; }
					
					for (const candidate of Object.values(data)) {
						try {
							await peerConnection.addIceCandidate(
									new RTCIceCandidate(candidate)
							);
						} catch (err) { console.error("ICE error:", err); }
					}
				}
			);
		
		GE("callButton").onclick =
			function() { endCall(); };
	};


async function createPeerConnection() {
	peerConnection = new RTCPeerConnection(rtcConfiguration);
	
	localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
	
	for ( const track of localStream.getTracks() ) { peerConnection.addTrack(track, localStream); }
	
	peerConnection.ontrack =
		function(event) {
			const audio = GE("remoteAudio");
			
			audio.srcObject = event.streams[0];
			audio.play().catch(
					err =>
						console.log("Audio autoplay:", err)
			);
		};
	
	peerConnection.onicecandidate =
		async function(event) {
			if ( !event.candidate || !currentCallId ) { return; }
			
			const candidateRef =
				push(
					ref(
						db,
						REF.calls + "/" + currentCallId + "/" +
						( callingBySelf ? "callerCandidates" : "receiverCandidates" )
					)
				);
			
			await set(candidateRef, event.candidate.toJSON());
		};
	
	peerConnection.onconnectionstatechange =
		function() {
			if (!peerConnection) { return; }
			
			const state = peerConnection.connectionState;
			
			console.log("WebRTC state:", state);
			
			if (state === "connected") {
				GE("callStatus").textContent = "Connected";
				GE("muteButton").style.display = "inline-block";
			}
			
			if (state === "disconnected") { GE("callStatus").textContent = "Connection interrupted."; }
			
			if (state === "failed") { GE("callStatus").textContent = "Connection failed."; }
			if (state === "closed") { endCall(); }
		};
}

function startIncomingCallListener() {
	stopIncomingCallListener();
	
	if (!currentUser) { return; }
	
	stopCallListener =
		onValue(
			ref(db, REF.calls),
			async function(snapshot) {
				const calls = snapshot.val();
				
				if (!calls) { return; }
				
				for ( const [callId, call] of Object.entries(calls) ) {
					if (call.receiver !== currentUser.uid) { continue; }
					
					if (call.status !== "ringing") { continue; }
					if (currentCallId) { continue; }
					
					currentCallId = callId;
					currentCallData = call;
					callingBySelf = false;
					
				   showCallPage("Incoming Call", call.callerName, "Accept");
					
					GE("callStatus").textContent = "Incoming call...";
					const rejectButton = createRejectButton();
					rejectButton.style.display = "inline-block";
					GE("callButton").onclick = function() { acceptCall(); };
					
					break;
				}
			}
		);
}

function stopIncomingCallListener() {
	if (stopCallListener) {
		stopCallListener();
		stopCallListener = null;
	}
}

async function acceptCall() {
	if (!currentCallId || !currentCallData) { return; }
	
	try {
		GE("callButton").disabled = true;
		GE("callStatus").textContent = "Connecting...";
		
		await createPeerConnection();
		
		const call = await fetch(REF.calls + "/" + currentCallId);
		if (!call || !call.offer) {
			throw new Error("Call offer not found.");
		}
		
		await peerConnection.setRemoteDescription(new RTCSessionDescription(call.offer));
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		
		await update(
			REF.calls + "/" + currentCallId + "/answer",
			{
				type: answer.type,
				sdp: answer.sdp
			}
		);
		
		await update(REF.calls + "/" + currentCallId + "/status", "active");
		
		stopReceiverCandidateListener =
			onValue(
				ref(db, REF.calls + "/" + currentCallId + "/callerCandidates"),
				async function(snapshot) {
					const data =
						snapshot.val();
					
					if (!data) { return; }
					
					for ( const candidate of Object.values(data) ) {
						try {
							await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
						} catch (err) { console.error("ICE error:", err); }
					}
				}
			);
		
		GE("callHead").textContent = "In Call";
		GE("callButton").disabled = false;
		GE("callButton").textContent = "End";
		GE("callButton").onclick = function() { endCall(); };
	}
	catch (err) {
		console.error("Accept call error:", err);
		GE("callStatus").textContent = "Could not connect: " + err.message;
		await endCall();
	}
}

async function rejectCall() {
	if (!currentCallId) { return; }
	
	await update(REF.calls + "/" + currentCallId + "/status", "rejected");
	
	await cleanupCall(true);
}


window.endCall =
	async function(silent = false) {
		if (!currentCallId) {
			if (!silent) { hideCallPage(); }
			return;
		}
		
		try {
			if (currentCallData) {
				await update(REF.calls + "/" + currentCallId + "/status", "ended" );
			}
		}
		catch (err) { console.error("End call Firebase error:", err); }
		
		await cleanupCall(!silent);
	};

async function cleanupCall(returnToChat = true) {
	const rejectButton = GE("rejectCallButton");
	if (rejectButton) { rejectButton.style.display = "none"; }
	
	if ( stopCallerCandidateListener ) {
		stopCallerCandidateListener();
		stopCallerCandidateListener = null;
	}
	
	if ( stopReceiverCandidateListener ) {
		stopReceiverCandidateListener();
		stopReceiverCandidateListener = null;
	}
	
	if (peerConnection) {
		peerConnection.close();
		peerConnection = null;
	}
	
	if (localStream) {
		for ( const track of localStream.getTracks() ) { track.stop(); }
		localStream = null;
	}
	
	GE("remoteAudio").srcObject = null;
	
	currentCallId = null;
	currentCallData = null;
	callingBySelf = false;
	isMuted = false;
	
	GE("muteButton").style.display = "none";
	GE("muteButton").textContent = "Mute";
	
	if (returnToChat) { hideCallPage(); }
}

window.toggleMute =
	function() {
		if (!localStream) { return; }
		
		const tracks = localStream.getAudioTracks();
		if (!tracks.length) { return; }
		
		isMuted = !isMuted;
		for ( const track of tracks ) { track.enabled = !isMuted; }
		
		GE("muteButton").textContent = isMuted ? "Unmute" : "Mute";};


function createRejectButton() {
	let button = GE("rejectCallButton");
	
	if (button) { return button; }
	
	button = CE("button");
	button.id = "rejectCallButton";
	button.textContent = "Reject";
	
	button.onclick =
		function() { rejectCall(); };
	
	GE("callPage").insertBefore(
			button,
			GE("muteButton")
		);
	
	return button;
}

const originalShowCallPage = showCallPage;

GE("callButton").disabled = true;


// ----------------------------------------------------------------
// ----------------------------------------------------------------
