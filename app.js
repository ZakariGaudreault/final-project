const colors = {
  "1-1": "#d9f0d3", "1-2": "#5aae61", "1-3": "#1b7837",
  "2-1": "#f4a582", "2-2": "#c7c7c7", "2-3": "#92c5de",
  "3-1": "#b2182b", "3-2": "#ef6548", "3-3": "#fdd49e"
};

const textColors = {
  "1-1": "#2d6a2d", "1-2": "#fff", "1-3": "#fff",
  "2-1": "#7a2000", "2-2": "#4a4541", "2-3": "#0d3b6e",
  "3-1": "#fff",    "3-2": "#fff",   "3-3": "#7a4000"
};

const abbrs = {
  "01":"AL","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
  "12":"FL","13":"GA","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS",
  "21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN",
  "28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ",
  "35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR",
  "42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"
};

Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
  d3.csv("usa_rent_burden_by_state.csv")
]).then(([us, csvData]) => {

  const stateData = {};
  csvData.forEach(d => {
    const id = d.STATEFP.padStart(2, "0");
    stateData[id] = {
      name:   d.state,
      income: +d.median_household_income,
      rent:   +d.median_gross_rent,
      class:  d.bivariate_class
    };
  });

  const svg        = d3.select("#map-svg");
  const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
  const path       = d3.geoPath().projection(projection);
  const states     = topojson.feature(us, us.objects.states);

  const tooltip = d3.select("body").append("div")
    .style("position",       "fixed")
    .style("background",     "#1a1714")
    .style("color",          "#f5f2ec")
    .style("padding",        "10px 14px")
    .style("font-family",    "'DM Mono', monospace")
    .style("font-size",      "12px")
    .style("line-height",    "1.6")
    .style("pointer-events", "none")
    .style("opacity",        "0")
    .style("border-radius",  "3px")
    .style("z-index",        "999")
    .style("max-width",      "200px");

  svg.selectAll("path.state")
    .data(states.features)
    .join("path")
    .attr("class", "state")
    .attr("d", path)
    .attr("fill", d => {
      const s = stateData[d.id.toString().padStart(2, "0")];
      return s ? colors[s.class] : "#ccc";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .on("mousemove", function(event, d) {
      const s = stateData[d.id.toString().padStart(2, "0")];
      if (!s) return;
      const burden = ((s.rent / (s.income / 12)) * 100).toFixed(1);
      tooltip
        .style("opacity", "1")
        .style("left", (event.clientX + 14) + "px")
        .style("top",  (event.clientY - 10) + "px")
        .html(
          `<strong>${s.name}</strong><br>` +
          `Income: $${s.income.toLocaleString()}/yr<br>` +
          `Rent: $${s.rent}/mo<br>` +
          `Burden: ${burden}%`
        );
      d3.select(this).attr("stroke", "#1a1714").attr("stroke-width", 1.5);
    })
    .on("mouseleave", function() {
      tooltip.style("opacity", "0");
      d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
    });

  svg.selectAll("text.label")
    .data(states.features.filter(d => {
      const id = d.id.toString().padStart(2, "0");
      return stateData[id] && !["02", "15", "11"].includes(id);
    }))
    .join("text")
    .attr("class", "label")
    .attr("transform", d => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", "8")
    .attr("font-family", "'DM Mono', monospace")
    .attr("fill", d => {
      const s = stateData[d.id.toString().padStart(2, "0")];
      return s ? textColors[s.class] : "#555";
    })
    .attr("pointer-events", "none")
    .text(d => abbrs[d.id.toString().padStart(2, "0")] || "");

  const sorted = Object.entries(stateData)
    .map(([fips, d]) => ({
      ...d,
      fips,
      burden: ((d.rent / (d.income / 12)) * 100).toFixed(1)
    }))
    .sort((a, b) => b.burden - a.burden);

  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  sorted.forEach((s, i) => {
    const isHigh = parseFloat(s.burden) >= 22;
    const isLow  = parseFloat(s.burden) <= 15;
    tbody.innerHTML += `<tr>
      <td class="num">${i + 1}</td>
      <td><span class="swatch" style="background:${colors[s.class]}"></span>${s.name}</td>
      <td class="num">$${s.income.toLocaleString()}</td>
      <td class="num">$${s.rent}/mo</td>
      <td class="num ${isHigh ? "bad-text" : isLow ? "good-text" : ""}">${s.burden}%</td>
      <td class="num">${s.class}</td>
    </tr>`;
  });
});
