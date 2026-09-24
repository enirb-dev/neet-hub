
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
	onChildAdded,
	remove,
	query,
	orderByChild,
	limitToLast,
	endAt,
	onChildChanged,
	startAt
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

class RawAdminSDK {}
let AdminSDK = null;

function triggerUnauthorizedAdminCallAlert(propName, args) {
	Log(`Unauthorized Admin Call Observed!!! Attempted "${String(propName)}" with "${String(args)}"`);
	signOut(auth);
}

const safeAdmin = new Proxy(RawAdminSDK, {
	get(target, prop, receiver) {
		return function(...args) {
			return triggerUnauthorizedAdminCallAlert(prop, args);
		}
	}
})

AdminSDK = safeAdmin;

// ----------------------------------------------------------------
// ----------------------------------------------------------------

let currentUser = null;
let currentUsername = null;
let currentRoom = null;
let currentRoomData = null;

let DEVMODE = false;

let stopMessageListener = null;

let stopNotificationListener = null;

let queryPageButtonFlag = false;

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
	log: BASE + "/log",
	roomsB: BASE + "/roomsB"
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

function _hideE(element) {
	element.style.display = "none";
}

function _showE(element) {
	element.style.display = "block";
}

function hideE(element) {
	_hideE(GE(element));
}

function showE(element) {
	_showE(GE(element));
}

function hideDiv(divName) {
	Array.from(GE(divName).children).forEach(child => {
		_hideE(child);
	});
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

function formatDate(dat) {
	let d = new Date(dat);
	
	let tmp = `${String(d.getDate()).padStart(2, "0")}/` +
	`${String(d.getMonth() + 1).padStart(2, "0")} ` +
	//+ `/${d.getFullYear()} ` +
	`${String(d.getHours()).padStart(2, "0")}:` +
	`${String(d.getMinutes()).padStart(2, "0")}`;
	//+ `:${String(d.getSeconds()).padStart(2, "0")}`;
	
	return tmp;
}

function _formatDate(dat) {
	let d = new Date(dat);
	
	let tmp = `${String(d.getDate()).padStart(2, "0")}/` +
	`${String(d.getMonth() + 1).padStart(2, "0")}/` +
	`${d.getFullYear()} ` +
	`${String(d.getHours()).padStart(2, "0")}:` +
	`${String(d.getMinutes()).padStart(2, "0")}:` +
	`${String(d.getSeconds()).padStart(2, "0")}`;
	
	return tmp;
}

async function ask(query, type) {
	const queryPage = GE("queryPage");
	
	showE("queryPage");
	queryPageButtonFlag = false;
	
	hideE("query_i");
	hideE("query_p");
	
	if (type == "input" || type == "both") {
		showE("query_i");
	}
	
	if (type == "password" || type == "both") {
		showE("query_p");
	}
	
	showE("query_q");
	GE("query_q").textContent = query;
	
	while (!queryPageButtonFlag) {
		await delay(500);
	}
	
	let result = [];
	
	if (type == "input" || type == "both") {
		result.push(GE("query_i").value);
	}
	
	if (type == "password" || type == "both") {
		result.push(GE("query_p").value);
	}
	
	GE("query_i").value = "";
	GE("query_p").value = "";
	
	queryPageButtonFlag = false;
	hideE("queryPage");
	
	return result;
}

function createMenu(x, y, options) {	// options = list of (text, action)
	if (currentMenu) {
		currentMenu.remove();
		currentMenu = null;
	}
	
	const menu = CE("div");
	currentMenu = menu;
	
	menu.style.position = "fixed";
	menu.style.left = `${x}px`;
	menu.style.top = `${y}px`;
	menu.style.zindex = "1000";
	
	for (const [txt, action] of options) {
		const but = CE("button");
		but.textContent = txt;
		but.className = "B";
		but.onclick = function(event) {
			event.stopPropagation();
			closeMenu();
			
			action();
		};
		
		menu.appendChild(but);
	}
	
	document.body.appendChild(menu);
	
	function closeMenu() {
		/*
		if (menu.parentNode) {
			menu.remove();
		}
		*/
		
		menu.remove();
		
		if (currentMenu == menu) {
			currentMenu = null;
		}
		
		window.removeEventListener("click", closeMenu);
		window.removeEventListener("contextmenu", closeMenu);
	}
	
	window.addEventListener("click", closeMenu);
	window.addEventListener("contextmenu", closeMenu);
	
	return menu;
}

async function initMediaDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("NeetHubDB", 1);
		
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			
			if (!db.objectStoreNames.contains("images")) {
				db.createObjectStore("images", {keyPath: "id"});
			}
		};
		
		request.onsuccess = (event) => {
			MDB = event.target.result;
			resolve(MDB);
		};
		
		request.onerror = (event) => {
			reject(event.target.error);
		};
	});
}

function saveFile(id, blob, type="images") {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction(type, "readwrite");
		const store = trans.objectStore(type);
		
		const req = store.put({
			id: id,
			blob: blob,
			tstamp: Date.now()
		});
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

function getFile(id, type="images") {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction(type, "readonly");
		const store = trans.objectStore(type);
		
		const req = store.get(id);
		
		req.onsuccess = () => resolve(req.result || null);
		req.onerror = () => reject(req.error);
	});
}

function deleteFile(id, type="images") {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction(type, "readwrite");
		const store = trans.objectStore(type);
		
		const req = store.delete(id);
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

function clearFiles(type="images") {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction(type, "readwrite");
		const store = trans.objectStore(type);
		
		const req = store.clear();
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

async function loadCachedImage(imageId) {
	const cached = await getFile(imageId);
	
	if (cached) {
		console.log("Image Loaded from Cache: ", imageId);
		return URL.createObjectURL(cached.blob);
	}
	
	console.log("Image not Cached. Downlaoding: ", imageId);
	
	const downloadUrl = `${UPLOADER}?fileId=${encodeURIComponent(imageId)}`;
	const response = await window.fetch(downloadUrl);
	
	if (!response.ok) {
		throw new Error("Image Download Failed: HTTP ", response.status, " Message: ", response.message || "NaN");
	}
	
	const raw = await response.text();
	//console.log("Script Response: ", raw);
	
	const result = JSON.parse(raw);
	
	console.log("Result Data: ", result.base64Data?.length, result.mimeType);
	
	//const result = response.json();
	
	const binary = atob(result.base64Data);
	const bytes = new Uint8Array(binary.length);
	
	for (let i=0; i< binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	
	const blob = new Blob(
		[bytes],
		{ type: result.mimeType }
	);
	
	// const blob = await response.blob();
	await saveFile(imageId, blob);
	
	console.log("Image downloaded and cached: ", imageId);
	return URL.createObjectURL(blob);
}

window.addEventListener("scroll", () => {
	if (currentMenu) {
		currentMenu.remove();
		currentMenu = null;
	}
}, true);

async function dialog(msg, immediateHide=false) {
	const queryPage = GE("queryPage");
	
	showE("queryPage");
	
	queryPageButtonFlag = false;
	
	hideE("query_i");
	hideE("query_p");
	
	showE("query_q");
	GE("query_q").textContent = msg;
	
	if (!immediateHide) {
		while (!queryPageButtonFlag) {
			await delay(500);
		}
	} else {
		await delay(1000);
	}
	
	queryPageButtonFlag = false;
	hideE("queryPage");
	
}


window.queryPageButtonClicked = function() {
	queryPageButtonFlag = true;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------


function setLoginStatus(txt) {
	GE("loginStatus").textContent = txt;
}

let emergencyTriggered = false;
const emergencyBubble = GE("emergencyBubble");
let emergencyEnabled = true;
let notificationsEnabled = false;
let notifiedCache = [];

let CACHE = {};
CACHE.replying = null;
CACHE.hacker = false;
CACHE.recording = null;
CACHE.recorded = null;

let currentMenu = null;
let MDB = null;

let fileDialogOpen = false;

let focussed = true;

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
		emergency(true);
	}
});

document.addEventListener("visibilitychange", function() {
	if (document.hidden && currentUser && !fileDialogOpen) {
		focussed = false;
		emergency();
	} else {
		focussed = true;
	}
});

window.addEventListener("blur", function() {
	if (currentUser && !fileDialogOpen) {
		emergency();
	}
});

window.clearhistory = async function() {
	await update(REF.globalChat, {});
	Log("History Cleared.");
};

window.emergency = function(force=false) {
	if ((emergencyTriggered || DEVMODE || !emergencyEnabled) && !force) { return; }
	
	emergencyTriggered = true;
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	Log("Emergency Triggered.");
	
	logout();
};

window.toggleEmergencyActivity = function() {
	if (emergencyEnabled) {
		emergencyEnabled = false;
		GE("emergencyToggle").textContent = "Emergency: Disabled";
	} else {
		emergencyEnabled = true;
		GE("emergencyToggle").textContent = "Emergency: Enabled";
	}
}

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

GE("messageFile").addEventListener("pointerdown", function() {
    fileDialogOpen = true;
});

window.addEventListener("focus", function() {
    // give the OS dialog a moment to fully close before re-arming
    setTimeout(() => { fileDialogOpen = false; }, 300);
});

// ----------------------------------------------------------------
// ----------------------------------------------------------------

window.sendMessage = async function(recursive=false) {
	if (!currentUser || !currentRoom) {
		return;
	}
	
	const input = GE("messageInput");
	const fileInput = GE("messageFile");
	
	let text = input.value.trim();
	input.value = "";
	
	let _time = Math.floor(Date.now() / 1000);
	
	function formatString(str) {
		let target = "/system:1";
		
		if (str.includes(target)) {
			const clean = str.replace(target, "");
			return [1, clean];
		}
		
		target = "/system:2";
		
		if (str.includes(target)) {
			const clean = str.replace(target, "");
			return [2, clean];
		}
		
		return [0, str];
	}
	
	let tmp = formatString(text);
	text = tmp[1];
	if (tmp[0] == 1) {
		_time = null;
	} else if (tmp[0] == 2) {
		CACHE.hacker = !CACHE.hacker;
	}
	
	const files = Array.from(fileInput.files);
	
	if (files.length == 0 && text) {
		const message = {
			sender: currentUser.uid,
			senderName: currentUsername,
			type: "text",
			data: text,
			tstamp: Date.now(),
			time: _time,
			seenBy: [currentUser.uid],
			replyingTo: CACHE.replying,
			meta: null
		};
		
		const messageRef = push(
			ref(db, currentRoom + "/messages")
		);
		
		await set(messageRef, message);
		
		CACHE.replying = null;
		updateReplyUI();
		
		
		const lastMeta = {
			senderName: currentUsername,
			data: text,
			tstamp: Date.now()
		};
		
		if (currentRoomData) {
			
			await set(
				ref(
					db,
					REF.roomsB + "/" +
					currentRoomData.uid +
					"/lastMessageMeta"
				),
				lastMeta
			);
			
			for (const _user of currentRoomData.users) {
				
				if (_user == currentUser.uid) {
					continue;
				}
				
				const notifRef = push(
					ref(
						db,
						REF.users + "/" +
						_user +
						"/notifications"
					)
				);
				
				await set(notifRef, {
					room: currentRoom,
					roomName: currentRoomData.name,
					sender: currentUser.uid,
					senderName: currentUsername,
					type: 1,
					timestamp: Date.now()
				});
			}
		}
		
		return;
	} else if (CACHE.recorded) {
		const replyingTo = CACHE.replying;
		
		CACHE.replying = null;
		updateReplyUI();
		
		sendFile(CACHE.recorded, options=["🎶 Audio", "audio"]);
		CACHE.recorded = null;
	}
	
	fileInput.value = "";
	const replyingTo = CACHE.replying;
	
	CACHE.replying = null;
	updateReplyUI();
	
		
	for (const file of files) {
		sendFile(file);
	}
};


async function sendFile(file, options=["📷 Image", "image"]) {
		const cont = GE("messages");
		
		const sendingDiv = CE("div");
		sendingDiv.className = "message";
		sendingDiv.textContent = `${options[0]} Sending...`;
		
		sendingDiv.style.position = "relative";
		sendingDiv.style.padding = "6px 45px 12px 10px";
		sendingDiv.style.marginTop = "5px";
		sendingDiv.style.marginBottom = "1px";
		sendingDiv.style.overflow = "hidden";
		
		cont.appendChild(sendingDiv);
		cont.scrollTop = cont.scrollHeight;
		
		try {
			console.log("Starting upload:", file.name);
			
			const uploadResult = await uploadToDrive(file);
			
			const fId = uploadResult.fileId;
			const fURL = `https://lh3.googleusercontent.com/d/${fId}=w2000`;
			
			const message = {
				sender: currentUser.uid,
				senderName: currentUsername,
				type: options[1],
				data: fURL,
				tstamp: Date.now(),
				time: Math.floor(Date.now() / 1000),
				seenBy: [currentUser.uid],
				replyingTo: CACHE.replying,
				meta: [fId]
			};
			
			
			const messageRef = push(
				ref(db, currentRoom + "/messages")
			);
			
			await set(messageRef, message);
			console.log("File Sent:", file.name);
			
			sendingDiv.remove();
			
			const lastMeta = {
				senderName: currentUsername,
				data: options[0],
				tstamp: Date.now()
			};
			
			if (currentRoomData) {
				
				await set(
					ref(
						db,
						REF.roomsB + "/" +
						currentRoomData.uid +
						"/lastMessageMeta"
					),
					lastMeta
				);
				
				
				for (const _user of currentRoomData.users) {
					
					if (_user == currentUser.uid) {
						continue;
					}
					
					const notifRef = push(
						ref(
							db,
							REF.users + "/" +
							_user +
							"/notifications"
						)
					);
					
					await set(notifRef, {
						room: currentRoom,
						roomName: currentRoomData.name,
						sender: currentUser.uid,
						senderName: currentUsername,
						type: 1,
						timestamp: Date.now()
					});
				}
			}
		} catch (err) {
			console.error(
				options[1] + " Send Failed:",
				file.name,
				err
			);
			
			sendingDiv.textContent = options[0] + " Loading Failed.";
		}
}


async function chatPageUpdate() {
	if (currentRoomData) {
		if (!currentUser) { return; }
		GE("roomTitle").textContent = currentRoomData.name;
		if (currentRoomData.users.length == 2) {
			let otherUser;
			
			// for (const u of currentRoomData.users) { if (u != currentUser.uid) { otherUser = u; break; } }
			otherUser = currentRoomData.users.find(
				u => u != currentUser.uid
			);
			
			let seenOther = await fetch(REF.users + "/" + otherUser + "/lastSeen") || 0;
			
			if (Date.now() - seenOther <= 3000) {
				GE("onlineHasher").textContent = "Online"; showE("onlineDot");
			} else {
				GE("onlineHasher").textContent = "Offline"; hideE("onlineDot");
			}
		}
	} else {
		GE("roomTitle").textContent = "Neet Hub Chat";
		GE("onlineHasher").textContent = ""; hideE("onlineDot");
	}
}

setInterval(chatPageUpdate, 500);

function setupMessageMenu(div, messageId, message) {
	div.addEventListener("contextmenu", function(event) {
		event.preventDefault();
		event.stopPropagation();
		
		createMenu(
			event.clientX,
			event.clientY,
			[
				[
					"Reply",
					function() {
						CACHE.replying = [
							messageId,
							message.data
						];
						
						GE("messageInput").focus();
						updateReplyUI();
					}
				],
				[
					"Delete",
					function() {
						deleteMessage(messageId);
					}
				],
			]
		);
	});
}

function updateReplyUI() {
	const existing = GE("replyingBar");
	
	if (!existing) {
		return;
	}
	
	if (!CACHE.replying) {
		existing.style.display = "none";
		existing.textContent = "";
		return;
	}
	
	existing.style.display = "block";
	existing.textContent = "";
	
	const label = CE("span");
	label.textContent = "Replying to: ";
	
	const text = CE("b");
	let _ = (CACHE.replying[1].length > 20) ? "... " : " ";
	text.textContent = CACHE.replying[1].slice(0,20) + _;
	
	const cancel = CE("button");
	cancel.textContent = "Cancel";
	cancel.className = "B";
	cancel.onclick = function(event) {
		event.stopPropagation();
		CACHE.replying = null;
		updateReplyUI();
	};
	
	existing.appendChild(label);
	existing.appendChild(text);
	existing.appendChild(cancel);
}

let blockLoad = false;
let messageListener = null;
let messageChangedListener = null;

let oldestMessageTime = null;
let newestMessageTime = null;
let loadingOlderMessages = false;
let hasMoreMessages = true;

const MESSAGE_CHUNK = 50;

async function renderMessageLegacy(messageId, message) {
	const div = CE("div");
	const isSameUser = (message.senderName == lastUser);
	div.className = "message";
	
	div.style.position = "relative";
	div.style.padding = "6px 45px 12px 10px"
	div.style.marginTop = isSameUser ? "1px" : "5px";
	div.style.marginBottom = "1px";
	
	if (!Array.isArray(message.seenBy)) {
		message.seenBy = [message.sender];
	}
	
	if (!message.seenBy.includes(currentUser.uid)) {
		if (focussed) {
			message.seenBy.push(currentUser.uid);
			
			blockLoad = true;
			await update(
				currentRoom + "/messages/" + messageId + "/seenBy",
				message.seenBy
			);
			blockLoad = false;
		}
	}
	
	let tmp = true;
	
	if (currentRoomData) {
		for (const user of currentRoomData.users) {
			if (!message.seenBy.includes(user)) {
				tmp = false;
				return null;
			}
		}
	} else {
		tmp = false;
	}
	
	const replyingTo = CE("b");
	if (message.replyingTo) {
		replyingTo.textContent = message.replyingTo[1];
	}
	
	const name = CE("b");
	name.textContent = message.senderName || "Unknown";
	
	const brk2 = CE("br");
	const time = CE("span");
	time.className = "message-time";
	
	let formatted;
	
	if (!message.time) { message.time = null; }
	if (message.time !== null) {
		formatted = formatDate(message.time * 1000);
	} else {
		formatted = "TimeStampError";
	}
	
	if (message.sender == currentUser.uid && tmp && (formatted != "TimeStampError")) {
		formatted = "✔" + ' ' + formatted;
	}
	
	time.textContent = formatted;
	time.style.fontSize = "10px";
	time.style.position = "absolute";
	time.style.right = "4px";
	time.style.bottom = "2px";
	
	time.style.display = 'inline-block';
	time.style.transform = "scale(0.8)";
	time.style.transformOrigin = "bottom right";
	time.style.whiteSpace = "nowrap";
	time.style.color = "#888";
	
	if (message.replyingTo) {
		const replyBox = CE("div");
		
		replyBox.style.padding = "3px 6px";
		replyBox.style.marginBottom = "4px";
		replyBox.style.borderLeft = "3px solid #888";
		replyBox.style.fontSize = "12px";
		replyBox.style.opacity = "0.75";
		replyBox.style.overflow = "hidden";
		replyBox.style.textOverflow = "ellipsis";
		replyBox.style.whiteSpace = "nowrap";
		replyBox.style.background = "#ddd";
		
		const replyLabel = CE("b");
		replyLabel.textContent = "↩ ";
		
		const replyText = CE("span");
		replyText.textContent = message.replyingTo[1];
		
		replyBox.appendChild(replyLabel);
		replyBox.appendChild(replyText);
		
		replyBox.onclick = function(event) {
			event.stopPropagation();
			
			const targetId = message.replyingTo[0];
			
			const target = GE("messages").querySelector(`[data-message-id="${targetId}"]`);
			
			if (target) {
				target.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
			}
		};
		
		div.appendChild(replyBox);
	}
	
	let dat;
	if (message.type == "text") {
		dat = CE("span");
		dat.textContent = message.data;
	} else if (message.type == "image") {
		dat = CE("div");
		dat.textContent = "📷 Image Loading...";
		
		dat.style.maxWidth = "380px";
		dat.style.maxHeight = "550px";
		dat.style.width = "auto";
		dat.style.height = "auto";
		
		const imageId = message.meta[0];
		
		let tUrl;
		loadCachedImage(imageId, message.data)
			.then(url => {
				dat.textContent = "";
				
				const imgCont = CE("img");
				imgCont.src = url;
				
				tUrl = url;
				
				imgCont.style = "pointer";
				
				imgCont.onclick = (event) => {
					event.stopPropagation();
					
					const overlay = CE("div");
					let os = overlay.style;
					os.position = "fixed";
					os.inset = "0";
					os.background = "rgba(0,0,0,0.85)";
					os.display = "flex";
					os.alignItems = "center";
					os.justifyContent = "center";
					os.zindex = "9999";
					os.cursor = "zoom-out";
					
					const bigImg = CE("img");
					bigImg.src = tUrl;
					let bs = bigImg.style;
					bs.maxWidth = "95vw";
					bs.maxHeight = "95vw";
					bs.objectFit = "contain";
					bs.borderRadius = "8px";
					
					overlay.appendChild(bigImg);
					document.body.appendChild(overlay);
					
					overlay.onclick = () => {
						overlay.remove();
					}
					
				}
				
				imgCont.style.maxWidth = "380px";
				imgCont.style.maxHeight = "550px";
				imgCont.style.width = "auto";
				imgCont.style.height = "auto";
				
				imgCont.style.display = "block";
				imgCont.style.borderRadius = "8px";
				imgCont.style.objectFit = "contain";
				
				imgCont.onload = () => {
					requestAnimationFrame(() => {
						cont.scrollTop = cont.scrollHeight;
					});
					console.log("Image Loaded: ", dat.naturalWidth, dat.naturalHeight);
				}
				
				imgCont.onerror = async function() {
					console.log("Image Failed: ", dat.src);
					
					try {
						const response = await window.fetch(message.data);
						
						console.log("FETCH STATUS:", response.status);
						console.log("FETCH TYPE:", response.headers.get("content-type"));
						console.log("FETCH URL:", response.url);
					} catch (err) {
						console.log("FETCH ERROR:", err);
					}
				}
				
				dat.replaceWith(imgCont);
			})
			.catch (err => {
				console.error("Image Failed: ", imageId, err);
				dat.alt = "Image Failed";
			});
		
		// dat.src = message.data;
		
		
	} else if (message.type == "video") {
		dat = CE("video");
		dat.src = message.data;
		dat.controls = true;
	} else {
		return 0;
	}
	
	div.dataset.messageId = messageId;
	
	setupMessageMenu(div, messageId, message);
	
	if (lastUser != message.senderName) {
		div.appendChild(name);
		const brkName = CE("br");
		div.appendChild(brkName);
	}
	
	div.appendChild(dat);
	div.appendChild(time);
	
	div.style.overflow = 'hidden';
	
	return div;
}

GE("messages").addEventListener(
	"scroll",
	function() {

		if (this.scrollTop <= 100) {
			loadOlderMessages();
		}
	}
);

async function loadOlderMessages() {
	if (
		loadingOlderMessages ||
		!hasMoreMessages ||
		!currentRoom
	) {
		return;
	}
	
	if (oldestMessageTime === null) {
		return;
	}
	
	loadingOlderMessages = true;
	
	const cont = GE("messages");
	
	const oldHeight = cont.scrollHeight;
	const oldTop = cont.scrollTop;
	
	const messageRef =
		ref(
			db,
			currentRoom + "/messages"
		);
	
	const olderQuery = query(
		messageRef,
		orderByChild("tstamp"),
		endAt(oldestMessageTime - 1),
		limitToLast(MESSAGE_CHUNK)
	);
	
	try {
		const snap = await get(olderQuery);
		
		if (!snap.exists()) {
			hasMoreMessages = false;
			return;
		}
		
		const data = snap.val();
		const messages = Object.entries(data);
		
		messages.sort(
			(a, b) => a[1].tstamp - b[1].tstamp
		);
		
		if (messages.length === 0) {
			hasMoreMessages = false;
			return;
		}
		
		oldestMessageTime = messages[0][1].tstamp;
		
		for (let i = messages.length - 1; i >= 0; i--) {
			const [messageId, message] = messages[i];
			
			if (
				cont.querySelector(
					`[data-message-id="${messageId}"]`
				)
			) {
				continue;
			}
			
			await renderMessage(
				messageId,
				message,
				true
			);
		}
		
		const newHeight = cont.scrollHeight;
		cont.scrollTop =
			oldTop +
			(newHeight - oldHeight);
	
	} finally {
		loadingOlderMessages = false;
	}
}

function updateSenderNameVisibility(div) {
	const nameEl = div.querySelector(".sender-name");
	if (!nameEl) return;

	const prev = div.previousElementSibling;
	const shouldShow = !prev || prev.dataset.senderName !== div.dataset.senderName;

	nameEl.style.display = shouldShow ? "block" : "none";
	div.style.marginTop = shouldShow ? "5px" : "1px";
}

let renderMessage = null;
async function startMessageListener(messageRef) {
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	if (messageChangedListener) {
		messageChangedListener();
		messageChangedListener = null;
	}
	
	const cont = GE("messages");
	
	cont.innerHTML = "";
	
	oldestMessageTime = null;
	newestMessageTime = null;
	loadingOlderMessages = false;
	hasMoreMessages = true;
	
	renderMessage = async function(messageId, message, prepend=false) {
		if (!message) {
			return;
		}
		
		if (message.deleted && !CACHE.hacker) {
			return;
		}
		
		if (cont.querySelector(`[data-message-id="${messageId}"]`)) {
			return;
		}
		
		const div = CE("div");
		
		let lastUser = null;
		
		if (cont.children.length > 0) {
			const referenceElement = prepend
				? cont.children[0]
				: cont.children[cont.children.length - 1];
			
			lastUser = referenceElement.dataset.senderName || null;
		}
		
		const isSameUser = message.senderName == lastUser;
		
		div.className = "message";
		
		div.style.position = "relative";
		div.style.padding = "6px 45px 12px 10px";
		div.style.marginTop = isSameUser ? "1px" : "5px";
		div.style.marginBottom = "1px";
		
		if (!Array.isArray(message.seenBy)) {
			message.seenBy = [message.sender];
		}
		
		if (!message.seenBy.includes(currentUser.uid)) {
			if (focussed) {
				message.seenBy.push(currentUser.uid);
				blockLoad = true;
				
				await update(
					currentRoom +
					"/messages/" +
					messageId +
					"/seenBy",
					message.seenBy
				);

				blockLoad = false;
			}
		}
		
		let tmp = true;
		if (currentRoomData) {
			for (const user of currentRoomData.users) {
				if (!message.seenBy.includes(user)) {
					tmp = false;
					break;
				}
			}
		
		} else {
			tmp = false;
		}
		
		const name = CE("b");
		name.className = "sender-name";
		name.textContent = message.senderName || "Unknown";
		name.style.display = "block";
		name.style.marginBotton = "10px";
		
		div.dataset.messageId = messageId;
		div.dataset.senderName = message.senderName || "";
		
		const time = CE("span");
		
		let formatted;
		
		if (!message.time) {
			message.time = null;
		}
		
		if (message.time !== null) {
			formatted = formatDate(message.time * 1000);
		} else {
			formatted = "TimeStampError";
		}
		
		if (
			message.sender == currentUser.uid &&
			tmp &&
			formatted != "TimeStampError"
		) {
			formatted = "✔ " + formatted;
		}
		
		time.textContent = formatted;
		
		time.style.fontSize = "10px";
		time.style.position = "absolute";
		time.style.right = "4px";
		time.style.bottom = "2px";
		
		time.style.display = "inline-block";
		time.style.transform = "scale(0.8)";
		time.style.transformOrigin = "bottom right";
		time.style.whiteSpace = "nowrap";
		time.style.color = "#888";
		
		if (message.replyingTo) {
			const replyBox = CE("div");
			
			replyBox.style.padding = "3px 6px";
			replyBox.style.marginBottom = "4px";
			replyBox.style.borderLeft = "3px solid #888";
			replyBox.style.fontSize = "12px";
			replyBox.style.opacity = "0.75";
			replyBox.style.overflow = "hidden";
			replyBox.style.textOverflow = "ellipsis";
			replyBox.style.whiteSpace = "nowrap";
			replyBox.style.background = "#ddd";
			
			const replyLabel = CE("b");
			replyLabel.textContent = "↩ ";
			
			const replyText = CE("span");
			replyText.textContent = message.replyingTo[1];
			
			replyBox.appendChild(replyLabel);
			replyBox.appendChild(replyText);
			
			replyBox.onclick = function(event) {
				event.stopPropagation();
				const targetId = message.replyingTo[0];
				const target =
					GE("messages")
					.querySelector(
						`[data-message-id="${targetId}"]`
					);
				
				if (target) {
					target.scrollIntoView({
						behavior: "smooth",
						block: "center"
					});
				}
			};
			
			div.appendChild(replyBox);
		}
		
		let dat;
		
		if (message.type == "text") {
			dat = CE("span");
			dat.textContent = message.data;
		} else if (message.type == "image") {
			dat = CE("div");
			dat.textContent = "📷 Image Loading...";
			
			const imageId = message.meta[0];
			
			let tUrl;
			
			loadCachedImage(imageId, message.data)
				.then(url => {
					dat.textContent = "";
					
					const imgCont = CE("img");
					
					imgCont.src = url;
					tUrl = url;
					imgCont.style.cursor = "pointer";
					
					imgCont.onclick = function(event) {
						event.stopPropagation();
						
						const overlay = CE("div");
						let os = overlay.style;
						
						os.position = "fixed";
						os.inset = "0";
						os.background = "rgba(0,0,0,0.85)";
						os.display = "flex";
						os.alignItems = "center";
						os.justifyContent = "center";
						os.zIndex = "9999";
						os.cursor = "zoom-out";
						
						const bigImg = CE("img");
						bigImg.src = tUrl;
						
						let bs = bigImg.style;
						
						bs.maxWidth = "95vw";
						bs.maxHeight = "95vw";
						bs.objectFit = "contain";
						bs.borderRadius = "8px";
						
						overlay.appendChild(bigImg);
						
						document.body.appendChild(overlay);
						
						overlay.onclick = () => {
							overlay.remove();
						};
					};
					
					imgCont.style.maxWidth = "380px";
					imgCont.style.maxHeight = "550px";
					imgCont.style.width = "auto";
					imgCont.style.height = "auto";
					
					imgCont.style.display = "block";
					imgCont.style.borderRadius = "8px";
					imgCont.style.objectFit = "contain";
					
					imgCont.onload = () => {
						requestAnimationFrame(() => {
							cont.scrollTop = cont.scrollHeight;
						});
						
						console.log(
							"Image Loaded:",
							imgCont.naturalWidth,
							imgCont.naturalHeight
						);
					};
					
					imgCont.onerror = function() {
						console.log(
							"Image Failed:",
							imgCont.src
						);
					};
					dat.replaceWith(imgCont);
				})
				.catch(err => {
					console.error(
						"Image Failed:",
						imageId,
						err
					);
					dat.textContent = "📷 Image Failed";
				});
		} else if (message.type == "video") {
			dat = CE("video");
			dat.src = message.data;
			dat.controls = true;
		} else {
			return;
		}
		
		div.dataset.messageId = messageId;
		div.dataset.senderName = message.senderName || "";
		
		setupMessageMenu(
			div,
			messageId,
			message
		);
		
		div.appendChild(name);
		
		
		div.appendChild(dat);
		div.appendChild(time);
		
		div.style.overflow = "hidden";
		
		if (prepend) {
			cont.prepend(div);
		} else {
			cont.appendChild(div);
		}
		
		updateSenderNameVisibility(div);

		if (prepend && div.nextElementSibling) {
			updateSenderNameVisibility(div.nextElementSibling);
		}
	};
	
	const initialQuery = query(
		messageRef,
		orderByChild("tstamp"),
		limitToLast(MESSAGE_CHUNK)
	);
	
	const initialSnap = await get(initialQuery);
	console.log("CurrentRoom: ", currentRoom);
	
	
	if (initialSnap.exists()) {
		const data = initialSnap.val();
		const messages = Object.entries(data);
		
		messages.sort(
			(a, b) => a[1].tstamp - b[1].tstamp
		);
		
		if (messages.length > 0) {
			oldestMessageTime = messages[0][1].tstamp;
			newestMessageTime = messages[messages.length - 1][1].tstamp;
		}
		
		for (const [messageId, message] of messages) {
			await renderMessage(
				messageId,
				message
			);
		}
	}
	
	cont.scrollTop = cont.scrollHeight;
	
	const newMessageQuery = query(
		messageRef,
		orderByChild("tstamp"),
		startAt(newestMessageTime + 1)
	);
	
	messageListener = onChildAdded(
		newMessageQuery,
		async function(snapshot) {
			const message = snapshot.val();
			
			if (!message) {
				return;
			}
			
			const exists =
				cont.querySelector(
					`[data-message-id="${snapshot.key}"]`
				);
			
			if (exists) {
				return;
			}
			
			await renderMessage(
				snapshot.key,
				message
			);
			
			cont.scrollTop = cont.scrollHeight;
		}
	);
	
	messageChangedListener = onChildChanged(
		messageRef,
		async function(snapshot) {
			const message = snapshot.val();

			const oldDiv =
				cont.querySelector(
					`[data-message-id="${snapshot.key}"]`
				);

			if (
				message.deleted &&
				!CACHE.hacker
			) {
				if (oldDiv) {
					oldDiv.remove();
				}
				return;
			}

			if (oldDiv) {
				const time =
					oldDiv.querySelector(".message-time");

				if (time) {
					let allSeen = true;

					if (currentRoomData) {
						for (const user of currentRoomData.users) {
							if (!message.seenBy?.includes(user)) {
								allSeen = false;
								break;
							}
						}
					} else {
						allSeen = false;
					}

					let formatted =
						message.time
							? formatDate(message.time * 1000)
							: "TimeStampError";

					if (
						message.sender == currentUser.uid &&
						allSeen &&
						formatted != "TimeStampError"
					) {
						formatted = "✔ " + formatted;
					}

					time.textContent = formatted;
				}

				return;
			}

			await renderMessage(
				snapshot.key,
				message
			);
		}
	);
	
	stopMessageListener = function() {
		if (messageListener) {
			messageListener();
			messageListener = null;
		}
		
		if (messageChangedListener) {
			messageChangedListener();
			messageChangedListener = null;
		}
	};
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function updateLastSeen() {
	if (!currentUser) { return; }
	if (!focussed) { return; }
	await update(REF.users + "/" + currentUser.uid + "/" + "lastSeen", Date.now()).catch(err => {console.error("LastSeen Update Failed: ", err);});
}

function startNotificationListener() {
	if (!currentUser) { return; }
	
	if (stopNotificationListener) {
		stopNotificationListener();
		stopNotificationListener = null;
	}
	
	const notifRef = ref(db, REF.users + "/" + currentUser.uid + "/notifications");
	
	stopNotificationListener = onChildAdded(
		notifRef,
		async function(snapshot) {
			const notif = snapshot.val();
			
			if (!notif) { return; }
			if (!notificationsEnabled) { return; }
			
			if (currentRoomData && notif.room == currentRoom) {
				await remove(snapshot.ref);
				return;
			}
			
			if (notif.type == 1) {
				await notify("Neet-Hub", `Message From ${notif.roomName} by ${notif.senderName}.`);
			}
			
			await remove(snapshot.ref);
		}
	);
}

async function checkNotifications() {
	if (!currentUser) { return; }
	
	if (!notificationsEnabled) { return; }
	
	const notifU = Object.entries(await fetch(REF.users + "/" + currentUser.uid + "/notifications"));
	
	for (const [notifId, notif] of notifU) {
		if (notifId in notifiedCache) { return; }
		
		if (currentRoomData.name = notif[0]) {
			await remove(ref(REF.users + "/" + currentUser.uid + "/notifications" + notifId));
			continue;
		}
		
		if (notif[2] == 1) {
			await notify("Neet-Hub", `Message from ${notif[0]} by ${notif[1]}.`);
		}
		
		if (notif[2] == 2) {
			await notify("Neet-Hub", `Incoming Call from ${notif[0]} by ${notif[1]}.`);
		}
		
		await remove(ref(REF.users + "/" + currentUser.uid + "/notifications" + notifId));
	}
	
	return;
	
	const rooms = await fetch(REF.rooms);
	
	if (!rooms) {
		return;
	}
	
	const data = Object.values(rooms);
	
	for (const room of data) {
		if (!room.users || !room.users.includes(currentUser.uid) || room.deleted) { continue; }
		
		if (!room.messages) { return; }
		const messages = Object.entries(room.messages);
		messages.sort(
			(a, b) => a[1].tstamp - b[1].tstamp
		);
		
		const [messageId, lastMsg] = messages[messages.length - 1] || [];
		if (!lastMsg) { continue; }
		
		if (!lastMsg.seenBy.includes(currentUser.uid) && lastMsg.sender !== currentUser.uid) {
			if (!notifiedCache.includes(messageId)) {
				await notify("Neet-Hub", `Notification From ${room.name} By ${lastMsg.senderName}`);
				notifiedCache.push(messageId);
			}
		}
	}
}

setInterval(updateLastSeen, 2000);
// setInterval(checkNotifications, 500);

async function notify(head, notif) {
	if (Notification.permission !== "granted") {
		const permission = await Notification.requestPermission();
		
		if (permission !== "granted") {
			return;
		}
	}
	
	new Notification(head, {
		body: notif
	});
}

window.toggleNotifications = async function() {
	if (notificationsEnabled) {
		notificationsEnabled = false;
		GE("notificationToggle").textContent = "Notifications: Disabled";
		return;
	}
	
	if (!("Notification" in window)) {
		GE("notificationToggle").textContent = "Not available in your browser.";
		await delay(1000);
		GE("notificationToggle").textContent = "Notifications: Disabled";
		return;
	}
	
	if (Notification.permission === "denied") {
		GE("notificationToggle").textContent = "Notifications are blocked by your browser.";
		await delay(1000);
		GE("notificationToggle").textContent = "Notifications: Disabled";
		return;
	}
	
	if (Notification.permission !== "granted") {
		const permission = await Notification.requestPermission();
		
		if (permission != "granted") {
			return;
		}
	}
	
	notificationsEnabled = true;
	GE("notificationToggle").textContent = "Notifications: Enabled";

}

async function recordingTrigger() {
	if (CACHE.recording) {
		dialog("Coming Soon!", true);
		recordingAction("stop");
		const audioD = recordingAction("get");
		CACHE.recorded = audioD;
		
		const fileId = uploadToDrive(audio);
		
	} else {
		recordingAction("start");
	}
	
	return;
}

const UPLOADER = "https://script.google.com/macros/s/AKfycbyt9tZA8hsJLoLiNWvgF3U-NO7QOHWe_kCS0RvylN_VNWqAZ6sSGUq6AlQVXpQsrFR4/exec";

async function uploadToDrive(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = async() => {
			const base64Data = reader.result.split(',')[1];
			const payload = {
				fileName: file.name,
				mimeType: file.type,
				base64Data: base64Data
			}
			
			try {
				const response = await window.fetch(UPLOADER, {
					method: "POST",
					body: JSON.stringify(payload),
					headers: {
						"Content-Type": "text/plain;charset=utf-8"
					}
				});
				
				const result = await response.json();
				
				if (result.status == "success") {
					resolve(result);
				} else {
					reject(new Error(result.message));
				}
			} catch (err) {
				reject(err);
			}
		};
		
		reader.onerror = (err) => reject(err);
		reader.readAsDataURL(file);
	});
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
	
	CACHE.replying = null;
	updateReplyUI();
	
	initMediaDB();
	
	if (roomHash === REF.globalChat) {
		GE("callButton").disabled = true;
	} else {
		const room = await fetch(roomHash);
		currentRoomData = room;
		
		let tmp = await fetch(REF.roomsB + "/" + currentRoomData.uid);
		
		if (!tmp) {
			let users = await fetch(REF.users);
			let usernames = [];
			
			for (const user of currentRoomData.users) {
				usernames.push(users[user].username);
			}
			
			const roomB = {
				uid: currentRoomData.uid,
				users: currentRoomData.users,
				usernames: usernames,
				name: currentRoomData.name,
				deleted: currentRoomData.deleted,
				
				lastMessageMeta: {
					data: null,
					senderName: null,
					tstamp: null
				}
			};
			
			await set(ref(db, REF.roomsB + "/" + roomB.uid), roomB);
		}
		
		if (room && room.users && room.users.length >= 2) {
			GE("callButton").disabled = false;
		} else {
			GE("callButton").disabled = true;
		}
	}
	
	blockLoad = false;
	await startMessageListener(ref(db, roomHash + "/messages"));
}

window.showRooms = async function() {
	GE("chatPage").style.display = "none";
	GE("roomsPage").style.display = "block";
	
	CACHE.replying = null;
	updateReplyUI();
	
	currentRoomData = null;
	
	const rooms = await fetch(REF.roomsB);
	
	const cont = GE("rooms");
	cont.innerHTML = "";
	
	if (!rooms) {
		cont.textContent = "No Rooms.";
		return;
	}
	
	const data = Object.values(rooms);
	
	for (const room of data) {
		if (!room.users || !room.users.includes(currentUser.uid) || room.deleted) { continue; }
		
		/*
		let tmp = await fetch(REF.roomsB + "/" + room.uid);
		
		if (!tmp) {
			let users = await fetch(REF.users);
			let usernames = [];
			
			for (const user of room.users) {
				usernames.push(users[user].username);
			}
			
			const roomB = {
				uid: room.uid,
				users: room.users,
				usernames: usernames,
				name: room.name,
				deleted: room.deleted,
				
				lastMessageMeta: {
					data: null,
					senderName: null,
					tstamp: null
				}
			};
			
			await set(ref(db, REF.roomsB + "/" + roomB.uid), roomB);
		}
		*/
		
		const div = CE("div");
		
		const name = CE("b");
		name.textContent = room.name || "Private Chat";
		
		const last = CE("span");
		
		// senderName, data, tstamp
		
		if (room.lastMessageMeta) {
			if (room.lastMessageMeta.data) {
				let _ = (room.lastMessageMeta.data.length > 30) ? "... " : " ";
				last.textContent = "\n" + room.lastMessageMeta.data.slice(0, 30) + _;
			} else {
				last.textContent = "n\No Messages.";
			}
		} else {
			last.textContent = "\nNo Messages.";
		}
		
		const p = CE("p");
		
		const but = CE("button");
		but.className = "B";
		but.textContent = "Open";
		but.onclick = function() { openRoom(REF.rooms + "/" + room.uid); }
		
		const but2 = CE("button");
		but2.className = "B";
		but2.textContent = "Delete";
		but2.onclick = function() {
			let t = emergencyEnabled;
			emergencyEnabled = false;
			
			let ch = confirm("Delete this Room? (Can't Be Undone)");
			
			if (ch) { deleteRoom(room.uid); }
			emergencyEnabled = t;
		}
		
		const hrk = CE("hr");
		const brk = CE("br");
		
		div.appendChild(name); div.appendChild(last); div.appendChild(brk); div.appendChild(p);
		div.appendChild(but); div.appendChild(but2); div.appendChild(hrk);
		cont.appendChild(div);
	}
}

window.logout = async function() {
	await endCall(true);
	
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	if (stopNotificationListener) {
		stopNotificationListener();
		stopNotificationListener = null;
	}
	
	if (notificationsEnabled) { toggleNotifications(); }
	
	stopIncomingCallListener();
	
	Log("Logged Out.");
	currentUser = null;
	
	hideDiv("appWorking");
	
	hideE("chatPage");
	hideE("adminPage");
	hideDiv("adminPage");
	
	GE("messages").innerHTML = "";
	
	GE("username").value = "";
	GE("password").value = "";
	
	showE("loginPage");
	
	hideDiv("adminPage");
	
	GE("loginPage").style.display = "block";
	hideE("callPage");
	hideE("logPage");
	
	setLoginStatus("");
	await signOut(auth);
	
	if (currentUsername == "admin") {
		AdminSDK = safeAdmin;
		window.location.reload(true);
	}
};

window.backToAdmin = function() {
	hideDiv("adminPage");
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


window.showLastSeens = async function() {
	GE("adminPanel").style.display = "none";
	GE("lastSeensPage").style.display = "block";
	
	const cont = GE("lastSeens");
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
		
		const seen = CE("span");
		seen.textContent = _formatDate(account.lastSeen);
		
		const brk = CE("br");
		const hrk = CE("hr");
		
		div.appendChild(name);
		div.appendChild(brk);
		div.appendChild(seen);
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
			deleteMessageGlobal(msgID);
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
	
	//let uid = await AdminSDK.getUserByEmail(usernameToEmail(acc));
	//await AdminSDK.completelyDeleteUser(uid);
	
	Log(`Deleted Account: ${acc}`);
	manageAccounts();
}

async function deleteRoom(roomHash) {
	//await remove(ref(db, roomHash));
	await update(REF.rooms + "/" + roomHash + "/deleted", true);
	await update(REF.roomsB + "/" + roomHash + "/deleted", true);
	
	Log(`Room Deleted: ${roomHash}`);
	showRooms();
}

async function deleteMessageGlobal(msgID) {
	await remove(ref(db, REF.globalChat + "/" + msgID));
	
	Log(`Deleted Message: ${msgID}`);
	managehistory();
}

async function deleteMessage(msgID) {
	await update(REF.rooms + "/" + currentRoomData.uid + "/messages/" + msgID + "/deleted", true);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------

window.system = async function(hash) {
	if (hash == 1) { await update(REF.newReg, true); Log("New User Registration Enabled."); }
	if (hash == 2) { await update(REF.newReg, false); Log("New User Registration Disabled."); }
	if (hash == 3) { await update(REF.frozen, true); Log("System Frozen."); }
	if (hash == 4) { await update(REF.frozen, false); Log("System Unfrozen."); }
	if (hash == 5) { await remove(ref(db, REF.log)); showLog(); }
	
	Log(`System Call Observed: ${hash}`);
};

window.admin = async function(hash) {
	if (hash == 1) {
		let [user, pass] = await ask("Enter Username And Password to Update", "both");
		//let uid = await AdminSDK.getUserByEmail(usernameToEmail(user));
		
		//await AdminSDK.resetPassword(uid, pass);
		//await dialog("Updated Password.", true);
		await dialog("Deprecated.", true);
	}
}

window.createRoom = async function() {
	const div = CE("div");
	div.id = "cRoom";
	div.className = "pageStyleB";
	
	const room = {
		uid: null,
		users: [],
		messages: {},
		name: null,
		deleted: false
	}
	
	const roomB = {
		uid: null,
		users: [],
		usernames: [],
		name: null,
		deleted: false,
		lastMessageMeta: {
			senderName: null,
			data: null,
			tstamp: 0
		}
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
	roomB.name = inp.value.trim();
	
	txt.textContent = "Enter Member Username (leave blank to finish):";
	inp.value = "";
	
	const users = await fetch(REF.users);
	
	while (true) {
		await waitForClick(but);
		const memberName = inp.value.trim().toLowerCase();
		
		if (memberName == "") {
			break;
		}
		
		let found = false;
		
		if (users) {
			for (const [uid, user] of Object.entries(users)) {
				if (user.username == memberName) {
					room.users.push(uid);
					roomB.users.push(uid);
					roomB.usernames.push(user.username);
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
	roomB.users.push(currentUser.uid);
	
	const roomRef = push(ref(db, REF.rooms));
	room.uid = roomRef.key;
	roomB.uid = roomRef.key;
	
	await set(roomRef, room);
	await set(
		ref(db, REF.roomsB + "/" + roomB.uid),
		roomB
	);
	
	div.style.display = "none";
	
	Log(`Room Created: ${room.uid}:${room.name}`);
	showRooms();
}


GE("messageInput").addEventListener(
	"keydown",
	function(event) {
		if (event.key === "Enter") { sendMessage(); }
	}
);


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
				createdAt: Date.now(),
				lastSeen: 0,
				notifications: {}
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
				if (currentUsername.includes("test")) {
					if (emergencyEnabled) {
						toggleEmergencyActivity();
					}
				}
			}
		
		
		if (currentUsername == "admin") {
			//AdminSDK = await import("./swan.js");
			if (emergencyEnabled) { toggleEmergencyActivity(); }
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
		startNotificationListener();
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


const rtcConfiguration = {
	iceServers: [
		{
			urls: "stun:stun.l.google.com:19302"
		},
		{
			urls: "stun:stun1.l.google.com:19302"
		}
	]
};


let peerConnection = null;
let localStream = null;

let currentCallId = null;
let currentCallData = null;

let stopIncomingCallListenerRef = null;
let stopCurrentCallListener = null;

let stopCallerCandidateListener = null;
let stopReceiverCandidateListener = null;

let callingBySelf = false;
let isMuted = false;

let pendingRemoteCandidates = [];
let remoteDescriptionSet = false;

let callTimeoutTimer = null;
let endingCall = false;


function showCallPage(heading, person, buttonText) {
	hideE("chatPage");
	hideE("roomsPage");
	showE("callPage");
	
	GE("callHead").textContent = heading;
	GE("callPerson").textContent = person;
	GE("callStatus").textContent = "";
	
	const button = GE("callButton");
	
	button.textContent = buttonText;
	button.disabled = false;
}


function hideCallPage() {
	hideE("callPage");
	showE("chatPage");
}

async function getOtherUser() {
	if (!currentRoomData || !currentRoomData.users) {
		return null;
	}
	
	const otherUID =
		currentRoomData.users.find(
			uid => uid !== currentUser.uid
		);
	
	if (!otherUID) {
		return null;
	}
	
	const userData =
		await fetch(
			REF.users + "/" + otherUID
		);
	
	if (!userData) {
		return null;
	}
	
	return {
		uid: otherUID,
		username: userData.username
	};
}

async function createPeerConnection() {
	if (peerConnection) {
		return;
	}
	
	peerConnection = new RTCPeerConnection(rtcConfiguration);
	
	remoteDescriptionSet = false;
	pendingRemoteCandidates = [];
	
	try {
		localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
		
		for ( const track of localStream.getTracks() ) {
			peerConnection.addTrack(track, localStream);
		}
		
		peerConnection.ontrack = function(event) {
				const audio = GE("remoteAudio");
				if (!audio) { return; }
				
				audio.srcObject = event.streams[0];
				
				audio.play().catch(
					err =>
						console.log(
							"Audio autoplay:",
							err
						)
				);
			};
		
		
		peerConnection.onicecandidate = async function(event) {
				if ( !event.candidate || !currentCallId ) { return; }
				
				const side =
					callingBySelf
						? "callerCandidates"
						: "receiverCandidates";
				
				const candidateRef =
					push(
						ref(
							db,
							REF.calls +
							"/" +
							currentCallId +
							"/" +
							side
						)
					);
				
				try {
					await set(candidateRef, event.candidate.toJSON());
				}
				catch (err) {
					console.error(
						"Could not save ICE candidate:",
						err
					);
				}
			};
		
		peerConnection.onconnectionstatechange = function() {
				if (!peerConnection) { return; }
				const state = peerConnection.connectionState;
				
				console.log(
					"WebRTC state:",
					state
				);
				
				if (state === "connected") {
					GE("callStatus").textContent = "Connected";
					GE("muteButton").style.display = "inline-block";
				}

				else if (state === "disconnected") {
					GE("callStatus").textContent = "Connection interrupted.";
				}
				
				else if (state === "failed") {
					GE("callStatus").textContent = "Connection failed.";
				}
				
				else if (state === "closed") {
					// pass
				}
			};
	}
	
	catch (err) {
		// getUserMedia() can fail after peerConnection
		
		console.error(
			"Peer connection setup failed:",
			err
		);
		
		if (peerConnection) {
			peerConnection.close();
			peerConnection = null;
		}
		
		if (localStream) {
			for ( const track of localStream.getTracks() ) {
				track.stop();
			}
			
			localStream = null;
		}
		
		throw err;
	}
}


async function addRemoteCandidate(candidate) {
	if (!peerConnection || !candidate) {
		return;
	}
	
	if (!remoteDescriptionSet) {
		pendingRemoteCandidates.push(candidate);
		return;
	}
	
	try {
		await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
	}
	
	catch (err) {
		console.error(
			"ICE candidate error:",
			err
		);
	}
}


async function flushPendingRemoteCandidates() {
	if (!peerConnection || !remoteDescriptionSet) {
		return;
	}
	
	const candidates = pendingRemoteCandidates;
	pendingRemoteCandidates = [];
	
	for ( const candidate of candidates ) {
		try {
			await peerConnection.addIceCandidate( new RTCIceCandidate(candidate) );
		}
		catch (err) {
			console.error(
				"Queued ICE candidate error:",
				err
			);
		}
	}
}

function listenForCallerCandidates() {
	if (!currentCallId) {
		return;
	}
	
	if (stopReceiverCandidateListener) {
		stopReceiverCandidateListener();
		stopReceiverCandidateListener = null;
	}
	
	stopReceiverCandidateListener =
		onChildAdded(
			ref(
				db,
				REF.calls +
				"/" +
				currentCallId +
				"/callerCandidates"
			),
			
			async function(snapshot) {
				const candidate = snapshot.val();
				await addRemoteCandidate(candidate);
			}
		);
}


function listenForReceiverCandidates() {
	if (!currentCallId) {
		return;
	}
	
	if (stopCallerCandidateListener) {
		stopCallerCandidateListener();
		stopCallerCandidateListener = null;
	}
	
	stopCallerCandidateListener =
		onChildAdded(
			ref(
				db,
				REF.calls +
				"/" +
				currentCallId +
				"/receiverCandidates"
			),
			
			async function(snapshot) {
				const candidate = snapshot.val();
				await addRemoteCandidate(candidate);
			}
		);
}

window.callUser =
	async function() {
		if (!currentUser) {
			return;
		}
		if (!currentRoomData) {
			alert(
				"Calling is available only in private chats."
			);
			return;
		}
		
		if (!currentRoomData.users || currentRoomData.users.length !== 2) {
			alert("Calling currently supports exactly 2 users per room.");
			return;
		}
		
		if (peerConnection || currentCallId) {
			return;
		}
		
		const otherUser = await getOtherUser();
		
		if (!otherUser) {
			alert("Could not find the other user.");
			
			return;
		}
		
		const existingCalls = await fetch(REF.calls);
		
		Log(`Call Attempted: to ${otherUser.uid}:${otherUser.username}`);
		
		if (existingCalls) {
			for ( const call of Object.values(existingCalls) ) {
				if (call.status !== "active" && call.status !== "ringing") {
					continue;
				}
				
				if (call.caller === otherUser.uid || call.receiver === otherUser.uid) {
					alert("That user is already on a call.");
					return;
				}
			}
		}
		
		callingBySelf = true;
		endingCall = false;
		
		showCallPage(
			"Outgoing Call",
			otherUser.username,
			"End"
		);
		
		GE("callStatus").textContent = "Calling...";
		
		const callRef = push(ref(db, REF.calls));
		
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
		
		
		try {
			await set(callRef, currentCallData);
			await createPeerConnection();
			
			listenForReceiverCandidates();
			
			const offer = await peerConnection.createOffer();
			
			await peerConnection.setLocalDescription(offer);
			
			await update(
				REF.calls +
				"/" +
				currentCallId +
				"/offer",
				
				{
					type: offer.type,
					sdp: offer.sdp
				}
			);
			
			if (stopCurrentCallListener) {
				stopCurrentCallListener();
				stopCurrentCallListener = null;
			}
			
			stopCurrentCallListener =
				onValue(
					ref(
						db,
						REF.calls +
						"/" +
						currentCallId
					),
					
					async function(snapshot) {
						const data = snapshot.val();
						
						if (!data) {
							return;
						}
						
						currentCallData = data;
						
						if (data.status === "rejected") {
							GE("callStatus").textContent = "Call rejected.";
							await cleanupCall(true);
							return;
						}
						
						if ( data.status === "ended" ) {
							GE("callStatus").textContent = "Call ended.";
							await cleanupCall(true);
							return;
						}
						
						if (data.answer && peerConnection && peerConnection.currentRemoteDescription === null) {
							try {
								await peerConnection.setRemoteDescription( new RTCSessionDescription(data.answer));
								remoteDescriptionSet = true;
								
								await flushPendingRemoteCandidates();
								GE("callStatus").textContent = "Connecting...";
							}
							catch (err) {
								console.error(
									"Answer error:",
									err
								);
								
								GE("callStatus").textContent = "Could not establish connection.";
							}
						}
					}
				);
			
			
			clearTimeout(callTimeoutTimer);
			callTimeoutTimer = setTimeout(
					async function() {
						if (currentCallId && currentCallData && currentCallData.status === "ringing") {
							GE("callStatus").textContent = "No answer.";
							
							await endCall();
						}
					},
					30000
				);
			
			GE("callButton").onclick = function() { endCall(); };
		}
		
		catch (err) {
			console.error(
				"Call setup error:",
				err
			);
			
			GE("callStatus").textContent = "Could not start call: " + err.message;
			
			await cleanupCall(true);
		}
	};


function startIncomingCallListener() {
	if (!currentUser) {
		return;
	}
	
	stopIncomingCallListener();
	
	stopIncomingCallListenerRef =
		onValue(
			ref(db, REF.calls),
			
			async function(snapshot) {
				const calls = snapshot.val();
				if (!calls) {
					return;
				}
				
				if (currentCallId) {
					return;
				}
				
				for ( const [callId, call] of Object.entries(calls) ) {
					if ( call.receiver !== currentUser.uid ) {
						continue;
					}
					
					if (call.status !== "ringing") {
						continue;
					}
					
					// Ignore extremely old ringing calls.
					
					if ( call.createdAt && Date.now() - call.createdAt > 60000 ) {
						continue;
					}
					
					if (currentCallId) {
						return;
					}
					
					await notify("Neet-Hub", `Incoming Call from ${call.callerName}`);
					
					currentCallId = callId;
					currentCallData = call;
					callingBySelf = false;
					
					endingCall = false;
					
					showCallPage("Incoming Call", call.callerName || "Unknown User", "Accept");
					GE("callStatus").textContent = "Incoming call...";
					
					const rejectButton = createRejectButton();
					
					rejectButton.style.display = "inline-block";
					
					GE("callButton").onclick =
						function() {
							acceptCall(rejectButton);
						};

					break;
				}
			}
		);
}


function stopIncomingCallListener() {
	if (stopIncomingCallListenerRef) {
		stopIncomingCallListenerRef();
		stopIncomingCallListenerRef = null;
	}
}


async function acceptCall(rejectBut) {
	if (!currentCallId || !currentCallData) {
		return;
	}
	
	try {
		endingCall = false;
		GE("callButton").disabled = true;
		GE("callStatus").textContent = "Connecting...";
		
		await createPeerConnection();
		
		const call =
			await fetch(
				REF.calls +
				"/" +
				currentCallId
			);
		
		if (!call || !call.offer) {
			throw new Error(
				"Call offer not found."
			);
		}
		
		await peerConnection.setRemoteDescription( new RTCSessionDescription(call.offer) );
		remoteDescriptionSet = true;
		
		await flushPendingRemoteCandidates();
		listenForCallerCandidates();
		
		const answer = await peerConnection.createAnswer();
		
		await peerConnection.setLocalDescription(answer);
		
		await update(
			REF.calls +
			"/" +
			currentCallId +
			"/answer",
			
			{
				type: answer.type,
				sdp: answer.sdp
			}
		);
		
		await update(
			REF.calls +
			"/" +
			currentCallId +
			"/status",
			"active"
		);
		
		GE("callHead").textContent = "In Call";
		GE("callStatus").textContent = "Connecting...";
		GE("callButton").disabled = false;
		GE("callButton").textContent = "End";
		GE("callButton").onclick = function() { endCall(); };
		
		hideE(rejectBut);
	}
	
	catch (err) {
		console.error(
			"Accept call error:",
			err
		);
		GE("callStatus").textContent = "Could not connect: " + err.message;
		await endCall();
	}
}

async function rejectCall() {
	if (!currentCallId) {
		return;
	}
	
	const callId = currentCallId;
	try {
		await update(
			REF.calls +
			"/" +
			callId +
			"/status",
			"rejected"
		);
	}
	catch (err) {
		console.error(
			"Reject call error:",
			err
		);
	}
	
	await cleanupCall(true);
}


window.endCall =
	async function(silent = false) {
		if (endingCall) {
			return;
		}
		
		if (!currentCallId) {
			if (!silent) { hideCallPage(); }
			return;
		}
		
		endingCall = true;
		
		const callId = currentCallId;
		
		try {
			await update(
				REF.calls +
				"/" +
				callId +
				"/status",
				"ended"
			);
		}
		catch (err) {
			console.error(
				"End call Firebase error:",
				err
			);
		}
		
		await cleanupCall(!silent);
		
		endingCall = false;
	};


async function cleanupCall(
	returnToChat = true
) {
	clearTimeout(
		callTimeoutTimer
	);
	
	callTimeoutTimer = null;
	
	const rejectButton = GE("rejectCallButton");
	
	if (rejectButton) { rejectButton.style.display = "none"; }
	
	if (stopCallerCandidateListener) {
		stopCallerCandidateListener();
		stopCallerCandidateListener = null;
	}
	
	if (stopReceiverCandidateListener) {
		stopReceiverCandidateListener();
		stopReceiverCandidateListener = null;
	}
	
	if (stopCurrentCallListener) {
		stopCurrentCallListener();
		stopCurrentCallListener = null;
	}
	
	const pc = peerConnection;
	
	peerConnection = null;
	if (pc) {
		pc.ontrack = null;
		pc.onicecandidate = null;
		pc.onconnectionstatechange = null;
		
		try {
			pc.close();
		}
		catch (err) {
			console.error(
				"Peer close error:",
				err
			);
		}
	}
	
	if (localStream) {
		for ( const track of localStream.getTracks() ) {
			track.stop();
		}
		
		localStream = null;
	}
	
	const audio = GE("remoteAudio");
	
	if (audio) {
		audio.pause();
		audio.srcObject =
			null;
	}
	
	currentCallId = null;
	currentCallData = null;
	callingBySelf = false;
	isMuted = false;
	remoteDescriptionSet = false;
	pendingRemoteCandidates = [];
	
	GE("muteButton").style.display = "none";
	GE("muteButton").textContent = "Mute";
	
	if (returnToChat) {
		showE("chatPage");
		hideE("roomsPage");
		hideE("callPage");
		if (currentRoom) {
			openRoom(currentRoom);
		}
	}
}

window.toggleMute =
	function() {
		if (!localStream) {
			return;
		}
		
		const tracks = localStream.getAudioTracks();
		
		if (!tracks.length) {
			return;
		}
		
		isMuted = !isMuted;
		for ( const track of tracks ) {
			track.enabled = !isMuted;
		}
		
		GE("muteButton").textContent =
			isMuted
				? "Unmute"
				: "Mute";
	};

function createRejectButton() {
	let button = GE("rejectCallButton");
	
	if (button) {
		return button;
	}
	
	button = CE("button");
	button.id = "rejectCallButton";
	button.textContent = "Reject";
	
	button.onclick =
		function() {
			rejectCall();
		};

	GE("callPage").insertBefore(
		button,
		GE("muteButton")
	);
	
	return button;
}

GE("callButton").disabled =
	true;

// ----------------------------------------------------------------
// ----------------------------------------------------------------