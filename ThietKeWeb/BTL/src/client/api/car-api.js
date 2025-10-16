// Car API Service
// Fetches real car data from RapidAPI and integrates with the car management system

// Configuration
const RAPIDAPI_KEY = '02e21a2917mshb9f7023387f37a0p16f9b8jsnf44ab3717559'; 

const URL_MODELS = 'https://car-api2.p.rapidapi.com/api/models?sort=id&direction=asc&year=2020&verbose=yes';
const URL_BODIES = 'https://car-api2.p.rapidapi.com/api/bodies?verbose=yes&sort=id&direction=asc';
const URL_ENGINES = 'https://car-api2.p.rapidapi.com/api/engines?verbose=yes&direction=asc&sort=id';

const RAPIDAPI_HEADERS = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': 'car-api2.p.rapidapi.com'
};

// Car Class
class Car {
  constructor({ id, make_id, make_name, name, body, engine }) {
    body = body || {};
    engine = engine || {};

    this.id = id;
    this.make_id = make_id ?? null;
    this.make_name = make_name ?? null;
    this.name = name ?? null;
    this.make = make_name ?? null;
    this.model = name ?? null;

    // body 
    this.bodyType = body.type ?? body.bodyType ?? body.value ?? null;
    this.doors = body.doors ?? null;

    // engine 
    this.engineType = engine.engine ?? engine.engine_type ?? engine.type ?? engine.name ?? null;
    this.horsepower = engine.horsepower ?? engine.horsepower_hp ?? engine.hp ?? null;

    // Additional properties for our system
    this.year = 2020; // Default year from API
    this.price = this.generatePrice();
    this.status = 'available';
    this.description = this.generateDescription();
    this.image = this.generateImagePath();
    this.stock = 100;
    this.sold = 0;
  }

  get in_stock() { 
    return this.stock - this.sold; 
  }

  // Generate realistic price based on make and horsepower
  generatePrice() {
    let basePrice = 20000; // Base price
    
    // Adjust based on make (luxury brands cost more)
    const luxuryMakes = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Jaguar', 'Land Rover'];
    if (this.make_name && luxuryMakes.some(make => this.make_name.includes(make))) {
      basePrice = 40000;
    }
    
    // Adjust based on horsepower
    if (this.horsepower) {
      basePrice += (this.horsepower - 150) * 50; // $50 per HP above 150
    }
    
    return Math.max(15000, Math.min(150000, basePrice)); // Clamp between $15k-$150k
  }

  // Generate description based on car properties
  generateDescription() {
    let desc = `A ${this.year} ${this.make_name} ${this.name}`;
    
    if (this.bodyType) {
      desc += ` in ${this.bodyType} body style`;
    }
    
    if (this.engineType) {
      desc += ` with ${this.engineType} engine`;
    }
    
    if (this.horsepower) {
      desc += ` producing ${this.horsepower} horsepower`;
    }
    
    if (this.doors) {
      desc += ` and ${this.doors} doors`;
    }
    
    return desc + '.';
  }

  // Generate image path (placeholder for now)
  generateImagePath() {
    return '../../../Assets/image/car_temp.png';
  }

  changeImage(path) { 
    this.image = path; 
  }

  sell(qty) {
    qty = Number(qty) || 0;
    if (qty <= 0) return false;
    if (this.sold + qty > this.stock) return false;
    this.sold += qty;
    return true;
  }
}

// Inventory Class
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

  // Filter cars by search term
  filterCars(searchTerm, priceRange) {
    return this.cars.filter(car => {
      const matchesSearch = !searchTerm || 
        car.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year?.toString().includes(searchTerm);
      
      const matchesPrice = !priceRange || this.checkPriceRange(car.price, priceRange);
      
      return matchesSearch && matchesPrice;
    });
  }

  // Check if car price matches the selected range
  checkPriceRange(price, range) {
    if (!price) return false;
    
    switch (range) {
      case '0-10000':
        return price < 10000;
      case '10000-25000':
        return price >= 10000 && price <= 25000;
      case '25000-50000':
        return price >= 25000 && price <= 50000;
      case '50000+':
        return price > 50000;
      default:
        return true;
    }
  }

  updateAllImages(path) { 
    this.cars.forEach(c => c.changeImage(path)); 
  }

  updateCarImage(id, path) { 
    const c = this.cars.find(x => x.id === id); 
    if (c) c.changeImage(path); 
  }

  sellCar(id, qty) { 
    const c = this.cars.find(x => x.id === id); 
    if (!c) return { ok: false }; 
    return { ok: c.sell(qty), car: c }; 
  }

  generateReportObject() {
    return this.cars.map(c => ({ 
      id: c.id, 
      make_id: c.make_id, 
      name: c.name, 
      sold: c.sold, 
      in_stock: c.in_stock 
    }));
  }

  exportReportBrowser(filename = 'car_report.json') {
    const report = this.generateReportObject();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = filename; 
    document.body.appendChild(a); 
    a.click();
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
    console.log('Report downloaded:', filename);
  }
}

// Helper functions
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

// Main function to build inventory from API
export async function buildInventoryFromApi() {
  console.log('Fetching car data from API...');

  try {
    // fetch all endpoints
    const [rawModels, rawBodies, rawEngines] = await Promise.all([
      fetchJson(URL_MODELS),
      fetchJson(URL_BODIES),
      fetchJson(URL_ENGINES)
    ]);

    console.log('API Response received');

    // extract arrays
    const modelsArr = extractArray(rawModels);
    const bodiesArr = extractArray(rawBodies);
    const enginesArr = extractArray(rawEngines);

    // normalize models
    const models = modelsArr.map(item => {
      const make_id = item.make_id ?? (item.make && item.make.id) ?? null;
      const make_name = item.make && item.make.name ? item.make.name : (item.make_name ?? null);
      return { 
        id: item.id, 
        make_id, 
        make_name, 
        name: item.name ?? item.model_name ?? item.title ?? null, 
        __raw: item 
      };
    });

    // normalize bodies
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

    // normalize engines
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

    console.log(`Fetched: ${models.length} models, ${bodies.length} bodies, ${engines.length} engines`);

    // build inventory
    const inventory = Inventory.fromNormalized(models, bodies, engines);

    // Set default images
    inventory.updateAllImages('../../../Assets/image/car_temp.png');

    console.log('Inventory ready with', inventory.cars.length, 'cars');

    return { 
      success: true, 
      cars: inventory.cars,
      inventory: inventory,
      models, 
      bodies, 
      engines 
    };

  } catch (error) {
    console.error('Error building inventory:', error);
    return { 
      success: false, 
      error: error.message,
      cars: [],
      inventory: new Inventory([])
    };
  }
}

// Export classes for use in other files
export { Car, Inventory };
