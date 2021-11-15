<script context="module" lang="ts">
    export const prerender = true;
</script>

<script lang="ts">

    import {onDestroy, tick } from 'svelte';
    import {Web3RPC} from '$lib/ammWeb3.ts';

    // Polygon/Matic Web3 API endpoint
    const WEB3_RPC = "https://polygon-rpc.com";

    var err = "";
    var token0Name = "";
    var token1Name = "";
    var price = "";
    var refreshTimerId = 0;

const tokens = {
    "ETH": {
        "decimals": 18,
        "addr": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
    },
    "BTC": {
        "decimals": 8,
        "addr": "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
    },
    "USDT": {
        "decimals": 6,
        "addr": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    },
    "USDC": {
        "decimals": 6,
        "addr": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    },
    "LINK": {
        "decimals": 18,
        "addr": "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39"
    },
    "CRO": {
        "decimals": 8,
        "addr": "0xada58df0f643d959c2a47c9d4d4c1a4defe3f11c"
    },
    "BUSD": {
        "decimals": 18,
        "addr": "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7"
    },
    "UNI": {
        "decimals": 18,
        "addr": "0xb33eaad8d922b1083446dc23f610c2567fb5180f"
    },
    "DAI": {
        "decimals": 18,
        "addr": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
    },
    "THETA": {
        "decimals": 18,
        "addr": "0xb46e0ae620efd98516f49bb00263317096c114b2"
    },
    "FTM": {
        "decimals": 18,
        "addr": "0xc9c1c1c20b3658f8787cc2fd702267791f224ce1"
    },
    "GRT": {
        "decimals": 18,
        "addr": "0x5fe2b58c013d7601147dcdd68c143a77499f5531"
    },
    "UST": {
        "decimals": 18,
        "addr": "0x692597b009d13c4049a947cab2239b7d6517875f"
    },
    "MANA": {
        "decimals": 18,
        "addr": "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4"
    },
    "AAVE": {
        "decimals": 18,
        "addr": "0xd6df932a45c0f255f85145f286ea0b292b21c90b"
    },
    "LRC": {
        "decimals": 18,
        "addr": "0x84e1670f61347cdaed56dcc736fb990fbb47ddc1"
    },
    "CHZ": {
        "decimals": 18,
        "addr": "0xf1938ce12400f9a761084e7a80d37e732a4da056"
    },
    "ENJ": {
        "decimals": 18,
        "addr": "0x7ec26842f195c852fa843bb9f6d8b583a274a157"
    },
    "LEO": {
        "decimals": 18,
        "addr": "0x06d02e9d62a13fc76bb229373fb3bbbd1101d2fc"
    },
    "MKR": {
        "decimals": 18,
        "addr": "0x6f7C932e7684666C9fd1d44527765433e01fF61d"
    },
    "AMP": {
        "decimals": 18,
        "addr": "0x0621d647cecbfb64b79e44302c1933cb4f27054d"
    },
    "SAND": {
        "decimals": 18,
        "addr": "0xc6d54d2f624bc83815b49d9c2203b1330b841ca0"
    },
    "HOT": {
        "decimals": 18,
        "addr": "0x0c51f415cf478f8d08c246a6c6ee180c5dc3a012"
    },
    "COMP": {
        "decimals": 18,
        "addr": "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c"
    },
    "SUSHI": {
        "decimals": 18,
        "addr": "0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a"
    },
    "IOTX": {
        "decimals": 18,
        "addr": "0xf6372cdb9c1d3674e83842e3800f2a62ac9f3c66"
    },
    "CEL": {
        "decimals": 4,
        "addr": "0xd85d1e945766fea5eda9103f918bd915fbca63e6"
    },
    "SNX": {
        "decimals": 18,
        "addr": "0x50b728d8d964fd00c2d0aad81718b71311fef68a"
    },
    "NEXO": {
        "decimals": 18,
        "addr": "0x41b3966b4ff7b427969ddf5da3627d6aeae9a48e"
    },
    "BAT": {
        "decimals": 18,
        "addr": "0x3cef98bb43d732e2f285ee605a8158cde967d219"
    },
    "LPT": {
        "decimals": 18,
        "addr": "0x3962f4a0a0051dcce0be73a7e09cef5756736712"
    },
    "HT": {
        "decimals": 18,
        "addr": "0xfad65eb62a97ff5ed91b23afd039956aaca6e93b"
    },
    "OMG": {
        "decimals": 18,
        "addr": "0x62414d03084eeb269e18c970a21f45d2967f0170"
    },
    "CRV": {
        "decimals": 18,
        "addr": "0x172370d5cd63279efa6d502dab29171933a610af"
    },
    "YFI": {
        "decimals": 18,
        "addr": "0xda537104d6a5edd53c6fbba9a898708e465260b6"
    },
    "TUSD": {
        "decimals": 18,
        "addr": "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756"
    },
    "TEL": {
        "decimals": 2,
        "addr": "0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32"
    },
    "UMA": {
        "decimals": 18,
        "addr": "0x3066818837c5e6ed6601bd5a91b0762877a6b731"
    },
    "renBTC": {
        "decimals": 8,
        "addr": "0xdbf31df14b66535af65aac99c32e9ea844e14501"
    },
    "BNT": {
        "decimals": 18,
        "addr": "0xc26d47d5c33ac71ac5cf9f776d63ba292a4f7842"
    },
    "ZRX": {
        "decimals": 18,
        "addr": "0x5559edb74751a0ede9dea4dc23aee72cca6be3d5"
    },
    "PAX": {
        "decimals": 18,
        "addr": "0x6f3b3286fd86d8b47ec737ceb3d0d354cc657b3e"
    },
    "FRAX": {
        "decimals": 18,
        "addr": "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89"
    },
    "SRM": {
        "decimals": 6,
        "addr": "0x6bf2eb299e51fc5df30dec81d9445dde70e3f185"
    },
    "ELON": {
        "decimals": 18,
        "addr": "0xe0339c80ffde91f3e20494df88d4206d86024cdf"
    },
    "RPL": {
        "decimals": 18,
        "addr": "0x7205705771547cf79201111b4bd8aaf29467b9ec"
    },
    "XYO": {
        "decimals": 18,
        "addr": "0xd2507e7b5794179380673870d88b22f94da6abe0"
    },
    "1INCH": {
        "decimals": 18,
        "addr": "0x9c2c5fd7b07e95ee044ddeba0e97a665f142394f"
    },
    "FXS": {
        "decimals": 18,
        "addr": "0x1a3acf6d19267e2d3e7f898f42803e90c9219062"
    }
};


    var SushiSwapFactoryAddress = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    var tokenA = Object.keys(tokens)[0];  //  ETH
    var tokenB = Object.keys(tokens)[3];  // USDC

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
        console.log("ERROR");
        console.log(errTxt);
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
            commaPos = 6;
        var tokPriceStr = priceValue.toFixed(commaPos);
        if (commaPos < 3)
            tokPriceStr = tokPriceStr.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        token0Name = tokenA;
        token1Name = tokenB;
        err = "";
        document.title = `PriceWeb3 - ${tokPriceStr} ${token1Name}`;
        price = tokPriceStr;
    }
    function getPrice() {
        // Cancel the existing refresh timer
        if (refreshTimerId != 0)
            stopTimer();
        price = "";
        var tokenAdata = tokens[tokenA];
        var tokenBdata = tokens[tokenB];
        var side = 0;
        if (parseInt(tokenAdata.addr, 16) > parseInt(tokenBdata.addr, 16))
            side = 1;
        web3.getLivePrice(SushiSwapFactoryAddress, tokenAdata, tokenBdata, side, setTimerID, printPrice, printErr);
    }
    function pairChanged(evt) {
        tick().then(() => { // Wait for tokens variable refreshed
            closeAll();
            getPrice();
        });
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
      
      
      <div class="select">
        <select on:change={pairChanged} bind:value={tokenA}>
            {#each Object.keys(tokens) as token1}
                <option value={token1}>
                    {token1}
                </option>
            {/each}
        </select>
      </div>
      price in
      <div class="select">
        <select on:change={pairChanged} bind:value={tokenB}>
            {#each Object.keys(tokens) as token2}
                <option value={token2}>
                    {token2}
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
