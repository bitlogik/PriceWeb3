<script context="module" lang="ts">
    export const prerender = true;
</script>

<script lang="ts">

    import {onDestroy, tick, onMount} from 'svelte';
    import {Web3RPC} from '$lib/ammWeb3.ts';
    import {tokens} from '$lib/tokens.js';

    // Polygon/Matic Web3 API endpoint
    const WEB3_RPC = "https://rpc.ankr.com/polygon";

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
            getPrice();
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
        web3.getLivePrice(SushiSwapFactoryAddress, tokenAdata, tokenBdata, side, setTimerID, printPrice, printErr, printWarn);
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
        getPrice();
    }

    var web3 = new Web3RPC(WEB3_RPC, printErr);

</script>

<svelte:head>
    <title>PriceWeb3</title>
</svelte:head>

<section class="hero">
  <h1>PriceWeb3</h1>
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
