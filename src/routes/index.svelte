<script context="module" lang="ts">
    export const prerender = true;
</script>

<script lang="ts">

    import {onDestroy} from 'svelte';
    import {Web3RPC} from '$lib/ammWeb3.ts';

    // Polygon/Matic Web3 API endpoint
    const WEB3_RPC = "wss://ws-matic-mainnet.chainstacklabs.com";

    var err = "";
    var token0Name = "";
    var token1Name = "";
    var price = "";
    var side = 1;
    var refreshTimerId = 0;
    const pairsInfo = {
        "USDC/ETH": {
            contract: "0x34965ba0ac2451A34a0471F04CCa3F990b8dea27"
        },
        "MATIC/ETH": {
            contract: "0xc4e595acDD7d12feC385E5dA5D43160e8A0bAC0E"
        },
        "BTC/USDC": {
            contract: "0xd02b870c556480491c70aaf98c297fddd93f6f5c"
        },
        "BTC/ETH": {
            contract: "0xe62ec2e799305e0d367b0cc3ee2cda135bf89816"
        },
        "ETH/AAVE": {
            contract: "0x2813d43463c374a680f235c428fb1d7f08de0b69"
        },
        "MATIC/USDC": {
            contract: "0xcd353f79d9fade311fc3119b841e1f456b54e858"
        },
        "SUSHI/WETH": {
            contract: "0xb5846453b67d0b4b4ce655930cf6e4129f4416d7"
        },
        "AVAX/ETH": {
            contract: "0x1274de0de2e9d9b1d0e06313c0e5edd01cc335ef"
        },
        "USDC/DINO": {
            contract: "0x3324af8417844e70b81555a6d1568d78f4d4bf1f"
        }
    };
    var currentPair = Object.keys(pairsInfo)[0];

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
        price = "";
        if (Object.prototype.toString.call(errTxt) === "[object String]")
            err = errTxt;
        else
            err = "Error";
    }

    function printPrice(priceValue) {
        console.log("Price :", priceValue);
        var commaPos = 2;
        if (priceValue > 200)
            commaPos = 0;
        if (priceValue < 0.15)
            commaPos = 5;
        var tokPriceStr = priceValue.toFixed(commaPos);
        if (commaPos < 3)
            tokPriceStr = tokPriceStr.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        token0Name = currentPair.split("/")[side % 2];
        token1Name = currentPair.split("/")[(side + 1) % 2];
        err = "";
        document.title = `PriceWeb3 - ${tokPriceStr} ${token1Name}`;
        price = tokPriceStr;
    }
    function getPrice() {
        // cancel the existing refresh timer
        if (refreshTimerId != 0)
            stopTimer();
        price = "";
        web3.getLivePrice(pairsInfo[currentPair].contract, side, setTimerID, printPrice, printErr);
    }
    function pairChanged(evt) {
        currentPair = evt.target.value;
        getPrice();
    }
    function changeSide() {
        side = (side + 1) % 2;
        getPrice();
    }

    var web3 = new Web3RPC(WEB3_RPC, getPrice, printErr);

</script>

<svelte:head>
    <title>PriceWeb3</title>
</svelte:head>

<section class="hero">
  <h1>PriceWeb3</h1>
  <div class="hero-body has-text-centered">
    <div class="login">
      <div>Realtime Price<br>
      on SushiSwap (Polygon)</div>
      <div class="select is-rounded">
        <select on:change={pairChanged}>
            {#each Object.keys(pairsInfo) as pair}
                <option value={pair}>
                    {pair}
                </option>
            {/each}
        </select>
      </div>
      
      <div class="priceOut">
        {#if price}
            1 {token0Name} =<br>
            {price} {token1Name}
        {:else}
            Loading price ...
        {/if}
      </div>
      <div class="error">{err}</div>
      {#if price}
        <div id="invert" on:click={changeSide}><img class="swpimg" src="/swap.svg" /> invert</div>
      {/if}
    </div>
  </div>
</section>


<style>
section {
  font-size: 1.2em;
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

.login {
  border-radius: 16px;
  padding: 2.5rem 0;
  width: 300px;
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
.hero-body {
  flex-grow: unset;
}
input {
  background: #D9DDE6 !important;
}

a {
  font-weight: 600;
}
</style>
