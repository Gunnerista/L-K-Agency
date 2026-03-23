/**
 * L&K Agency - Browser File Generator
 * localStorageì ì ì¥ë ì¤í¬ëí ë°ì´í°ë¡ë¶í° Excel + HTML ëìë³´ëë¥¼ ìì±í©ëë¤.
 *
 * ì¬ì  ì¡°ê±´:
 *   localStorage['fa_data'] â Free Agents JSON
 *   localStorage['ce_data'] â Contract Expiring JSON
 *
 * ì¬ì©ë²:
 *   transfermarkt.com ì½ììì ì´ ì¤í¬ë¦½í¸ë¥¼ ì¤ííë©´
 *   Excel(.xlsx)ê³¼ HTML ëìë³´ëê° ìë ë¤ì´ë¡ëë©ëë¤.
 *
 * ìì¡´ì±: SheetJS (xlsx v0.18.5) â ì¤í¬ë¦½í¸ ë´ìì ìë ë¡ë
 */

(async function() {
    // ââ 1. Load SheetJS ââ
    console.log('[Generator] Loading SheetJS...');
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load SheetJS'));
        document.head.appendChild(script);
    });
    console.log('[Generator] SheetJS loaded.');

    // ââ 2. Load data from localStorage ââ
    const faRaw = localStorage.getItem('fa_data');
    const ceRaw = localStorage.getItem('ce_data');
    if (!faRaw || !ceRaw) {
        console.error('[Generator] Missing data! Run scrapers first.');
        console.error('  fa_data:', faRaw ? 'OK' : 'MISSING');
        console.error('  ce_data:', ceRaw ? 'OK' : 'MISSING');
        return;
    }

    const faData = JSON.parse(faRaw);
    const ceData = JSON.parse(ceRaw);
    console.log(`[Generator] FA: ${faData.length} players, CE: ${ceData.length} players`);

    // ââ 3. Parse market value for sorting ââ
    function parseValue(v) {
        if (!v || v === 'N/A' || v === '-') return 0;
        const str = v.replace(/[^0-9.kmbnâ¬Â£]/gi, '').toLowerCase();
        let num = parseFloat(str) || 0;
        if (str.includes('bn') || str.includes('b')) num *= 1e9;
        else if (str.includes('m')) num *= 1e6;
        else if (str.includes('k')) num *= 1e3;
        return num;
    }

    // Sort by market value descending
    faData.sort((a, b) => parseValue(b.market_value) - parseValue(a.market_value));
    ceData.sort((a, b) => parseValue(b.market_value) - parseValue(a.market_value));

    // ââ 4. Generate Excel ââ
    console.log('[Generator] Creating Excel...');
    const wb = XLSX.utils.book_new();

    // FA Sheet
    const faHeaders = ['Name', 'Position', 'Age', 'Nationality', 'Market Value', 'Last Club', 'League'];
    const faRows = faData.map(p => [
        p.name, p.position, p.age, p.nationality, p.market_value, p.last_club || '', p.league
    ]);
    const faWs = XLSX.utils.aoa_to_sheet([faHeaders, ...faRows]);
    faWs['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 6 }, { wch: 18 }, { wch: 14 }, { wch: 25 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, faWs, 'Free Agents');

    // CE Sheet
    const ceHeaders = ['Name', 'Position', 'Age', 'Nationality', 'Market Value', 'Current Club', 'Contract Expiry', 'League'];
    const ceRows = ceData.map(p => [
        p.name, p.position, p.age, p.nationality, p.market_value, p.current_club || '', p.contract_expiry || '', p.league
    ]);
    const ceWs = XLSX.utils.aoa_to_sheet([ceHeaders, ...ceRows]);
    ceWs['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 6 }, { wch: 18 }, { wch: 14 }, { wch: 25 }, { wch: 14 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ceWs, 'Contract Expiring 2026');

    XLSX.writeFile(wb, 'LK_Agency_Transfer_Market_Analysis_2026.xlsx');
    console.log('[Generator] Excel downloaded!');

    // ââ 5. Generate HTML Dashboard ââ
    console.log('[Generator] Creating HTML dashboard...');

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Collect unique leagues
    const faLeagues = [...new Set(faData.map(p => p.league))].sort();
    const ceLeagues = [...new Set(ceData.map(p => p.league))].sort();

    function buildTableRows(data, type) {
        return data.map(p => {
            if (type === 'fa') {
                return `<tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${escapeHtml(p.position)}</td>
                    <td>${escapeHtml(String(p.age))}</td>
                    <td>${escapeHtml(p.nationality)}</td>
                    <td data-value="${parseValue(p.market_value)}">${escapeHtml(p.market_value)}</td>
                    <td>${escapeHtml(p.last_club || '')}</td>
                    <td>${escapeHtml(p.league)}</td>
                </tr>`;
            } else {
                return `<tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${escapeHtml(p.position)}</td>
                    <td>${escapeHtml(String(p.age))}</td>
                    <td>${escapeHtml(p.nationality)}</td>
                    <td data-value="${parseValue(p.market_value)}">${escapeHtml(p.market_value)}</td>
                    <td>${escapeHtml(p.current_club || '')}</td>
                    <td>${escapeHtml(p.contract_expiry || '')}</td>
                    <td>${escapeHtml(p.league)}</td>
                </tr>`;
            }
        }).join('\n');
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>L&K Agency Transfer Market Dashboard 2026</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e1a; color: #e0e0e0; }
.header { background: linear-gradient(135deg, #1a1f3a 0%, #0d1117 100%); padding: 30px; text-align: center; border-bottom: 2px solid #2d5aa0; }
.header h1 { font-size: 28px; color: #4da6ff; margin-bottom: 8px; }
.header p { color: #8899aa; font-size: 14px; }
.stats { display: flex; justify-content: center; gap: 40px; margin: 20px 0; }
.stat { text-align: center; }
.stat .num { font-size: 32px; font-weight: bold; color: #4da6ff; }
.stat .label { font-size: 12px; color: #6688aa; text-transform: uppercase; }
.tabs { display: flex; justify-content: center; gap: 10px; padding: 20px; }
.tab { padding: 12px 24px; border: 1px solid #2d5aa0; border-radius: 8px; cursor: pointer; background: transparent; color: #8899aa; font-size: 14px; transition: all 0.3s; }
.tab.active { background: #2d5aa0; color: #fff; }
.tab:hover { border-color: #4da6ff; color: #4da6ff; }
.controls { padding: 10px 30px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.controls input, .controls select { padding: 8px 14px; border-radius: 6px; border: 1px solid #2d3a5a; background: #111827; color: #e0e0e0; font-size: 14px; }
.controls input { flex: 1; min-width: 200px; }
.controls select { min-width: 160px; }
.table-wrap { overflow-x: auto; padding: 0 20px 30px; }
table { width: 100%; border-collapse: collapse; }
th { background: #1a2540; color: #4da6ff; padding: 12px; text-align: left; cursor: pointer; position: sticky; top: 0; font-size: 13px; white-space: nowrap; }
th:hover { background: #243050; }
td { padding: 10px 12px; border-bottom: 1px solid #1a2030; font-size: 13px; }
tr:nth-child(even) { background: rgba(255,255,255,0.02); }
tr:hover { background: rgba(77,166,255,0.08); }
.hidden { display: none; }
.count { padding: 5px 30px; color: #6688aa; font-size: 13px; }
</style>
</head>
<body>
<div class="header">
    <h1>L&K Agency Transfer Market Dashboard</h1>
    <p>2026 Season Analysis | 34 Leagues</p>
    <div class="stats">
        <div class="stat"><div class="num">${faData.length}</div><div class="label">Free Agents</div></div>
        <div class="stat"><div class="num">${ceData.length}</div><div class="label">Contract Expiring</div></div>
        <div class="stat"><div class="num">${faData.length + ceData.length}</div><div class="label">Total Players</div></div>
    </div>
</div>
<div class="tabs">
    <div class="tab active" onclick="switchTab('fa')">Free Agents (${faData.length})</div>
    <div class="tab" onclick="switchTab('ce')">Contract Expiring (${ceData.length})</div>
</div>
<div id="fa-section">
    <div class="controls">
        <input type="text" id="fa-search" placeholder="Search by name, club, nationality..." oninput="filterTable('fa')">
        <select id="fa-league" onchange="filterTable('fa')"><option value="">All Leagues</option>${faLeagues.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('')}</select>
    </div>
    <div class="count" id="fa-count">${faData.length} players</div>
    <div class="table-wrap">
        <table id="fa-table">
            <thead><tr><th onclick="sortTable('fa',0)">Name</th><th onclick="sortTable('fa',1)">Position</th><th onclick="sortTable('fa',2)">Age</th><th onclick="sortTable('fa',3)">Nationality</th><th onclick="sortTable('fa',4)">Market Value</th><th onclick="sortTable('fa',5)">Last Club</th><th onclick="sortTable('fa',6)">League</th></tr></thead>
            <tbody>${buildTableRows(faData, 'fa')}</tbody>
        </table>
    </div>
</div>
<div id="ce-section" class="hidden">
    <div class="controls">
        <input type="text" id="ce-search" placeholder="Search by name, club, nationality..." oninput="filterTable('ce')">
        <select id="ce-league" onchange="filterTable('ce')"><option value="">All Leagues</option>${ceLeagues.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('')}</select>
    </div>
    <div class="count" id="ce-count">${ceData.length} players</div>
    <div class="table-wrap">
        <table id="ce-table">
            <thead><tr><th onclick="sortTable('ce',0)">Name</th><th onclick="sortTable('ce',1)">Position</th><th onclick="sortTable('ce',2)">Age</th><th onclick="sortTable('ce',3)">Nationality</th><th onclick="sortTable('ce',4)">Market Value</th><th onclick="sortTable('ce',5)">Current Club</th><th onclick="sortTable('ce',6)">Contract Expiry</th><th onclick="sortTable('ce',7)">League</th></tr></thead>
            <tbody>${buildTableRows(ceData, 'ce')}</tbody>
        </table>
    </div>
</div>
<script>
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('active', (tab==='fa'?i===0:i===1)));
    document.getElementById('fa-section').classList.toggle('hidden', tab!=='fa');
    document.getElementById('ce-section').classList.toggle('hidden', tab!=='ce');
}
function filterTable(tab) {
    const search = document.getElementById(tab+'-search').value.toLowerCase();
    const league = document.getElementById(tab+'-league').value;
    const rows = document.querySelectorAll('#'+tab+'-table tbody tr');
    let count = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const leagueCell = row.cells[tab==='fa'?6:7]?.textContent || '';
        const show = text.includes(search) && (!league || leagueCell === league);
        row.style.display = show ? '' : 'none';
        if (show) count++;
    });
    document.getElementById(tab+'-count').textContent = count + ' players';
}
let sortState = {};
function sortTable(tab, col) {
    const key = tab+col;
    sortState[key] = !sortState[key];
    const tbody = document.querySelector('#'+tab+'-table tbody');
    const rows = Array.from(tbody.rows);
    rows.sort((a,b) => {
        let va = a.cells[col]?.textContent || '';
        let vb = b.cells[col]?.textContent || '';
        if (col === 4) { va = parseFloat(a.cells[col]?.dataset.value||0); vb = parseFloat(b.cells[col]?.dataset.value||0); return sortState[key] ? va-vb : vb-va; }
        if (col === 2) { va = parseInt(va)||0; vb = parseInt(vb)||0; return sortState[key] ? va-vb : vb-va; }
        return sortState[key] ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    rows.forEach(r => tbody.appendChild(r));
}
</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'LK_Agency_Transfer_Dashboard_2026.html';
    a.click();
    URL.revokeObjectURL(a.href);
    console.log('[Generator] HTML Dashboard downloaded!');
    console.log('[Generator] All files generated successfully!');
})();
