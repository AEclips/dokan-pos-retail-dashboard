import { INITIAL_PRODUCTS, INITIAL_SAMPLE_SALES, INITIAL_CUSTOMER_DUES } from '../constants/initialProducts';
import { DEFAULT_SHOP_CONFIG } from '../constants/shopConfig';

const STORAGE_KEYS = {
  PRODUCTS: 'dokanpos_products_v1',
  SALES: 'dokanpos_sales_v1',
  DUES: 'dokanpos_dues_v1',
  CONFIG: 'dokanpos_config_v1'
};

export function loadStoreState() {
  let products = INITIAL_PRODUCTS;
  let sales = INITIAL_SAMPLE_SALES;
  let dues = INITIAL_CUSTOMER_DUES;
  let config = DEFAULT_SHOP_CONFIG;

  try {
    const rawProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (rawProd) products = JSON.parse(rawProd);

    const rawSales = localStorage.getItem(STORAGE_KEYS.SALES);
    if (rawSales) sales = JSON.parse(rawSales);

    const rawDues = localStorage.getItem(STORAGE_KEYS.DUES);
    if (rawDues) dues = JSON.parse(rawDues);

    const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (rawConfig) config = { ...DEFAULT_SHOP_CONFIG, ...JSON.parse(rawConfig) };
  } catch (e) {
    console.error('Failed to load storage state:', e);
  }

  return { products, sales, dues, config };
}

export function saveStoreState({ products, sales, dues, config }) {
  try {
    if (products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    if (sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    if (dues) localStorage.setItem(STORAGE_KEYS.DUES, JSON.stringify(dues));
    if (config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save storage state:', e);
  }
}

export function exportBackupJson(state) {
  const payload = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    system: 'DokanPOS Bangladesh',
    ...state
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `DokanPOS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.products && !json.sales) {
          throw new Error('Invalid DokanPOS backup format');
        }
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
