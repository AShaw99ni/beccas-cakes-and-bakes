---
  Shop page

  1. Products load — visit the shop, spinner shows briefly then products appear. No flash of wrong state before status loads.
  2. Images and placeholders — products with images show them; products without show the "Photo coming soon" camera placeholder.
  3. Notice banner (open) — when window is open, banner reads "Fresh to order. Orders close [date]" pulled from the sheet.

  ---
  Order window — closed state

  4. Closed banner appears — with window closed, a dark banner appears above the products saying orders are closed with the reopen date. YES
  5. Static notice hidden — the hardcoded notice banner is hidden when the closed banner is showing. YES
  6. Products greyed out — all product cards are dimmed and unclickable. YES
  7. 60-second poll — open the shop while the window is open, then change the sheet to close it. Within 60 seconds the page should grey out without refreshing. YES

  ---
  Sold out / stock

  8. Sold out badge — set a product's max_qty to 0 in the sheet (or exhaust it via orders). The card should show "Sold out" and be greyed out. YES
  9. Limited availability badge — set max_qty to 3 and sold_qty close to it. "Only X left!" badge appears on the card. YES

  ---
  Checkout — happy path

  10. Open window, add items, open checkout — summary renders with correct prices and Saturday collection dates. YES
  11. Collection date picker — only Saturdays shown, at least 7 days ahead, each labelled "9:30am–12:30pm". YES
  12. Market Saturday excluded — add a stall event on a Saturday in the events sheet. That Saturday (and any weekend with a Sunday stall) should not appear in the picker. YES?
  13. Pay with test card — use 4242 4242 4242 4242, any future expiry, any CVC. Should redirect to Stripe, complete payment, land on order success page. YES
  14. Becca receives order email — check the notification email has correct items, total, collection date with 9:30am–12:30pm time. YES
  15. Customer receives confirmation email — check confirmation email has same details and correct collection time. YES
  16. Sold counts increment — after a successful order, call /.netlify/functions/get-shop-status directly in the browser and confirm soldQty has increased for the ordered products. YES

  ---
  Checkout — edge cases

  17. Window closes during checkout — open window, add items to basket, then close the window in the sheet, then try to pay. Server should reject with "Orders are not currently open."
  18. Over-requested quantity — with max_qty: 5 and 3 already sold, try to order 4. Checkout error should say "Only 2 of X are available — your quantity has been updated." Summary should update to 2. Clicking Try Again should proceed. YES
  19. Fully sold out at checkout — exhaust a product completely, then try to check out with it in your basket. Should get "Sorry, X is no longer available." YES

  ---
  Auto-reset

  21. Sold counts reset on new window — after running up some sold counts, change open_from in the sheet to a new date. Call get-shop-status and confirm soldQty values are all back to 0. YES

  ---
  Other pages

  22. Nav and footer on all pages — visit contact, order success, order cancel, new-index, gallery, our story, upcoming events. Nav and footer should appear with no console errors. YES
  23. Gallery loads — photos display, filter buttons work, lightbox opens. YES
  24. Upcoming events — events render, filter tabs work, past events collapsed. YES
  25. Allergen advice — products load, products without images show "Photo coming soon" placeholder, modal opens correctly. YES, but when open modal in shop, disable add to basket if sold out or order window not open. Works when the window is closed

  ---
  I'd do these roughly in order — get the happy path working first (10–16) before testing the edge cases.