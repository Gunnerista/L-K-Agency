/**
 * L&K Agency - Contract Expiry Scraper
 * Transfermarkt.comìì 2026ë ì¬ë¦ ê³ì½ë§ë£ ì ì ë°ì´í°ë¥¼ ìì§í©ëë¤.
 *
 * ì¬ì©ë²:
 * 1. transfermarkt.com ìë¬´ íì´ì§ìì F12 (ê°ë°ì ëêµ¬) ì´ê¸°
 * 2. Console í­ì ì´ ì¤í¬ë¦½í¸ ì ì²´ë¥¼ ë¶ì¬ë£ê¸°
 * 3. ìì§ ìë£ í localStorage['ce_data']ì JSONì¼ë¡ ì ì¥ë¨
 *
 * ëì: 34ê° ë¦¬ê·¸, 32ì¸ ë¯¸ë§, 2026ë 6ì 30ì¼ ê³ì½ ë§ë£ ì ì
 */

(async function() {
    const LEAGUES = {
        'GB1': 'Premier League', 'GB2': 'Championship', 'GB3': 'League One',
        'ES1': 'LaLiga', 'ES2': 'LaLiga2', 'L1': 'Bundesliga', 'L2': '2. Bundesliga',
        'DK1': 'Superliga (Denmark)', 'SE1': 'Allsvenskan', 'NO1': 'Eliteserien',
        'FI1': 'Veikkausliiga', 'IS1': 'Besta deild (Iceland)',
        'IT1': 'Serie A', 'FR1': 'Ligue 1', 'PO1': 'Liga Portugal', 'NL1': 'Eredivisie',
        'BE1': 'Jupiler Pro League', 'TR1': 'SÃ¼per Lig', 'RSK1': 'K League 1',
        'SA1': 'Saudi Pro League', 'MLS1': 'MLS', 'C1': 'Super League (Switzerland)',
        'A1': 'Bundesliga (Austria)', 'SC1': 'Scottish Premiership',
        'GR1': 'Super League 1 (Greece)', 'BRA1': 'SÃ©rie A (Brazil)',
        'ARG1': 'Torneo Apertura (Argentina)', 'MEX1': 'Liga MX', 'AUS1': 'A-League',
        'RU1': 'Premier Liga (Russia)', 'UKR1': 'Premier Liga (Ukraine)',
        'PL1': 'Ekstraklasa', 'TS1': 'Chance Liga (Czech Republic)',
        'KR1': 'SuperSport HNL (Croatia)', 'SER1': 'Super liga Srbije'
    };

    const allPlayers = [];
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const MAX_AGE = 31; // Under 32

    for (const [code, name] of Object.entries(LEAGUES)) {
        console.log(`[CE] Scraping ${name} (${code})...`);
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const url = `https://www.transfermarkt.com/league/vertragsende/wettbewerb/${code}/plus/1/galerie/0/page/${page}`;
                const resp = await fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const html = await resp.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const rows = doc.querySelectorAll('table.items tbody tr');

                if (rows.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const row of rows) {
                    const nameEl = row.querySelector('td.hauptlink a');
                    const posEl = row.querySelector('td:nth-child(2)');
                    const ageEl = row.querySelector('td.zentriert');
                    const valueEl = row.querySelector('td.rechts');
                    const nationEl = row.querySelector('img.flaggenrahmen');
                    const clubEl = row.querySelector('td:nth-child(5) a, td:nth-child(6) a');
                    const expiryEl = row.querySelector('td:last-child');

                    const age = ageEl ? parseInt(ageEl.textContent.trim()) : 99;

                    if (nameEl && age <= MAX_AGE) {
                        allPlayers.push({
                            name: nameEl.textContent.trim(),
                            position: posEl ? posEl.textContent.trim() : '',
                            age: age,
                            nationality: nationEl ? nationEl.getAttribute('title') || '' : '',
                            market_value: valueEl ? valueEl.textContent.trim() : '',
                            current_club: clubEl ? clubEl.textContent.trim() : '',
                            contract_expiry: expiryEl ? expiryEl.textContent.trim() : '',
                            league: name,
                            league_code: code,
                            profile_url: nameEl.href || '',
                            type: 'Contract Expiring 2026'
                        });
                    }
                }

                const nextPage = doc.querySelector('li.naechste-seite a');
                if (!nextPage) hasMore = false;
                else page++;

                await delay(1500 + Math.random() * 1000);
            } catch (e) {
                console.warn(`[CE] Error on ${name} page ${page}:`, e.message);
                hasMore = false;
            }
        }
        console.log(`[CE] ${name}: ${allPlayers.length} total players so far`);
    }

    localStorage.setItem('ce_data', JSON.stringify(allPlayers));
    console.log(`[CE] DONE! Total: ${allPlayers.length} contract-expiring players saved to localStorage['ce_data']`);
})();
