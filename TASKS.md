# FF Meta — Sprint: Dashboard & Layout Cleanup

> Source docs: UI/Sidebar components live in `src/components/layout/`  
> Run `pnpm dev` locally to verify visual changes.

## TODO

- [ ] **Replace sidebar word-mark with logo image**  
      _File:_ `src/components/layout/Sidebar/SidebarHeader.tsx`  
      _Done when:_ `<Logo />` renders, clicks route to `/`.

- [ ] **Remove duplicate home icon in sidebar**  
      _Files to check:_ `SidebarLinks.ts`, `Sidebar.tsx`  
      _Done when:_ Only one home entry appears.

- [ ] **Drop Navbar and relocate Light/Dark switch & Profile icon to sidebar footer**  
      _Files:_ `Navbar.tsx`, `Sidebar/Footer.tsx`, theme context  
      _Done when:_ No `Navbar` rendered anywhere; two icons sit above footer text.

- [ ] **Add footer text `© 2025 FF Meta — All rights reserved.` on every page**  
      _File:_ `src/components/layout/AppShell.tsx`  
      _Done when:_ Text visible in dev build across all routes.

---

## Dashboard

- [ ] **Create reusable `<ComingSoon message="Coming soon…"/>` component**  
      _Location:_ `src/components/common/ComingSoon.tsx`  
      _Done when:_ Accepts optional `message` prop, minimal styling.

- [ ] **Replace entire Dashboard content with `<ComingSoon/>`**  
      _File:_ `routes/Dashboard.tsx`  
      _Done when:_ No AI Predictions or Custom Reports cards remain.

---

## Players Page

- [ ] **Filter out K & DEF everywhere (table + filters)**  
      _Files:_ `routes/Players.tsx`, `utils/positionFilter.ts`  
      _Done when:_ K/DEF options & rows no longer appear.

- [ ] **Delete non-functional top-right buttons**  
      _Files:_ `PlayersHeader.tsx`  
      _Done when:_ No orphan buttons in UI.

- [ ] **Fix or remove broken “Rankings Set” dropdown**  
      _File:_ `RankingsToolbar.tsx`  
      _Done when:_ Dropdown opens and selects, or is hidden.

- [ ] **Move “Create New” button directly above table header**  
      _File:_ `PlayersHeader.tsx`  
      _Done when:_ Button aligns left of filters.

- [ ] **Remove “0 players ranked” badge**  
      _Files:_ same as above.

- [ ] **Add per-position dropdown inside “My Rankings” card**  
      _File:_ `MyRankingsCard.tsx`  
      _Done when:_ Selecting a position filters list.

- [ ] **[Spike] Audit UI components & sketch redesign**  
      _Output:_ save wireframe PNG/Figma link to `design/players-revamp/`  
      _Done when:_ image committed; no code changes required.

---

## Admin Panel

- [ ] **Hide all tabs except “Data Sync”**  
      _Files:_ `routes/Admin/*.tsx`  
      _Done when:_ Only one tab visible.

---

## Points Calculator

- [ ] **Make “Player Statistics” the only card on page**  
      _File:_ `routes/PointsCalculator.tsx`  
      _Done when:_ Single card occupies full width.

- [ ] **Embed “Calc Fantasy Pts” button inside that card footer**  
      _Same file_  
      _Done when:_ Button aligns right in card actions.

- [ ] **Turn “Fantasy Points Result” into a modal triggered by button**  
      _Files:_ `components/modals/FantasyPointsResult.tsx`, route file  
      _Done when:_ Modal opens, closes on ESC/outside-click.

---

## Profile

- [ ] **Create Profile tab that shows `<ComingSoon/>`**  
      _File:_ `routes/Profile.tsx`  
      _Done when:_ Route renders coming-soon message.
