// PackPal v3 — keeps wear-duration logic, adds pants mix, baby powder, camera, etc.

const btn = document.getElementById("generateBtn");
const status = document.getElementById("status");
const listCard = document.getElementById("listCard");
const listContainer = document.getElementById("listContainer");
const tipsDiv = document.getElementById("tips");

function daysBetween(start, end) {
  const s = new Date(start), e = new Date(end);
  return Math.max(1, Math.round((e - s) / (1000*60*60*24)) + 1);
}

function isFemale(p){return /female|girl|woman/i.test(p);}
function ageGroup(p){
  const x=p.toLowerCase();
  if(x.includes("infant"))return"infant";
  if(x.includes("toddler"))return"toddler";
  if(x.includes("child"))return"child";
  if(x.includes("pre-teen")||x.includes("preteen"))return"preteen";
  if(x.includes("teen"))return"teen";
  if(x.includes("young adult"))return"youngadult";
  if(x.includes("adult")&&!x.includes("young"))return"adult";
  if(x.includes("senior"))return"senior";
  return"adult";
}
function includesInternational(notes,home,dest){
  if(/international/i.test(notes))return true;
  const hc=home.split(',').pop()?.trim().toLowerCase();
  const dc=dest.split(',').pop()?.trim().toLowerCase();
  return hc&&dc&&hc!==dc;
}
function hasTransport(t,w){return t.toLowerCase().includes(w.toLowerCase());}

function buildList(trip){
  const {profile,tripType,transport,home,dest,notes,days}=trip;
  const female=isFemale(profile);
  const age=ageGroup(profile);
  const cats=[],tips=[];

  // CLOTHES
  const clothes={name:"Clothes",items:[]};
  if(age==="infant"||age==="toddler"){
    const diapers=5*days,wipes=3*5*days,packs=Math.ceil(wipes/20);
    clothes.items.push({name:"Onesies / Rompers",qty:days});
    clothes.items.push({name:"Baby T-shirts / Shirts",qty:Math.ceil(days/2)});
    clothes.items.push({name:"Baby Pants / Shorts",qty:Math.ceil(days/2)});
    if(female) clothes.items.push({name:"Baby Skirts / Dresses (as appropriate)",qty:Math.ceil(days/3)});
    clothes.items.push({name:"Sweater / Jacket",qty:1});
    clothes.items.push({name:"Socks / Booties",qty:days});
    clothes.items.push({name:`Diapers (~${diapers})`,qty:diapers});
    clothes.items.push({name:`Wipes (~${wipes} wipes / ${packs} packs)`,qty:packs});
  } else {
    const underwear=days,socks=days,tops=days,pajamas=Math.ceil(days/3);
    const shoePairs=Math.ceil(days/3)+1;
    const outerQty=Math.ceil(days/4)+1;
    const beltQty=Math.max(1,Math.ceil(days/5));

    clothes.items.push({name:"Tops",qty:tops});
    // Pants + skirts/dresses for girls/females
    if(female){
      clothes.items.push({name:"Pants",qty:Math.ceil(days/1)});
      clothes.items.push({name:"Skirts / Dresses",qty:Math.ceil(days/2),notes:"Mix based on trip type and weather"});
    }else{
      clothes.items.push({name:"Pants / Shorts",qty:Math.ceil(days/1)});
    }
    clothes.items.push({name:"Underwear",qty:underwear});
    clothes.items.push({name:"Socks",qty:socks});
    clothes.items.push({name:"Shoes (1 pair/3 days + backup)",qty:shoePairs});
    clothes.items.push({name:"Jersey / Jacket / Coat (1/4 days + backup)",qty:outerQty});
    clothes.items.push({name:"Belt",qty:beltQty});
    if(/business|work/i.test(tripType)){
      const suitQty=Math.ceil(days/2);
      clothes.items.push({name:"Formal Suit",qty:suitQty,notes:"1 suit can be worn up to 2 days"});
    }
    if(female&&["preteen","teen","youngadult","adult","senior"].includes(age))
      clothes.items.push({name:"Bras",qty:Math.ceil(days/2)});
    clothes.items.push({name:"Pyjamas / Sleepwear",qty:pajamas});
  }
  cats.push(clothes);

  // TOILETRIES
  const toile={name:"Toiletries",items:[]};
  if(age==="infant"||age==="toddler"){
    toile.items.push({name:"Baby soap / wash",qty:1});
    toile.items.push({name:"Baby shampoo",qty:1});
    toile.items.push({name:"Baby lotion / cream",qty:1});
    toile.items.push({name:"Baby powder",qty:1});
  }else{
    toile.items.push({name:"Toothbrush & Toothpaste",qty:1});
    toile.items.push({name:"Soap / Body wash",qty:1});
    toile.items.push({name:"Deodorant",qty:1});
    toile.items.push({name:"Face cloth / Towel",qty:1});
    if(female&&["preteen","teen","youngadult","adult"].includes(age))
      toile.items.push({name:"Sanitary products (pads/tampons)",qty:Math.ceil(days/3)});
  }
  cats.push(toile);

  // ACCESSORIES
  const acc={name:"Accessories",items:[
    {name:"Hat / Cap / Beanie",qty:1},
    {name:"Wallet / ID holder",qty:1},
    {name:"Backpack / Day bag",qty:1},
    {name:"Wrist Watch",qty:1}
  ]};
  if(female&&["teen","youngadult","adult","senior"].includes(age))
    acc.items.push({name:"Handbag / Purse",qty:1});
  cats.push(acc);

  // ELECTRONICS
  const elec={name:"Electronics",items:[]};
  if(["preteen","teen","youngadult","adult","senior"].includes(age)){
    elec.items.push({name:"Cellphone + charger",qty:1});
    if(/business/i.test(tripType)) elec.items.push({name:"Laptop / Tablet + charger",qty:1});
    if(/leisure|vacation/i.test(tripType))
      elec.items.push({name:"Camera (optional)",qty:1,notes:"Capture memories during trip"});
  }
  cats.push(elec);

  // DOCUMENTS
  const docs={name:"Documents",items:[]};
  if(age!=="infant"&&age!=="toddler") docs.items.push({name:"ID / Identity card",qty:1});
  if(includesInternational(notes,home,dest))
    docs.items.push({name:"Passport",qty:1});
  if(/car rental|rent a car/i.test(notes)||hasTransport(transport,"self-driving"))
    docs.items.push({name:"Driver's licence",qty:1});
  if(hasTransport(transport,"airplane")) docs.items.push({name:"Plane ticket",qty:1});
  if(hasTransport(transport,"bus")) docs.items.push({name:"Bus ticket",qty:1});
  if(hasTransport(transport,"train")) docs.items.push({name:"Train ticket",qty:1});
  cats.push(docs);

  tips.push("Shoes: one pair per 3 days + backup.");
  tips.push("Outerwear: one jersey/jacket/coat per 4 days + backup.");
  tips.push("Belts: one belt can be used up to 5 days.");
  if(/business|work/i.test(tripType)) tips.push("Formal suits included (1 per 2 days).");
  if(/leisure|vacation/i.test(tripType)) tips.push("Camera recommended to capture memories.");

  return{cats,tips};
}

function renderList(trip,cats,tips){
  document.getElementById("listTitle").textContent=`Packing List — ${trip.profile}`;
  listCard.style.display="block";
  listContainer.innerHTML="";tipsDiv.innerHTML="";
  cats.forEach(c=>{
    const div=document.createElement("div");
    div.className="category";
    div.innerHTML=`<h3>${c.name}</h3>`;
    c.items.forEach(i=>{
      const row=document.createElement("div");
      row.className="item";
      row.innerHTML=`<div class="chk"></div><div class="name">${i.name} (Qty: ${i.qty||1})${i.notes?`<div class='muted'>${i.notes}</div>`:""}</div>`;
      row.onclick=()=>{row.classList.toggle("packed");row.querySelector(".chk").textContent=row.classList.contains("packed")?"✓":""};
      div.appendChild(row);
    });
    listContainer.appendChild(div);
  });
  if(tips.length){
    tipsDiv.innerHTML="<h3>Travel Tips</h3>"+tips.map(t=>`<p>• ${t}</p>`).join("");
  }
}

btn.onclick=()=>{
  const v=id=>document.getElementById(id).value.trim();
  const trip={profile:v("profile"),tripType:v("tripType"),transport:v("transport"),home:v("home"),dest:v("dest"),start:v("start"),end:v("end"),notes:v("notes")};
  if(!trip.home||!trip.dest||!trip.start||!trip.end){alert("Please complete Home, Destination and Dates.");return;}
  trip.days=daysBetween(trip.start,trip.end);
  status.textContent="Preparing Packing List...";
  btn.disabled=true;
  setTimeout(()=>{
    const r=buildList(trip);
    status.textContent="Packing List Ready";
    renderList(trip,r.cats,r.tips);
    btn.disabled=false;
  },2000+Math.random()*2500);
};