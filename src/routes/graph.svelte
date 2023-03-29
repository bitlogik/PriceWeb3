<script>

  import {onMount} from 'svelte';
  import {page} from '$app/stores';
  import Line from 'svelte-chartjs/src/Line.svelte';

  // Default values
  var qrobj;
  var rate;
  var days;
  var uprice;
  var unit;
  $: {
      qrobj = $page.query;
      loadData();
  }
  var inputRate = "APR";
  var tickStep = 40;  // 100% / 40 = 2.5%
  var maxVar = 3.4;   // +240%

  var maxGain = "";
  var ROI = "";
  var ROIprice = "";
  var beatHold = ["",""];
  var beatHoldPrices = ["",""];
  var generateX = (v, i) => {
    return (i/tickStep)+2/tickStep;
  };
  var printPrice = (p) => {
    var priceValue = uprice * p;
    var commaPos = 2;
    if (priceValue > 200)
        commaPos = 0;
    if (priceValue < 0.15)
        commaPos = 5;
    var tokPriceStr = priceValue.toFixed(commaPos);
    if (commaPos < 3)
        tokPriceStr = tokPriceStr.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return tokPriceStr + " " + unit;
  }
  var genLabels = (x) => {
    var pcVar = (x-1)*100;
    var pcVarStr = "";
    if (uprice && uprice>0) {
      return printPrice(x);
    }
    else {
      if (pcVar > 0)
        pcVarStr += "+ " + pcVar.toFixed(0);
      if (pcVar < 0)
        pcVarStr += "- " + (-pcVar).toFixed(0);
      if (pcVar == 0)
        pcVarStr += "0";
      return pcVarStr + " %";
    }
  }
  var holdValue = (x) => {
    return (x+1)/2;
  };
  var gainVShold = (x, amount) => {
    // Gain of the amount relative to hold
    return amount / holdValue(x);
  };
  var LPgain = (x) => {
    var gain = rate/100*days;
    if (inputRate=="APR")
      gain /= 365;
    return Math.sqrt(x) * 100 * (1+gain);
  };
  var relGain = (x) => {
    return gainVShold(x, LPgain(x));
  };
  
  var solveGainLimit = () => {
    // Minimum price change to ROI
    var effRate = rate/100*days;
    if (inputRate=="APR")
      effRate /= 365;
    return 100*(1/((1+effRate)*(1+effRate))-1);
  };
  var solveBeatHold = () => {
    // Prices change bounds to overperform hold
    var effRate = rate/100*days;
    if (inputRate=="APR")
      effRate /= 365;
    var baseLimit = (effRate*effRate)+2*effRate;
    var SqDiscrim = Math.sqrt(effRate*(effRate+1)*(effRate+1)*(effRate+2));
    return [200*(baseLimit-SqDiscrim), 200*(baseLimit+SqDiscrim)];
  };

  var xTick = Array.from({length:tickStep*maxVar}, generateX);
  var gainData = xTick.map(LPgain);
  var relGainData = xTick.map(relGain);
  var holdData = xTick.map(x => 100*holdValue(x))
  
  var getHeightRatio = () => {
    if (window.innerWidth <= 650)
      return 0.9;
    else if (window.innerWidth <= 900)
      return 1.5;
    return 1.75;
  };
  var changeInputRate = (evt) => {
    inputRate = evt.target.value;
    refreshData();
  }
  var refreshData = () => {
    data.labels = xTick.map(genLabels);
    data.datasets[0].data = xTick.map(LPgain);
    data.datasets[1].data = xTick.map(relGain);
    maxGain = (LPgain(1)-100).toFixed(1);
    var ROIn = solveGainLimit()
    ROI = ROIn.toFixed(1);
    ROIprice = printPrice(1+ROIn/100);
    var beatHoldn = solveBeatHold();
    beatHold = beatHoldn.map(l=>l.toFixed(1));
    beatHoldPrices = beatHoldn.map(x=>1+x/100).map(printPrice);
  };
  let data = {
    datasets: [
      {
        label: "Gain",
        borderColor: "#000f89",
        borderWidth: 3,
        borderJoinStyle: "round"
      },
      {
        label: "Relative",
        borderColor: "#32cd32",
        borderWidth: 3,
        borderJoinStyle: "round"
      },
      {
        label: "Hold",
        data:holdData,
        borderColor: "#ff7f50",
        borderWidth: 2,
        borderDash: [20, 8],
        borderJoinStyle: "round"
      },
      {
        label: "Flat ROI",
        data: Array.from({length:tickStep*maxVar}, x=>100),
        borderColor: "#F60026",
        borderWidth: 1,
        borderDash: [8, 8],
        borderJoinStyle: "round"
      },
      
    ],
    
  };
  let options = {
    aspectRatio: getHeightRatio(),
    responsive: true,
    animation: {duration:200},
    elements: {
        point: {
          radius: 0,
          hitRadius: 12,
          hoverRadius: 6
        },
    },
    interaction: {
      mode: 'index',
    },
    scales: {
      y: {
        max: 250,
      }
    },
    plugins: {
      legend: {
        position: 'top',
        maxHeight: 32,
        labels: {
            boxHeight:0,
            boxWidth: 20
        }
      },
      title: {
        display: false,
      },
    }
  }
window.addEventListener('resize', (evt) => {
  options.aspectRatio = getHeightRatio();
});
var loadData = () => {
  inputRate = "APR";
  if (qrobj.get("type") && qrobj.get("type").toLowerCase() == "dpr") {
    inputRate = "DPR";
  }
  var selectClassDOM = document.getElementsByClassName('select')[0];
  if (selectClassDOM) {
    var selectDOM = selectClassDOM.firstChild;
    selectDOM.value = inputRate;
  }
  rate = qrobj.get("rate")?qrobj.get("rate"):70 // APR %
  days = qrobj.get("days")?qrobj.get("days"):30 // days period
  uprice = qrobj.get("price")?qrobj.get("price"):""
  unit = "$";
  var titleDOM = document.getElementsByTagName("h2")[0]
  if(titleDOM)
    titleDOM.scrollIntoView();
  refreshData();
};
onMount(loadData);
</script>

<svelte:head>
  <title>Graph - PriceWeb3</title>
</svelte:head>

<div class="mt-6 has-text-centered">
  <h1>LP graph calculator</h1>
  <div class="mt-4 mb-0 box ">
    <div class="graphHeader">
      Maximum gain : +{maxGain} % <br>
      <div class="has-text-weight-bold mt-2">One side variation limits</div>
      R.O.I. breakeven : {ROI} % and above<br>
      {#if uprice && uprice>0}
        ROI Price > {ROIprice}<br>
      {/if}

      Beat the hold : {beatHold[0]}% to +{beatHold[1]}%<br>
      {#if uprice && uprice>0}
        {beatHoldPrices[0]} > Price > {beatHoldPrices[1]}<br>
      {/if}
    </div>
    <Line
      data={data}
      options={options}
      class="graph"
    />
  </div>
  <div class="graphTitle my-0 is-size-6">LP gain VS one side variation</div>
  <div class="columns is-mobile mt-4 mb-0">
    <div class="column p-1 is-offset-1 is-flex is-justify-content-end">
      <div class="is-size-5 column p-1 is-flex is-justify-content-end is-align-items-center mr-2">
        Rate
      </div>
      <input 
        class="input"
        type="text"
        placeholder={inputRate}
        bind:value={rate}
        on:keyup={refreshData}
      >
    </div>
    <div class="column p-1 has-text-left is-flex is-align-items-center ml-0">
      <div class="select" on:change={changeInputRate}>
        <select>
          <option value="DPR">% DPR</option>
          <option value="APR" selected>% APR</option>
        </select>
      </div>
    </div>
  </div>
  <div class="columns is-mobile mt-0 mb-3">
    <div class="is-size-5 column is-offset-1 is-justify-content-end p-1 is-flex is-align-items-center ml-3">
      deposit duration (days)
    </div>
    <div class="column p-1 is-flex is-justify-content-start">
      <input 
        class="input"
        type="text"
        placeholder="Days"
        bind:value={days}
        on:keyup={refreshData}
      >
    </div>
  </div>
  <div class="columns is-mobile mb-3">
    <div class="is-size-5 column is-offset-1 is-justify-content-end p-1 is-flex is-align-items-center ml-3">
      Moving token initial price
    </div>
    <div class="column p-1 is-flex is-justify-content-start">
      <input 
        class="input"
        type="text"
        placeholder="$"
        bind:value={uprice}
        on:keyup={refreshData}
      >
      <select bind:value={unit} on:change={refreshData}>
        <option>$</option>
        <option>€</option>
        <option>¥</option>
        <option>£</option>
        <option>¤</option>
      </select>
    </div>
  </div>
  
  <div class="example mb-4">
    This calculator is for automatic markets based on the constant product formula (x*y=K). It works for any services that implements the UniswapV2 protocol. Such as Quickswap, SushiSwap, Uniswap (v2),... This doesn't apply for different automatic markets with a different mechanism like Balancer or Curve.<br>
    The X axis is the variation of one side. Like a half token side in the liquidity pool.<br>
    At the start of the period, fund is shared 50%/50% between the 2 sides of the liquidity pool.<br><br>
    
    <span style="color:#000f89;font-weight:bold">Blue line</span> : What is the value you get by depositing $100 or a unit in liquidity after the defined period.<br>
    <span style="color:#32cd32;font-weight:bold">Green line</span> : Relative percentage compared to the same amount kept as "holding" the 2 assets.<br>
    <span style="color:#ff7f50">Orange dashed</span> : What is the value you get by just "holding" the 2 assets. The green line is the ratio (or gap) between this orange line and the the blue line.<br>
    <span style="color:#F60026">Red horizontal</span> : What is the value you get by keeping 100 stable units, like keeping $100 fund, you always get $100. This is the "ground 0 ROI" reference line.<br>
    
    <br>Blue curve is above the orange dashed diagonal = Green curve is above the red horizontal "unit" : you gain money relative to keeping 50/50 coins aka "hold". Opposite : Blue is below the orange dashed = Green is below the horizontal "unit" = you lose money relative to keeping coins.<br>
    
    Blue curve is above the red horizontal "unit" : you gain money from the beginning (but possibly less than holding because of impermanent losses). You'll end up with more than $100. Opposite : Blue is below the red horizontal "unit" : you lose money from the beginning. You'll end up with less than $100.<br>
    

    <br>Examples : With APR = 70%, during 90 days<br>
    - Both sides stable, no side gain nor lose (x= 0%) : you gain the full rate reward 17.3 %, which is also +17.3% than holding.<br>
    - The half coin side gains 85% (x= +85%) : you gain 59.5 %, which is +11.9% than holding.<br>
    - The half coin side loses 40% (x= -40%) : you lose 9.2 % (100-90.8), although value is +13.5% than holding.<br>
    - The half coin side loses 80% (x= -80%) : you lose 47.6 % (100-52.4), which is 11.9% worse than holding.<br>
    <br>Conditions :<br>
    - The other half side is fixed. This theory is good when one side of the liquidity is a stable coin (USDT, jEUR...), or your point of reference (XTZ, BTC, ETH,...).<br>
    - It doesn't take in account any trading, order, transaction fee. It supposes the fees to deposit and remove the liquidity are null or at least negligeable relative to the balance.<br>
    - If the rate includes an external farming reward denominated in a token, the computed result is for the current price of the reward token.
  </div>
</div>

<style>

  h2 {
    font-size: 1.2em;
  }
  input {
    max-width: 80px;
    background-color: #FCFCFD;
  }
  select:not([multiple]) {
    padding-right: 1.8rem;
    background-color: #FCFCFD;
  }
  .example {
    font-size: 0.8rem;
    text-align: justify;
    padding: 0.5rem 1.25rem;
  }
  .box {
    border-radius: 16px;
    background-color: #FCFCFD;
  }
  .graphHeader {
    display: inline-block;
    padding: 1rem;
    border-width: 1px;
    border-style: solid;
    border-color: #0d2b4e;
    border-radius: 3px;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 531px) {
    .graphHeader {
      padding: 0.75rem 0.36rem;
      font-size: 1rem;
    }
  }

</style>
