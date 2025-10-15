// emission factors (kg)
const FACTORS = {
  electricity: 0.50,
  petrol: 2.31,
  shortFlight: 0.15,
  longFlight: 0.11
};

const el = id => document.getElementById(id);
const inputs = {
  electricity: el('electricity'),
  petrol: el('petrol'),
  shortFlight: el('shortFlight'),
  longFlight: el('longFlight')
};

function parseInput(value){
  const n = parseFloat(value);
  return (Number.isFinite(n) && n >= 0) ? n : 0;
}

function compute(){
  const electricityMonthly = parseInput(inputs.electricity.value);
  const petrolWeekly = parseInput(inputs.petrol.value);
  const shortFlightKm = parseInput(inputs.shortFlight.value);
  const longFlightKm = parseInput(inputs.longFlight.value);

  const electricityYearlyKWh = electricityMonthly * 12;
  const petrolYearlyL = petrolWeekly * 52;

  const eElec = electricityYearlyKWh * FACTORS.electricity;
  const ePetrol = petrolYearlyL * FACTORS.petrol;
  const eShort = shortFlightKm * FACTORS.shortFlight;
  const eLong = longFlightKm * FACTORS.longFlight;

  const totalKg = eElec + ePetrol + eShort + eLong;
  const totalTonnes = totalKg / 1000;

  return { electricity: eElec, petrol: ePetrol, shortFlight: eShort, longFlight: eLong, totalKg, totalTonnes };
}

function formatNumber(n, digits=2){
  return Number(n).toLocaleString(undefined,{minimumFractionDigits:digits,maximumFractionDigits:digits});
}

function render(){
  const r = compute();
  el('total').textContent = `${formatNumber(r.totalTonnes,2)} t CO₂e`;
  el('kgValue').textContent = `${formatNumber(r.totalKg,0)} kg CO₂e / year`;

  const breakdownEl = el('breakdown');
  breakdownEl.innerHTML = '';

  const parts = [
    {key:'electricity', label:'Electricity', value:r.electricity},
    {key:'petrol', label:'Petrol (vehicle fuel)', value:r.petrol},
    {key:'shortFlight', label:'Short flights', value:r.shortFlight},
    {key:'longFlight', label:'Long flights', value:r.longFlight}
  ];

  const total = r.totalKg || 0.000001;

  parts.forEach(p=>{
    const percent = (p.value / total) * 100;
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div style="min-width:120px">
        <div style="font-weight:600">${p.label}</div>
        <div class="muted">${formatNumber(p.value,0)} kg / yr</div>
      </div>
      <div style="flex:1;display:flex;align-items:center">
        <div class="bar" aria-hidden="true"><i style="width:${Math.min(100,percent)}%"></i></div>
        <div style="width:48px;text-align:right;margin-left:8px" class="muted">${formatNumber(percent,1)}%</div>
      </div>
    `;
    breakdownEl.appendChild(item);
  });
}

el('calculate').addEventListener('click', ()=>{ render(); el('total').focus(); });
el('reset').addEventListener('click', ()=>{ Object.values(inputs).forEach(i=> i.value=''); render(); });
Object.values(inputs).forEach(i=>{ i.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter'){ ev.preventDefault(); render(); } }); });

// initial render
render();
