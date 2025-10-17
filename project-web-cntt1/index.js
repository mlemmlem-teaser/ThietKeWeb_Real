// Configuration
const RAPIDAPI_KEY = '02e21a2917mshb9f7023387f37a0p16f9b8jsnf44ab3717559'; 

const URL_MODELS = 'https://car-api2.p.rapidapi.com/api/models?sort=id&direction=asc&year=2020&verbose=yes';
const URL_BODIES = 'https://car-api2.p.rapidapi.com/api/bodies?verbose=yes&sort=id&direction=asc';
const URL_ENGINES = 'https://car-api2.p.rapidapi.com/api/engines?verbose=yes&direction=asc&sort=id';

const RAPIDAPI_HEADERS = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': 'car-api2.p.rapidapi.com'
};

const $log = document.getElementById('log');
function log(...args) {
  console.log(...args);
  $log.textContent += args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ') + '\n';
}
function clearLog(){ $log.textContent = ''; }

// Helpers: fetch & extract
async function fetchJson(url) {
  const resp = await fetch(url, { method: 'GET', headers: RAPIDAPI_HEADERS });
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function extractArray(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data && Array.isArray(resp.data)) return resp.data;
  if (resp.collection && resp.collection.data && Array.isArray(resp.collection.data)) return resp.collection.data;
  if (resp.results && Array.isArray(resp.results)) return resp.results;
  if (resp.items && Array.isArray(resp.items)) return resp.items;
  return [];
}

// Car & Inventory
class Car {
  constructor({ id, make_id, make_name, name, body, engine }) {
    body = body || {};
    engine = engine || {};

    this.id = id;
    this.make_id = make_id ?? null;
    this.make_name = make_name ?? null;
    this.name = name ?? null;

    // body 
    this.bodyType = body.type ?? body.bodyType ?? body.value ?? null;
    this.doors = body.doors ?? null;

    // engine 
    this.engineType = engine.engine ?? engine.engine_type ?? engine.type ?? engine.name ?? null;
    this.horsepower = engine.horsepower ?? engine.horsepower_hp ?? engine.hp ?? null;

    this.image = 'Assets/image/car0.png';
    this.stock = 100;
    this.sold = 0;
  }

  get in_stock() { return this.stock - this.sold; }
  changeImage(p) { this.image = p; }
  sell(qty) {
    qty = Number(qty) || 0;
    if (qty <= 0) return false;
    if (this.sold + qty > this.stock) return false;
    this.sold += qty;
    return true;
  }
}

class Inventory {
  constructor(cars = []) {
    this.cars = cars; // array of Car
  }

  static fromNormalized(models, bodies, engines) {

    const cars = models.map(m => {
      const id = m.id;
      // match by model_id
      let body = bodies.find(b => b.model_id === id) || null;
      let engine = engines.find(e => e.model_id === id) || null;

      // fallback: try to find in model.__raw fields
      if (!body) {
        const raw = m.__raw;
        let cand = raw?.make_model_trim?.make_model || raw?.make_model || raw?.bodies || raw?.body || raw?.attributes?.body;
        if (Array.isArray(cand)) cand = cand[0];
        if (typeof cand === 'string') cand = { type: cand };
        if (cand) body = { type: cand.type ?? cand.bodyType ?? cand.value ?? null, doors: cand.doors ?? null, __raw: cand };
      }
      if (!engine) {
        const raw = m.__raw;
        let cand = raw?.make_model_trim?.make_model || raw?.make_model || raw?.engines || raw?.engine || raw?.attributes?.engine;
        if (Array.isArray(cand)) cand = cand[0];
        if (typeof cand === 'string') cand = { engine: cand };
        if (cand) engine = { engine: cand.engine ?? cand.engine_type ?? cand.name ?? null, horsepower: cand.horsepower ?? cand.horsepower_hp ?? null, __raw: cand };
      }

      return new Car({
        id: m.id,
        make_id: m.make_id,
        make_name: m.make_name,
        name: m.name,
        body,
        engine
      });
    });

    return new Inventory(cars);
  }

  updateAllImages(path) { this.cars.forEach(c => c.changeImage(path)); }
  updateCarImage(id, path) { const c = this.cars.find(x => x.id === id); if (c) c.changeImage(path); }
  sellCar(id, qty) { const c = this.cars.find(x => x.id === id); if (!c) return { ok:false }; return { ok: c.sell(qty), car:c }; }

  generateReportObject() {
    return this.cars.map(c => ({ id: c.id, make_id: c.make_id, name: c.name, sold: c.sold, in_stock: c.in_stock }));
  }

  exportReportBrowser(filename='car_report.json') {
    const report = this.generateReportObject();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    log('Report downloaded (browser):', filename);
  }
}

// Build inventory: fetch + normalize + match
async function buildInventoryFromApi() {
  clearLog();
  log('Fetching endpoints... (this may take a few seconds)');

  // fetch all
  const [rawModels, rawBodies, rawEngines] = await Promise.all([
    fetchJson(URL_MODELS),
    fetchJson(URL_BODIES),
    fetchJson(URL_ENGINES)
  ]);

  log('RAW MODELS sample:', rawModels?.collection?.url ? 'collection' : typeof rawModels);
  log('RAW BODIES sample:', rawBodies?.collection?.url ? 'collection' : typeof rawBodies);
  log('RAW ENGINES sample:', rawEngines?.collection?.url ? 'collection' : typeof rawEngines);

  // extract arrays
  const modelsArr = extractArray(rawModels);
  const bodiesArr = extractArray(rawBodies);
  const enginesArr = extractArray(rawEngines);

  // normalize models
  const models = modelsArr.map(item => {
    const make_id = item.make_id ?? (item.make && item.make.id) ?? null;
    const make_name = item.make && item.make.name ? item.make.name : (item.make_name ?? null);
    return { id: item.id, make_id, make_name, name: item.name ?? item.model_name ?? item.title ?? null, __raw: item };
  });

  // normalize bodies: locate model_id inside make_model_trim.make_model.id (fallback)
  const bodies = bodiesArr.map(item => {
    const model_id = item?.make_model_trim?.make_model?.id ?? item?.make_model_trim?.make_model_id ?? item?.make_model_id ?? null;
    return {
      id: item.id ?? null,
      model_id,
      type: item.type ?? item.value ?? item.name ?? null,
      doors: item.doors ?? null,
      __raw: item
    };
  });

  // normalize engines: locate model_id inside make_model_trim.make_model.id (fallback)
  const engines = enginesArr.map(item => {
    const model_id = item?.make_model_trim?.make_model?.id ?? item?.make_model_trim?.make_model_id ?? item?.make_model_id ?? null;
    return {
      id: item.id ?? null,
      model_id,
      engine: item.engine ?? item.engine_type ?? item.name ?? item.value ?? null,
      horsepower: item.horsepower ?? item.horsepower_hp ?? item.hp ?? null,
      __raw: item
    };
  });

  log(`Fetched sizes -> models: ${models.length}, bodies: ${bodies.length}, engines: ${engines.length}`);

  // build inventory matching model.id === body.model_id / engine.model_id
  const inventory = Inventory.fromNormalized(models, bodies, engines);

  // example operations
  inventory.updateAllImages('assets/default.png');
  if (inventory.cars[0]) inventory.updateCarImage(inventory.cars[0].id, 'Assets/image/car0.png');
  if (inventory.cars[0]) inventory.sellCar(inventory.cars[0].id, 5);


  // enable download button
  document.getElementById('downloadBtn').disabled = false;
  // log some sample cars
  log('Inventory ready. Count:', inventory.cars.length);
  log('Sample:', inventory.cars.slice(0,99).map(c => ({ id:c.id, name:c.name, make:c.make_name, body:c.bodyType, engine:c.engineType, hp:c.horsepower })));

  return { inventory, models, bodies, engines };
}

// UI wiring
let latestInventory = null;
/*document.getElementById('fetchBtn').addEventListener('click', async () => {
  try {
    const { inventory } = await buildInventoryFromApi();
    latestInventory = inventory;
  } catch (e) {
    log('Error building inventory:', e);
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!latestInventory) return alert('No inventory yet. Press Fetch first.');
  latestInventory.exportReportBrowser('car_report.json');
});*/
//Mở đầu tab động 
function openTab(evt, cityName) {
    
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
//Toàn bộ headder động
//CONTACT_FUNCTION
function scrollToForm() {
    // 1. Lấy phần tử đích bằng ID (advise-contact)
    const targetElement = document.getElementById('advise-contact');
    
    // 2. Kiểm tra và thực hiện cuộn
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center' 
        });
    }
}
//Hiệu ứng nút bấm đầu 
const clickFormBtn = document.getElementById("click-form");
const clickBuyBtn = document.getElementById("click-buy");

// --- HIỆU ỨNG KHI DI CHUỘT VÀO (HOVER IN) ---
clickFormBtn.addEventListener("mouseenter", function() {
    clickBuyBtn.style.backgroundColor = "transparent"; // Đổi màu nền thành Đỏ
    clickBuyBtn.style.color = "#ffffff";          // Đổi màu chữ thành Trắng
    clickBuyBtn.style.border = "0.5px solid #ffffffff"  // Phóng to nhẹ
});

// --- HIỆU ỨNG KHI RỜI CHUỘT (HOVER OUT) ---
clickFormBtn.addEventListener("mouseleave", function() {
    clickBuyBtn.style.backgroundColor = "#335c96"; 
    clickBuyBtn.style.border = "none"         
});
//Tạo hiệu ứng nút 
const buttons =document.querySelectorAll(".btn")
buttons.forEach((button)=>{
  button.addEventListener("click",function(e){
    //lấy tọa độ button so với vp
    const buttonRect=e.target.getBoundingClientRect();
    console.log(buttonRect);
    //Lấy tọa độ chuột so với vp
    const x=e.clientX;
    const y=e.clientY;
    console.log(x,y);
    //Tính tọa đô chuột click so với button
    const xInside = x-buttonRect.left;
    const yInside=y-buttonRect.top;
    //Thêm thẻ span , để thêm class circle 
    const hinhTron =document.createElement("span");
    hinhTron.classList.add("circle")
    hinhTron.style.top=yInside+"px";
    hinhTron.style.left=xInside+"px";
    this.appendChild(hinhTron);
    setTimeOut(()=> hinhTron.remove(),500);
  });
});
//Tạo hiệu ứng form thông báo khi nhập sai
document.getElementById("advise-contact").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const name = document.getElementById("username").value.trim();
  const moblie = document.getElementById("moblie").value.trim();
  
  // Lấy các element hiển thị lỗi riêng cho từng trường
  const nameError = document.getElementById("name-error");
  const moblieError = document.getElementById("moblie-error");
  
  // Reset tất cả thông báo lỗi
  nameError.textContent = "";
  moblieError.textContent = "";
  
  let hasError = false;
  
  // Kiểm tra tên
  if (name === "") {
    nameError.textContent = "⚠️ Bạn chưa nhập tên!";
    hasError = true;
  }
  
  // Kiểm tra số điện thoại
  if (moblie === "") {
    moblieError.textContent = "⚠️ Bạn chưa nhập số điện thoại!";
    hasError = true;
  } else {
    const mobliePattern = /^0\d{9}$/;
    if (!mobliePattern.test(moblie)) {
      moblieError.textContent = "⚠️ Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0!";
      hasError = true;
    }
  }
  
  // Nếu có lỗi thì dừng lại
  if (hasError) {
    return;
  }
  
  // Nếu đúng hết
  alert("✅ Gửi thành công!");
  this.reset();
});
