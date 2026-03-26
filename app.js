<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
<script>
const stateData = {
  "01":{"name":"Alabama","income":54943,"rent":841,"class":"1-1"},
  "02":{"name":"Alaska","income":77790,"rent":1258,"class":"3-3"},
  "04":{"name":"Arizona","income":65913,"rent":1162,"class":"2-2"},
  "05":{"name":"Arkansas","income":50540,"rent":808,"class":"1-1"},
  "06":{"name":"California","income":84097,"rent":1747,"class":"3-3"},
  "08":{"name":"Colorado","income":82756,"rent":1480,"class":"3-3"},
  "09":{"name":"Connecticut","income":83572,"rent":1259,"class":"3-3"},
  "10":{"name":"Delaware","income":72724,"rent":1144,"class":"2-3"},
  "11":{"name":"District of Columbia","income":101027,"rent":1657,"class":"3-3"},
  "12":{"name":"Florida","income":63061,"rent":1392,"class":"3-1"},
  "13":{"name":"Georgia","income":65030,"rent":1148,"class":"2-2"},
  "15":{"name":"Hawaii","income":88005,"rent":1858,"class":"3-3"},
  "16":{"name":"Idaho","income":63377,"rent":1020,"class":"2-2"},
  "17":{"name":"Illinois","income":72205,"rent":1050,"class":"2-2"},
  "18":{"name":"Indiana","income":62743,"rent":883,"class":"1-1"},
  "19":{"name":"Iowa","income":65429,"rent":815,"class":"1-2"},
  "20":{"name":"Kansas","income":64124,"rent":882,"class":"1-2"},
  "21":{"name":"Kentucky","income":55573,"rent":836,"class":"1-1"},
  "22":{"name":"Louisiana","income":52087,"rent":877,"class":"1-1"},
  "23":{"name":"Maine","income":63001,"rent":1004,"class":"2-1"},
  "24":{"name":"Maryland","income":94991,"rent":1499,"class":"3-3"},
  "25":{"name":"Massachusetts","income":89645,"rent":1584,"class":"3-3"},
  "26":{"name":"Michigan","income":63202,"rent":925,"class":"2-2"},
  "27":{"name":"Minnesota","income":77706,"rent":1043,"class":"2-3"},
  "28":{"name":"Mississippi","income":48716,"rent":798,"class":"1-1"},
  "29":{"name":"Missouri","income":61303,"rent":890,"class":"1-1"},
  "30":{"name":"Montana","income":60560,"rent":967,"class":"2-1"},
  "31":{"name":"Nebraska","income":66644,"rent":869,"class":"1-2"},
  "32":{"name":"Nevada","income":66274,"rent":1290,"class":"3-2"},
  "33":{"name":"New Hampshire","income":90845,"rent":1247,"class":"3-3"},
  "34":{"name":"New Jersey","income":97126,"rent":1466,"class":"3-3"},
  "35":{"name":"New Mexico","income":51945,"rent":903,"class":"1-1"},
  "36":{"name":"New York","income":75157,"rent":1490,"class":"3-3"},
  "37":{"name":"North Carolina","income":60516,"rent":1042,"class":"2-1"},
  "38":{"name":"North Dakota","income":68131,"rent":826,"class":"1-2"},
  "39":{"name":"Ohio","income":61938,"rent":882,"class":"1-1"},
  "40":{"name":"Oklahoma","income":56956,"rent":847,"class":"1-1"},
  "41":{"name":"Oregon","income":70084,"rent":1319,"class":"3-2"},
  "42":{"name":"Pennsylvania","income":67587,"rent":1014,"class":"2-2"},
  "44":{"name":"Rhode Island","income":74008,"rent":1145,"class":"2-3"},
  "45":{"name":"South Carolina","income":59318,"rent":1014,"class":"2-1"},
  "46":{"name":"South Dakota","income":64828,"rent":783,"class":"1-2"},
  "47":{"name":"Tennessee","income":59695,"rent":960,"class":"2-1"},
  "48":{"name":"Texas","income":66963,"rent":1175,"class":"2-2"},
  "49":{"name":"Utah","income":79133,"rent":1306,"class":"3-3"},
  "50":{"name":"Vermont","income":72431,"rent":1083,"class":"2-2"},
  "51":{"name":"Virginia","income":80963,"rent":1392,"class":"3-3"},
  "53":{"name":"Washington","income":84247,"rent":1497,"class":"3-3"},
  "54":{"name":"West Virginia","income":48037,"rent":741,"class":"1-1"},
  "55":{"name":"Wisconsin","income":67080,"rent":871,"class":"1-2"},
  "56":{"name":"Wyoming","income":68002,"rent":935,"class":"2-2"}
};

const colors = {
  "1-1":"#d9f0d3","1-2":"#5aae61","1-3":"#1b7837",
  "2-1":"#f4a582","2-2":"#e8e4dc","2-3":"#92c5de",
  "3-1":"#b2182b","3-2":"#ef6548","3-3":"#fdd49e"
};

const textColors = {
  "1-1":"#2d6a2d","1-2":"#fff","1-3":"#fff",
  "2-1":"#7a2000","2-2":"#4a4541","2-3":"#0d3b6e",
  "3-1":"#fff","3-2":"#fff","3-3":"#7a4000"
};

fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
  .then(r => r.json())
  .then(us => {
    const svg = d3.select("#map-svg");
    const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
    const path = d3.geoPath().projection(projection);
    const states = topojson.feature(us, us.objects.states);

    const tooltip = d3.select("body").append("div")
      .style("position","fixed")
      .style("background","#1a1714")
      .style("color","#f5f2ec")
      .style("padding","10px 14px")
      .style("font-family","'DM Mono',monospace")
      .style("font-size","12px")
      .style("line-height","1.6")
      .style("pointer-events","none")
      .style("opacity","0")
      .style("border-radius","3px")
      .style("z-index","999")
      .style("max-width","200px");

    svg.selectAll("path")
      .data(states.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const s = stateData[d.id.toString().padStart(2,'0')];
        return s ? colors[s.class] : "#ccc";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mousemove", function(event, d) {
        const s = stateData[d.id.toString().padStart(2,'0')];
        if (!s) return;
        const burden = ((s.rent / (s.income/12))*100).toFixed(1);
        tooltip
          .style("opacity","1")
          .style("left", (event.clientX+14)+"px")
          .style("top",  (event.clientY-10)+"px")
          .html(`<strong>${s.name}</strong><br>Income: $${s.income.toLocaleString()}<br>Rent: $${s.rent}/mo<br>Burden: ${burden}%`);
        d3.select(this).attr("stroke","#1a1714").attr("stroke-width",1.5);
      })
      .on("mouseleave", function() {
        tooltip.style("opacity","0");
        d3.select(this).attr("stroke","#fff").attr("stroke-width",0.5);
      });

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a,b) => a !== b))
      .attr("fill","none")
      .attr("stroke","rgba(255,255,255,0.6)")
      .attr("stroke-width",0.4)
      .attr("d", path);

    svg.selectAll("text.label")
      .data(states.features.filter(d => {
        const s = stateData[d.id.toString().padStart(2,'0')];
        return s && !["02","15","11"].includes(d.id.toString().padStart(2,'0'));
      }))
      .join("text")
      .attr("class","label")
      .attr("transform", d => `translate(${path.centroid(d)})`)
      .attr("text-anchor","middle")
      .attr("dominant-baseline","central")
      .attr("font-size","8")
      .attr("font-family","'DM Mono',monospace")
      .attr("fill", d => {
        const s = stateData[d.id.toString().padStart(2,'0')];
        return s ? textColors[s.class] : "#555";
      })
      .attr("pointer-events","none")
      .text(d => {
        const abbrs = {"01":"AL","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","12":"FL","13":"GA","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};
        return abbrs[d.id.toString().padStart(2,'0')] || "";
      });
  });

// Table
const sorted = Object.entries(stateData)
  .map(([fips, d]) => ({...d, fips, burden: ((d.rent/(d.income/12))*100).toFixed(1)}))
  .sort((a,b) => b.burden - a.burden);

const tbody = document.getElementById('table-body');
sorted.forEach((s, i) => {
  const isHigh = parseFloat(s.burden) >= 22;
  const isLow  = parseFloat(s.burden) <= 15;
  tbody.innerHTML += `<tr>
    <td class="num">${i+1}</td>
    <td><span class="swatch" style="background:${colors[s.class]}"></span>${s.name}</td>
    <td class="num">$${s.income.toLocaleString()}</td>
    <td class="num">$${s.rent}/mo</td>
    <td class="num ${isHigh?'bad-text':isLow?'good-text':''}">${s.burden}%</td>
    <td class="num">${s.class}</td>
  </tr>`;
});
