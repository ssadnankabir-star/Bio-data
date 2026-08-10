# Sadnan Kaabeer - Live PDF & Image Export

Upload `index.html` and the `js/live-export.js` file to the same GitHub Pages project.

## What this version does

- Share live link: shares the current website URL.
- Professional PDF: uses the browser print engine on the current live profile. This keeps text sharp and real `<a>` links clickable in saved PDFs.
- Share page image: builds 3 complete export pages from the currently rendered profile and captures only the selected page.
- It does not cut a section in the middle.
- It uses the current DOM, so Firebase-loaded or admin-published content is included after it appears on the page.

## Required files

- `index.html`
- `js/live-export.js`
- your existing `assets/profile.jpg`
- your existing Firebase config/admin files

## Important

Image export loads `html2canvas` from jsDelivr. GitHub Pages needs internet access in the visitor's browser, which is normally fine.

PDF export intentionally does not use jsPDF. Browser Print / Save as PDF gives better typography and preserves clickable links much more reliably.
