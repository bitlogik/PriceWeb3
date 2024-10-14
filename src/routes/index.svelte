<script context="module" lang="ts">
    export const prerender = true;
</script>

<script lang="ts">

    import {onDestroy, tick, onMount} from 'svelte';
    import {Web3RPC} from '$lib/thinWeb3.js';
    import {tokens} from '$lib/tokens.js';

    // Polygon/Matic Web3 API endpoint
    const WEB3_RPC = "https://rpc.ankr.com/polygon";

    const REFRESH_TIME = 15000; // in ms : every 15 seconds

    // Uniswap v2 / SushiSwap and clones factory calls
    // getPair(address,address)
    const getPairMethod = "0xe6a43905";

    // Uniswap v2 / SushiSwap and clones LP calls
    //   For a pair, LP contract
    //   https://docs.uniswap.org/protocol/V2/reference/smart-contracts/pair
    // getReserves()
    const getReservesMethod = "0x0902f1ac";

    const ZERO256 = "0x0000000000000000000000000000000000000000000000000000000000000000";

    var err = "";
    var warn = "";
    var token0Name = "";
    var token1Name = "";
    var price = "";
    var refreshTimerId = 0;

    var SushiSwapFactoryAddress = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const TokAInitIdx = 0;  //  ETH
    const TokBInitIdx = 4;  // USDC

    var tokenA = Object.keys(tokens)[TokAInitIdx];
    var tokenB = Object.keys(tokens)[TokBInitIdx];

    onMount(() => {
        tick().then(() => {
            var sels = document.getElementsByTagName('select');
            sels[0].selectedIndex = TokAInitIdx;
            sels[1].selectedIndex = TokBInitIdx;
            web3 = new Web3RPC(WEB3_RPC, getPrice, printErr);
        });
    })

    function setTimerID(timerId) {
        refreshTimerId = timerId;
    }
    function closeAll() {
        stopTimer();
        web3.close();
    }
    function stopTimer() {
        if (refreshTimerId > 0)
            clearInterval(refreshTimerId);
        refreshTimerId = 0;
    }

    onDestroy(closeAll);

    function getPair(factoryContract, token0addr, token1addr, cb, cbErr){
        var decodePair = (dataHex) => {
            console.log("get pair");
            console.log(dataHex);
            if (dataHex == ZERO256 || dataHex == "0x")
                cbErr("No market for this pair.")
            else
                cb("0x" + dataHex.slice(26));
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
        web3.Web3Call(dataArg, factoryContract, decodePair, cbErr);
    }
    function getReserves(contractAddr, shift0, shift1, cb, cbErr) {
        var decodeReserve = (dataHex) => {
            // getReserves returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)
            const reservesObj = {
                "_reserve0": parseInt(dataHex.slice(2, 66 - shift0), 16),
                "_reserve1": parseInt(dataHex.slice(66, 130 - shift1), 16),
                "_blockTimestampLast": parseInt(dataHex.slice(130, 194), 16)
            };
            cb(reservesObj);
        }
        web3.Web3Call(getReservesMethod, contractAddr, decodeReserve, cbErr);
    }
    function getLivePrice(swapFactory, token0, token1, side, setTimerID, cb, cbErr, warnCb) {

        var readTokensContracts = (pairContract) => {

            var readPoolReserves = () => {

                var computePrice = (resObj) => {
                    var price = 0;
                    console.log(resObj._reserve0);
                    console.log(resObj._reserve1);
                    if (resObj._reserve0 < 10000000 && resObj._reserve1 < 10000000)
                        warnCb("Low liquidity and accuracy");
                    if (side == 0)
                        price = resObj._reserve1 / resObj._reserve0;
                    else
                        price = resObj._reserve0 / resObj._reserve1;
                    cb(price * shiftFactor);
                };

                var TOKEN_0_UNIT = token0.decimals;
                var TOKEN_1_UNIT = token1.decimals;
                // Shift with hex reading a millionth of the token unit
                var shift0 = Math.floor((3 * TOKEN_0_UNIT) / 4) - 5;
                if (shift0 < 0)
                    shift0 = 0;
                var shift1 = Math.floor((3 * TOKEN_1_UNIT) / 4) - 5;
                if (shift1 < 0)
                    shift1 = 0;
                var shiftFactor = Math.pow(16, shift1 - shift0) * Math.pow(10, TOKEN_0_UNIT - TOKEN_1_UNIT);
                if (side == 1)
                    [shift0, shift1] = [shift1, shift0];
                getReserves(pairContract, shift0, shift1, computePrice, cbErr);
                // Call getReserves every refresh time
                var timerID = window.setInterval(getReserves.bind(this), REFRESH_TIME, pairContract, shift0, shift1, computePrice, cbErr);
                // Callback to share the timerID
                setTimerID(timerID);
            }

            readPoolReserves();
        }
        getPair(swapFactory, token0.addr, token1.addr, readTokensContracts, cbErr);
    }

    function printErr(errTxt) {
        console.log("ERROR");
        console.log(errTxt);
        if (Object.prototype.toString.call(errTxt) === "[object String]")
            err = errTxt;
        else
            err = "Error";
    }
    function printWarn(errTxt) {
        console.log("Warning");
        console.log(errTxt);
        if (Object.prototype.toString.call(errTxt) === "[object String]")
            warn = errTxt;
        else
            warn = "Warning";
    }

    function printPrice(priceValue) {
        console.log("Price :", priceValue);
        token0Name = tokenA;
        token1Name = tokenB;
        var commaPos = 2;
        if (priceValue > 200)
            commaPos = 0;
        if (priceValue < 0.15)
            commaPos = 6;
        var tokPriceStr = priceValue.toFixed(commaPos);
        if (commaPos < 3)
            tokPriceStr = tokPriceStr.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        document.title = `PriceWeb3 ${tokPriceStr} ${token1Name}`;
        price = tokPriceStr;
    }
    function getPrice() {
        // Cancel the existing refresh timer
        if (refreshTimerId != 0)
            stopTimer();
        if (tokenA == tokenB) {
            warn = "Same unit"
            printPrice(1);
            return;
        }
        var tokenAdata = tokens[tokenA];
        var tokenBdata = tokens[tokenB];
        var side = 0;
        if (parseInt(tokenAdata.addr, 16) > parseInt(tokenBdata.addr, 16))
            side = 1;
        getLivePrice(SushiSwapFactoryAddress, tokenAdata, tokenBdata, side, setTimerID, printPrice, printErr, printWarn);
    }
    function pairAChanged(evt) {
        tokenA = evt.target.value;
        pairChanged();
    }
    function pairBChanged(evt) {
        tokenB = evt.target.value;
        pairChanged();
    }
    function pairChanged() {
        price = "";
        warn = "";
        err = "";
        closeAll();
        web3 = new Web3RPC(WEB3_RPC, getPrice, printErr);
    }

    var web3 = null;

</script>

<svelte:head>
    <title>PriceWeb3</title>
</svelte:head>

<section class="hero">
  <h1>Price Web3</h1>
  <div class="hero-body has-text-centered">
    <div class="login">
      <div>
        DeFi Realtime Price<br>
        <small>on SushiSwap (Polygon)</small>
      </div>
      
      <div class="columns is-mobile ml-2">
        <div class="column">
            <div class="select">
                <select on:change={pairAChanged}>
                    {#each Object.keys(tokens) as token1}
                        <option value={token1}>
                            {token1}
                        </option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="column midcol">
            in
        </div>
        <div class="column mr-2">
            <div class="select">
                <select on:change={pairBChanged}>
                    {#each Object.keys(tokens) as token2}
                        <option value={token2}>
                            {token2}
                        </option>
                    {/each}
                </select>
            </div>
        </div>
      </div>
      <div class="priceOut">
        {#if price}
            1 {token0Name} =<br>
            {price} {token1Name}
        {:else if !err}
            Loading price ...
        {/if}
      </div>
      <div class="error">{err}</div>
      <div class="warning">{warn}</div>
    </div>
  </div>
</section>


<style>
section {
  font-size: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  margin-top: 3rem;
}

.hero-body {
  justify-content: center;
  padding-top: 1.5rem;
}
.select select:not([multiple]) {
  padding-right: 0.9em;
}
.select:not(.is-multiple):not(.is-loading)::after {
  right: 0.4em;
}
.midcol {
  padding-top: 1.2em;
}
.login {
  border-radius: 16px;
  padding: 2.5rem 0;
  width: 280px;
  box-shadow: 8px 8px 15px #D9DDE6;
  background-color: #f8f8fd;
}

.login > * {
  margin: 0.4em 0;
}

.priceOut {
  font-size: 1.2em;
}

#invert {
  margin: 24px 88px;
  padding: 5px 0px 6px 0;
  border: 2px solid;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fdfdfd;
}
.swpimg {
  width: 1.2em;
  margin-bottom: -0.25em;
  margin-right: 0.5em;
}
.error {
  color: #EE4040;
}
.warning {
  color: #FFAB4F;
}
.hero-body {
  flex-grow: unset;
}
input {
  background: #D9DDE6 !important;
}

a {
  font-weight: 600;
}

small {
  font-size: 0.75em;
}

@media (min-width: 720px) {
  .login {
    padding: 2.75rem 0.5rem;
    width: 360px;
  }
  section {
    font-size: 1.25em;
  }
}
</style>
