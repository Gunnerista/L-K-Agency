/**
 * L&K Agency - Free Agents Scraper
 * Transfermarkt.comìì ìì ê³ì½(FA) ì ì ë°ì´í°ë¥¼ ìì§í©ëë¤.
 *
 * ì¬ì©ë²:
 * 1. transfermarkt.com ìë¬´ íì´ì§ìì F12 (ê°ë°ì ëêµ¬) ì´ê¸°
 * 2. Console í­ì ì´ ì¤í¬ë¦½í¸ ì ì²´ë¥¼ ë¶ì¬ë£ê¸°
 * 3. ìì§ ìë£ í localStorage['fa_data']ì JSONì¼ë¡ ì ì¥ë¨
 *
 * ëì: 34ê° ë¦¬ê·¸ì íì¬ ìì ê³ì½ ì ì
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

    for (const [code, name] of Object.entries(LEAGUES)) {
        console.log(`[FA] Scraping ${name} (${code})...`);
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const url = `https://www.transfermarkt.com/league/vertragsloseNachVerein/wettbewerb/${code}/page/${page}`;
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
                    const lastClubEl = row.querySelector('td:nth-child(5) a, td:nth-child(6) a');

                    if (nameEl) {
                        allPlayers.push({
                            name: nameEl.textContent.trim(),
                            position: posEl ? posEl.textContent.trim() : '',
                            age: ageEl ? ageEl.textContent.trim() : '',
                            nationality: nationEl ? nationEl.getAttribute('title') || '' : '',
                            market_value: valueEl ? valueEl.textContent.trim() : '',
                            last_club: lastClubEl ? lastClubEl.textContent.trim() : '',
                            league: name,
                            league_code: code,
                            profile_url: nameEl.href || '',
                            type: 'Free Agent'
                        });
                    }
                }

                // Check pagination
                const nextPage = doc.querySelector('li.naechste-seite a');
                if (!nextPage) hasMore = false;
                else page++;

                await delay(1500 + Math.random() * 1000);
            } catch (e) {
                console.warn(`[FA] Error on ${name} page ${page}:`, e.message);
                hasMore = false;
            }
        }
        console.log(`[FA] ${name}: ${allPlayers.length} total players so far`);
    }

    localStorage.setItem('fa_data', JSON.stringify(allPlayers));
    console.log(`[FA] DONE! Total: ${allPlayers.length} free agents saved to localStorage['fa_data']`);
})();
