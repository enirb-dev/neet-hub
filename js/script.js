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
	equalTo,
	onChildChanged,
	startAt,
	runTransaction,
	onDisconnect
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
	Log(`Unauthorized Admin Call Observed!!! Attempted "${String(propName)}" with "${String(args)}"`, false);
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
let stopReactionListener = null;

let queryPageButtonFlag = false;
let currentOpenLog = null;

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
	roomsB: BASE + "/roomsB",
	reactions: BASE + "/config/reactions"
};

// Hoisted utilities & constants to avoid Temporal Dead Zone (TDZ)
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const UPLOADER = "https://script.google.com/macros/s/AKfycbyt9tZA8hsJLoLiNWvgF3U-NO7QOHWe_kCS0RvylN_VNWqAZ6sSGUq6AlQVXpQsrFR4/exec";

let CACHE = {
	replying: null,
	hacker: false,
	recording: null,
	recorded: null,
	loading: false,
	testing: true,
	inspecting: false,
	typingIndicator: false,
	pinnedHash: 0,
	audioChunks: [],
	reactions: {},
	rxnList: null
};

let currentMenu = null;
let MDB = null;


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

function _hideE(el) {
	el.style.display = "none";
	el.hidden = true;
}

function _showE(el) {
	el.style.display = "block";
	el.hidden = false;
}

function hideE(el) {
	_hideE(GE(el));
}

function showE(el) {
	_showE(GE(el));
}

function hideDiv(divName) {
	Array.from(GE(divName).children).forEach(child => {
		_hideE(child);
	});
}

function showDiv(divName) {
	Array.from(GE(divName).children).forEach(child => {
		_showE(child);
	});
}

async function Log(txt, user=true, format=0, inf=0) {
	let data; let pref3; let pref2; let pref1; let str;
	const map = {
		0: '[ I ]',
		1: '[ E ]',
	}
	
	pref3 = format === null ? '' : (map[format] ?? '[U]')
	
	pref2 = currentUser ? `${currentUser.uid}:${currentUsername}` : 'SYSTEM';
	pref1 = new Date().toLocaleString();
	
	str = `${pref1} ${pref2} ${pref3} ----- ${txt}`;
	if ( inf == 1) { console.log(str); }
	
	let handle;
	if (user === false) {
		handle = REF.log;
	} else if (user === true) {
		handle = REF.users + "/" + currentUser.uid + "/" + "logs";
	} else {
		handle = user;
	}
	
	data = {
		timestamp: Date.now(),
		text:      str
	};
	
	//let handle = (!user) ? REF.log : REF.users + "/" + currentUser.uid + "/" + "logs";
	
	//console.log(handle);
	await push(ref(db, handle), data);
}

function waitForClick(button) {
	return new Promise(function(resolve) {
		button.onclick = function() {
			resolve();
		};
	});
}

function formatDate(dat, format=1) {
	let d = new Date(dat);
	
	let tmp;

	if (format == 1) {
		tmp = `${String(d.getDate()).padStart(2, "0")}/` +
		`${String(d.getMonth() + 1).padStart(2, "0")} ` +
		//+ `/${d.getFullYear()} ` +
		`${String(d.getHours()).padStart(2, "0")}:` +
		`${String(d.getMinutes()).padStart(2, "0")}`;
		//+ `:${String(d.getSeconds()).padStart(2, "0")}`;
	} else if (format == 2) {
		tmp = `${String(d.getHours()).padStart(2, "0")}:` +
		`${String(d.getMinutes()).padStart(2, "0")}`;
	} else if (format == 3) {
		tmp = `${String(d.getHours()).padStart(2, "0")}:` +
		`${String(d.getMinutes()).padStart(2, "0")}` +
		`:${String(d.getSeconds()).padStart(2, "0")}`;
	}
	
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
	hideE("query_b");
	hideE("query_b2");
	
	if (type == "input" || type == "both") {
		showE("query_i");
	}
	
	if (type == "password" || type == "both") {
		showE("query_p");
	}
	
	showE("query_q");
	GE("query_q").textContent = query;
	
	showE("query_b");
	showE("query_b2");
	
	while (queryPageButtonFlag === false) {
		await delay(500);
	}
	
	if (queryPageButtonFlag === null) {
		return null;
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

async function askYesNo(query, format=1) {
	const queryPage = GE("queryPage");
	
	showE("queryPage");
	queryPageButtonFlag = false;
	
	hideE("query_i");
	hideE("query_p");
	hideE("query_b");
	hideE("query_b2");
	
	showE("query_q");
	GE("query_q").textContent = query;
	
	showE("query_b");
	showE("query_b2");
	
	if (format == 1) {
		GE("query_b").textContent = "Yes";
		GE("query_b2").textContent = "No";
	} else {
		GE("query_b").textContent = "Confirm";
		GE("query_b2").textContent = "Cancel";
	}
	
	while (queryPageButtonFlag === false) {
		await delay(500);
	}
	
	let result;
	
	if (queryPageButtonFlag == true) {
		result = true;
	} else if (queryPageButtonFlag == null) {
		result = false;
	}
	
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
	
	menu.className = "contextMenu";
	menu.style.left = `${x}px`;
	menu.style.top = `${y}px`;
	
	for (const [txt, action] of options) {
		const but = CE("button");
		
		but.textContent = txt;
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


async function dialog(msg, immediateHide=false) {
	const queryPage = GE("queryPage");
	
	showE("queryPage");
	
	queryPageButtonFlag = false;
	
	hideE("query_i");
	hideE("query_p");
	hideE("query_b2");
	
	showE("query_q");
	GE("query_q").textContent = msg;
	
	if (immediateHide === false) {
		showE("query_b");
		while (!queryPageButtonFlag) {
			await delay(500);
		}
	} else if (immediateHide === true) {
		hideE("query_b");
		await delay(1500);
	} else {
		hideE("query_b");
		await delay(immediateHide).catch(err => {
			console.log(`Dialog Error: Invalid Argument (${immediateHide})`);
		});
	}
	
	queryPageButtonFlag = false;
	hideE("queryPage");
}

async function showLoadingScreen() {
	if (CACHE.loading === true) { return; }
	CACHE.loading = true;
	
	showE("queryPage");
	
	hideE("query_b");
	hideE("query_b2");
	hideE("query_i");
	hideE("query_p");
	showE("query_q");
	
	GE("query_q").textContent = "Loading...";
	
	let n = 1;
	while (CACHE.loading !== null) {
		GE("query_q").textContent = "Loading" + ".".repeat(n);
		n++;
		if (n > 3) { n = 1; }
		await delay(250);
	}
	
	CACHE.loading = false;
	hideE("queryPage");
	hideE("query_q");
}

async function doneLoading() {
	if (!(CACHE.loading === true)) return;
	CACHE.loading = null;
	while (CACHE.loading !== false) {
		await delay(250);
	}
}

window.queryPageButtonClicked = function(tmp) {
	if (tmp != true) {
		queryPageButtonFlag = true;
	} else {
		queryPageButtonFlag = null;
	}
}

async function initMediaDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("NeetHubDB", 2);
		
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			
			if (!db.objectStoreNames.contains("files")) {
				db.createObjectStore("files", {keyPath: "id"});
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

function saveFile(id, blob) {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction("files", "readwrite");
		const store = trans.objectStore("files");
		
		const req = store.put({
			id: id,
			blob: blob,
			tstamp: Date.now()
		});
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

function getFile(id) {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction("files", "readonly");
		const store = trans.objectStore("files");
		
		const req = store.get(id);
		
		req.onsuccess = () => resolve(req.result || null);
		req.onerror = () => reject(req.error);
	});
}

function deleteFile(id) {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction("files", "readwrite");
		const store = trans.objectStore("files");
		
		const req = store.delete(id);
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

function clearFiles() {
	return new Promise((resolve, reject) => {
		const trans = MDB.transaction("files", "readwrite");
		const store = trans.objectStore("files");
		
		const req = store.clear();
		
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

async function loadCachedFile(fId, type="Image", forceRedownload=false) {
	const cached = (!forceRedownload) ? (await getFile(fId)) : null;
	
	if (cached) {
		console.log(type + " Loaded from Cache: ", fId);
		return URL.createObjectURL(cached.blob);
		
	}
	
	if (!forceRedownload) {
		console.log(type + " not Cached. Downloading: ", fId);
	} else {
		console.log(type + " force redownloading: ", fId);
	}
	
	const downloadUrl = `${UPLOADER}?fileId=${encodeURIComponent(fId)}`;
	const response = await window.fetch(downloadUrl);
	
	if (!response.ok) {
		throw new Error(`${type} Download Failed: HTTP ${response.status} Message: ${response.statusText || "NaN"}`);
	}
	
	const raw = await response.text();
	//console.log("Script Response: ", raw);
	
	const result = JSON.parse(raw);
	if (!result || result.status !== "success" || !result.base64Data) {
		throw new Error(`${type} download failed: ${result?.message || "Invalid payload received"}`);
	}
	
	console.log("Result Data: ", result.base64Data?.length, result.mimeType);
	
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
	await saveFile(fId, blob);
	
	console.log(type + " downloaded and cached: ", fId);
	return URL.createObjectURL(blob);
}

window.addEventListener("scroll", () => {
	if (currentMenu) {
		currentMenu.remove();
		currentMenu = null;
	}
}, true);


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

// CACHE, currentMenu, and MDB hoisted to top

let fileDialogOpen = false;

let focussed = true;

let dragging = false;
let moved = false;
let offsetX = 0;
let offsetY = 0;


if (emergencyBubble) emergencyBubble.addEventListener("pointerdown", function(event) {
	dragging = true;
	moved = false;
	
	const rect = emergencyBubble.getBoundingClientRect();
	
	offsetX = event.clientX - rect.left;
	offsetY = event.clientY - rect.top;
	
	emergencyBubble.setPointerCapture(event.pointerId);
});

if (emergencyBubble) emergencyBubble.addEventListener("pointermove", function(event) {
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

if (emergencyBubble) emergencyBubble.addEventListener("pointerup", function(event) {
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
	Log("History Cleared.", false);
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
		Log("Orientation Logout!", true, 0, 1);
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
		Log("Motion Emergency Triggered!", true, 0, 1);
		emergency();
	}
});

function armFileDialog() {
	fileDialogOpen = true;
}

const fileInput = GE("messageFile");

function isFileTrigger(e) {
	return e.target === fileInput || (e.target.closest && e.target.closest('label[for="messageFile"]'));
}

document.addEventListener("pointerdown", e => { if (isFileTrigger(e)) armFileDialog(); }, true);
document.addEventListener("click",       e => { if (isFileTrigger(e)) armFileDialog(); }, true);

if (fileInput) fileInput.addEventListener("change", () => {
	updateSelectedFilesUI();
	setTimeout(() => { fileDialogOpen = false; }, 300);
});

if (fileInput) fileInput.addEventListener("cancel", () => {
	setTimeout(() => { fileDialogOpen = false; }, 300);
});

window.addEventListener("focus", () => {
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
		
		const scheduleMatch = str.match(/\/schedule:(\d{2})-(\d{2})-(\d{4});(\d{2}):(\d{2}):(\d{2})/);
		
		if (scheduleMatch) {
			const [fullTag, day, month, year, hours, minutes, seconds] = scheduleMatch;
			
			const when = new Date(
				Number(year),
				Number(month) - 1,
				Number(day),
				Number(hours),
				Number(minutes),
				Number(seconds)
			);

			const clean = str.replace(fullTag, "").trim();

			// reject impossible dates (month 13, 31 Feb, 25:00 ...) instead of letting them roll over
			const valid =
				when.getFullYear() === Number(year) &&
				when.getMonth() === Number(month) - 1 &&
				when.getDate() === Number(day) &&
				when.getHours() === Number(hours) &&
				when.getMinutes() === Number(minutes) &&
				when.getSeconds() === Number(seconds);

			if (!valid) {
				dialog("Invalid schedule date. Use /schedule:DD-MM-YYYY;HH:MM:SS", true);
				return [4, clean];
			}

			// messages store `time` in unix SECONDS (everything else reads it as seconds)
			_time = Math.floor(when.getTime() / 1000);
			return [3, clean];
		}
		
		return [0, str];
	}
	
	
	let tmp = formatString(text);
	text = tmp[1];
	if (tmp[0] == 1) {
		_time = null;
	} else if (tmp[0] == 2) {
		CACHE.hacker = !CACHE.hacker;
	} else if (tmp[0] == 4) {
		input.value = text;
		return;
	}
	
	const isScheduled = _time !== null && _time * 1000 > Date.now();
	const files = Array.from(fileInput.files);
	
	if (files.length == 0 && text) {
		const message = {
			sender: currentUser.uid,
			senderName: currentUsername,
			type: "text",
			data: text,
			tstamp: isScheduled ? _time * 1000 : Date.now(),
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
		
		if (currentRoomData && !isScheduled) {
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

				if (_user == currentUser.uid) { continue; }
				const notifRef = push(
					ref(db, REF.users + "/" + _user + "/notifications")
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
		
		const namedFile = new File(
			[CACHE.recorded],
			`voice-${Date.now()}.webm`,
			{ type: CACHE.recorded.type }
		);
		
		sendFile(namedFile, ["🎶 Audio", "audio"], replyingTo);
		CACHE.recorded = null;
		
		updateRecordingUI();
	}
	
	fileInput.value = "";
	updateSelectedFilesUI();
	
	const replyingTo = CACHE.replying;	
	CACHE.replying = null;
	updateReplyUI();
	
	
	for (const file of files) {
		let options;
		console.log(file.type);
		if (file.type.startsWith("image")) {
			options = ["📷 Image", "image"];
		} else if (file.type.startsWith("video")) {
			options = ["📽 Video", "video"];
		} else if (file.type.startsWith("audio")) {
			options = ["🎶 Audio", "audio"];
		} else {
			options = ["📁 File", "file"];
		}
		sendFile(file, options, replyingTo);
	}
};


async function sendFile(file, options=["📷 Image", "image"], replyingTo=null) {
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
				replyingTo: replyingTo,
				meta: [fId, file.name]
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
				if (CACHE.typingIndicator) {
					GE("onlineHasher").textContent = "Typing...";
				} else {
					GE("onlineHasher").textContent = "Online";
				}
				showE("onlineDot");
			} else {
				//GE("onlineHasher").textContent = "Offline";
				GE("onlineHasher").textContent = "Last Seen: " + formatDate(seenOther, 2);
				hideE("onlineDot");
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
				[
					"Pin/Unpin",
					function() {
						togglePinMessage(messageId);
					}
				],
				[
					"React",
					function() {
						reactOn(messageId, event.clientX, event.clientY);
					}
				],
				...(myReactionCount(messageId) > 0 ? [[
					"Remove my reactions",
					function() {
						removeMyReactions(messageId);
					}
				]] : [])
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
		_hideE(existing);
		return;
	}
	
	_showE(existing);
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

const msgsContainer = GE("messages");
if (msgsContainer) {
	msgsContainer.addEventListener(
		"scroll",
		function() {
			if (this.scrollTop <= 100) {
				loadOlderMessages();
			}
		}
	);
}

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

// ---- Flash highlight for a focused message (style injected once) ----
(function() {
	if (document.getElementById("msgFlashStyle")) return;
	const st = document.createElement("style");
	st.id = "msgFlashStyle";
	st.textContent = `
		@keyframes msgFlash {
			0%, 100% { box-shadow: inset 0 0 0 0 rgba(255,215,0,0); filter: brightness(1); }
			20%, 60% { box-shadow: inset 0 0 0 4px #ffd700, inset 0 0 24px rgba(255,215,0,0.55); filter: brightness(1.35); }
			40%, 80% { box-shadow: inset 0 0 0 2px rgba(255,215,0,0.4); filter: brightness(1.1); }
		}
		.msgFlash { animation: msgFlash 1.8s ease-in-out; }
	`;
	document.head.appendChild(st);
})();

function flashMessage(el) {
	el.classList.remove("msgFlash");
	void el.offsetWidth; // restart the animation if it is already running
	el.classList.add("msgFlash");
	setTimeout(() => el.classList.remove("msgFlash"), 1900);
}

// Scrolls to a message, loading older chunks first if it is not on screen yet.
// Used by the pinned bar and by reply banners. Returns true if the message was shown.
async function focusMessage(targetId) {
	const cont = GE("messages");
	const find = () => cont.querySelector(`[data-message-id="${targetId}"]`);
	
	let target = find();
	let loadedMore = false;
	
	if (!target) {
		if (!currentRoom) return false;
		const roomAtStart = currentRoom;
		
		// the target's timestamp tells us how far back we need to load
		const ts = await fetch(currentRoom + "/messages/" + targetId + "/tstamp");
		if (roomAtStart !== currentRoom) return false;
		
		if (ts === null) {
			dialog("That message no longer exists.", true);
			return false;
		}
		
		cont.style.cursor = "progress";
		document.body.style.cursor = "progress";
		
		try {
			let stalls = 0;
			
			while (
				!target &&
				hasMoreMessages &&
				oldestMessageTime !== null &&
				oldestMessageTime > ts
			) {
				if (roomAtStart !== currentRoom) return false;
				
				// a scroll-triggered load may already be running
				while (loadingOlderMessages) await delay(50);
				
				const before = oldestMessageTime;
				await loadOlderMessages();
				loadedMore = true;
				
				target = find();
				
				if (oldestMessageTime === before) {
					stalls++;
					if (stalls >= 3) break;
				} else {
					stalls = 0;
				}
			}
		} finally {
			cont.style.cursor = "";
			document.body.style.cursor = "";
		}
		
		target = find();
	}
	
	if (!target) {
		dialog("Could not find that message (it may have been deleted).", true);
		return false;
	}
	
	// instant jump after loading (smooth scroll fights with the layout shifts), smooth otherwise
	target.scrollIntoView({
		behavior: loadedMore ? "auto" : "smooth",
		block: "center"
	});
	flashMessage(target);
	return true;
}

function updateSenderNameVisibility(div) {
	const nameEl = div.querySelector(".sender-name");
	if (!nameEl) return;

	const prev = div.previousElementSibling;
	const shouldShow = !prev || prev.dataset.senderName !== div.dataset.senderName;

	nameEl.style.display = shouldShow ? "block" : "none";
	div.style.marginTop = shouldShow ? "5px" : "1px";
}

window.scrollToBottomF = function() {
	const cont = GE("messages");
	if (!cont) return;
	
	requestAnimationFrame(() => {
		cont.scrollTo({
			top: cont.scrollHeight,
			behavior: "smooth"
		});
	});
}

async function updateTyping() {
	if (!currentUser || !currentRoomData) return;
	let t = await fetch(REF.rooms + "/" + currentRoomData.uid + "/typing");
	if (!t) return;
	
	if (Date.now() - t.at < 500) {
		if (t.by != currentUser.uid) {
			CACHE.typingIndicator = true;
			return;
		}
	}
	
	CACHE.typingIndicator = false;
	await delay(100);
}

setInterval(updateTyping, 500);

const URL_REGEX = /\b((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

function linkify(container, text) {
	container.textContent = "";
	let lastIndex = 0;
	
	for (const match of text.matchAll(URL_REGEX)) {
		let raw = match[0];
		const start = match.index;
		
		// Trim trailing punctuation that is probably part of the sentence
		let trailing = "";
		while (/[.,!?;:)\]}'"]$/.test(raw)) {
			// Keep a closing ")" if the URL has a matching "("
			if (raw.endsWith(")") && (raw.match(/\(/g) || []).length >= (raw.match(/\)/g) || []).length) break;
			trailing = raw.slice(-1) + trailing;
			raw = raw.slice(0, -1);
		}
		
		// Text before the link
		if (start > lastIndex) {
			container.appendChild(document.createTextNode(text.slice(lastIndex, start)));
		}
		
		const href = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
		
		// Only allow http(s) links
		let safe = true;
		try {
			const u = new URL(href);
			safe = u.protocol === "http:" || u.protocol === "https:";
		} catch {
			safe = false;
		}
		
		// temporarily allow all links
		safe = true;
		
		if (safe) {
			const a = CE("a");
			a.href = href;
			a.textContent = raw;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			a.style.color = "#4da3ff";
			a.style.textDecoration = "underline";
			a.style.wordBreak = "break-all";
			
			// Don't trigger the message menu / reply handlers when tapping a link
			a.onclick = (e) => e.stopPropagation();
			
			container.appendChild(a);
		} else {
			container.appendChild(document.createTextNode(raw));
		}
		
		// Punctuation after the link goes back as plain text
		if (trailing) {
			container.appendChild(document.createTextNode(trailing));
		}
		
		lastIndex = start + match[0].length;
	}
	
	// Remaining text after the last link
	if (lastIndex < text.length) {
		container.appendChild(document.createTextNode(text.slice(lastIndex)));
	}
}

let renderMessage = null;

// messageId -> timeout handle, for scheduled messages waiting to be revealed
const scheduledTimers = new Map();

function clearScheduledTimers() {
	for (const handle of scheduledTimers.values()) {
		clearTimeout(handle);
	}
	scheduledTimers.clear();
}

async function startMessageListener(messageRef, inspecting=false) {
	clearScheduledTimers();
	
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
	
	// start before the first render so CACHE.reactions fills in as messages draw
	startReactionListener();
	
	const renderingInProgress = new Set();
	
	async function markSeen(msgId) {
		const seenRef = ref(db, currentRoom + "/messages/" + msgId + "/seenBy");
		
		try {
			await runTransaction(seenRef, (current) => {
				const arr = Array.isArray(current) ? current : [];
				if (!arr.includes(currentUser.uid)) arr.push(currentUser.uid);
				return arr;
			});
		} catch (err) {
			console.error("Markseen Failed: ", err);
		}
	}
	
	oldestMessageTime = null;
	newestMessageTime = null;
	loadingOlderMessages = false;
	hasMoreMessages = true;
	
	renderMessage = async function(messageId, message, prepend=false) {
		if (!message) return;
		if (message.deleted && !CACHE.hacker) return;
		if (cont.querySelector(`[data-message-id="${messageId}"]`)) return;
		
		if (message.time && message.time * 1000 > Date.now()) {
			if (!scheduledTimers.has(messageId)) {
				const roomAtSchedule = currentRoom;
				const wait = Math.min(message.time * 1000 - Date.now(), 2147483647);
				
				scheduledTimers.set(messageId, setTimeout(async function() {
					scheduledTimers.delete(messageId);
					if (roomAtSchedule !== currentRoom || !currentUser) return;
					
					const fresh = await fetch(roomAtSchedule + "/messages/" + messageId);
					if (!fresh || roomAtSchedule !== currentRoom) return;
					
					const wasAtBottom = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 150;
					await renderMessage(messageId, fresh);
					
					if (wasAtBottom) { cont.scrollTop = cont.scrollHeight; }
				}, wait + 50));
			}
			return;
		}
		
		if (renderingInProgress.has(messageId)) return;
		renderingInProgress.add(messageId);
		
		const div = CE("div");
		
		let lastUser = null;
		
		if (cont.children.length > 0) {
			const referenceElement = prepend
				? cont.children[0]
				: cont.children[cont.children.length - 1];
			
			lastUser = referenceElement.dataset.senderName || null;
		}
		
		const isSameUser = message.senderName == lastUser;
		
		if (message.type === "stamp" || message.type === "system") {
			div.className = "stampMessage";
			div.dataset.messageId = messageId;
			div.dataset.senderName = "";
			
			// Non-manipulable, not right-clickable
			div.addEventListener("contextmenu", function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
			
			const stampIcon = CE("span");
			stampIcon.textContent = "🔔 ";
			stampIcon.style.marginRight = "4px";
			
			const stampText = CE("span");
			stampText.textContent = message.data || "Notification";
			
			const stampTime = CE("span");
			stampTime.className = "stampTime";
			if (message.time) {
				stampTime.textContent = formatDate(message.time * 1000);
			} else if (message.tstamp) {
				stampTime.textContent = formatDate(message.tstamp);
			}
			
			div.appendChild(stampIcon);
			div.appendChild(stampText);
			if (stampTime.textContent) {
				div.appendChild(stampTime);
			}
			
			if (prepend) {
				cont.prepend(div);
			} else {
				cont.appendChild(div);
			}
			return;
		}

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
				markSeen(messageId);
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
		name.style.marginBottom = "10px";
		
		div.dataset.messageId = messageId;
		div.dataset.pinned = message.pinned ? "1" : "0";
		div.dataset.senderName = message.senderName || "";
		
		const time = CE("span");
		time.className = "message-time";
		
		let formatted;
		
		if (message.time) {
			formatted = formatDate(message.time * 1000);
		} else if (message.tstamp) {
			formatted = formatDate(message.tstamp);
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
		
		time.textContent = ((message.deleted) ? "❌ " : "") + formatted;
		
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
			replyBox.className = "replyPreview";
			
			const replyLabel = CE("b");
			replyLabel.textContent = "↩ ";
			
			const replyText = CE("span");
			replyText.textContent = message.replyingTo[1];
			
			replyBox.appendChild(replyLabel);
			replyBox.appendChild(replyText);
			
			replyBox.onclick = function(event) {
				event.stopPropagation();
				focusMessage(message.replyingTo[0]);
			};
			
			div.appendChild(replyBox);
		}
		
		let dat;
		
		if (message.type == "text") {
			dat = CE("span");
			
			const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})+$/u;
			const emojiSize = "75px";
			dat.textContent = message.data;
			
			if (emojiRegex.test(message.data) && [...message.data].length <= 5) {
				dat.className = "emoji";
				dat.style.fontFamily = "Noto Color Emoji";
				dat.style.fontSize = emojiSize;
				
				//console.log("Loaded Emoji.");
			} else {
				linkify(dat, message.data);
				div.style.overflowWrap = "anywhere";
			}
			
		} else if (message.type == "image") {
			dat = CE("div");
			dat.className = "image-container";
			
			const loadingText = CE("span");
			loadingText.textContent = "📷 Image Loading...";
			dat.appendChild(loadingText);
			
			const imageId = message.meta[0];
			let tUrl;
			
			loadCachedFile(imageId, message.data)
				.then(url => {
					loadingText.remove();
					
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
						bs.maxHeight = "95vh";
						bs.objectFit = "contain";
						bs.borderRadius = "8px";
						
						overlay.appendChild(bigImg);
						document.body.appendChild(overlay);
						
						overlay.onclick = () => overlay.remove();
					};
					
					imgCont.style.maxWidth = "380px";
					imgCont.style.maxHeight = "550px";
					imgCont.style.width = "auto";
					imgCont.style.height = "auto";
					imgCont.style.display = "block";
					imgCont.style.borderRadius = "8px";
					imgCont.style.objectFit = "contain";
					
					imgCont.onload = () => {
						console.log("Image Loaded:", imgCont.naturalWidth, imgCont.naturalHeight);
					};
					
					imgCont.onerror = function() {
						console.log("Image Failed:", imgCont.src);
					};
					
					dat.appendChild(imgCont);
				})
				.catch(err => {
					console.error("Image Failed:", imageId, err);
					loadingText.textContent = "📷 Image Failed";
				});
		} else if (message.type == "video") {
			dat = CE("div");
			dat.textContent = "📽 Video Loading...";
			
			const videoId = message.meta[0];
			
			let tUrl;
			
			loadCachedFile(videoId, message.data)
				.then(url => {
					dat.textContent = "";
					
					const vidCont = CE("video");
					
					vidCont.src = url;
					tUrl = url;
					vidCont.style.cursor = "pointer";
					//vidCont.controls = true;
					
					vidCont.onclick = function(event) {
						event.stopPropagation();
						
						if (!vidCont.paused) vidCont.pause();
						
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
						
						const bigVid = CE("video");
						bigVid.src = tUrl;
						
						let bs = bigVid.style;
						
						bs.maxWidth = "95vw";
						bs.maxHeight = "95vh";
						bs.objectFit = "contain";
						bs.borderRadius = "8px";
						
						bigVid.controls = true;
						bigVid.autoplay = true;
						
						bigVid.onclick = (e) => {
							e.stopPropagation();
						};
						
						overlay.appendChild(bigVid);
						
						document.body.appendChild(overlay);
						
						overlay.onclick = () => {
							bigVid.pause();
							overlay.remove();
						};
					};
					
					vidCont.style.maxWidth = "380px";
					vidCont.style.maxHeight = "550px";
					vidCont.style.width = "auto";
					vidCont.style.height = "auto";
					
					vidCont.style.display = "block";
					vidCont.style.borderRadius = "8px";
					vidCont.style.objectFit = "contain";
					
					vidCont.onloadedmetadata = () => {
						// requestAnimationFrame(() => {
							// cont.scrollTop = cont.scrollHeight;
						// });
						
						console.log(
							"Video Loaded:",
							vidCont.naturalWidth,
							vidCont.naturalHeight
						);
					};
					
					vidCont.onerror = function() {
						console.log(
							"Video Failed:",
							vidCont.src
						);
					};
					dat.replaceWith(vidCont);
				})
				.catch(err => {
					console.error(
						"Video Failed:",
						videoId,
						err
					);
					dat.textContent = "📽 Video Failed";
				});
		} else if (message.type == "audio") {
			dat = CE("div");
			dat.textContent = "🎶 Audio Loading...";
			
			const audioId = message.meta[0];
			
			let tUrl;
			
			loadCachedFile(audioId, message.data)
				.then(url => {
					dat.textContent = "";
					
					const audioCont = CE("audio");
					
					audioCont.src = url;
					tUrl = url;
					
					audioCont.controls = true;
					
					audioCont.onloadedmetadata = () => {
						// requestAnimationFrame(() => {
							// cont.scrollTop = cont.scrollHeight;
						// });
					};
					
					audioCont.onerror = function() {
						console.log(
							"Audio Failed:",
							audioCont.src
						);
					};
					dat.replaceWith(audioCont);
				})
				.catch(err => {
					console.error(
						"Audio Failed:",
						audioId,
						err
					);
					dat.textContent = "🎶 Audio Failed";
				});
		} else {
			dat = CE("div");
			dat.textContent = "📁 File Loading...";
			
			const fileId = message.meta[0];
			const fileName = message.meta[1] || "File";
			
			let tUrl;
			
			loadCachedFile(fileId, message.data)
				.then(url => {
					dat.textContent = "";
					
					const fileCont = CE("div");
					fileCont.style.display = "flex";
					fileCont.style.alignItems = "center";
					fileCont.style.gap = "8px";
					
					const label = CE("span");
					label.textContent = "📁 " + fileName;
					label.style.overflow = "hidden";
					label.style.textOverflow = "ellipsis";
					label.style.whiteSpace = "nowrap";
					label.style.maxWidth = "220px";
					
					fileCont.src = url;
					tUrl = url;
					
					const saveBut = CE("a");
					
					saveBut.textContent = "Save";
					saveBut.className = "B";
					
					saveBut.href = url;
					saveBut.download = fileName;
					
					saveBut.style.flexShrink = "0";
					saveBut.style.textDecoration = "none";
					
					fileCont.appendChild(label);
					fileCont.appendChild(saveBut);
					
					dat.replaceWith(fileCont);
					
					// requestAnimationFrame(() => {
						// cont.scrollTop = cont.scrollHeight;
					// });
				})
				.catch(err => {
					console.error(
						"File Failed:",
						fileId,
						err
					);
					dat.textContent = "📁 File Failed";
				});
		}
		
		div.dataset.messageId = messageId;
		div.dataset.senderName = message.senderName || "";
		
		if (!inspecting) {
			setupMessageMenu(
				div,
				messageId,
				message
			);
		}
		
		div.appendChild(name);
		
		
		div.appendChild(dat);
		div.appendChild(time);
		
		renderReactions(div, messageId);
		
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
		
		// Scheduled messages carry a future tstamp until they are revealed. Leave them out of
		// the pagination bounds, otherwise the "new messages" listener would start in the
		// future and miss everything sent before then.
		const nowMs = Date.now();
		const visible = messages.filter(m => m[1].tstamp <= nowMs);

		if (visible.length > 0) {
			oldestMessageTime = visible[0][1].tstamp;
			newestMessageTime = visible[visible.length - 1][1].tstamp;
		}
		
		for (const [messageId, message] of messages) {
			await renderMessage(
				messageId,
				message
			);
		}
	}
	
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
				const nowPinned = message.pinned ? "1" : "0";
				if (oldDiv.dataset.pinned !== nowPinned) {
					oldDiv.dataset.pinned = nowPinned;
					refreshPinned();
				}
				
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

		clearScheduledTimers();
		stopReactionListenerNow();
	};

	cont.scrollTop = cont.scrollHeight;
}

// delay is hoisted at the top of the file

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
			} else if (notif.type == 3) {
				const notifMsg = notif.text || `${notif.senderName} wants to initiate a video/audio connection with you in ${notif.roomName}`;
				await notify("Neet-Hub", notifMsg);
				if (typeof showInAppToast === "function") {
					showInAppToast(notifMsg);
				}
			}
			
			await remove(snapshot.ref);
		}
	);
}

async function checkNotifications() {
	if (!currentUser || !notificationsEnabled) { return; }
	
	try {
		const rawNotifs = await fetch(REF.users + "/" + currentUser.uid + "/notifications");
		if (!rawNotifs) return;
		
		const notifU = Object.entries(rawNotifs);
		for (const [notifId, notif] of notifU) {
			if (!notif || notifiedCache.includes(notifId)) continue;
			
			if (currentRoomData && notif.room === currentRoom) {
				await remove(ref(db, REF.users + "/" + currentUser.uid + "/notifications/" + notifId));
				continue;
			}
			
			const rName = notif.roomName || "Room";
			const sName = notif.senderName || "Someone";
			
			if (notif.type == 1) {
				await notify("Neet-Hub", `Message from ${rName} by ${sName}.`);
				notifiedCache.push(notifId);
			} else if (notif.type == 2 || notif.type == 3) {
				await notify("Neet-Hub", notif.text || `Incoming connection from ${rName} by ${sName}.`);
				notifiedCache.push(notifId);
			}
			
			await remove(ref(db, REF.users + "/" + currentUser.uid + "/notifications/" + notifId));
		}
	} catch (err) {
		console.warn("checkNotifications error:", err);
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

setInterval(updateLastSeen, 500);
// setInterval(checkNotifications, 500);

async function notify(head, notif) {
	if (!("Notification" in window)) {
		return;
	}
	if (Notification.permission !== "granted") {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			return;
		}
	}
	try {
		new Notification(head, {
			body: notif
		});
	} catch (e) {
		console.warn("Notification error:", e);
	}
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
			console.log("Notif Not gratnted.");
			return;
		}
	}
	
	notificationsEnabled = true;
	GE("notificationToggle").textContent = "Notifications: Enabled";
	console.log("notif succ.");
}

function updateRecordingUI() {
	let el = GE("recordingIndicator");
	
	if (!el) {
		el = CE("div");
		el.id = "recordingIndicator";
		el.style.display = "none";
		el.style.padding = "4px 8px";
		el.style.margin = "4px 0";
		el.style.fontSize = "12px";
		el.style.borderRadius = "4px";
		el.style.background = "#000000";
		
		const label = CE("span");
		label.id = "recordingIndicatorLabel";
		el.appendChild(label);
		
		const discardBtn = CE("button");
		discardBtn.id = "recordingDiscardButton";
		discardBtn.textContent = "Discard";
		discardBtn.className = "B";
		discardBtn.style.marginLeft = "8px";
		discardBtn.onclick = function(event) {
			event.stopPropagation();
			CACHE.recorded = null;
			updateRecordingUI();
			CACHE.audioChunks = [];
		};
		el.appendChild(discardBtn);
		
		const input = GE("messageInput");
		input.parentNode.insertBefore(el, input);
	}
	
	const label = GE("recordingIndicatorLabel");
	const discardBtn = GE("recordingDiscardButton");
	
	if (CACHE.recording) {
		el.style.display = "block";
		label.textContent = "🔴 Recording...";
		discardBtn.style.display = "none";
	} else if (CACHE.recorded) {
		el.style.display = "block";
		label.textContent = "🎙️ Voice note ready — press send";
		discardBtn.style.display = "inline-block";
	} else {
		el.style.display = "none";
	}
}

async function recordingAction(action) {
	if (action == "start") {
		if (CACHE.recording) return;
		
		try {
			const stream = await navigator.mediaDevices.getUserMedia({audio:true});
			CACHE.audioChunks = [];
			
			CACHE.mediaRecorder = new MediaRecorder(stream);
			CACHE.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					CACHE.audioChunks.push(event.data);
				}
			}
			
			CACHE.mediaRecorder.start();
			CACHE.recording = true;
			console.log("Recording Started.");
		} catch (err) {
			console.error("Recording Error: ", err);
			CACHE.recording = false;
		}
		
	} else if (action == "stop") {
		if (!CACHE.mediaRecorder) return;
		if (!CACHE.recording) return;
		
		return new Promise((resolve) => {
			CACHE.mediaRecorder.onstop = () => {
				const audioBlob = new Blob(CACHE.audioChunks, {
					type: CACHE.mediaRecorder.mimeType
				});
				
				CACHE.recorded = audioBlob;
				CACHE.mediaRecorder.stream.getTracks().forEach(t => t.stop());
				
				console.log("Recording Stopped.");
				resolve(audioBlob);
			}
			CACHE.recording = false;
			CACHE.mediaRecorder.stop();
		});
		
	} else if (action == "get") {
		return CACHE.recorded;
	}
}

window.recordingTrigger = async function() {
	if (CACHE.recording) {
		await recordingAction("stop");
	} else {
		if (Array.from(GE("messageFile").files).length > 0) {
			let tt = await askYesNo("A file is currently selected. Discard the file and start recording?");
			console.log(tt);
			if (tt != true) {
				return;
			} else {
				GE("messageFile").value = "";
				updateSelectedFilesUI();
			}
		}
		
		if (CACHE.audioChunks?.length > 0) {
			let tt= await askYesNo("A recording is already selected. Discard and start new?");
			console.log(tt);
			if (!tt) {
				return;
			}
		}
		await recordingAction("start");
	}
	updateRecordingUI();
	
	return;
};

function updateSelectedFilesUI() {
	let el = GE("fileIndicator");
	const fileInput = GE("messageFile");
	
	if (CACHE.audioChunks?.length > 0) {
		CACHE.recorded = null;
		updateRecordingUI();
		CACHE.audioChunks = [];
	}
	
	if (!el) {
		el = CE("div");
		el.id = "fileIndicator";
		el.style.display = "none";
		el.style.padding = "4px 8px";
		el.style.margin = "4px 0";
		el.style.fontSize = "12px";
		el.style.borderRadius = "4px";
		el.style.background = "#2a2a2a";
		el.style.color = "#ffffff";
		
		const label = CE("span");
		label.id = "fileIndicatorLabel";
		el.appendChild(label);
		
		const clearBtn = CE("button");
		clearBtn.id = "fileClearButton";
		clearBtn.textContent = "❌ Clear";
		clearBtn.className = "B";
		clearBtn.style.marginLeft = "8px";
		clearBtn.onclick = function(event) {
			event.stopPropagation();
			fileInput.value = "";
			updateSelectedFilesUI();
		};
		el.appendChild(clearBtn);
		
		const input = GE("messageInput");
		input.parentNode.insertBefore(el, input);
	}
	
	const label = GE("fileIndicatorLabel");
	const files = Array.from(fileInput.files || []);
	
	if (files.length > 0) {
		el.style.display = "block";
		const fileNames = files.map(f => f.name).join(", ");
		const preview = fileNames.length > 35 ? fileNames.slice(0, 32) + "..." : fileNames;
		label.textContent = `📎 ${files.length} file(s) selected: ${preview}`;
	} else {
		el.style.display = "none";
	}
}

const mFileEl = GE("messageFile"); if (mFileEl) mFileEl.addEventListener("change", updateSelectedFilesUI);

// UPLOADER hoisted to top

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

async function openRoom(roomHash, inspecting=false) {
	showLoadingScreen();
	
	if (typeof closeRoomMedia === "function") {
		await closeRoomMedia();
	}
	
	CACHE.inspecting = inspecting;

	hideE("roomsPage");
	let list = ["messageInput", "messageSend", "messageCall", "camQuickBtn", "micQuickBtn", "camToggleBtn", "micToggleBtn", "recButLabel", "fileButLabel", "messageFile", "recBut"];
	if (inspecting) {
		hideE("adminPage");
		hideE("allRoomsPage");
		
		for (const el of list) {
			const elem = GE(el);
			if (elem) elem.disabled = true;
		}
		GE("messageInput").value = "Blocked";
	} else {
		for (const el of list) {
			const elem = GE(el);
			if (elem) elem.disabled = false;
		}
		GE("messageInput").value = "";
	}
	
	showE("chatPage");
	
	if (stopMessageListener) {
		stopMessageListener();
		stopMessageListener = null;
	}
	
	currentRoom = roomHash;
	currentRoomData = null;
	
	if (GE("pinnedUI")) { GE("pinnedUI").style.display = "none"; }
	
	CACHE.replying = null;
	updateReplyUI();
	
	initMediaDB();
	
	if (roomHash === REF.globalChat) {
		if (GE("callButton")) GE("callButton").disabled = true;
		if (GE("chatBackButton")) GE("chatBackButton").style.display = "none";
		if (GE("roomMediaBar")) GE("roomMediaBar").style.display = "none";
		if (GE("camQuickBtn")) GE("camQuickBtn").disabled = true;
		if (GE("micQuickBtn")) GE("micQuickBtn").disabled = true;
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
			if (GE("callButton")) GE("callButton").disabled = false;
			if (GE("chatBackButton")) GE("chatBackButton").style.display = "inline-block";
			if (GE("roomMediaBar")) GE("roomMediaBar").style.display = "block";
			if (GE("camQuickBtn")) GE("camQuickBtn").disabled = false;
			if (GE("micQuickBtn")) GE("micQuickBtn").disabled = false;
			
			if (!inspecting && typeof initRoomMediaListeners === "function") {
				await initRoomMediaListeners();
			}
		} else {
			if (GE("callButton")) GE("callButton").disabled = true;
			if (GE("chatBackButton")) GE("chatBackButton").style.display = "none";
			if (GE("roomMediaBar")) GE("roomMediaBar").style.display = "none";
			if (GE("camQuickBtn")) GE("camQuickBtn").disabled = true;
			if (GE("micQuickBtn")) GE("micQuickBtn").disabled = true;
		}
	}
	
	blockLoad = false;
	await startMessageListener(ref(db, roomHash + "/messages"), inspecting);
	refreshPinned();
	
	await doneLoading();
	console.log("Loaded Room.");
}

const mInputEl = GE("messageInput"); if (mInputEl) mInputEl.addEventListener("input", async (event) => {
	if (GE("messageInput").value == "") return;
	if (!currentRoomData) return;
	if (!currentUser) return;
	
	await update(REF.rooms + "/" + currentRoomData.uid + "/typing/by", currentUser.uid);
	await update(REF.rooms + "/" + currentRoomData.uid + "/typing/at", Date.now());
});

window.showRooms = async function() {
	if (typeof closeRoomMedia === "function") {
		await closeRoomMedia();
	}
	hideE("chatPage");
	hideE("profilePage");
	showE("roomsPage");
	
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
				last.textContent = "\nNo Messages.";
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
		but2.onclick = async function() {
			let t = emergencyEnabled;
			emergencyEnabled = false;
			
			// let ttt = await ask("Delete this Room? (Can't Be Undone) (Type YES)", "input")[0].toLowerCase();
			// fails because [] and . have higher precedence than await
			
			// either use this or use inline parenthesis as used below
			//let tttt = await ask("Delete this Room? (Can't Be Undone) (Type YES)", "input");
			//let ttt = tttt[0]?.trim().toLowerCase();
			
			let tttRes = await ask("Delete this Room? (Can't Be Undone) (Type YES)", "input");
			if (!tttRes || !tttRes[0]) { emergencyEnabled = t; return; }
			let ttt = tttRes[0].trim().toLowerCase();
			
			let ch = (ttt == "yes");
			
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

window.showProfile = async function() {
	hideE("chatPage");
	hideE("roomsPage");
	showE("profilePage");
	
	let profileData = GE("profileFunctional");
	profileData.innerHTML = "";
	
	let head = CE("span");
	head.textContent = `Username:    ${currentUsername}`;
	
	profileData.appendChild(head);
}

window.profile = async function(hash) {
	if (hash == 1) {
		return;
	}
}

window.logout = async function() {
	if (typeof closeRoomMedia === "function") {
		await closeRoomMedia();
	}
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
	
	GE("messageFile").value = "";
	updateSelectedFilesUI();
	
	GE("messages").innerHTML = "";
	
	GE("username").value = "";
	GE("password").value = "";
	
	showE("loginPage");
	
	hideDiv("adminPage");
	
	showE("loginPage");
	
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
    hideE("chatPage");
    hideE("allRoomsPage");
    hideE("logPage");
    hideE("accountManager");
    hideE("lastSeensPage");
    hideE("historyManager");
	
    hideDiv("adminPage");
	
    showE("adminPage");
    showE("adminPanel");
    showDiv("adminPanel");
	
    if (GE("loggedInText")) GE("loggedInText").textContent = "Logged in as: ";
    if (GE("logoutButton")) {
        GE("logoutButton").textContent = "Logout";
        GE("logoutButton").onclick = window.logout;
    }
};

window.backToGlobal = async function() {
	if (typeof closeRoomMedia === "function") {
		await closeRoomMedia();
	}
	hideE("roomsPage");
	showE("chatPage");
	
	if(GE("cRoom")) { GE("cRoom").remove(); }
	
	openRoom(REF.globalChat)
}


window.showLog = async function(user=false) {
	let logBase = null;
	const cont = GE("logDiv");
	cont.innerHTML = "Loading logs...";
	if (!user) {
		logBase = REF.log;
		showLoadingScreen();
	} else if (user === true) {			
		const users = await fetch(REF.users);
		let res = await ask("Enter UserName:", "input");
		if (!res || !res[0]) { await dialog("User Not Found.", true); backToAdmin(); return; }
		let memberName = res[0].trim().toLowerCase();
		
		memberName = memberName.trim().toLowerCase();
		
		let found = false;
		if (!users) { await dialog("User Not Found.", true); backToAdmin(); return; }
		
		for (const [uid, user] of Object.entries(users)) {
			if (user.username == memberName) {
				found = true;
				logBase = REF.users + "/" + uid + "/" + "logs";
				break;
			}
		}
		
		if (!found) { await dialog("User Not Found.", true); backToAdmin(); return; }
		showLoadingScreen();
	} else {
		logBase = user;
	}
	
	currentOpenLog = logBase;
	
	hideE("adminPanel");
	showE("logPage");
	
	try {
		const data = await fetch(logBase);
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
		
		//logs.sort((a, b) => b[0].localeCompare(a[0]));
		
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
		Log("Opened Log", (logBase == REF.log) ? false : true);
	} catch (err) {
		console.error("Could not load logs:", err);
		cont.textContent = "Error loading logs: " + err.message;
	} finally {
		await doneLoading();
	}
};

window.manageAccounts = async function() {
	showLoadingScreen();
	hideE("adminPanel");
	showE("accountManager");
	
	const cont = GE("accounts");
	cont.innerHTML = "";
	
	const data = await fetch(REF.users);
	
	if (!data) {
		cont.textContent = "No accounts found.";
		await doneLoading();
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
	
	await doneLoading();
	Log("Account Manager Opened.", false);
};


window.showAllRooms = async function() {
	showLoadingScreen();
	hideE("adminPanel");
	showE("allRoomsPage");
	
	const cont = GE("allRooms");
	cont.innerHTML = "";
	
	const data = await fetch(REF.roomsB);
	
	if (!data) {
		cont.textContent = "No Rooms Created.";
		await doneLoading();
		return;
	}
	
	const rooms = Object.entries(data);
	
	for (const [uid, room] of rooms) {
        const div = CE("div");
        div.className = "room";
        
        let name = CE("span");
        name.textContent = room.name || "Unnamed Room";
        
        const users = CE("p");
        const list = Array.isArray(room.usernames) ? room.usernames : (room.users || []);
        users.textContent = "Users: " + (list.join(", ") || "None");
        
        const but = CE("button");
        but.textContent = "Inspect Room";
        but.onclick = (event) => {
            event.stopPropagation();
			GE("logoutButton").textContent = "Back";
			GE("logoutButton").onclick = window.backToAdmin;
			GE("loggedInText").textContent = "";
			
            openRoom(REF.rooms + "/" + uid, true);
        };
        
		if (room.deleted) {
			name.textContent += " <Deleted>";
		}
		
		div.appendChild(name); div.appendChild(CE("br"));
		div.appendChild(users); div.appendChild(CE("br"));
		div.appendChild(but);
        
        cont.appendChild(div);
        cont.appendChild(CE("hr"));
    }
    
    await doneLoading();
};

window.showLastSeens = async function() {
	showLoadingScreen();
	hideE("adminPanel");
	showE("lastSeensPage");
	
	const cont = GE("lastSeens");
	cont.innerHTML = "";
	
	const data = await fetch(REF.users);
	
	if (!data) {
		cont.textContent = "No accounts found.";
		await doneLoading();
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
	
	await doneLoading();
	Log("Account Manager Opened.", false);
};

window.managehistory = async function() {
	showLoadingScreen();
	hideE("adminPanel");
	showE("historyManager");
	
	const cont = GE("history");
	cont.innerHTML = "";
	
	const data = await fetch(REF.globalChat + "/messages");
	
	if (!data) {
		cont.textContent = "No history Yet.";
		await doneLoading();
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
		
		if (msgData.type == "audio") {
			dat = CE("audio");
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
	
	await doneLoading();
	Log("History Manager Opened.", false);
};

async function deleteAccount(acc) {
	try {
		await remove(ref(db, REF.users + "/" + acc));
		Log(`Deleted Account: ${acc}`, false);
	} catch (err) {
		console.error("Delete Account Error:", err);
	}
	manageAccounts();
}

async function deleteRoom(roomHash) {
	//await remove(ref(db, roomHash));
	await update(REF.rooms + "/" + roomHash + "/deleted", true);
	await update(REF.roomsB + "/" + roomHash + "/deleted", true);
	
	Log(`Room Deleted: ${roomHash}`, false);
	showRooms();
}

async function deleteMessageGlobal(msgID) {
	await remove(ref(db, REF.globalChat + "/messages/" + msgID));
	
	Log(`Deleted Message: ${msgID}`, false);
	managehistory();
}

function previewForMessage(message) {
	if (message.type == "stamp" || message.type == "system") { return "🔔 " + (message.data || "Notification"); }
	if (message.type == "text") { return message.data; }
	if (message.type == "image") { return "📷 Image"; }
	if (message.type == "video") { return "🎥 Video"; }
	if (message.type == "audio") { return "🎶 Audio"; }
	if (message.type == "file") { return "📁 " + (message.meta?.[1] || "File"); }
	return message.data;
}


async function refreshLastMessageMeta(roomUid, roomHash) {
	const messages = await fetch(roomHash + "/messages");
	
	let lastMeta = {
		senderName: null,
		data: null,
		tstamp: null
	};
	
	if (messages) {
		// skip still-hidden scheduled messages so their text can't leak into the room preview
		const remaining = Object.values(messages).filter(m => !m.deleted && m.tstamp <= Date.now());
		
		if (remaining.length > 0) {
			remaining.sort((a, b) => a.tstamp - b.tstamp);
			const last = remaining[remaining.length - 1];
			
			lastMeta = {
				senderName: last.senderName,
				data: previewForMessage(last),
				tstamp: last.tstamp
			};
		}
	}
	
	await set(
		ref(db, REF.roomsB + "/" + roomUid + "/lastMessageMeta"),
		lastMeta
	);
}

async function deleteMessage(msgID) {
	if (currentRoomData) {
		const msg = await fetch(REF.rooms + "/" + currentRoomData.uid + "/messages/" + msgID);
		if (msg && (msg.type === "stamp" || msg.type === "system" || msg.permanent)) {
			dialog("System stamp messages cannot be deleted.", true);
			return;
		}
		await update(REF.rooms + "/" + currentRoomData.uid + "/messages/" + msgID + "/deleted", true);
		await refreshLastMessageMeta(currentRoomData.uid, currentRoom);
	} else {
		if (!CACHE.hacker) {
			dialog("Not Allowed In Global Chat.", true);
		} else {
			await update(REF.globalChat + "/messages/" + msgID + "/deleted", true);
		}
	}
}

async function togglePinMessage(msgID) {
	if (!currentRoom) return;
	
	if (!currentRoomData && !CACHE.hacker) {
		dialog("Not Allowed In Global Chat.", true);
		return;
	}
	
	// currentRoom is the path of the open chat (global or private room)
	const p = currentRoom + "/messages/" + msgID + "/pinned";
	const t = await fetch(p);
	
	await update(p, t ? false : true);
	await refreshPinned();
}

async function refreshPinned() {
	const tt = GE("pinnedUI");
	if (!tt || !currentRoom) return;
	
	const roomAtStart = currentRoom;
	
	let data = [];
	
	try {
		const snap = await get(query(
			ref(db, currentRoom + "/messages"),
			orderByChild("pinned"),
			equalTo(true)
		));
		
		const list = [];
		if (snap.exists()) {
			snap.forEach(function(child) {
				const m = child.val();
				if (m && !m.deleted) list.push([child.key, m.tstamp || 0]);
			});
		}
		list.sort((a, b) => a[1] - b[1]);
		data = list.map(x => x[0]);
	} catch (err) {
		// No ".indexOn": "pinned" rule yet -> fall back to the messages already on screen
		console.warn("refreshPinned: add .indexOn pinned to your rules. Using loaded messages only.", err);
		data = Array.from(GE("messages").querySelectorAll('[data-pinned="1"]'))
			.map(d => d.dataset.messageId);
	}
	
	// user switched chat while we were fetching
	if (roomAtStart !== currentRoom) return;
	
	CACHE.pinnedHash = 0;
	
	if (data.length === 0) {
		tt.style.display = "none";
		tt.textContent = "";
		tt.onclick = null;
		return;
	}
	
	tt.style.display = "block";
	tt.style.cursor = "pointer";
	tt.textContent = `📌 ${data.length} Message${data.length > 1 ? "s" : ""} Pinned`;
	
	tt.onclick = function(event) {
		event.stopPropagation();
		
		// jump to newest pinned first, then step backwards
		const idx = data.length - 1 - (CACHE.pinnedHash % data.length);
		focusMessage(data[idx]);
		
		CACHE.pinnedHash = (CACHE.pinnedHash + 1) % data.length;
	};
}

// ---------------------------------------------------------------
// Reactions
//
// Storage:  <currentRoom>/reactions/<messageId> = [[emoji, uid, username], ...]
// Allowed emoji list: REF.reactions (/reactions). Falls back to DEFAULT_REACTIONS.
//
// One listener per open room keeps CACHE.reactions up to date and re-renders
// only the messages that changed. Messages that render later (older chunks,
// new arrivals) read from the cache in renderMessage().
// ---------------------------------------------------------------

const DEFAULT_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

CACHE.reactions = {};
CACHE.rxnList = null;

(function() {
	if (document.getElementById("rxnStyle")) return;
	const st = document.createElement("style");
	st.id = "rxnStyle";
	st.textContent = `
		.reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
		.rxnCard {
			display: inline-flex; align-items: center; gap: 3px;
			padding: 1px 7px; border-radius: 12px; font-size: 13px;
			background: rgba(255,255,255,0.10); border: 1px solid #916a0a;
			cursor: pointer; user-select: none;
		}
		.rxnCard.mine { background: rgba(184,134,11,0.28); border-color: #b8860b; }
		.rxnCard .rxnCount { font-size: 11px; opacity: 0.85; }
	`;
	document.head.appendChild(st);
})();

function reactionPath(msgId) {
	return currentRoom + "/reactions/" + msgId;
}

// Firebase may hand back arrays as objects (sparse keys); also drops malformed entries.
function normalizeReactions(raw) {
	if (!raw) return [];
	const list = Array.isArray(raw) ? raw : Object.values(raw);
	return list.filter(r => Array.isArray(r) && r.length >= 3);
}

async function getReactionList() {
	if (CACHE.rxnList) return CACHE.rxnList;
	
	let raw = null;
	try { raw = await fetch(REF.reactions); } catch (err) { console.warn("Reaction list fetch failed:", err); }
	
	let list = !raw ? [] : (Array.isArray(raw) ? raw : Object.values(raw));
	list = list.filter(r => typeof r === "string" && r.length > 0);
	
	CACHE.rxnList = list.length ? list : DEFAULT_REACTIONS;
	return CACHE.rxnList;
}

// Add my reaction if I don't have it yet, remove it if I do.
async function toggleReaction(msgId, rxn) {
	if (!currentUser || !currentRoom || CACHE.inspecting) return;
	const uid = currentUser.uid;
	
	try {
		await runTransaction(ref(db, reactionPath(msgId)), (current) => {
			const list = normalizeReactions(current);
			const idx = list.findIndex(r => r[0] === rxn && r[1] === uid);
			
			if (idx >= 0) {
				list.splice(idx, 1);
			} else {
				list.push([rxn, uid, currentUsername]);
			}
			
			return list.length ? list : null;   // null deletes the node
		});
	} catch (err) {
		console.error("Reaction update failed:", err);
		dialog("Could not update reaction.", true);
	}
}

// Remove every reaction I have on a message.
async function removeMyReactions(msgId) {
	if (!currentUser || !currentRoom || CACHE.inspecting) return;
	const uid = currentUser.uid;

	try {
		await runTransaction(ref(db, reactionPath(msgId)), (current) => {
			const list = normalizeReactions(current).filter(r => r[1] !== uid);
			return list.length ? list : null;
		});
	} catch (err) {
		console.error("Reaction removal failed:", err);
		dialog("Could not remove reactions.", true);
	}
}

function myReactionCount(msgId) {
	if (!currentUser) return 0;
	return normalizeReactions(CACHE.reactions[msgId]).filter(r => r[1] === currentUser.uid).length;
}

// Draws the reaction cards for one message div from CACHE.reactions.
function renderReactions(div, msgId) {
	if (!div) return;

	let bar = div.querySelector(".reactions");
	const list = normalizeReactions(CACHE.reactions[msgId]);

	if (list.length === 0) {
		if (bar) bar.remove();
		return;
	}

	if (!bar) {
		bar = CE("div");
		bar.className = "reactions";

		const time = div.querySelector(".message-time");
		if (time) {
			div.insertBefore(bar, time);
		} else {
			div.appendChild(bar);
		}
	}

	bar.textContent = "";

	// group by emoji, keeping first-seen order
	const groups = new Map();
	for (const [rxn, uid, uname] of list) {
		if (!groups.has(rxn)) groups.set(rxn, []);
		groups.get(rxn).push({ uid: uid, name: uname });
	}

	for (const [rxn, users] of groups) {
		const card = CE("span");
		card.className = "rxnCard";

		const mine = currentUser && users.some(u => u.uid === currentUser.uid);
		if (mine) card.classList.add("mine");

		const em = CE("span");
		em.textContent = rxn;
		card.appendChild(em);

		if (users.length > 1) {
			const count = CE("span");
			count.className = "rxnCount";
			count.textContent = users.length;
			card.appendChild(count);
		}

		card.title = users.map(u => u.name || "Unknown").join(", ");

		// tap a card to add / remove your own reaction of that emoji
		// (inspecting admins can only look: no handler, no pointer cursor)
		if (CACHE.inspecting) {
			card.style.cursor = "default";
		} else {
			card.onclick = function(event) {
				event.stopPropagation();
				toggleReaction(msgId, rxn);
			};
		}

		bar.appendChild(card);
	}
}

function startReactionListener() {
	stopReactionListenerNow();

	CACHE.reactions = {};
	if (!currentRoom) return;

	const roomAtStart = currentRoom;

	stopReactionListener = onValue(
		ref(db, currentRoom + "/reactions"),
		function(snapshot) {
			if (roomAtStart !== currentRoom) return;   // user switched chat

			const prev = CACHE.reactions;
			const next = snapshot.exists() ? snapshot.val() : {};
			CACHE.reactions = next;

			// re-render every message whose reactions changed (added, edited or removed)
			const ids = new Set([...Object.keys(prev), ...Object.keys(next)]);
			const cont = GE("messages");

			for (const id of ids) {
				if (JSON.stringify(prev[id] ?? null) === JSON.stringify(next[id] ?? null)) continue;

				const div = cont.querySelector(`[data-message-id="${id}"]`);
				if (div) renderReactions(div, id);
			}
		},
		function(err) {
			console.error("Reaction listener error:", err);
		}
	);
}

function stopReactionListenerNow() {
	if (stopReactionListener) {
		stopReactionListener();
		stopReactionListener = null;
	}
}

async function reactOn(msgId, x, y) {
	if (!currentUser || !currentRoom || CACHE.inspecting) return;
	const rxns = await getReactionList();
	const options = rxns.map(rxn => [rxn, () => toggleReaction(msgId, rxn)]);
	
	createMenu(x, y, options);
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------

window.system = async function(hash) {
	Log(`System Call Observing: ${hash}`, false);
	
	if (hash == 1) { await update(REF.newReg, true); Log("New User Registration Enabled.", false); }
	if (hash == 2) { await update(REF.newReg, false); Log("New User Registration Disabled.", false); }
	if (hash == 3) { await update(REF.frozen, true); Log("System Frozen.", false); }
	if (hash == 4) { await update(REF.frozen, false); Log("System Unfrozen.", false); }
	if (hash == 5) { await remove(ref(db, currentOpenLog)).catch(err => console.log(`Log Deletion Error. (${currentOpenLog})`)); Log("Logs Cleared.", currentOpenLog); showLog(currentOpenLog); }
	
	if (hash >= 0 && hash <= 5) { dialog("Success.", 500); }
	
};

window.admin = async function(hash) {
	if (hash == 1) {
		let t = await ask("Enter Username And Password to Update", "both");
		if (t === null) return;
		
		let [user, pass] = t;
		//let uid = await AdminSDK.getUserByEmail(usernameToEmail(user));
		
		//await AdminSDK.resetPassword(uid, pass);
		//await dialog("Updated Password.", true);
		await dialog("Deprecated.", true);
	}
}

window.createRoom = async function() {
	const existingDiv = GE("cRoom");
	if (existingDiv) existingDiv.remove();
	
	const div = CE("div");
	div.id = "cRoom";
	div.className = "pageStyleB";
	
	const room = {
		uid: null,
		users: [],
		messages: {},
		name: null,
		deleted: false,
		pinned: {},
		typing: {
			by: null,
			at: null
		}
	};
	
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
	};
	
	const txt = CE("span");
	txt.textContent = "Enter Room Name:";
	
	const inp = CE("input");
	inp.id = "rInput";
	
	const but = CE("button");
	but.textContent = "Ok";
	
	const cancelBut = CE("button");
	cancelBut.textContent = "Cancel";
	cancelBut.className = "B";
	cancelBut.style.marginLeft = "8px";
	
	let isCancelled = false;
	cancelBut.onclick = () => {
		isCancelled = true;
		div.remove();
	};
	
	const onKeyEnter = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			but.click();
		}
	};
	inp.addEventListener("keydown", onKeyEnter);
	
	div.appendChild(txt); div.appendChild(inp); div.appendChild(but); div.appendChild(cancelBut);
	_showE(div);
	
	GE("roomsPage").appendChild(div);
	inp.focus();
	
	while (true) {
		await waitForClick(but);
		if (isCancelled) return;
		const rName = inp.value.trim();
		if (!rName) {
			txt.textContent = "Room Name cannot be empty. Enter Room Name:";
			inp.focus();
			continue;
		}
		room.name = rName;
		roomB.name = rName;
		break;
	}
	
	txt.textContent = "Enter Member Username (leave blank to finish):";
	inp.value = "";
	inp.focus();
	
	const users = await fetch(REF.users);
	
	while (true) {
		await waitForClick(but);
		if (isCancelled) return;
		const memberName = inp.value.trim().toLowerCase();
		
		if (memberName === "") {
			break;
		}
		
		if (memberName === (currentUsername || "").toLowerCase()) {
			txt.textContent = "You cannot add yourself. Enter Member Username (leave blank to finish):";
			inp.value = "";
			inp.focus();
			continue;
		}
		
		let targetUid = null;
		let targetUser = null;
		
		if (users) {
			for (const [uid, user] of Object.entries(users)) {
				if (user.username && user.username.toLowerCase() === memberName) {
					targetUid = uid;
					targetUser = user;
					break;
				}
			}
		}
		
		if (!targetUid || !targetUser) {
			txt.textContent = `User "${memberName}" not found. Enter Member Username (leave blank to finish):`;
			inp.value = "";
			inp.focus();
			continue;
		}
		
		if (room.users.includes(targetUid)) {
			txt.textContent = `User "${targetUser.username}" already added. Enter next Member (leave blank to finish):`;
			inp.value = "";
			inp.focus();
			continue;
		}
		
		// Privacy settings check: default allows messaging unless explicitly restricted
		const canMessage = targetUser?.options?.canMessage ?? "all";
		const isKnown = Array.isArray(targetUser?.options?.knowns) && targetUser.options.knowns.includes(currentUser.uid);
		
		if (canMessage === "all" || isKnown) {
			room.users.push(targetUid);
			roomB.users.push(targetUid);
			roomB.usernames.push(targetUser.username);
			txt.textContent = `Added ${targetUser.username}! Enter next Member (leave blank to finish):`;
			inp.value = "";
			inp.focus();
		} else {
			txt.textContent = `Not allowed by ${targetUser.username}'s Privacy Settings. Enter another Member:`;
			inp.value = "";
			inp.focus();
		}
	}
	
	inp.removeEventListener("keydown", onKeyEnter);
	
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
	
	div.remove();
	
	Log(`Room Created: ${room.uid}:${room.name}`, false);
	Log(`Room Created: ${room.uid}:${room.name}`);
	showRooms();
};


const mInputKeyEl = GE("messageInput");
if (mInputKeyEl) {
	mInputKeyEl.addEventListener(
		"keydown",
		function(event) {
			if (event.key === "Enter") { sendMessage(); }
		}
	);
}


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
				notifications: {},
				options: {
					canMessage: "all",
					knowns: []
				}
			}
			
		);
		
		setLoginStatus("Account Created! You can now login.");
		Log(`User Registered: ${currentUser.uid}:${currentUsername}`, false);
		Log(`User Registered: ${currentUser.uid}:${currentUsername}`);
	} catch (err) {
		setLoginStatus("Error Registering User: " + err.message);
	}
};


window.login = async function() {
	emergencyTriggered = false;
	
	showLoadingScreen();
	let user = GE("username").value.trim().toLowerCase();
	let pass = GE("password").value.trim();
	
	if (!user || !pass) {
		if (CACHE.testing && !user && !pass) {
			user = "test";
			pass = "test1234";
		} else {
			setLoginStatus("Enter username and Password.");
			await doneLoading();
			return;
		}
	}
	
	if ((await fetch(REF.frozen) === true) && (user !== "admin")) {
		setLoginStatus("System Frozen by Admin.");
		await doneLoading();
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
		Log(`Login Attempted User: ${user}`, false);
		await doneLoading();
	}
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
			hideE("loginPage");
			hideE("chatPage");
			showE("adminPage");
			hideE("callPage");
			showE("adminPanel");
			
			await doneLoading();
			
			Log("ADMIN LOGGED IN.", false);
			return;
		} else {
			Log(`Logged User: ${currentUsername}`);
		}
		
		GE("username").value = "";
		GE("password").value = "";
		
		GE("currentUser").textContent = currentUsername;
		
		showDiv("banners"); showE("banners"); showE("bannerChat");
		hideE("loginPage"); hideE("adminPage");
		
		showE("chatPage");
		
		startIncomingCallListener();
		startNotificationListener();
		await doneLoading();
		
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


// ----------------------------------------------------------------
// WebRTC & ExpressTURN Tower Configuration
// ----------------------------------------------------------------
// ExpressTURN Tower Configuration: High reliability NAT traversal with UDP, TCP and TLS fallback
// You can supply credentials via window.EXPRESSTURN_USERNAME / window.EXPRESSTURN_CREDENTIAL
// or configure them directly in EXPRESS_TURN_CONFIG below.
const EXPRESS_TURN_CONFIG = {
	urls: [
		"turn:free.expressturn.com:3478",
	],
	username: "000000002107959047",
	credential: "gzl45xnCQQvZbX3QGpibMbjQChQ="
};

function getRtcConfiguration() {
	const turnUrls = EXPRESS_TURN_CONFIG.urls;
	const turnUser = EXPRESS_TURN_CONFIG.username;
	const turnCred = EXPRESS_TURN_CONFIG.credential;

	const iceServers = [
		{
			urls: [
				"stun:stun.l.google.com:19302",
				"stun:stun1.l.google.com:19302",
				"stun:relay1.expressturn.com:3478"
			]
		},
		{
			urls: turnUrls,
			username: turnUser,
			credential: turnCred
		}
	];

	return {
		iceServers: iceServers,
		// iceTransportPolicy: "relay",  // for force TURN tower testing
		iceCandidatePoolSize: 10
	};
}

let rtcConfiguration = getRtcConfiguration();

// ----------------------------------------------------------------
// Voluntary Media & Calling System
// ----------------------------------------------------------------

let currentRoomSession = 0;
let makingOffer = false;
let ignoreOffer = false;

let localCameraStream = null;
let localMicStream = null;
let isCameraOn = false;
let isMicOn = false;
let isTogglingCamera = false;
let isTogglingMic = false;

let roomPeerConnection = null;
let videoSender = null;
let audioSender = null;
let remoteDescriptionSet = false;
let pendingRemoteCandidates = [];

let stopRoomPresenceListener = null;
let stopRoomSignalListener = null;
let stopRoomCandidatesListener = null;
let stopRoomMediaStateListener = null;
let roomPresenceInterval = null;

let remoteMediaState = { cam: false, mic: false, ts: 0 };

function showInAppToast(text) {
	const existing = document.querySelector(".neet-toast");
	if (existing) existing.remove();
	
	const toast = CE("div");
	toast.className = "notification neet-toast";
	toast.style.position = "fixed";
	toast.style.top = "65px";
	toast.style.right = "18px";
	toast.style.zIndex = "10001";
	toast.style.cursor = "pointer";
	toast.style.maxWidth = "340px";
	toast.style.boxShadow = "0 8px 30px rgba(0,0,0,0.7)";
	toast.textContent = text;
	toast.onclick = () => toast.remove();
	document.body.appendChild(toast);
	setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
}

async function isOtherUserInRoom(otherUid) {
	if (!currentRoomData) return false;
	try {
		const val = await fetch(REF.rooms + "/" + currentRoomData.uid + "/presence/" + otherUid);
		if (val && typeof val === "number" && (Date.now() - val < 4500)) {
			return true;
		}
	} catch (e) {
		console.warn("Presence check error:", e);
	}
	return false;
}

async function broadcastMediaState() {
	if (!currentRoomData || !currentUser) return;
	try {
		await update(REF.rooms + "/" + currentRoomData.uid + "/mediaState/" + currentUser.uid, {
			cam: isCameraOn,
			mic: isMicOn,
			ts: Date.now()
		});
	} catch (e) {
		console.warn("broadcastMediaState error:", e);
	}
}

function updateMediaUI() {
	const bar = GE("roomMediaBar");
	if (!bar) return;
	if (!currentRoomData || currentRoom === REF.globalChat) {
		bar.style.display = "none";
		return;
	}
	
	bar.style.display = "block";
	
	// Local controls
	const camBtn = GE("camToggleBtn");
	const camText = GE("camToggleText");
	const camQuick = GE("camQuickBtn");
	if (camBtn) {
		camBtn.classList.toggle("active", isCameraOn);
		if (camText) camText.textContent = isCameraOn ? "Camera: ON" : "Camera: OFF";
	}
	if (camQuick) {
		camQuick.textContent = isCameraOn ? "📷 ON" : "📷 OFF";
		camQuick.classList.toggle("active", isCameraOn);
	}
	
	const micBtn = GE("micToggleBtn");
	const micText = GE("micToggleText");
	const micQuick = GE("micQuickBtn");
	if (micBtn) {
		micBtn.classList.toggle("active", isMicOn);
		if (micText) micText.textContent = isMicOn ? "Mic: ON" : "Mic: OFF";
	}
	if (micQuick) {
		micQuick.textContent = isMicOn ? "🎙️ ON" : "🎙️ OFF";
		micQuick.classList.toggle("active", isMicOn);
	}
	
	// Video elements
	const videoStage = GE("videoStage");
	const localContainer = GE("localVideoContainer");
	const remoteContainer = GE("remoteVideoContainer");
	
	const showLocal = isCameraOn;
	const showRemote = !!remoteMediaState.cam;
	
	if (localContainer) {
		localContainer.style.display = showLocal ? "block" : "none";
	}
	if (remoteContainer) {
		remoteContainer.style.display = showRemote ? "block" : "none";
	}
	
	if (videoStage) {
		videoStage.style.display = (showLocal || showRemote) ? "block" : "none";
	}
	
	if (showLocal || showRemote) {
		if (typeof initAllDraggableVideos === "function") {
			initAllDraggableVideos();
		}
	}
	
	// Partner media status
	const partnerStatusText = GE("partnerStatusText");
	const partnerStatusDot = GE("partnerStatusDot");
	if (partnerStatusText && currentRoomData.users && currentRoomData.users.length === 2) {
		const camLabel = remoteMediaState.cam ? "Cam: ON" : "Cam: OFF";
		const micLabel = remoteMediaState.mic ? "Mic: ON" : "Mic: OFF";
		partnerStatusText.textContent = `${camLabel} | ${micLabel}`;
		if (partnerStatusDot) {
			partnerStatusDot.classList.toggle("active", remoteMediaState.cam || remoteMediaState.mic);
		}
	}
}

async function ensurePeerConnection() {
	if (roomPeerConnection) return roomPeerConnection;
	if (!currentRoomData || !currentUser) return null;
	
	const mySession = currentRoomSession;
	const roomUid = currentRoomData.uid;
	const signalPath = REF.rooms + "/" + roomUid + "/webrtc";
	
	const pc = new RTCPeerConnection(rtcConfiguration);
	roomPeerConnection = pc;
	remoteDescriptionSet = false;
	pendingRemoteCandidates = [];
	
	// If local tracks are already active, add them to the connection
	if (isCameraOn && localCameraStream) {
		const vt = localCameraStream.getVideoTracks()[0];
		if (vt) {
			videoSender = pc.addTrack(vt, localCameraStream);
		}
	}
	if (isMicOn && localMicStream) {
		const at = localMicStream.getAudioTracks()[0];
		if (at) {
			audioSender = pc.addTrack(at, localMicStream);
		}
	}
	
	pc.ontrack = (event) => {
		if (currentRoomSession !== mySession) return;
		const [stream] = event.streams;
		if (event.track.kind === "video") {
			const remoteVideo = GE("remoteVideo");
			if (remoteVideo) {
				remoteVideo.srcObject = stream || new MediaStream([event.track]);
				remoteVideo.play().catch(e => console.warn("Remote video play error:", e));
			}
			updateMediaUI();
		} else if (event.track.kind === "audio") {
			const remoteAudio = GE("remoteAudio");
			if (remoteAudio) {
				remoteAudio.srcObject = stream || new MediaStream([event.track]);
				remoteAudio.play().catch(e => console.warn("Remote audio play error:", e));
			}
		}
	};
	
	pc.onicecandidate = async ({ candidate }) => {
		if (!candidate || currentRoomSession !== mySession || !currentRoomData) return;
		try {
			await push(ref(db, signalPath + "/candidates/" + currentUser.uid), candidate.toJSON());
		} catch (err) {
			console.error("ICE send error:", err);
		}
	};
	
	pc.onnegotiationneeded = async () => {
		if (currentRoomSession !== mySession || !currentRoomData) return;
		try {
			makingOffer = true;
			await pc.setLocalDescription();
			await set(ref(db, signalPath + "/description"), {
				from: currentUser.uid,
				description: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
				ts: Date.now()
			});
		} catch (err) {
			console.error("Negotiation error:", err);
		} finally {
			makingOffer = false;
		}
	};
	
	pc.onconnectionstatechange = () => {
		if (pc) {
			console.log("Room WebRTC state:", pc.connectionState);
		}
	};
	
	return pc;
}

async function triggerNegotiation() {
	if (!roomPeerConnection || !currentRoomData) return;
	const signalPath = REF.rooms + "/" + currentRoomData.uid + "/webrtc";
	try {
		const offer = await roomPeerConnection.createOffer();
		await roomPeerConnection.setLocalDescription(offer);
		await set(ref(db, signalPath + "/description"), {
			from: currentUser.uid,
			description: { type: offer.type, sdp: offer.sdp },
			ts: Date.now()
		});
	} catch (e) {
		console.warn("triggerNegotiation error:", e);
	}
}

async function flushPendingRemoteCandidates() {
	if (!roomPeerConnection || !remoteDescriptionSet) return;
	const list = pendingRemoteCandidates;
	pendingRemoteCandidates = [];
	for (const c of list) {
		try {
			await roomPeerConnection.addIceCandidate(new RTCIceCandidate(c));
		} catch (e) {
			console.warn("Flushed candidate error:", e);
		}
	}
}

async function initRoomMediaListeners() {
	if (!currentRoomData || currentRoomData.users.length !== 2 || !currentUser) return;
	const mySession = ++currentRoomSession;
	const roomUid = currentRoomData.uid;
	const otherUid = currentRoomData.users.find(u => u !== currentUser.uid);
	const signalPath = REF.rooms + "/" + roomUid + "/webrtc";
	
	// Set remote video badge label
	const usersData = await fetch(REF.users);
	const otherUsername = usersData?.[otherUid]?.username || "Partner";
	const badge = GE("remoteVideoBadge");
	if (badge) badge.textContent = `${otherUsername}'s Camera`;
	const miniBadge = GE("remoteMiniBadge");
	if (miniBadge) miniBadge.textContent = otherUsername;
	
	// 1. Establish presence in room
	const presenceRef = ref(db, REF.rooms + "/" + roomUid + "/presence/" + currentUser.uid);
	await set(presenceRef, Date.now());
	try {
		onDisconnect(presenceRef).set(0);
	} catch (e) {
		console.warn("onDisconnect presence error:", e);
	}
	
	if (roomPresenceInterval) clearInterval(roomPresenceInterval);
	roomPresenceInterval = setInterval(async () => {
		if (currentRoomSession !== mySession || !currentRoomData || !currentUser) return;
		try {
			await set(presenceRef, Date.now());
		} catch (e) {
			console.warn("Presence heartbeat failed:", e);
		}
	}, 1200);
	
	// 2. Listen to other user's presence in room
	stopRoomPresenceListener = onValue(ref(db, REF.rooms + "/" + roomUid + "/presence/" + otherUid), async (snapshot) => {
		if (currentRoomSession !== mySession) return;
		const otherTs = snapshot.val();
		const isPartnerIn = otherTs && typeof otherTs === "number" && (Date.now() - otherTs < 4500);
		
		if (isPartnerIn && (isCameraOn || isMicOn)) {
			await ensurePeerConnection();
			await triggerNegotiation();
		}
	});
	
	// 3. Listen to other user's media state
	stopRoomMediaStateListener = onValue(ref(db, REF.rooms + "/" + roomUid + "/mediaState/" + otherUid), (snapshot) => {
		if (currentRoomSession !== mySession) return;
		const state = snapshot.val();
		remoteMediaState = state || { cam: false, mic: false, ts: 0 };
		updateMediaUI();
	});
	
	// 4. Perfect Negotiation signaling listener
	const polite = currentUser.uid > otherUid;
	makingOffer = false;
	ignoreOffer = false;
	
	stopRoomSignalListener = onValue(ref(db, signalPath + "/description"), async (snapshot) => {
		if (currentRoomSession !== mySession) return;
		const data = snapshot.val();
		if (!data || data.from === currentUser.uid) return;
		const { description } = data;
		
		try {
			const pc = await ensurePeerConnection();
			const offerCollision = (description.type === "offer") &&
				(makingOffer || pc.signalingState !== "stable");
			
			ignoreOffer = !polite && offerCollision;
			if (ignoreOffer) {
				console.log("Impolite peer ignoring offer collision");
				return;
			}
			
			if (offerCollision && polite) {
				console.log("Polite peer rolling back local offer");
				await pc.setLocalDescription({ type: "rollback" });
			}
			
			await pc.setRemoteDescription(new RTCSessionDescription(description));
			remoteDescriptionSet = true;
			await flushPendingRemoteCandidates();
			
			if (description.type === "offer") {
				await pc.setLocalDescription();
				await set(ref(db, signalPath + "/description"), {
					from: currentUser.uid,
					description: { type: pc.localDescription.type, sdp: pc.localDescription.sdp },
					ts: Date.now()
				});
			}
		} catch (err) {
			console.error("Remote description handling error:", err);
		}
	});
	
	// 5. ICE candidates listener
	stopRoomCandidatesListener = onChildAdded(ref(db, signalPath + "/candidates/" + otherUid), async (snapshot) => {
		if (currentRoomSession !== mySession) return;
		const candidate = snapshot.val();
		if (!candidate) return;
		if (!roomPeerConnection || !remoteDescriptionSet) {
			pendingRemoteCandidates.push(candidate);
			return;
		}
		try {
			await roomPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
		} catch (err) {
			if (!ignoreOffer) {
				console.warn("ICE candidate add error:", err);
			}
		}
	});
	
	updateMediaUI();
}


// ----------------------------------------------------------------
// Floating Draggable Video Handlers & Flip Control
// ----------------------------------------------------------------

window.toggleMinimizeVideo = function(containerId, event) {
	if (event) {
		event.stopPropagation();
	}
	const box = GE(containerId);
	if (!box) return;
	box.classList.toggle("minimized");
};

// Local video is permanently mirrored (no flip toggle anymore)
(function() {
	const lv = GE("localVideo");
	if (lv) lv.style.transform = "scaleX(-1)";
})();

function initDraggableVideo(boxId, headerId) {
	const box = GE(boxId);
	if (!box) return;
	if (box._dragInitialized) return;
	box._dragInitialized = true;
	
	let dragging = false;
	let hasMoved = false;
	let startX = 0;
	let startY = 0;
	let initialLeft = 0;
	let initialTop = 0;
	let offsetX;
	let offsetY;
	let boxShiftX = 0;
	let boxShiftY = 0;
	let pendingMove = null;
	let rafId = null;

	box.style.touchAction = "none";

	function onPointerDown(event) {
		// Ignore clicks on header action buttons so button clicks fire cleanly
		if (event.target.closest(".floatingActionBtn")) {
			return;
		}
		
		dragging = true;
		hasMoved = false;
		startX = event.clientX;
		startY = event.clientY;
		
		// Where the box visually is right now (includes any CSS transform / margin)
		const rect = box.getBoundingClientRect();

		// Freeze size and kill transitions so switching from right/bottom to
		// left/top can't resize or animate the box (that was the sudden jump / lag)
		box.style.transition = "none";
		box.style.width = rect.width + "px";
		box.style.height = rect.height + "px";
		box.style.right = "auto";
		box.style.bottom = "auto";
		box.style.left = rect.left + "px";
		box.style.top = rect.top + "px";

		// If CSS (transform, margin, ...) still shifts the box, measure the error and cancel it
		const after = box.getBoundingClientRect();
		const errX = after.left - rect.left;
		const errY = after.top - rect.top;
		if (errX || errY) {
			box.style.left = (rect.left - errX) + "px";
			box.style.top = (rect.top - errY) + "px";
		}

		// Remember the correction so every later move uses the same mapping
		boxShiftX = errX;
		boxShiftY = errY;

		initialLeft = rect.left;
		initialTop = rect.top;
		offsetX = event.clientX - rect.left;
		offsetY = event.clientY - rect.top;

		try {
			box.setPointerCapture(event.pointerId);
		} catch (e) {}
	}

	function applyMove() {
		rafId = null;
		if (!dragging || !pendingMove) return;

		let newX = pendingMove.x - offsetX;
		let newY = pendingMove.y - offsetY;

		const maxX = window.innerWidth - box.offsetWidth;
		const maxY = window.innerHeight - box.offsetHeight;

		newX = Math.max(0, Math.min(newX, maxX));
		newY = Math.max(0, Math.min(newY, maxY));

		box.style.left = (newX - boxShiftX) + "px";
		box.style.top = (newY - boxShiftY) + "px";
	}

	function onPointerMove(event) {
		if (!dragging) return;

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		if (!hasMoved && Math.hypot(dx, dy) <= 4) {
			return;   // a plain click must not move the box at all
		}
		hasMoved = true;

		pendingMove = { x: event.clientX, y: event.clientY };
		if (rafId === null) {
			rafId = requestAnimationFrame(applyMove);
		}
	}
	
	function onPointerUp(event) {
		if (!dragging) return;
		dragging = false;
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		pendingMove = null;
		try {
			box.releasePointerCapture(event.pointerId);
		} catch (e) {}

		// Give size and transitions back to the stylesheet (so minimize still works)
		box.style.transition = "";
		box.style.width = "";
		box.style.height = "";

		// Make sure the box can't end up off screen after the size is restored
		const r = box.getBoundingClientRect();
		const cx = Math.max(0, Math.min(r.left, window.innerWidth - r.width));
		const cy = Math.max(0, Math.min(r.top, window.innerHeight - r.height));
		if (cx !== r.left) box.style.left = (parseFloat(box.style.left) + cx - r.left) + "px";
		if (cy !== r.top) box.style.top = (parseFloat(box.style.top) + cy - r.top) + "px";

		// If minimized and clicked without dragging, restore/normalize!
		if (!hasMoved && box.classList.contains("minimized")) {
			box.classList.remove("minimized");
		}
	}
	
	box.addEventListener("pointerdown", onPointerDown);
	box.addEventListener("pointermove", onPointerMove);
	box.addEventListener("pointerup", onPointerUp);
	box.addEventListener("pointercancel", () => { dragging = false; });
}

function initAllDraggableVideos() {
	initDraggableVideo("remoteVideoContainer", "remoteVideoHeader");
	initDraggableVideo("localVideoContainer", "localVideoHeader");
}

window.toggleCamera = async function() {
	if (!currentUser || !currentRoomData || currentRoom === REF.globalChat) return;
	if (currentRoomData.users.length !== 2) return;
	if (isTogglingCamera) return;
	isTogglingCamera = true;
	
	try {
		const otherUid = currentRoomData.users.find(u => u !== currentUser.uid);
		const usersData = await fetch(REF.users);
		const otherUsername = usersData?.[otherUid]?.username || "Partner";
		
		if (!isCameraOn) {
			// Turning Camera ON
			const inRoom = await isOtherUserInRoom(otherUid);
			if (!inRoom) {
				const send = await askYesNo(`${otherUsername} is not in room currently. Send a notification?`);
				if (send === true) {
					// 1. Send notification
					const notifRef = push(ref(db, REF.users + "/" + otherUid + "/notifications"));
					await set(notifRef, {
						room: currentRoom,
						roomName: currentRoomData.name,
						sender: currentUser.uid,
						senderName: currentUsername,
						type: 3,
						text: `${currentUsername} wants to initiate a video/audio connection with you in ${currentRoomData.name}`,
						timestamp: Date.now()
					});
					
					// 2. Record permanent stamp in chat
					const stampMsg = {
						sender: currentUser.uid,
						senderName: currentUsername,
						type: "stamp",
						data: `${currentUsername} wants to initiate a video/audio connection with ${otherUsername} in ${currentRoomData.name}`,
						tstamp: Date.now(),
						time: Math.floor(Date.now() / 1000),
						seenBy: [currentUser.uid],
						permanent: true
					};
					await set(push(ref(db, currentRoom + "/messages")), stampMsg);
					await set(ref(db, REF.roomsB + "/" + currentRoomData.uid + "/lastMessageMeta"), {
						senderName: currentUsername,
						data: stampMsg.data,
						tstamp: Date.now()
					});
				} else {
					isTogglingCamera = false;
					return;
				}
			}
			
			// Request local camera
			try {
				localCameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
			} catch (err) {
				console.error("Camera access failed:", err);
				dialog("Could not access camera: " + (err.message || "Permission denied"), true);
				isTogglingCamera = false;
				return;
			}
			
			isCameraOn = true;
			updateMediaUI();
			
			const localVideo = GE("localVideo");
			if (localVideo) {
				localVideo.srcObject = localCameraStream;
				localVideo.play().catch(e => console.warn("Local video play:", e));
			}
			
			await broadcastMediaState();
			
			const pc = await ensurePeerConnection();
			const videoTrack = localCameraStream.getVideoTracks()[0];
			if (videoTrack && pc) {
				if (videoSender) {
					await videoSender.replaceTrack(videoTrack);
				} else {
					videoSender = pc.addTrack(videoTrack, localCameraStream);
				}
			}
		} else {
			// Turning Camera OFF
			isCameraOn = false;
			if (localCameraStream) {
				localCameraStream.getTracks().forEach(t => t.stop());
				localCameraStream = null;
			}
			const localVideo = GE("localVideo");
			if (localVideo) {
				localVideo.srcObject = null;
			}
			if (videoSender && roomPeerConnection) {
				try {
					await videoSender.replaceTrack(null);
				} catch (e) {
					console.warn("replaceTrack error:", e);
				}
			}
			updateMediaUI();
			await broadcastMediaState();
		}
	} catch (err) {
		console.error("toggleCamera error:", err);
	} finally {
		isTogglingCamera = false;
	}
};

window.toggleMic = async function() {
	if (!currentUser || !currentRoomData || currentRoom === REF.globalChat) return;
	if (currentRoomData.users.length !== 2) return;
	if (isTogglingMic) return;
	isTogglingMic = true;
	
	try {
		const otherUid = currentRoomData.users.find(u => u !== currentUser.uid);
		const usersData = await fetch(REF.users);
		const otherUsername = usersData?.[otherUid]?.username || "Partner";
		
		if (!isMicOn) {
			// Turning Mic ON
			const inRoom = await isOtherUserInRoom(otherUid);
			if (!inRoom) {
				const send = await askYesNo(`${otherUsername} is not in room currently. Send a notification?`);
				if (send === true) {
					// 1. Send notification
					const notifRef = push(ref(db, REF.users + "/" + otherUid + "/notifications"));
					await set(notifRef, {
						room: currentRoom,
						roomName: currentRoomData.name,
						sender: currentUser.uid,
						senderName: currentUsername,
						type: 3,
						text: `${currentUsername} wants to initiate a video/audio connection with you in ${currentRoomData.name}`,
						timestamp: Date.now()
					});
					
					// 2. Record permanent stamp in chat
					const stampMsg = {
						sender: currentUser.uid,
						senderName: currentUsername,
						type: "stamp",
						data: `${currentUsername} wants to initiate a video/audio connection with ${otherUsername} in ${currentRoomData.name}`,
						tstamp: Date.now(),
						time: Math.floor(Date.now() / 1000),
						seenBy: [currentUser.uid],
						permanent: true
					};
					await set(push(ref(db, currentRoom + "/messages")), stampMsg);
					await set(ref(db, REF.roomsB + "/" + currentRoomData.uid + "/lastMessageMeta"), {
						senderName: currentUsername,
						data: stampMsg.data,
						tstamp: Date.now()
					});
				} else {
					isTogglingMic = false;
					return;
				}
			}
			
			// Request local mic
			try {
				localMicStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
			} catch (err) {
				console.error("Mic access failed:", err);
				dialog("Could not access microphone: " + (err.message || "Permission denied"), true);
				isTogglingMic = false;
				return;
			}
			
			isMicOn = true;
			updateMediaUI();
			
			await broadcastMediaState();
			
			const pc = await ensurePeerConnection();
			const audioTrack = localMicStream.getAudioTracks()[0];
			if (audioTrack && pc) {
				if (audioSender) {
					await audioSender.replaceTrack(audioTrack);
				} else {
					audioSender = pc.addTrack(audioTrack, localMicStream);
				}
			}
		} else {
			// Turning Mic OFF
			isMicOn = false;
			if (localMicStream) {
				localMicStream.getTracks().forEach(t => t.stop());
				localMicStream = null;
			}
			if (audioSender && roomPeerConnection) {
				try {
					await audioSender.replaceTrack(null);
				} catch (e) {
					console.warn("replaceTrack error:", e);
				}
			}
			updateMediaUI();
			await broadcastMediaState();
		}
	} catch (err) {
		console.error("toggleMic error:", err);
	} finally {
		isTogglingMic = false;
	}
};

window.closeRoomMedia = async function() {
	currentRoomSession++;
	
	// 1. Turn off local camera tracks
	isCameraOn = false;
	if (localCameraStream) {
		localCameraStream.getTracks().forEach(t => t.stop());
		localCameraStream = null;
	}
	const localVideo = GE("localVideo");
	if (localVideo) localVideo.srcObject = null;
	
	// 2. Turn off local mic tracks
	isMicOn = false;
	if (localMicStream) {
		localMicStream.getTracks().forEach(t => t.stop());
		localMicStream = null;
	}
	
	// 3. Close peer connection
	if (roomPeerConnection) {
		roomPeerConnection.ontrack = null;
		roomPeerConnection.onicecandidate = null;
		roomPeerConnection.onnegotiationneeded = null;
		roomPeerConnection.onconnectionstatechange = null;
		try {
			roomPeerConnection.close();
		} catch (e) {
			console.warn("Peer connection close error:", e);
		}
		roomPeerConnection = null;
	}
	videoSender = null;
	audioSender = null;
	remoteDescriptionSet = false;
	pendingRemoteCandidates = [];
	
	// 4. Remote media elements cleanup
	const remoteVideo = GE("remoteVideo");
	if (remoteVideo) remoteVideo.srcObject = null;
	const remoteAudio = GE("remoteAudio");
	if (remoteAudio) {
		remoteAudio.pause();
		remoteAudio.srcObject = null;
	}
	
	// 5. Unsubscribe Firebase listeners
	if (stopRoomSignalListener) {
		stopRoomSignalListener();
		stopRoomSignalListener = null;
	}
	if (stopRoomCandidatesListener) {
		stopRoomCandidatesListener();
		stopRoomCandidatesListener = null;
	}
	if (stopRoomMediaStateListener) {
		stopRoomMediaStateListener();
		stopRoomMediaStateListener = null;
	}
	if (stopRoomPresenceListener) {
		stopRoomPresenceListener();
		stopRoomPresenceListener = null;
	}
	if (roomPresenceInterval) {
		clearInterval(roomPresenceInterval);
		roomPresenceInterval = null;
	}
	
	// 6. Clear presence, media state and webrtc signals in Firebase
	if (currentRoomData && currentUser) {
		try {
			await update(REF.rooms + "/" + currentRoomData.uid + "/presence/" + currentUser.uid, 0);
			await update(REF.rooms + "/" + currentRoomData.uid + "/mediaState/" + currentUser.uid, {
				cam: false,
				mic: false,
				ts: Date.now()
			});
			await remove(ref(db, REF.rooms + "/" + currentRoomData.uid + "/webrtc/candidates/" + currentUser.uid));
		} catch (e) {
			console.warn("Clear presence/signaling error:", e);
		}
	}
	
	remoteMediaState = { cam: false, mic: false, ts: 0 };
	updateMediaUI();
};

window.backToRooms = async function() {
	await closeRoomMedia();
	await showRooms();
};

// Legacy compatibility shims
window.callUser = async function() {
	await toggleCamera();
};

window.endCall = async function(silent = false) {
	await closeRoomMedia();
};

function startIncomingCallListener() {
	// Voluntary media model
}

function stopIncomingCallListener() {
	// No-op
}

function showCallPage(heading, person, buttonText) {
	// No-op
}

function hideCallPage() {
	// No-op
}

window.toggleMute = function() {
	toggleMic();
};

function createRejectButton() {
	return null;
}

function initSidebar() {
	const bar = document.getElementById("controlBanner");
	const toggleBtn = document.getElementById("sideToggle");
	const topBar = document.getElementById("bannerTop");
	if (!bar || !toggleBtn) return;
	
	function setCollapsed(collapsed) {
		bar.classList.toggle("collapsed", collapsed);
		document.body.classList.toggle("sidebarOpen", !collapsed);
		toggleBtn.setAttribute("aria-expanded", String(!collapsed));
		toggleBtn.title = collapsed ? "Expand menu" : "Collapse menu";
	}
	
	function syncLayout() {
		const visible = !bar.hidden && getComputedStyle(bar).display !== "none";
		document.body.classList.toggle("sidebarOn", visible);
		if (!visible) setCollapsed(true);
		
		if (topBar && topBar.offsetHeight) {
			document.documentElement.style.setProperty("--topbar-h", (topBar.offsetHeight + 8) + "px");
		}
	}
	
	toggleBtn.addEventListener("click", () => {
		setCollapsed(!bar.classList.contains("collapsed"));
	});
	
	bar.addEventListener("click", (e) => {
		if (e.target.closest(".sideItem")) setCollapsed(true);
	});
	
	document.addEventListener("pointerdown", (e) => {
		if (!bar.classList.contains("collapsed") && !bar.contains(e.target)) {
			setCollapsed(true);
		}
	}, true);
	
	new MutationObserver(syncLayout).observe(bar, { attributes: true, attributeFilter: ["style", "hidden"] });
	if (topBar) {
		new MutationObserver(syncLayout).observe(topBar, { attributes: true, attributeFilter: ["style", "hidden"] });
		if (window.ResizeObserver) new ResizeObserver(syncLayout).observe(topBar);
	}
	window.addEventListener("resize", syncLayout);
	
	setCollapsed(true);
	syncLayout();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initSidebar);
} else {
	initSidebar();
}