var websocket = null;
var username = null;
var crypt = null;
var privateKey = null;
var publicKey = null;
document.addEventListener("DOMContentLoaded", function () {
    crypt = new JSEncrypt({default_key_size: 1024});
    privateKey = crypt.getPrivateKey();
    publicKey = crypt.getPublicKey();
    console.log("Keygen created");
});
//async function keygen(){
//}
//keygen();
console.log("Keygen called");
var otherPublicKey = null;
//console.log(publicKey);
function setConnectionDetails(){
    username = document.getElementById("username").value
    let room_name = document.getElementById("room_name").value
    const wss_server = 'wss://kris-chat.herokuapp.com/ws/chat/'
    const wss_url = wss_server + room_name + '/'
    // let wss_url = document.getElementById("wss_url").value
    //localStorage.setItem("username", username);
    //localStorage.setItem("room_name", room_name);
    //localStorage.setItem("wss_url", wss_url);
    websocket = new WebSocket(wss_url);
    websocket.onmessage = function (event) {
    let data = event.data;
    if (data === 'getpublickey'){
        sendPublicKey();
    }
    else{
        data = JSON.parse(data);
        if(data.publicKey && data.username !== username ){
            savePublicKey(data);
        }
        else if(data.message && data.username !== username ){
            //console.log(data.username);
            document.getElementById('encrypted_texts_received').value = data.message+'\n\n';
            const decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            const message = decrypt.decrypt(data.message);
            document.getElementById('decrypted_texts_received').value = (data.username + ' :\n' + message+'\n\n');
        }
    }
    }
    console.log('connection set');
    // requestPublicKey();
}
function savePublicKey(data){
    otherPublicKey = data.publicKey;
    console.log('Saved Public Key');
}
function sendPublicKey(){
    if(websocket)
        websocket.send(JSON.stringify({ username, publicKey }));
}
function requestPublicKey(){
    if(websocket)
        websocket.send('getpublickey');
}
function sendMessage(){
    console.log("send Message Called");
    let message = document.getElementById('send_text').value;
    if( websocket && username && otherPublicKey && message ){
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(otherPublicKey);
        message = encrypt.encrypt(message);
        websocket.send(JSON.stringify({
                        message,
                        username,
                    })
        );
        document.getElementById('send_text').value='';
    }
}