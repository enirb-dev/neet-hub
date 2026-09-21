
import { initializeApp, cert } from "https://esm.sh/firebase-admin@12.0.0/app";
import { getAuth } from "https://esm.sh/firebase-admin@12.0.0/auth";

import { getDatabase } from "https://esm.sh/firebase-admin@12.0.0/database";


const serviceAccount = {
  "type": "service_account",
  "project_id": "neet-hub-33eef",
  "private_key_id": "462586f127183a5b3a951ce340ae3a60c0c20662",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDhlkbxA8eykX7L\nwVo4gcLniaApkuEdCerhLT89NVzKZMijG406p4xWGgZwfBiKG/Zs+VXsOO108RQJ\nVgmD7eU/vCjTR2g626wbI8ApJx9ClThcUkSMkhhMTxItQZh1hllPb4/EjAX2sApc\nfoE3ufWg+MN6p51vk02RQ7V9/51anee+gTD8pl6ZiO6KW70W+P7qFR8tY8r8pD2a\nepugUvYvVd6+kbBkeqxotg8MvLmtqPj1Kygn3HxKv0+1OfhInzkmYPcpXiPT9vAW\n5yyuEO2w5CpcDU8uwtT0kX6CAuXNVdccciAzjVfYqk7m9Nh5G8GjCi9RDMVTakDt\nQP6Bk9CHAgMBAAECggEATmgXhyybq66TRgmRrKM5VZWJo/mHobqxNwutd75E3pnR\n/JMWbsUOa1zHUTBorRQT/gNZgG225tbl8mrDiuXUMOdavziJ+y8f7hzqbMNKw68u\ntDPp3Hvo0xkGhdFPRsXn48qwSw2qAvhj2YskqXRKceUUuFxqxX2Kz8sbWUxPak9h\nydx7MIJ/sLDtfYC8Pxs/17Ceqb30evHa7olO3jqECev6NoudZ31rWALh6+NS7vYw\nuHNLh4ojOFAw8d+6D9gvRFYZQB3iFK3bLvpaX50Tj61oFFVbYGOoNNI1iJvs70Ka\nlgSatREstXeBzQlB9aVY1ygXAhQE328pN+up+pi8kQKBgQD0a6qw76WfrRAg2k5D\nVtJd1TKOtoqsPSzcFJx6QZO3sGtQC4WMwDAqmYCA4CzOl0AMA/HlbV6F7cAS0iaE\ng+idX8q14Hda8iwy2etSQj61naUFnAMHLN1MDbWPlFxpcMYqniqtxX27+daSq127\naNxwcLd6bGwAD21TvIqLTlUv9wKBgQDsRjJtIt8J7a8w4veGDwePfPYMVqGTfC6p\nm+SN6DmxKLLYiBV8GDKJb4VIghXvkYzxhTycKXu2Mld2z3T7axfpYOU2GCE6qs1G\na1Tniu4sWyQJ4xVCVEDR3Qx4GSq7D1zFHacKYtLZeq1I6B1Kws85DN2JOS0bvfX8\nJHVP0tNf8QKBgDdUuEtdtOy0zNXjFZyA5xZ+0Pcls7bSEnmv4Mx8U+hdc62nLhBy\n4XSDU2fZV8tcyg7uRbBeVeuTqsuX70hIZDxcFxOdQOfBsufAFVmFzZRnn5fpfXX+\nXgp9gACE4XatJO845wh3kMMhB8YkLQ/j6SM7IQ4BxWEuHN277NEkZnx5AoGAXa13\nUM4CoG0ciMV0XjKXTMy+wSWX6mHSHm0wsRLhzNvWDQPngMwXPWZ58cWh7NpIh3nM\nDh5kbliHVRPrzcMoN9+zAT+P7TLLMKBdiXAL/ookP8dJJoNBL/P0fal8x63Pmlen\nYvbLom6BRebBtmKGxpfTPhTtTZKDdPT/jiaIqAECgYEAut5p1vO6u8f+G66AWtyq\nrcy20p9jxmhOMzRDyv7PdE8fGC06Vn+7h1hXO4caCr2G3txVsW4AmpWpl4NQbZoT\no6MtFiVh6Vz2+/5Y0Q1ARqEUEIB3sAan1q/Mi0zh7GyXZZxAGYqjI4i+/lbqT9bg\nMahTroJWYHa13bZ87awHMJE=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@neet-hub-33eef.iam.gserviceaccount.com",
  "client_id": "106127980230327195007",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40neet-hub-33eef.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}



initializeApp({
    credential: cert(serviceAccount),
    databaseURL:
        "https://neet-hub-33eef-default-rtdb.asia-southeast1.firebasedatabase.app"
});


const adminAuth = getAuth();
const adminDB = getDatabase();


export async function getUser(uid) {
    const user = await adminAuth.getUser(uid);
    return user;
}

export async function getUserByEmail(email) {
    const user = await adminAuth.getUserByEmail(email);
    return user;
}

export async function createUser(email, password, displayName = null) {
    const user = await adminAuth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        disabled: false
    });
	
    return user;
}


export async function resetPassword(uid, newPassword) {
    const user = await adminAuth.updateUser(uid, {
        password: newPassword
    });
	
    return user;
}


// IMPORTANT:
// This does NOT automatically delete:
//
// /users/<uid>
// /secure/<uid>
// messages
// rooms
// etc.

export async function deleteUser(uid) {
    await adminAuth.deleteUser(uid);
    return true;
}


export async function disableUser(uid) {
    const user = await adminAuth.updateUser(uid, {
        disabled: true
    });
	
    return user;
}


export async function enableUser(uid) {
    const user = await adminAuth.updateUser(uid, {
        disabled: false
    });
	
    return user;
}


export async function toggleUserDisabled(uid) {
    const user = await adminAuth.getUser(uid);
    const updated = await adminAuth.updateUser(uid, {
        disabled: !user.disabled
    });
    return updated;
}


export async function changeUserEmail(uid, newEmail) {
    const user = await adminAuth.updateUser(uid, {
        email: newEmail
    });
    return user;
}


export async function verifyUserEmail(uid) {
    const user = await adminAuth.updateUser(uid, {
        emailVerified: true
    });
	
    return user;
}


export async function changeDisplayName(uid, displayName) {
    const user = await adminAuth.updateUser(uid, {
        displayName: displayName
    });
	
    return user;
}


export async function completelyDeleteUser(uid) {
    await adminAuth.deleteUser(uid);
	
    await adminDB.ref(`/users/${uid}`).remove();
    await adminDB.ref(`/secure/${uid}`).remove();
	
    return true;
}


export async function listUsers() {
    const result = await adminAuth.listUsers(1000);
    return result.users;
}


export async function listAllUsers() {
    const users = [];
    let pageToken;

    do {
        const result = await adminAuth.listUsers(
            1000,
            pageToken
        );
        users.push(...result.users);
        pageToken = result.pageToken;
    } while (pageToken);
	
    return users;
}


export async function readData(path) {
    const snapshot = await adminDB
        .ref(path)
        .once("value");
	
    return snapshot.val();
}


export async function setData(path, value) {
    await adminDB.ref(path).set(value);
    return true;
}


export async function updateData(path, value) {
    await adminDB.ref(path).update(value);
    return true;
}


export async function deleteData(path) {
    await adminDB.ref(path).remove();
    return true;
}


export async function toggleRegistrations() {
    const snapshot = await adminDB.ref("/reg").once("value");
	
    const current = snapshot.val();
    const newValue = !Boolean(current);
	
    await adminDB.ref("/reg").set(newValue);
	
    return newValue;
}


export async function setRegistrations(enabled) {
    await adminDB.ref("/reg").set(Boolean(enabled));
    return Boolean(enabled);
}


export async function getRegistrationsState() {
    const snapshot = await adminDB.ref("/reg").once("value");
	
    return Boolean(snapshot.val());
}


export async function getNeetHubUser(uid) {
    return await readData(`/users/${uid}`);
}

export async function deleteNeetHubUserData(uid) {
    await deleteData(`/users/${uid}`);
    await deleteData(`/secure/${uid}`);
    return true;
}


export async function updateNeetHubUser(uid, data) {
    await adminDB.ref(`/users/${uid}`).update(data);
    return true;
}


export async function setLastSeen(uid, timestamp) {
    await adminDB.ref(`/users/${uid}/lastSeen`).set(timestamp);
    return true;
}


export async function getLastSeen(uid) {
    const snapshot = await adminDB.ref(`/users/${uid}/lastSeen`).once("value");
    return snapshot.val();
}


export async function getLogs() {
    return await readData("/log");
}


export async function clearLogs() {
    await deleteData("/log");
    return true;
}


export async function addLog(data) {
    const newLog = adminDB.ref("/log").push();
	
    await newLog.set({
        ...data,
        time: Math.floor(Date.now() / 1000)
    });
	
    return newLog.key;
}


export async function getRoom(roomHash) {
    return await readData(`/rooms/${roomHash}`);
}


export async function deleteRoom(roomHash) {
    await adminDB.ref(`/rooms/${roomHash}/deleted`).set(true);
    return true;
}


export async function restoreRoom(roomHash) {
    await adminDB.ref(`/rooms/${roomHash}/deleted`).set(false);
    return true;
}


export async function permanentlyDeleteRoom(roomHash) {
    await adminDB.ref(`/rooms/${roomHash}`).remove();
    return true;
}


export async function getCall(callId) {
    return await readData(`/calls/${callId}`);
}


export async function deleteCall(callId) {
    await deleteData(`/calls/${callId}`);
    return true;
}


export async function clearLog() {
    await deleteData("/log");
    return true;
}


export async function clearAllRooms() {
    await deleteData("/rooms");
    return true;
}


export async function clearAllCalls() {
    await deleteData("/calls");
    return true;
}
