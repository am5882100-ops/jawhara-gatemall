/* ═══════════════════════════════════════════════════════
   JAWHARA JEWELLERY — Branch Management System
   Main Application Logic
   Daily Target: 418 KWD
   
   Percentage Formula:
     Gold % = (Gold Profit / 418) * 100
     Diamond % = (Diamond Profit / 418) * 100
     Total % = Gold % + Diamond %
   
   Monthly Total % = Sum of all daily Total %
   Example: 4 days × 30% each = 120% total
═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Constants ───────────────────────────────────────── */
const DAILY_TARGET = 418;   // KWD
const LS_SALES_KEY  = 'jwh_daily_sales';
const LS_PIECES_KEY = 'jwh_monthly_pieces';
const ROWS_PER_PAGE = 10;
const API_TABLE_SALES  = 'tables/daily_sales';
const API_TABLE_PIECES = 'tables/monthly_pieces';

/* ─── State ───────────────────────────────────────────── */
let salesData   = [];
let piecesData  = [];

let dashSalesPage  = 1;
let dashPiecesPage = 1;
let salesPage      = 1;
let piecesPage     = 1;

let deleteCallback = null;

/* ═══════════════════════════════════════════════════════
   INITIALISATION
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  setDefaultDates();
  loadFromLocalStorage();
  await syncFromAPI();
  renderAll();
  updateKPIs();
  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

function setDefaultDates() {
  const today = getTodayString();
  const thisMonth = today.slice(0, 7);

  // Set default date fields
  const salesDate   = document.getElementById('sales-date');
  const pieceDate   = document.getElementById('piece-date');
  const salesFilter = document.getElementById('sales-month-filter');
  const piecesFilter= document.getElementById('pieces-month-filter');
  const dashFilter  = document.getElementById('dash-month-filter');
  const reportMonth = document.getElementById('report-month');

  if (salesDate)    salesDate.value   = today;
  if (pieceDate)    pieceDate.value   = today;
  if (salesFilter)  salesFilter.value = thisMonth;
  if (piecesFilter) piecesFilter.value= thisMonth;
  if (dashFilter)   dashFilter.value  = thisMonth;
  if (reportMonth)  reportMonth.value = thisMonth;
}

/* ═══════════════════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════════════════ */
function loadFromLocalStorage() {
  try {
    const s = localStorage.getItem(LS_SALES_KEY);
    const p = localStorage.getItem(LS_PIECES_KEY);
    if (s) salesData  = JSON.parse(s);
    if (p) piecesData = JSON.parse(p);
  } catch(e) {
    console.warn('LocalStorage load error:', e);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LS_SALES_KEY,  JSON.stringify(salesData));
    localStorage.setItem(LS_PIECES_KEY, JSON.stringify(piecesData));
  } catch(e) {
    console.warn('LocalStorage save error:', e);
  }
}

/* ═══════════════════════════════════════════════════════
   API SYNC
═══════════════════════════════════════════════════════ */
async function syncFromAPI() {
  try {
    const [salesRes, piecesRes] = await Promise.all([
      fetch(`${API_TABLE_SALES}?limit=1000`),
      fetch(`${API_TABLE_PIECES}?limit=1000`)
    ]);

    if (salesRes.ok) {
      const data = await salesRes.json();
      if (data.data && data.data.length > 0) {
        salesData = data.data.map(mapAPItoSale);
        saveToLocalStorage();
      }
    }

    if (piecesRes.ok) {
      const data = await piecesRes.json();
      if (data.data && data.data.length > 0) {
        piecesData = data.data.map(mapAPItoPiece);
        saveToLocalStorage();
      }
    }
  } catch(e) {
    console.warn('API sync error (using local data):', e);
  }
}

function mapAPItoSale(row) {
  return {
    id:              row.id,
    date:            row.date || '',
    gold_sales:      parseFloat(row.gold_sales)    || 0,
    gold_profit:     parseFloat(row.gold_profit)   || 0,
    diamond_sales:   parseFloat(row.diamond_sales) || 0,
    diamond_profit:  parseFloat(row.diamond_profit)|| 0,
    notes:           row.notes || '',
    gold_profit_pct: parseFloat(row.gold_profit_pct)    || 0,
    diamond_profit_pct: parseFloat(row.diamond_profit_pct) || 0,
    total_profit:    parseFloat(row.total_profit)  || 0,
    total_pct:       parseFloat(row.total_pct)     || 0,
  };
}

function mapAPItoPiece(row) {
  return {
    id:        row.id,
    date:      row.date || '',
    item_name: row.item_name || '',
    quantity:  parseInt(row.quantity) || 0,
    notes:     row.notes || '',
  };
}

async function apiCreateSale(entry) {
  try {
    const res = await fetch(API_TABLE_SALES, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(entry)
    });
    if (res.ok) return await res.json();
  } catch(e) { console.warn('API create sale error:', e); }
  return null;
}

async function apiUpdateSale(id, entry) {
  try {
    const res = await fetch(`${API_TABLE_SALES}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(entry)
    });
    if (res.ok) return await res.json();
  } catch(e) { console.warn('API update sale error:', e); }
  return null;
}

async function apiDeleteSale(id) {
  try {
    await fetch(`${API_TABLE_SALES}/${id}`, { method: 'DELETE' });
  } catch(e) { console.warn('API delete sale error:', e); }
}

async function apiCreatePiece(entry) {
  try {
    const res = await fetch(API_TABLE_PIECES, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(entry)
    });
    if (res.ok) return await res.json();
  } catch(e) { console.warn('API create piece error:', e); }
  return null;
}

async function apiUpdatePiece(id, entry) {
  try {
    const res = await fetch(`${API_TABLE_PIECES}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(entry)
    });
    if (res.ok) return await res.json();
  } catch(e) { console.warn('API update piece error:', e); }
  return null;
}

async function apiDeletePiece(id) {
  try {
    await fetch(`${API_TABLE_PIECES}/${id}`, { method: 'DELETE' });
  } catch(e) { console.warn('API delete piece error:', e); }
}

/* ═══════════════════════════════════════════════════════
   CALCULATIONS
═══════════════════════════════════════════════════════ */

/**
 * Core calculation function.
 * Gold % = (Gold Profit / 418) * 100
 * Diamond % = (Diamond Profit / 418) * 100
 * Total % = Gold % + Diamond %
 * Total Profit = Gold Profit + Diamond Profit
 */
function calcEntry(goldSales, goldProfit, diamondSales, diamondProfit) {
  const gp = parseFloat(goldProfit)    || 0;
  const dp = parseFloat(diamondProfit) || 0;
  const goldPct    = (gp / DAILY_TARGET) * 100;
  const diamondPct = (dp / DAILY_TARGET) * 100;
  const totalProfit = gp + dp;
  const totalPct   = goldPct + diamondPct;
  return {
    gold_profit_pct:    round2(goldPct),
    diamond_profit_pct: round2(diamondPct),
    total_profit:       round2(totalProfit),
    total_pct:          round2(totalPct),
  };
}

function round2(n) { return Math.round(n * 100) / 100; }

function recalcLive() {
  const gs = val('gold-sales');
  const gp = val('gold-profit');
  const ds = val('diamond-sales');
  const dp = val('diamond-profit');

  const calc = calcEntry(gs, gp, ds, dp);

  setText('prev-gold-pct',    fmt(calc.gold_profit_pct, '%'));
  setText('prev-diamond-pct', fmt(calc.diamond_profit_pct, '%'));
  setText('prev-total-profit',fmt(calc.total_profit, ' KWD'));
  setText('prev-total-pct',   fmt(calc.total_pct, '%'));
}

/* ═══════════════════════════════════════════════════════
   DAILY SALES — CRUD
═══════════════════════════════════════════════════════ */
async function saveSalesEntry(e) {
  e.preventDefault();
  const editId = document.getElementById('sales-edit-id').value;

  const goldSales    = parseFloat(val('gold-sales'))    || 0;
  const goldProfit   = parseFloat(val('gold-profit'))   || 0;
  const diamondSales = parseFloat(val('diamond-sales')) || 0;
  const diamondProfit= parseFloat(val('diamond-profit'))|| 0;
  const date  = val('sales-date');
  const notes = val('sales-notes');

  const calc = calcEntry(goldSales, goldProfit, diamondSales, diamondProfit);

  const entry = {
    date,
    gold_sales:    goldSales,
    gold_profit:   goldProfit,
    diamond_sales: diamondSales,
    diamond_profit: diamondProfit,
    notes,
    ...calc
  };

  if (editId) {
    // UPDATE
    entry.id = editId;
    const idx = salesData.findIndex(r => r.id === editId);
    if (idx > -1) {
      salesData[idx] = { ...salesData[idx], ...entry };
      saveToLocalStorage();
      apiUpdateSale(editId, entry);
      showToast('Entry updated successfully.', 'success');
    }
  } else {
    // CREATE
    entry.id = genId();
    salesData.push(entry);
    saveToLocalStorage();
    const apiResult = await apiCreateSale(entry);
    if (apiResult && apiResult.id) {
      salesData[salesData.length - 1].id = apiResult.id;
      saveToLocalStorage();
    }
    showToast('New entry saved successfully.', 'success');
  }

  salesPage = 1;
  resetSalesForm();
  renderAll();
  updateKPIs();
}

function editSale(id) {
  const entry = salesData.find(r => r.id === id);
  if (!entry) return;

  document.getElementById('sales-edit-id').value = id;
  document.getElementById('sales-date').value        = entry.date;
  document.getElementById('gold-sales').value        = entry.gold_sales;
  document.getElementById('gold-profit').value       = entry.gold_profit;
  document.getElementById('diamond-sales').value     = entry.diamond_sales;
  document.getElementById('diamond-profit').value    = entry.diamond_profit;
  document.getElementById('sales-notes').value       = entry.notes || '';

  document.getElementById('sales-form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Daily Entry';
  document.getElementById('sales-submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Entry';

  recalcLive();
  showSection('daily-sales');
  document.getElementById('sales-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Entry loaded for editing.', 'info');
}

function deleteSale(id) {
  deleteCallback = async () => {
    const idx = salesData.findIndex(r => r.id === id);
    if (idx > -1) {
      salesData.splice(idx, 1);
      saveToLocalStorage();
      apiDeleteSale(id);
      renderAll();
      updateKPIs();
      showToast('Entry deleted.', 'success');
    }
    closeDeleteModal();
  };
  openDeleteModal();
}

function resetSalesForm() {
  document.getElementById('sales-form').reset();
  document.getElementById('sales-edit-id').value = '';
  document.getElementById('sales-date').value = getTodayString();
  document.getElementById('sales-form-title').innerHTML = '<i class="fas fa-plus-circle"></i> New Daily Entry';
  document.getElementById('sales-submit-btn').innerHTML = '<i class="fas fa-save"></i> Save Entry';
  setText('prev-gold-pct', '—');
  setText('prev-diamond-pct', '—');
  setText('prev-total-profit', '—');
  setText('prev-total-pct', '—');
}

/* ═══════════════════════════════════════════════════════
   MONTHLY PIECES — CRUD
═══════════════════════════════════════════════════════ */
async function savePieceEntry(e) {
  e.preventDefault();
  const editId = document.getElementById('pieces-edit-id').value;

  const entry = {
    date:      val('piece-date'),
    item_name: val('piece-name'),
    quantity:  parseInt(val('piece-qty')) || 1,
    notes:     val('piece-notes'),
  };

  if (editId) {
    entry.id = editId;
    const idx = piecesData.findIndex(r => r.id === editId);
    if (idx > -1) {
      piecesData[idx] = { ...piecesData[idx], ...entry };
      saveToLocalStorage();
      apiUpdatePiece(editId, entry);
      showToast('Piece updated successfully.', 'success');
    }
  } else {
    entry.id = genId();
    piecesData.push(entry);
    saveToLocalStorage();
    const apiResult = await apiCreatePiece(entry);
    if (apiResult && apiResult.id) {
      piecesData[piecesData.length - 1].id = apiResult.id;
      saveToLocalStorage();
    }
    showToast('Piece saved successfully.', 'success');
  }

  piecesPage = 1;
  resetPiecesForm();
  renderAll();
}

function editPiece(id) {
  const entry = piecesData.find(r => r.id === id);
  if (!entry) return;

  document.getElementById('pieces-edit-id').value = id;
  document.getElementById('piece-date').value  = entry.date;
  document.getElementById('piece-name').value  = entry.item_name;
  document.getElementById('piece-qty').value   = entry.quantity;
  document.getElementById('piece-notes').value = entry.notes || '';

  document.getElementById('pieces-form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Piece Entry';
  document.getElementById('pieces-submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Piece';

  showSection('monthly-pieces');
  document.getElementById('pieces-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Piece loaded for editing.', 'info');
}

function deletePiece(id) {
  deleteCallback = async () => {
    const idx = piecesData.findIndex(r => r.id === id);
    if (idx > -1) {
      piecesData.splice(idx, 1);
      saveToLocalStorage();
      apiDeletePiece(id);
      renderAll();
      showToast('Piece deleted.', 'success');
    }
    closeDeleteModal();
  };
  openDeleteModal();
}

function resetPiecesForm() {
  document.getElementById('pieces-form').reset();
  document.getElementById('pieces-edit-id').value = '';
  document.getElementById('piece-date').value = getTodayString();
  document.getElementById('pieces-form-title').innerHTML = '<i class="fas fa-plus-circle"></i> New Piece Entry';
  document.getElementById('pieces-submit-btn').innerHTML = '<i class="fas fa-save"></i> Save Piece';
}

/* ═══════════════════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════════════════ */
function renderAll() {
  renderSalesTable();
  renderPiecesTable();
  renderDashboard();
}

/* ─── Dashboard ─────────────────────────────────────── */
function renderDashboard() {
  const month  = document.getElementById('dash-month-filter')?.value || getCurrentMonth();
  const search = (document.getElementById('dash-search')?.value || '').toLowerCase().trim();

  // Filter sales
  let filteredSales = salesData.filter(r => r.date && r.date.startsWith(month));
  if (search) {
    filteredSales = filteredSales.filter(r => (r.notes || '').toLowerCase().includes(search));
  }
  filteredSales = sortByDate(filteredSales);

  renderPaginatedTable({
    data: filteredSales,
    tbodyId: 'dash-sales-tbody',
    paginationId: 'dash-sales-pagination',
    pageVar: 'dashSalesPage',
    rowFn: renderSalesRow,
    emptyMsg: 'No sales data for the selected period.',
    colspan: 10,
    showActions: false,
  });

  // Filter pieces
  let filteredPieces = piecesData.filter(r => r.date && r.date.startsWith(month));
  filteredPieces = sortByDate(filteredPieces);

  renderPaginatedTable({
    data: filteredPieces,
    tbodyId: 'dash-pieces-tbody',
    paginationId: 'dash-pieces-pagination',
    pageVar: 'dashPiecesPage',
    rowFn: renderPieceRow,
    emptyMsg: 'No pieces data for the selected period.',
    colspan: 4,
    showActions: false,
  });
}

function applyDashFilters() {
  dashSalesPage = 1;
  dashPiecesPage = 1;
  renderDashboard();
}

function clearDashFilters() {
  document.getElementById('dash-month-filter').value = getCurrentMonth();
  document.getElementById('dash-search').value = '';
  dashSalesPage = 1;
  dashPiecesPage = 1;
  renderDashboard();
}

/* ─── Sales Table ───────────────────────────────────── */
function renderSalesTable() {
  const month = document.getElementById('sales-month-filter')?.value || '';
  let data = month ? salesData.filter(r => r.date && r.date.startsWith(month)) : [...salesData];
  data = sortByDate(data);

  renderPaginatedTable({
    data,
    tbodyId: 'sales-tbody',
    paginationId: 'sales-pagination',
    pageVar: 'salesPage',
    rowFn: (r) => renderSalesRow(r, true),
    emptyMsg: 'No entries yet. Add your first entry above.',
    colspan: 11,
    showActions: true,
  });
}

/* ─── Pieces Table ──────────────────────────────────── */
function renderPiecesTable() {
  const month = document.getElementById('pieces-month-filter')?.value || '';
  let data = month ? piecesData.filter(r => r.date && r.date.startsWith(month)) : [...piecesData];
  data = sortByDate(data);

  renderPaginatedTable({
    data,
    tbodyId: 'pieces-tbody',
    paginationId: 'pieces-pagination',
    pageVar: 'piecesPage',
    rowFn: (r) => renderPieceRow(r, true),
    emptyMsg: 'No entries yet. Add your first piece above.',
    colspan: 5,
    showActions: true,
  });
}

/* ─── Pagination Engine ─────────────────────────────── */
function renderPaginatedTable({ data, tbodyId, paginationId, pageVar, rowFn, emptyMsg, colspan }) {
  const tbody = document.getElementById(tbodyId);
  const paginationEl = document.getElementById(paginationId);
  if (!tbody) return;

  const currentPage = window[pageVar] || 1;
  const totalPages  = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  window[pageVar]   = safePage;

  const start = (safePage - 1) * ROWS_PER_PAGE;
  const slice = data.slice(start, start + ROWS_PER_PAGE);

  if (slice.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${colspan}">${emptyMsg}</td></tr>`;
  } else {
    tbody.innerHTML = slice.map(rowFn).join('');
  }

  // Pagination buttons
  if (paginationEl) {
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    let html = '';
    html += `<button class="page-btn" onclick="changePage('${pageVar}', ${safePage - 1})" ${safePage === 1 ? 'disabled' : ''}>‹</button>`;

    const range = pageRange(safePage, totalPages);
    for (const p of range) {
      if (p === '...') {
        html += `<span class="page-btn" style="cursor:default;border:none">…</span>`;
      } else {
        html += `<button class="page-btn ${p === safePage ? 'active' : ''}" onclick="changePage('${pageVar}', ${p})">${p}</button>`;
      }
    }
    html += `<button class="page-btn" onclick="changePage('${pageVar}', ${safePage + 1})" ${safePage === totalPages ? 'disabled' : ''}>›</button>`;
    paginationEl.innerHTML = html;
  }
}

function changePage(pageVar, page) {
  window[pageVar] = page;
  renderAll();
}

function pageRange(current, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

/* ─── Row Renderers ─────────────────────────────────── */
function renderSalesRow(r, showActions = false) {
  return `
    <tr>
      <td class="td-date">${formatDate(r.date)}</td>
      <td class="td-gold">${fmtKWD(r.gold_sales)}</td>
      <td class="td-gold">${fmtKWD(r.gold_profit)}</td>
      <td class="td-pct gold-text">${r.gold_profit_pct.toFixed(2)}%</td>
      <td class="td-diamond">${fmtKWD(r.diamond_sales)}</td>
      <td class="td-diamond">${fmtKWD(r.diamond_profit)}</td>
      <td class="td-pct diamond-text">${r.diamond_profit_pct.toFixed(2)}%</td>
      <td class="td-total">${fmtKWD(r.total_profit)}</td>
      <td class="td-pct total-text">${r.total_pct.toFixed(2)}%</td>
      <td style="max-width:160px; font-size:0.78rem; color:var(--text-muted);">${r.notes || '—'}</td>
      ${showActions ? `
      <td>
        <div class="td-actions">
          <button class="btn btn-icon btn-edit btn-sm" onclick="editSale('${r.id}')" title="Edit">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn btn-icon btn-delete btn-sm" onclick="deleteSale('${r.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>` : ''}
    </tr>`;
}

function renderPieceRow(r, showActions = false) {
  return `
    <tr>
      <td class="td-date">${formatDate(r.date)}</td>
      <td style="font-weight:600;">${escHtml(r.item_name)}</td>
      <td style="font-family:var(--font-serif); font-size:1rem; font-weight:600;">${r.quantity}</td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${r.notes || '—'}</td>
      ${showActions ? `
      <td>
        <div class="td-actions">
          <button class="btn btn-icon btn-edit btn-sm" onclick="editPiece('${r.id}')" title="Edit">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="btn btn-icon btn-delete btn-sm" onclick="deletePiece('${r.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>` : ''}
    </tr>`;
}

/* ═══════════════════════════════════════════════════════
   KPI CARDS — TODAY & CURRENT MONTH
═══════════════════════════════════════════════════════ */
function updateKPIs() {
  const today = getTodayString();
  const thisMonth = today.slice(0, 7);

  // Today
  const todayEntries = salesData.filter(r => r.date === today);
  const todayGoldProfit    = sumField(todayEntries, 'gold_profit');
  const todayDiamondProfit = sumField(todayEntries, 'diamond_profit');
  const todayTotalProfit   = todayGoldProfit + todayDiamondProfit;
  const todayGoldPct       = (todayGoldProfit / DAILY_TARGET) * 100;
  const todayDiamondPct    = (todayDiamondProfit / DAILY_TARGET) * 100;
  const todayTotalPct      = todayGoldPct + todayDiamondPct;

  setText('kpi-gold-profit',    fmtKWD(todayGoldProfit));
  setText('kpi-gold-pct',       `${todayGoldPct.toFixed(2)}% of daily target`);
  setText('kpi-diamond-profit', fmtKWD(todayDiamondProfit));
  setText('kpi-diamond-pct',    `${todayDiamondPct.toFixed(2)}% of daily target`);
  setText('kpi-total-profit',   fmtKWD(todayTotalProfit));
  setText('kpi-total-pct',      `${todayTotalPct.toFixed(2)}% of daily target`);

  // This month
  const monthEntries = salesData.filter(r => r.date && r.date.startsWith(thisMonth));
  const monthTotal   = sumField(monthEntries, 'total_profit');
  setText('kpi-month-profit', fmtKWD(monthTotal));
  setText('kpi-month-days',   `${monthEntries.length} day${monthEntries.length !== 1 ? 's' : ''} recorded`);
}

/* ═══════════════════════════════════════════════════════
   MONTHLY REPORT
═══════════════════════════════════════════════════════ */
function generateReport() {
  const month = document.getElementById('report-month').value;
  if (!month) {
    showToast('Please select a month to generate the report.', 'error');
    return;
  }

  const monthSales  = sortByDate(salesData.filter(r => r.date && r.date.startsWith(month)));
  const monthPieces = sortByDate(piecesData.filter(r => r.date && r.date.startsWith(month)));

  // Update header
  setText('report-period',    formatMonthLabel(month));
  setText('report-generated', formatDate(getTodayString()));

  // Calculate totals
  const totalGoldProfit    = sumField(monthSales, 'gold_profit');
  const totalDiamondProfit = sumField(monthSales, 'diamond_profit');
  const totalProfit        = sumField(monthSales, 'total_profit');
  const days               = monthSales.length;

  // Sum of all daily percentages (NOT average)
  // e.g. 4 days × 30% = 120%
  const totalGoldPct    = sumField(monthSales, 'gold_profit_pct');
  const totalDiamondPct = sumField(monthSales, 'diamond_profit_pct');
  const totalPct        = sumField(monthSales, 'total_pct');

  // Averages (per day)
  const avgGoldPct    = days > 0 ? totalGoldPct / days    : 0;
  const avgDiamondPct = days > 0 ? totalDiamondPct / days : 0;

  // Update KPI blocks
  setText('rpt-total-gold',    fmtKWD(totalGoldProfit));
  setText('rpt-total-diamond', fmtKWD(totalDiamondProfit));
  setText('rpt-total-profit',  fmtKWD(totalProfit));
  setText('rpt-avg-gold-pct',  `${avgGoldPct.toFixed(2)}% / day`);
  setText('rpt-avg-diamond-pct', `${avgDiamondPct.toFixed(2)}% / day`);
  setText('rpt-total-pct',     `${totalPct.toFixed(2)}%`);

  // Build daily table rows
  const tbody = document.getElementById('report-tbody');
  if (monthSales.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:2rem; color:var(--text-muted); font-style:italic;">No sales recorded for ${formatMonthLabel(month)}.</td></tr>`;
  } else {
    tbody.innerHTML = monthSales.map((r, i) => `
      <tr>
        <td style="font-weight:700; color:var(--text-muted);">${i + 1}</td>
        <td style="font-weight:600; white-space:nowrap;">${formatDate(r.date)}</td>
        <td>${fmtKWD(r.gold_sales)}</td>
        <td style="color:var(--gold-dark); font-weight:600;">${fmtKWD(r.gold_profit)}</td>
        <td style="color:var(--gold-dark); font-weight:700;">${r.gold_profit_pct.toFixed(2)}%</td>
        <td>${fmtKWD(r.diamond_sales)}</td>
        <td style="color:var(--diamond-dark); font-weight:600;">${fmtKWD(r.diamond_profit)}</td>
        <td style="color:var(--diamond-dark); font-weight:700;">${r.diamond_profit_pct.toFixed(2)}%</td>
        <td style="color:#2D7D4E; font-weight:700;">${fmtKWD(r.total_profit)}</td>
        <td style="color:#2D7D4E; font-weight:800; font-size:0.85rem;">${r.total_pct.toFixed(2)}%</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${r.notes || '—'}</td>
      </tr>`).join('');
  }

  // Footer row
  const tfoot = document.getElementById('report-tfoot');
  tfoot.innerHTML = `
    <tr>
      <td colspan="2" style="text-align:left; padding-left:1rem;">TOTALS (${days} days)</td>
      <td>—</td>
      <td>${fmtKWD(totalGoldProfit)}</td>
      <td>${totalGoldPct.toFixed(2)}%</td>
      <td>—</td>
      <td>${fmtKWD(totalDiamondProfit)}</td>
      <td>${totalDiamondPct.toFixed(2)}%</td>
      <td>${fmtKWD(totalProfit)}</td>
      <td>${totalPct.toFixed(2)}%</td>
      <td>—</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align:left; padding-left:1rem; opacity:0.75; font-size:0.72rem;">DAILY AVG</td>
      <td>—</td>
      <td>${fmtKWD(days > 0 ? totalGoldProfit/days : 0)}</td>
      <td>${avgGoldPct.toFixed(2)}%</td>
      <td>—</td>
      <td>${fmtKWD(days > 0 ? totalDiamondProfit/days : 0)}</td>
      <td>${avgDiamondPct.toFixed(2)}%</td>
      <td>${fmtKWD(days > 0 ? totalProfit/days : 0)}</td>
      <td>${(days > 0 ? totalPct/days : 0).toFixed(2)}%</td>
      <td>—</td>
    </tr>`;

  // Pieces table
  const piecesTbody = document.getElementById('report-pieces-tbody');
  if (monthPieces.length === 0) {
    piecesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted); font-style:italic;">No pieces recorded for this month.</td></tr>`;
  } else {
    piecesTbody.innerHTML = monthPieces.map(r => `
      <tr>
        <td style="font-weight:600;">${formatDate(r.date)}</td>
        <td style="font-weight:600;">${escHtml(r.item_name)}</td>
        <td style="font-weight:700;">${r.quantity}</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${r.notes || '—'}</td>
      </tr>`).join('');
  }

  showToast(`Report generated for ${formatMonthLabel(month)}.`, 'success');
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════ */
function showSection(name) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Show target
  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === name);
  });

  // Close mobile nav
  document.getElementById('main-nav')?.classList.remove('open');

  // Section-specific actions
  if (name === 'report') generateReport();
  if (name === 'dashboard') { renderDashboard(); updateKPIs(); }
}

function toggleNav() {
  document.getElementById('main-nav')?.classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════ */
function openDeleteModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('delete-modal').classList.remove('hidden');
  document.getElementById('confirm-delete-btn').onclick = () => {
    if (deleteCallback) deleteCallback();
  };
}

function closeDeleteModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('delete-modal').classList.add('hidden');
  deleteCallback = null;
}

document.getElementById('modal-overlay')?.addEventListener('click', closeDeleteModal);

/* ═══════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════ */
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: 'fas fa-check-circle',
    error:   'fas fa-exclamation-circle',
    info:    'fas fa-info-circle',
    default: 'fas fa-bell',
  };
  const id = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.id = id;
  toast.innerHTML = `
    <i class="toast-icon ${icons[type] || icons.default}"></i>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="removeToast('${id}')">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => removeToast(id), 4500);
}

function removeToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(() => el.remove(), 300);
}

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function genId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function formatMonthLabel(monthStr) {
  if (!monthStr) return '—';
  try {
    const [y, m] = monthStr.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch { return monthStr; }
}

function fmtKWD(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return parseFloat(n).toFixed(3) + ' KWD';
}

function fmt(n, suffix = '') {
  if (n === undefined || n === null || isNaN(n)) return '—';
  return parseFloat(n).toFixed(2) + suffix;
}

function sumField(arr, field) {
  return arr.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0);
}

function sortByDate(arr) {
  return [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
