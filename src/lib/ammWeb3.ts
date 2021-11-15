// Copyright BitLogiK 2021. All Rights Reserved.
// PriceWeb3 : Web3 RPC calls for AMM pairs
// This file is licensed under the GNU Affero General Public License.
// License text available at http://www.gnu.org/licenses/agpl.txt


const REFRESH_TIME = 15000; // in ms : every 15 seconds

// Uniswap v2 / SushiSwap and clones LP calls
//   For a pair, LP contract
//   https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair
// getReserves()
const getReservesMethod = "0x0902f1ac";
// token0()
const token0Call = "0x0dfe1681";
// token1()
const token1Call = "0xd21220a7";

//  ERC20 calls for tokens
// decimals()
const decimalsMethod = "0x313ce567";
// symbol() Get the token name
// const symbolMethod = "95d89b41";


class Web3RPC {
    constructor(rpcURL, cbOK, cbErr) {
        this.ws = null;
        this.callId = 0;
        if (rpcURL.startsWith("wss")) {
            // WebSocket
            this.wsConnect(rpcURL, cbOK, cbErr);
        } else if (rpcURL.startsWith("https")) {
            // https
            this.RPCURL = rpcURL;
            setTimeout(cbOK, 250);
        } else
            cbErr("Unsupported RPC connection scheme : wss or https.")
    }
    wsConnect(rpcURL, cbOK, cbErr) {
        this.ws = new WebSocket(rpcURL);
        this.ws.onerror = function (errEvent) {
            cbErr("Can't connect to the RPC API.")
        };
        this.ws.onclose = function (closeEvent) {
            this.ws = null;
            if (closeEvent.code == 1006) {
                console.log("Reconnecting");
                this.wsConnect(rpcURL, cbOK, cbErr);
            }
        };
        this.ws.onopen = cbOK;
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
    Web3Call(data, toContract, cb, cbErr) {
        const params = [{
                "data": data,
                "to": toContract
            },
            "latest"
        ];
        this.callId++;
        this.registerReplyHandler(cb, this.callId);
        if (this.ws) {

            this.registerErrorHandler(cbErr);
        }
        this.PostJSONRPC("eth_call", this.callId, params);
    }
    getTokens(contractAddr, cb, cbErr) {
        // Input the Uniswap v2 smart-contracts address
        // return (callback) array of the ERC20 smart-contracts pair addresses
        //  cb([addrToken0, addrToken1])
        var tokensAddresses = [];
        var decodeTokenAddr = (dataHex) => {
            if (dataHex) {
                // token0/1 returns (address)
                const addr = dataHex.slice(26);
                return "0x" + addr;
            } else
                cbErr("Error getting tokens address.")
        }
        var processToken1 = (dataHex) => {
            tokensAddresses.push(decodeTokenAddr(dataHex));
            cb(tokensAddresses);
        }
        var processToken0 = (dataHex) => {
            tokensAddresses.push(decodeTokenAddr(dataHex));
            this.Web3Call(token1Call, contractAddr, processToken1, cbErr);
        }
        this.Web3Call(token0Call, contractAddr, processToken0, cbErr);
    }
    getDecimals(contractAddr, cb, cbErr) {
        var decodeReserve = (dataHex) => {
            // decimals() returns (uint8 decimals)
            const tokenDecimals = parseInt(dataHex.slice(2, 66), 16);
            cb(tokenDecimals);
        }
        this.Web3Call(decimalsMethod, contractAddr, decodeReserve, cbErr);
    }
    contractsDecimal(contractAddresses, cb, cbErr) {
        // Input array of contract 2 addresses (the ERC20 smart-contracts pair)
        // return (callback) array of decimals of the ERC20 tokens
        var tokensDecimals = [];
        var processToken1 = (decimal1) => {
            tokensDecimals.push(decimal1);
            cb(tokensDecimals);
        }
        var processToken0 = (decimal0) => {
            tokensDecimals.push(decimal0);
            this.getDecimals(contractAddresses[1], processToken1, cbErr);
        }
        this.getDecimals(contractAddresses[0], processToken0, cbErr);
    }
    getReserves(contractAddr, shift0, shift1, cb, cbErr) {
        var decodeReserve = (dataHex) => {
            // getReserves returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)
            const reservesObj = {
                "_reserve0": parseInt(dataHex.slice(2, 66 - shift0), 16),
                "_reserve1": parseInt(dataHex.slice(66, 130 - shift1), 16),
                "_blockTimestampLast": parseInt(dataHex.slice(130, 194), 16)
            };
            cb(reservesObj);
        }
        this.Web3Call(getReservesMethod, contractAddr, decodeReserve, cbErr);
    }
    getLivePrice(pairContract, side, setTimerID, cb, cbErr) {

        var readPoolReserves = (pairDecimals) => {

            var computePrice = (resObj) => {
                var price = 0;
                if (side == 0)
                    price = resObj._reserve1 / resObj._reserve0 * shiftFactor;
                else
                    price = resObj._reserve0 / resObj._reserve1 * shiftFactor;
                cb(price);
            };

            var TOKEN_0_UNIT = pairDecimals[0];
            var TOKEN_1_UNIT = pairDecimals[1];
            // Shift with hex reading a millionth of the token unit
            var shift0 = Math.floor((3 * TOKEN_0_UNIT) / 4) - 5;
            var shift1 = Math.floor((3 * TOKEN_1_UNIT) / 4) - 5;
            if (shift0 < 0)
                shift0 = 0;
            if (shift1 < 0)
                shift1 = 0;
            var shiftFactor = 1;
            if (side == 0)
                shiftFactor = Math.pow(16, shift1 - shift0) * Math.pow(10, TOKEN_0_UNIT - TOKEN_1_UNIT);
            else
                shiftFactor = Math.pow(16, shift0 - shift1) * Math.pow(10, TOKEN_1_UNIT - TOKEN_0_UNIT);
            this.getReserves(pairContract, shift0, shift1, computePrice, cbErr);
            // Call getReserves every refresh time
            var timerID = window.setInterval(this.getReserves.bind(this), REFRESH_TIME, pairContract, shift0, shift1, computePrice, cbErr);
            // Callback to share the timerID
            setTimerID(timerID);
        }
        var readTokensContracts = (tokensContractArray) => {
            this.contractsDecimal(tokensContractArray, readPoolReserves, cbErr);
        }

        this.getTokens(pairContract, readTokensContracts, cbErr);
    }
}

export {
    Web3RPC,
};
