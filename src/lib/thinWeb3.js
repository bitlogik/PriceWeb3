// Copyright BitLogiK 2021-2024. All Rights Reserved.
// ThinWeb3 : Minimalist Web3 RPC JS client
// This file is licensed under the GNU Affero General Public License.
// License text available at http://www.gnu.org/licenses/agpl.txt


class Web3RPC {
    constructor(rpcURL, cbReady, cbErr) {
        this.ws = null;
        this.callId = 0;
        if (rpcURL.startsWith("wss")) {
            // WebSocket
            this.wsConnect(rpcURL, cbReady, cbErr);
        } else if (rpcURL.startsWith("https")) {
            // https
            this.RPCURL = rpcURL;
            setTimeout(cbReady, 200);
        } else
            cbErr("Unsupported RPC connection scheme : wss or https.")
    }
    wsConnect(rpcURL, cbReady, cbErr) {
        this.ws = new WebSocket(rpcURL);
        this.ws.onerror = function (errEvent) {
            cbErr("Can't connect to the RPC API.")
        };
        this.ws.onclose = function (closeEvent) {
            this.ws = null;
            if (closeEvent.code == 1006) {
                console.log("Reconnecting");
                this.wsConnect(rpcURL, cbReady, cbErr);
            }
        };
        this.ws.onopen = function() {
           cbReady();
        }
    }
    close() {
        if (this.ws != null) {
            this.ws.close();
        }
    }
    registerReplyHandler(replyHandler, id) {
        if (this.ws)
            this.ws.onmessage = function (evt) {
                const reply = JSON.parse(evt.data);
                if (reply.id == id)
                    replyHandler(reply.result);
            }
        else
            this.onresponse = function (evt) {
                evt.json().then(reply => {
                    if (reply.id == id)
                        replyHandler(reply.result);
                });
            }
    }
    registerErrorHandler(errorCallback) {
        if (this.ws)
            this.ws.onerror = errorCallback;
        else
            this.onerror = errorCallback;
    }
    postDataJSON(dataObj) {
        const dataReq = JSON.stringify(dataObj);
        if (this.ws)
            this.ws.send(dataReq);
        else
            fetch(this.RPCURL, {
                method: "POST",
                body: JSON.stringify(dataObj)
            })
            .then(this.onresponse)
            .catch(this.onerror);
    }
    PostJSONRPC(method, id, params) {
        const reqObj = {
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        };
        this.postDataJSON(reqObj);
    }
    RPCCall(method, params, cb, cbErr) {
        this.callId++;
        const currentId = this.callId;
        this.registerReplyHandler(cb, currentId);
        this.registerErrorHandler(cbErr);
        this.PostJSONRPC(method, currentId, params);
    }
    Web3Call(data, toContract, cb, cbErr) {
        const params = [{
                "data": data,
                "to": toContract
            },
            "latest"
        ];
        this.RPCCall("eth_call", params, cb, cbErr)
    }
}

export {
    Web3RPC,
};
