# v1 reliability changes — 2026-09-23

Modified: `index-20260923-safety-pwa-v1.html` and `sw.js`.

- Missing values in an otherwise successful API response are no longer replaced with benign wind, wave, temperature, pressure, or weather defaults. They remain `null`; incomplete core wind/wave data makes the safety card show **資料不足，暫不評估**, and fish scoring is withheld when its core inputs are incomplete.
- Added **推估潮流納入魚情** per-spot setting. Selecting 「僅顯示，不納入分數」 leaves the estimated tide-current row available for trend reading but removes it from fishing-score weighting. The UI now calls this value **推估潮流**.
- The synthetic fallback generator is renamed `generateDevelopmentSampleData()` and documented as development-only. Production fetch failures use the existing no-assessment state.
- Replaced per-hour repeated time-array scans with time-index `Map`s. Tide lookup is indexed; the daily mean used for estimated tide current is cached once per date.
- Service-worker cache version increased to `sunnyfish-shell-v2` and now caches `index-20260923-safety-pwa-v1.html` for offline shell availability. Forecast API data remains network-only.
- The 「觸發限制因素」heading and explanation list use half-size secondary text, while the safety badge and measurements retain their existing emphasis.
