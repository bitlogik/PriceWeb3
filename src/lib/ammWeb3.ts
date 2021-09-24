// Copyright BitLogiK 2021. All Rights Reserved.
// PriceWeb3 : Web3 RPC calls for AMM pairs
// This file is licensed under the GNU Affero General Public License.
// License text available at http://www.gnu.org/licenses/agpl.txt


const REFRESH_TIME = 12000; // in ms : every 12 seconds

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

var ws = null;
var callId = 0;

function closeWebSocket() {
    if (ws != null) {
        ws.close();
    }
}

function openWebSocket(wsurl, openCallback, errCB) {
    ws = new WebSocket(wsurl);
    ws.onerror = function (errEvent) {
        errCB("Can't connect to the RPC API.")
    };
    ws.onclose = function(closeEvent) {
        ws = null;
        if (closeEvent.code == 1006) {
            console.log("Reconnecting");
            openWebSocket(wsurl, openCallback, errCB);
        }
    };
    ws.onopen = openCallback;
}

function registerReplyHandler(replyHandler, id) {
    if (ws)
        ws.onmessage = function(evt) {
            const reply = JSON.parse(evt.data)
            if (reply.id == id)
                replyHandler(reply.result);
        }
}

function registerErrorHandler(errorCallback) {
    ws.onerror = errorCallback;
}

function postDataJSON(dataObj) {
    const dataReq = JSON.stringify(dataObj);
    ws.send(dataReq);
}

function PostJSONRPC(method, id, params) {
    const reqObj = {
        "jsonrpc": "2.0",
        "id": id,
        "method": method,
        "params": params
    };
    postDataJSON(reqObj);
}

function Web3Call(data, toContract, cb, cbErr) {
    const params = [{
            "data": data,
            "to": toContract
        },
        "latest"
    ];
    callId++;
    registerReplyHandler(cb, callId);
    registerErrorHandler(cbErr);
    PostJSONRPC("eth_call", callId, params);
}

function getTokens(contractAddr, cb, cbErr) {
    // Input the Uniswap v2 smart-contracts address
    // return (callback) array of the ERC20 smart-contracts pair addresses
    //  cb([addrToken0, addrToken1])
    var tokensAddresses = [];
    var decodeTokenAddr = function (dataHex) {
        if (dataHex) {
            // token0/1 returns (address)
            const addr = dataHex.slice(26);
            return "0x" + addr;
        } else
            cbErr("Error getting tokens address.")
    }
    var processToken1 = function (dataHex) {
        tokensAddresses.push(decodeTokenAddr(dataHex));
        cb(tokensAddresses);
    }
    var processToken0 = function (dataHex) {
        tokensAddresses.push(decodeTokenAddr(dataHex));
        Web3Call(token1Call, contractAddr, processToken1, cbErr);
    }
    Web3Call(token0Call, contractAddr, processToken0, cbErr);
}

function getDecimals(contractAddr, cb, cbErr) {
    var decodeReserve = function (dataHex) {
        // decimals() returns (uint8 decimals)
        const tokenDecimals = parseInt(dataHex.slice(2, 66), 16);
        cb(tokenDecimals);
    }
    Web3Call(decimalsMethod, contractAddr, decodeReserve, cbErr);
}

function contractsDecimal(contractAddresses, cb, cbErr) {
    // Input array of contract 2 addresses (the ERC20 smart-contracts pair)
    // return (callback) array of decimals of the ERC20 tokens
    var tokensDecimals = [];
    var processToken1 = function (decimal1) {
        tokensDecimals.push(decimal1);
        cb(tokensDecimals);
    }
    var processToken0 = function (decimal0) {
        tokensDecimals.push(decimal0);
        getDecimals(contractAddresses[1], processToken1, cbErr);
    }
    getDecimals(contractAddresses[0], processToken0, cbErr);
}

function getReserves(contractAddr, shift0, shift1, cb, cbErr) {
    var decodeReserve = function (dataHex) {
        // getReserves returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)
        const reservesObj = {
            "_reserve0": parseInt(dataHex.slice(2, 66 - shift0), 16),
            "_reserve1": parseInt(dataHex.slice(66, 130 - shift1), 16),
            "_blockTimestampLast": parseInt(dataHex.slice(130, 194), 16)
        };
        cb(reservesObj);
    }
    Web3Call(getReservesMethod, contractAddr, decodeReserve, cbErr);
}

function getLivePrice(pairContract, side, setTimerID, cb, cbErr) {

    var readPoolReserves = function (pairDecimals) {

        var computePrice = function (resObj) {
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
        getReserves(pairContract, shift0, shift1, computePrice, cbErr);
        // Call getReserves every refresh time
        var timerID = window.setInterval(getReserves, REFRESH_TIME, pairContract, shift0, shift1, computePrice, cbErr);
        // Callback to share the timerID
        setTimerID(timerID);
    }
    var readTokensContracts = function (tokensContractArray) {
        contractsDecimal(tokensContractArray, readPoolReserves, cbErr);
    }

    getTokens(pairContract, readTokensContracts, cbErr);
}

export {
    getLivePrice,
    openWebSocket,
    closeWebSocket
};
