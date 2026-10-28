/* Course-page access gate.
   Reuses the same Supabase login the student does for onboarding (same domain =
   same saved session). Not signed in -> bounce to /login.html and come back.
   Fails OPEN: if the auth library can't load, we show the page rather than lock
   everyone out over a CDN hiccup. */
(function () {
  var SUPA_URL = 'https://klyiqncsgxcrbdgonaaj.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtseWlxbmNzZ3hjcmJkZ29uYWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjkxMTQsImV4cCI6MjA5MTAwNTExNH0.WuM-vY6LBoNF2XiQJG2YX5CDOa-AWVGlhobfeuBOLl8';

  var root = document.documentElement;
  root.style.visibility = 'hidden'; // hide until we know they're allowed in

  function reveal() { root.style.visibility = ''; }
  function toLogin() {
    var next = location.pathname + location.search;
    location.replace('/login.html?next=' + encodeURIComponent(next));
  }

  function check() {
    try {
      var sb = window.supabase.createClient(SUPA_URL, ANON, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
      sb.auth.getSession().then(function (r) {
        if (r && r.data && r.data.session) { reveal(); } else { toLogin(); }
      }).catch(function () { reveal(); }); // auth call failed -> fail open
    } catch (e) { reveal(); }
  }

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.onload = check;
  s.onerror = reveal; // library didn't load -> fail open
  document.head.appendChild(s);

  // safety net: never leave the page hidden forever if something stalls
  setTimeout(reveal, 6000);
})();
