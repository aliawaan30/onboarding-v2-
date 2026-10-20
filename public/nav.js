/* Course jump menu.
   Floating three-line button, bottom right, on every course page.
   Opens a sheet listing all 41 pages so you can go straight to any of them.
   Self-contained: no dependencies, no build step. Included via /nav.js. */
(function () {
  if (window.__courseNav) return;
  window.__courseNav = 1;

  var MODULES = [
    ['M1', 'What an AI agency is', [
      ['/courses/m1/index.html', 'Every business near you needs AI, and almost none of them have it']]],
    ['M2', 'Build your business', [
      ['/courses/business/business-a.html', 'Nobody buys from somebody who says they do a bit of everything'],
      ['/courses/business/business-b.html', 'Build your website'],
      ['/courses/business/business-c.html', 'Your offer, contact and getting paid'],
      ['/courses/business/business-d.html', 'Go live']]],
    ['M3', 'Find your leads', [
      ['/courses/leads/leads-a.html', 'Your AI Goes Out and Finds the Customers'],
      ['/courses/leads/leads-c.html', 'Build Your Lead CRM'],
      ['/courses/leads/leads-d.html', 'Find Businesses With No Website'],
      ['/courses/leads/leads-e.html', 'Find Businesses Missing Calls'],
      ['/courses/leads/leads-f.html', 'Find Agents With Listings and No Video'],
      ['/courses/leads/leads-g.html', 'Let It Run Every Night']]],
    ['M4', 'AI Websites', [
      ['/courses/websites/websites-a.html', 'Why every business needs a website'],
      ['/courses/websites/websites-b.html', 'Build the Website']]],
    ['M9', 'Premium Websites', [
      ['/courses/premium/premium-a.html', 'The Same Afternoon, Ten Times the Money'],
      ['/courses/premium/premium-b.html', 'Load the Skill and Write the Brief'],
      ['/courses/premium/premium-c.html', 'Make the Media in Envato'],
      ['/courses/premium/premium-d.html', 'Build the Site'],
      ['/courses/premium/premium-e.html', 'Check It, Then Hand It Over']]],
    ['M5', 'AI Walkthrough Videos', [
      ['/courses/walkthroughs/walkthroughs-a.html', 'Agents Pay Hundreds for One Video, Then Wait a Week'],
      ['/courses/walkthroughs/walkthroughs-b.html', 'Build the App'],
      ['/courses/walkthroughs/walkthroughs-c.html', 'Finish the App'],
      ['/courses/walkthroughs/walkthroughs-d.html', 'Make Your First Video']]],
    ['M6', 'AI Receptionists', [
      ['/courses/receptionists/receptionists-a.html', 'Every missed call is a job that went to someone else'],
      ['/courses/receptionists/receptionists-b.html', 'Build The Booking Engine'],
      ['/courses/receptionists/receptionists-c.html', 'Build The Receptionist'],
      ['/courses/receptionists/receptionists-d.html', 'Give It A Real Number']]],
    ['M7', 'The calls', [
      ['/courses/calls/calls-a.html', 'The whole business comes down to one conversation'],
      ['/courses/calls/calls-b.html', 'The Cold Call'],
      ['/courses/calls/calls-c.html', 'The Meeting']]],
    ['M8', 'Deliver and repeat', [
      ['/courses/deliver/deliver-a.html', 'Getting the client is the hard part. Keeping them is the profitable part'],
      ['/courses/deliver/deliver-b.html', 'Hand It Over'],
      ['/courses/deliver/deliver-c.html', 'Get Paid'],
      ['/courses/deliver/deliver-d.html', 'Proof And Referrals'],
      ['/courses/deliver/deliver-e.html', 'Charge More, And Keep It Running']]]
  ];

  /* flatten, so we can find where we are and build prev/next */
  var FLAT = [];
  for (var i = 0; i < MODULES.length; i++) {
    for (var j = 0; j < MODULES[i][2].length; j++) {
      FLAT.push({
        href: MODULES[i][2][j][0],
        title: MODULES[i][2][j][1],
        mod: MODULES[i][0],
        letter: MODULES[i][2].length === 1 ? '1' : 'abcdefg'.charAt(j)
      });
    }
  }

  var here = location.pathname.replace(/\/index\.html$/, '/index.html');
  var idx = -1;
  for (var k = 0; k < FLAT.length; k++) {
    if (FLAT[k].href === here) { idx = k; break; }
  }

  var css = ''
    + '#cnav-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));'
    + 'width:54px;height:54px;border-radius:16px;border:none;background:#0e1512;'
    + 'box-shadow:0 6px 22px rgba(0,0,0,.32);z-index:100000;cursor:pointer;'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;'
    + '-webkit-tap-highlight-color:transparent;padding:0}'
    + '#cnav-btn span{display:block;width:21px;height:2.5px;border-radius:2px;background:#32d09f}'
    + '#cnav-btn:active{transform:scale(.94)}'
    + '#cnav-scrim{position:fixed;inset:0;background:rgba(8,14,12,.55);z-index:100001;'
    + 'opacity:0;pointer-events:none;transition:opacity .22s ease;'
    + '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}'
    + '#cnav-sheet{position:fixed;left:0;right:0;bottom:0;z-index:100002;background:#fbfcfb;'
    + 'border-radius:20px 20px 0 0;max-height:86vh;display:flex;flex-direction:column;'
    + 'transform:translateY(102%);transition:transform .28s cubic-bezier(.32,.72,0,1);'
    + 'box-shadow:0 -10px 40px rgba(0,0,0,.28);overscroll-behavior:contain}'
    + 'body.cnav-open #cnav-scrim{opacity:1;pointer-events:auto}'
    + 'body.cnav-open #cnav-sheet{transform:translateY(0)}'
    + 'body.cnav-open{overflow:hidden}'
    + '#cnav-head{flex:none;padding:12px 16px 11px;border-bottom:1px solid #e3e9e6;'
    + 'display:flex;align-items:center;gap:12px;background:#fff;border-radius:20px 20px 0 0}'
    + '#cnav-grab{position:absolute;top:7px;left:50%;transform:translateX(-50%);'
    + 'width:36px;height:4px;border-radius:3px;background:#d4dedA}'
    + '#cnav-head h3{margin:6px 0 0;font-size:14.5px;font-weight:700;flex:1;color:#0e1512;'
    + 'letter-spacing:-.01em;font-family:inherit}'
    + '#cnav-x{flex:none;margin-top:6px;width:34px;height:34px;border-radius:10px;border:none;'
    + 'background:#eef4f1;color:#5f6d67;font-size:19px;line-height:1;cursor:pointer;padding:0}'
    + '#cnav-list{overflow-y:auto;-webkit-overflow-scrolling:touch;'
    + 'padding:6px 12px calc(20px + env(safe-area-inset-bottom))}'
    + '.cnav-m{margin-top:14px}'
    + '.cnav-mh{display:flex;gap:8px;align-items:baseline;padding:0 6px 6px}'
    + '.cnav-mh b{font-size:10.5px;letter-spacing:.1em;color:#8b5cf6;font-weight:800}'
    + '.cnav-mh i{font-style:normal;font-size:11.5px;letter-spacing:.03em;color:#5f6d67;'
    + 'font-weight:700;text-transform:uppercase}'
    + '.cnav-ul{list-style:none;margin:0;padding:0;background:#fff;border:1px solid #e3e9e6;'
    + 'border-radius:13px;overflow:hidden}'
    + '.cnav-ul li+li{border-top:1px solid #eef2f0}'
    + '.cnav-a{display:flex;align-items:center;gap:11px;min-height:48px;padding:10px 13px;'
    + 'text-decoration:none;color:#0e1512;font-size:14px;line-height:1.35;'
    + 'font-family:inherit;letter-spacing:-.01em}'
    + '.cnav-a:active{background:#f1f6f4}'
    + '.cnav-a .l{flex:none;width:24px;height:24px;border-radius:7px;background:#eef4f1;'
    + 'color:#5f6d67;font-size:10.5px;font-weight:800;display:flex;align-items:center;'
    + 'justify-content:center;text-transform:uppercase}'
    + '.cnav-a .t{flex:1}'
    + '.cnav-a.on{background:#f0fbf7}'
    + '.cnav-a.on .l{background:#32d09f;color:#06231a}'
    + '.cnav-a.on .t{font-weight:700}'
    + '#cnav-foot{flex:none;display:flex;gap:8px;padding:9px 12px calc(10px + env(safe-area-inset-bottom));'
    + 'border-top:1px solid #e3e9e6;background:#fff}'
    + '#cnav-foot a{flex:1;text-align:center;padding:11px 8px;border-radius:11px;'
    + 'background:#eef4f1;color:#0e1512;text-decoration:none;font-size:13px;font-weight:700;'
    + 'font-family:inherit;letter-spacing:-.01em}'
    + '#cnav-foot a.dim{opacity:.32;pointer-events:none}'
    + '@media (prefers-reduced-motion:reduce){#cnav-sheet,#cnav-scrim{transition:none}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var html = '';
  for (var a = 0; a < MODULES.length; a++) {
    var m = MODULES[a];
    html += '<div class="cnav-m"><div class="cnav-mh"><b>' + m[0] + '</b><i>'
          + esc(m[1]) + '</i></div><ul class="cnav-ul">';
    for (var b = 0; b < m[2].length; b++) {
      var href = m[2][b][0];
      var on = (href === here) ? ' on' : '';
      var badge = m[2].length === 1 ? '1' : 'abcdefg'.charAt(b);
      html += '<li><a class="cnav-a' + on + '" href="' + href + '">'
            + '<span class="l">' + badge + '</span>'
            + '<span class="t">' + esc(m[2][b][1]) + '</span></a></li>';
    }
    html += '</ul></div>';
  }

  var prev = idx > 0 ? FLAT[idx - 1] : null;
  var next = (idx > -1 && idx < FLAT.length - 1) ? FLAT[idx + 1] : null;
  var foot = '<a href="' + (prev ? prev.href : '#') + '"' + (prev ? '' : ' class="dim"')
           + '>&larr; Previous</a>'
           + '<a href="/m.html">All pages</a>'
           + '<a href="' + (next ? next.href : '#') + '"' + (next ? '' : ' class="dim"')
           + '>Next &rarr;</a>';

  var wrap = document.createElement('div');
  wrap.innerHTML =
      '<button id="cnav-btn" type="button" aria-label="Jump to another page" '
    + 'aria-expanded="false"><span></span><span></span><span></span></button>'
    + '<div id="cnav-scrim"></div>'
    + '<div id="cnav-sheet" role="dialog" aria-modal="true" aria-label="Course pages">'
    + '<div id="cnav-head"><div id="cnav-grab"></div>'
    + '<h3>' + (idx > -1 ? FLAT[idx].mod + ' &middot; page ' + FLAT[idx].letter.toUpperCase() : 'Course pages') + '</h3>'
    + '<button id="cnav-x" type="button" aria-label="Close">&times;</button></div>'
    + '<div id="cnav-list">' + html + '</div>'
    + '<div id="cnav-foot">' + foot + '</div></div>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  var btn = document.getElementById('cnav-btn');
  var scrim = document.getElementById('cnav-scrim');
  var sheet = document.getElementById('cnav-sheet');

  function open() {
    document.body.classList.add('cnav-open');
    btn.setAttribute('aria-expanded', 'true');
    var cur = sheet.querySelector('.cnav-a.on');
    if (cur && cur.scrollIntoView) {
      try { cur.scrollIntoView({ block: 'center' }); } catch (e) { cur.scrollIntoView(); }
    }
  }
  function close() {
    document.body.classList.remove('cnav-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    document.body.classList.contains('cnav-open') ? close() : open();
  });
  scrim.addEventListener('click', close);
  document.getElementById('cnav-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('cnav-open')) close();
  });
})();
