// Copyright BitLogiK 2021. All Rights Reserved.
// PriceWeb3 : Web3 RPC calls for AMM pairs
// This file is licensed under the GNU Affero General Public License.
// License text available at http://www.gnu.org/licenses/agpl.txt


const REFRESH_TIME = 15000; // in ms : every 15 seconds


// Uniswap v2 / SushiSwap and clones factory calls
// getPair(address,address)
const getPairMethod = "0xe6a43905";

// Uniswap v2 / SushiSwap and clones LP calls
//   For a pair, LP contract
//   https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair
// getReserves()
const getReservesMethod = "0x0902f1ac";

//  ERC20 calls for tokens
// decimals()
const decimalsMethod = "0x313ce567";
// symbol() Get the token name
// const symbolMethod = "0x95d89b41";


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
    getDecimals(contractAddr, cb, cbErr) {
        var decodeReserve = (dataHex) => {
            console.log("get decimals");
            console.log(dataHex);
            // decimals() returns (uint8 decimals)
            const tokenDecimals = parseInt(dataHex.slice(2, 66), 16);
            cb(tokenDecimals);
        }
        this.Web3Call(decimalsMethod, contractAddr, decodeReserve, cbErr);
    }
    getPair(factoryContract, token0addr, token1addr, cb, cbErr){
        var decodePair = (dataHex) => {
            console.log("get pair");
            console.log(dataHex);
            cb("0x" + dataHex.slice(26));
            // cbErr no pair
        }
        var token0uintAddr = token0addr;
        var token1uintAddr = token1addr;
        if (token0uintAddr.startsWith("0x"))
            token0uintAddr = token0uintAddr.slice(2);
        if (token1uintAddr.startsWith("0x"))
            token1uintAddr = token1uintAddr.slice(2);
        token0uintAddr = "000000000000000000000000" + token0uintAddr;
        token1uintAddr = "000000000000000000000000" + token1uintAddr;
        var dataArg = getPairMethod+ token0uintAddr + token1uintAddr;
        this.Web3Call(dataArg, factoryContract, decodePair, cbErr);
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
    getLivePrice(swapFactory, token0, token1, side, setTimerID, cb, cbErr) {

        var readTokensContracts = (pairContract) => {

            var readPoolReserves = () => {

                var computePrice = (resObj) => {
                    var price = 0;
                    if (side == 0)
                        price = resObj._reserve1 / resObj._reserve0;
                    else
                        price = resObj._reserve0 / resObj._reserve1;
                    cb(price * shiftFactor);
                };

                var TOKEN_0_UNIT = token0.decimals;
                var TOKEN_1_UNIT = token1.decimals;
                // Shift with hex reading a millionth of the token unit
                var shift0 = Math.floor((3 * token0.decimals) / 4) - 5;
                if (shift0 < 0)
                    shift0 = 0;
                var shift1 = Math.floor((3 * token1.decimals) / 4) - 5;
                if (shift1 < 0)
                    shift1 = 0;
                var shiftFactor = Math.pow(16, shift1 - shift0) * Math.pow(10, token0.decimals - token1.decimals);
                if (side == 1)
                    [shift0, shift1] = [shift1, shift0];
                this.getReserves(pairContract, shift0, shift1, computePrice, cbErr);
                // Call getReserves every refresh time
                var timerID = window.setInterval(this.getReserves.bind(this), REFRESH_TIME, pairContract, shift0, shift1, computePrice, cbErr);
                // Callback to share the timerID
                setTimerID(timerID);
            }
            
            // this.contractsDecimal(tokensContractArray, readPoolReserves, cbErr);
            readPoolReserves();
            
        }
        this.getPair(swapFactory, token0.addr, token1.addr, readTokensContracts, console.log);
    }
}

export {
    Web3RPC,
};
