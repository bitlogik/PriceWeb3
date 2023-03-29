<script context="module" lang="ts">
    export const prerender = true;
</script>

<script lang="ts">

    import {onDestroy, tick, onMount} from 'svelte';
    import {Web3RPC} from '$lib/ammWeb3.ts';

    // Polygon/Matic Web3 API endpoint
    const WEB3_RPC = "https://rpc.ankr.com/polygon";

    var err = "";
    var warn = "";
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
    "MATIC": {
        "decimals": 18,
        "addr": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    },
    "USDT": {
        "decimals": 6,
        "addr": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    },
    "USDC": {
        "decimals": 6,
        "addr": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    },
    "BNB": {
        "decimals": 18,
        "addr": "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3"
    },
    "BUSD": {
        "decimals": 18,
        "addr": "0xdab529f40e671a1d4bf91361c21bf9f0c9712ab7"
    },
    "SHIB": {
        "decimals": 18,
        "addr": "0x6f8a06447ff6fcf75d803135a7de15ce88c1d4ec"
    },
    "AVAX": {
        "decimals": 18,
        "addr": "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b"
    },
    "DAI": {
        "decimals": 18,
        "addr": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
    },
    "UNI": {
        "decimals": 18,
        "addr": "0xb33eaad8d922b1083446dc23f610c2567fb5180f"
    },
    "LINK": {
        "decimals": 18,
        "addr": "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39"
    },
    "LEO": {
        "decimals": 18,
        "addr": "0x06d02e9d62a13fc76bb229373fb3bbbd1101d2fc"
    },
    "TUSD": {
        "decimals": 18,
        "addr": "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756"
    },
    "LDO": {
        "decimals": 18,
        "addr": "0xc3c7d422809852031b44ab29eec9f1eff2a58756"
    },
    "CRO": {
        "decimals": 8,
        "addr": "0xada58df0f643d959c2a47c9d4d4c1a4defe3f11c"
    },
    "APE": {
        "decimals": 18,
        "addr": "0xB7b31a6BC18e48888545CE79e83E06003bE70930"
    },
    "GRT": {
        "decimals": 18,
        "addr": "0x5fe2b58c013d7601147dcdd68c143a77499f5531"
    },
    "FTM": {
        "decimals": 18,
        "addr": "0xc9c1c1c20b3658f8787cc2fd702267791f224ce1"
    },
    "SAND": {
        "decimals": 18,
        "addr": "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683"
    },
    "MANA": {
        "decimals": 18,
        "addr": "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4"
    },
    "FRAX": {
        "decimals": 18,
        "addr": "0x45c32fa6df82ead1e2ef74d17b76547eddfaff89"
    },
    "AAVE": {
        "decimals": 18,
        "addr": "0xd6df932a45c0f255f85145f286ea0b292b21c90b"
    },
    "THETA": {
        "decimals": 18,
        "addr": "0xb46e0ae620efd98516f49bb00263317096c114b2"
    },
    "RPL": {
        "decimals": 18,
        "addr": "0x7205705771547cf79201111b4bd8aaf29467b9ec"
    },
    "PAX": {
        "decimals": 18,
        "addr": "0x6f3b3286fd86d8b47ec737ceb3d0d354cc657b3e"
    },
    "SNX": {
        "decimals": 18,
        "addr": "0x50b728d8d964fd00c2d0aad81718b71311fef68a"
    },
    "USDD": {
        "decimals": 18,
        "addr": "0xffa4d863c96e743a2e1513824ea006b8d0353c57"
    },
    "CRV": {
        "decimals": 18,
        "addr": "0x172370d5cd63279efa6d502dab29171933a610af"
    },
    "CHZ": {
        "decimals": 18,
        "addr": "0xf1938ce12400f9a761084e7a80d37e732a4da056"
    },
    "MKR": {
        "decimals": 18,
        "addr": "0x6f7C932e7684666C9fd1d44527765433e01fF61d"
    },
    "HT": {
        "decimals": 18,
        "addr": "0xfad65eb62a97ff5ed91b23afd039956aaca6e93b"
    },
    "FXS": {
        "decimals": 18,
        "addr": "0x1a3acf6d19267e2d3e7f898f42803e90c9219062"
    },
    "PAXG": {
        "decimals": 18,
        "addr": "0x553d3d295e0f695b9228246232edf400ed3560b5"
    },
    "AGIX": {
        "decimals": 8,
        "addr": "0x190eb8a183d22a4bdf278c6791b152228857c033"
    },
    "MASK": {
        "decimals": 18,
        "addr": "0x2b9e7ccdf0f4e5b24757c1e1a80e311e34cb10c7"
    },
    "LRC": {
        "decimals": 18,
        "addr": "0x84e1670f61347cdaed56dcc736fb990fbb47ddc1"
    },
    "RNDR": {
        "decimals": 18,
        "addr": "0x61299774020da444af134c82fa83e3810b309991"
    },
    "1INCH": {
        "decimals": 18,
        "addr": "0x9c2c5fd7b07e95ee044ddeba0e97a665f142394f"
    },
    "NEXO": {
        "decimals": 18,
        "addr": "0x41b3966b4ff7b427969ddf5da3627d6aeae9a48e"
    },
    "WOO": {
        "decimals": 18,
        "addr": "0x1b815d120b3ef02039ee11dc2d33de7aa4a8c603"
    },
    "GUSD": {
        "decimals": 2,
        "addr": "0xc8a94a3d3d2dabc3c1caffffdca6a7543c3e3e65"
    },
    "ENJ": {
        "decimals": 18,
        "addr": "0x7ec26842f195c852fa843bb9f6d8b583a274a157"
    },
    "FET": {
        "decimals": 18,
        "addr": "0x7583feddbcefa813dc18259940f76a02710a8905"
    },
    "BAT": {
        "decimals": 18,
        "addr": "0x3cef98bb43d732e2f285ee605a8158cde967d219"
    },
    "INJ": {
        "decimals": 18,
        "addr": "0x4e8dc2149eac3f3def36b1c281ea466338249371"
    },
    "HOT": {
        "decimals": 18,
        "addr": "0x0c51f415cf478f8d08c246a6c6ee180c5dc3a012"
    },
    "GNO": {
        "decimals": 18,
        "addr": "0x5ffd62d3c3ee2e81c00a7b9079fb248e7df024a8"
    },
    "COMP": {
        "decimals": 18,
        "addr": "0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c"
    },
    "YFI": {
        "decimals": 18,
        "addr": "0xda537104d6a5edd53c6fbba9a898708e465260b6"
    }
};


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
