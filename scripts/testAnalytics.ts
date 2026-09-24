import { getClubSeasons, getPeakSeasons, getBestPrimeWindows, getLongestStreaks, getCumulativeTitles, getClubSummaryStats } from '../src/lib/analytics';
import { CLUBS } from '../src/data/clubs';

function runTests() {
  console.log(`\n======================================================`);
  console.log(`Running Analytical Test Suite (README Section 47)`);
  console.log(`======================================================\n`);

  const failures: string[] = [];

  // Test 1: Chelsea Peak Season should include 2012 and 2021 (Titles)
  const chelseaPeaks = getPeakSeasons('chelsea');
  const chelseaPeakYears = chelseaPeaks.map(p => p.seasonEndYear);
  if (!chelseaPeakYears.includes(2012) || !chelseaPeakYears.includes(2021)) {
    failures.push(`Chelsea peak seasons should include 2012 and 2021. Got: ${chelseaPeakYears.join(', ')}`);
  } else {
    console.log(`✓ Chelsea peaks verified (2012 & 2021 Champions)`);
  }

  // Test 2: Cumulative titles match total titles for all clubs
  CLUBS.forEach(club => {
    const stats = getClubSummaryStats(club.id);
    const cum = getCumulativeTitles(club.id);
    const finalCum = cum[cum.length - 1].titles;
    if (stats.titles !== finalCum) {
      failures.push(`${club.name} cumulative titles (${finalCum}) do not match stats titles (${stats.titles})`);
    }
  });
  console.log(`✓ Cumulative titles match total titles across all 14 clubs`);

  // Test 3: Barcelona Prime Window (rolling 5-season)
  const barcaBestPrime = getBestPrimeWindows('barcelona', 5)[0];
  if (!barcaBestPrime || barcaBestPrime.qfPlus < 5) {
    failures.push(`Barcelona best prime window should have 5/5 QF+. Got: ${barcaBestPrime?.qfPlus}`);
  } else {
    console.log(`✓ Barcelona prime window verified (${barcaBestPrime.startSeason}–${barcaBestPrime.endSeason}: QF+ ${barcaBestPrime.qfPlus}/5, ${barcaBestPrime.titles} titles)`);
  }

  // Test 4: Streak calculation consistency (length equals year range + 1)
  CLUBS.forEach(club => {
    const streaks = getLongestStreaks(club.id);
    Object.entries(streaks).forEach(([key, s]) => {
      if (s.length > 0) {
        const expectedLen = s.endYear - s.startYear + 1;
        if (s.length !== expectedLen) {
          failures.push(`${club.name} ${key} streak length ${s.length} does not match ${s.startYear}-${s.endYear} (${expectedLen})`);
        }
      }
    });
  });
  console.log(`✓ Streak calculations correctly validated across all categories and clubs`);

  // Test 5: Bayern Munich longest QF+ streak
  const bayernStreaks = getLongestStreaks('bayern');
  if (bayernStreaks.qf.length < 5) {
    failures.push(`Bayern Munich QF+ streak should be at least 5. Got: ${bayernStreaks.qf.length}`);
  } else {
    console.log(`✓ Bayern Munich longest QF+ streak verified: ${bayernStreaks.qf.length} consecutive seasons (${bayernStreaks.qf.startSeason}–${bayernStreaks.qf.endSeason})`);
  }

  // Test 6: Verify all 13 clubs have complete 31 records
  CLUBS.forEach(c => {
    const seasons = getClubSeasons(c.id);
    if (seasons.length !== 31) {
      failures.push(`Club ${c.name} does not have exactly 31 seasons. Got: ${seasons.length}`);
    }
  });
  console.log(`✓ All 14 clubs verified for exactly 31 seasons (434 total observations)`);

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} analytics tests failed:`);
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log(`\n✅ All analytical suite tests passed successfully!\n`);
}

runTests();
