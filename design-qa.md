# Yuequn Homepage Design QA

- Source visual truth: `D:\CODEX_SPEC.md\image\桌機板-首頁.png` (1440 x 4177) and `D:\CODEX_SPEC.md\image\手機板-首頁.png` (390 x 5378)
- Implementation: `http://127.0.0.1:4174/high-fi/figma-homepage.html`
- Implementation screenshots: Codex in-app Browser tab 1, full-page desktop and calibrated 391 CSS-pixel mobile captures
- Viewports: desktop 1440 x 900 CSS px; mobile 391 x 850 CSS px (viewport control calibrated from 312 physical px)
- Density normalization: browser capture density was scaled by the in-app surface; comparison used full-page normalized previews
- State: homepage default, plus service tab selected and mobile menu open

**Full-view comparison evidence**

- Desktop preserves the source's white sticky navigation, split hero, angled red overlay, service feature, four trust cards, red technician stage, offset review cards, map contact block, and oversized red footer.
- Mobile preserves the source order and single-column reading rhythm: header, copy-first hero, full-width workshop image, horizontal service tabs, four stacked trust cards, centered technician carousel, review carousel, contact/map, and vertical red footer.
- No horizontal document overflow was found at the calibrated mobile viewport (`scrollWidth 372`, `innerWidth 391`).

**Focused comparison evidence**

- Hero: supplied technician photograph, subject crop, red wedge, headline weight, red emphasis, SINCE label, and CTA were checked at desktop and mobile sizes.
- Service and team cards: supplied photos remain sharp and use the reference's white-card/red-stage treatment.
- Typography and copy: Noto Sans TC/Traditional Chinese hierarchy, labels, headings, service names, contact details, and review content were checked against the supplied images.

**Findings**

- No actionable P0/P1/P2 mismatch remains after the responsive pass.
- [P3] Fine differences may remain in exact font rasterization and diagonal-mask angles because the supplied references are flattened raster images.

**Comparison history**

- Initial implementation drift: footer was white, contact used two images, mobile values were two columns, and desktop/mobile section proportions did not match.
- Fixes: restored the red geometric footer, single map treatment, stacked mobile value cards, screenshot-matched section heights and gutters, source image crops, and bounded carousel/menu states.
- Post-fix evidence: desktop and calibrated mobile browser captures show the corrected composition; build succeeds and browser console has no errors or warnings.

**Interaction verification**

- Service tab changes selected state and visible service content.
- Mobile navigation opens and reports its expanded state.
- Technician and review controls remain keyboard-accessible buttons.
- Reduced-motion behavior is present; all key icon controls have accessible labels.

**Follow-up polish**

- P3 only: adjust individual diagonal vertices or 1-2 px typographic metrics if a future overlay comparison requires pixel-level calibration.

final result: passed
