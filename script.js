(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══════════════ LANGUAGE SWITCHER ═══════════════
  var currentLang = 'ar';

  window.switchLang = function(lang){
    currentLang = lang;
    var html = document.documentElement;
    if(lang === 'en'){
      html.setAttribute('lang','en');
      html.setAttribute('dir','ltr');
      document.getElementById('btn-ar').className = 'lang-btn';
      document.getElementById('btn-en').className = 'lang-btn active';
    } else {
      html.setAttribute('lang','ar');
      html.setAttribute('dir','rtl');
      document.getElementById('btn-ar').className = 'lang-btn active';
      document.getElementById('btn-en').className = 'lang-btn';
    }
    var els = document.querySelectorAll('[data-ar][data-en]');
    for(var i = 0; i < els.length; i++){
      var el = els[i];
      if(lang === 'en'){
        el.textContent = el.getAttribute('data-en');
        el.classList.remove('arabic-text');
        el.classList.add('english-text');
      } else {
        el.textContent = el.getAttribute('data-ar');
        el.classList.remove('english-text');
        el.classList.add('arabic-text');
      }
    }
  };

  // ═══════════════ ENVELOPE ═══════════════
  var scene = document.getElementById('scene');
  var envelope = document.getElementById('envelope-trigger');
  var invitationCard = document.getElementById('invitation-card');
  var langSwitch = document.getElementById('lang-switch');

  var opened = false;
  var petalsStarted = false;

  // ═══════════════ AUDIO ═══════════════
  var bgAudio = document.getElementById('bg-audio');

  function showEnvelope(){
    scene.style.opacity = '1';
    scene.style.pointerEvents = 'auto';
    scene.style.transition = 'opacity 0.5s ease';
    langSwitch.style.opacity = '1';

    // Start falling flowers & butterflies immediately
    dropPetals();

    // Try playing background audio
    if(bgAudio){
      bgAudio.currentTime = 0;
      bgAudio.play().catch(function(){});
    }
  }

  // Try playing bg audio on first user interaction (fallback for autoplay policy)
  function tryPlayAudio(){
    if(bgAudio && bgAudio.paused){
      bgAudio.play().catch(function(){});
    }
    document.removeEventListener('click', tryPlayAudio);
    document.removeEventListener('touchstart', tryPlayAudio);
  }
  document.addEventListener('click', tryPlayAudio);
  document.addEventListener('touchstart', tryPlayAudio);

  showEnvelope();

  // ═══════════════ INVITATION CARD ═══════════════
  function showInvitationCard(){
    if(!invitationCard) return;
    invitationCard.classList.add('show');
    initReveal();
    startCountdown();
  }

  // ═══════════════ REVEAL ON APPEAR ═══════════════
  function initReveal(){
    var items = invitationCard.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if(reduced || !('IntersectionObserver' in window)){
      for(var i=0; i<items.length; i++){
        items[i].classList.add('in');
      }
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      for(var i=0; i<entries.length; i++){
        if(entries[i].isIntersecting){
          var delay = parseInt(entries[i].target.getAttribute('data-delay')) || 0;
          (function(el, d){
            setTimeout(function(){ el.classList.add('in'); }, d);
          })(entries[i].target, delay);
          obs.unobserve(entries[i].target);
        }
      }
    }, {threshold:0.1, rootMargin:'0px 0px -40px 0px'});
    for(var j=0; j<items.length; j++){
      obs.observe(items[j]);
    }
  }

  // ═══════════════ COUNTDOWN ═══════════════
  function startCountdown(){
    var target = new Date('2026-07-24T18:00:00Z').getTime();
    var cdDays = document.getElementById('cd-days');
    var cdHours = document.getElementById('cd-hours');
    var cdMins = document.getElementById('cd-mins');
    var cdSecs = document.getElementById('cd-secs');
    if(!cdDays) return;
    var lastVals = {d:null,h:null,m:null,s:null};

    function pad(n){ return n<10 ? '0'+n : ''+n; }

    function setCountdown(el, key, val){
      var str = pad(val);
      if(lastVals[key] !== str){
        lastVals[key] = str;
        el.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
        el.style.transform = 'translateY(-4px)';
        el.style.opacity = '0.5';
        setTimeout(function(){
          el.textContent = str;
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
        }, 150);
      }
    }

    function tick(){
      var now = Date.now();
      var diff = target - now;
      if(diff <= 0){
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMins.textContent = '00';
        cdSecs.textContent = '00';
        clearInterval(timer);
        return;
      }
      var days = Math.floor(diff/86400000);
      var hours = Math.floor((diff%86400000)/3600000);
      var mins = Math.floor((diff%3600000)/60000);
      var secs = Math.floor((diff%60000)/1000);
      setCountdown(cdDays,'d',days);
      setCountdown(cdHours,'h',hours);
      setCountdown(cdMins,'m',mins);
      setCountdown(cdSecs,'s',secs);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  function createFireworkBurst(cx, cy){
    var scene2 = document.getElementById('scene');
    if(!scene2) return;

    var colors = ['#C8A040','#E0C060','#C26070','#E8A8B4','#F5D8DE','#064e3b','#80bea6','#ffffff'];
    var burstCount = 30;

    for(var i = 0; i < burstCount; i++){
      (function(i){
        var el = document.createElement('div');
        var size = 5 + Math.random() * 8;
        var angle = (Math.PI * 2 / burstCount) * i + (Math.random() * 0.3 - 0.15);
        var dist = 100 + Math.random() * 200;
        var dur = 700 + Math.random() * 600;
        var col = colors[Math.floor(Math.random() * colors.length)];
        var isCircle = Math.random() > 0.4;

        el.style.cssText = 'position:absolute;pointer-events:none;z-index:50;border-radius:50%;left:'+cx+'px;top:'+cy+'px;transform:translate(-50%,-50%);';

        if(isCircle){
          el.style.width = size+'px';
          el.style.height = size+'px';
          el.style.background = col;
          el.style.boxShadow = '0 0 '+size*2+'px '+col;
        } else {
          var len = 14 + Math.random()*20;
          el.style.width = len+'px';
          el.style.height = '2px';
          el.style.background = 'linear-gradient(90deg, '+col+', transparent)';
          el.style.transformOrigin = '0 50%';
          el.style.transform = 'translate(-50%,-50%) rotate('+((angle*180/Math.PI))+'deg)';
        }

        scene2.appendChild(el);

        var dx = Math.cos(angle) * dist;
        var dy = Math.sin(angle) * dist;

        el.animate([
          { transform: isCircle ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) rotate('+(angle*180/Math.PI)+'deg) scaleX(0.2)', opacity:1 },
          { transform: isCircle ? 'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) scale(0.3)' : 'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) rotate('+(angle*180/Math.PI)+'deg) scaleX(1)', opacity:0.8, offset:0.3 },
          { transform: isCircle ? 'translate(calc(-50% + '+dx*1.2+'px), calc(-50% + '+dy*1.2+'px)) scale(0)' : 'translate(calc(-50% + '+dx*1.2+'px), calc(-50% + '+dy*1.2+'px)) rotate('+(angle*180/Math.PI)+'deg) scaleX(0)', opacity:0 }
        ], { duration:dur, easing:'cubic-bezier(0.16,1,0.3,1)' });

        setTimeout(function(){ el.remove(); }, dur + 50);
      })(i);
    }

    // Central flash
    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;pointer-events:none;z-index:49;left:'+cx+'px;top:'+cy+'px;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:radial-gradient(circle, #fff 0%, #C8A040 40%, transparent 70%);';
    scene2.appendChild(flash);
    flash.animate([
      { transform:'translate(-50%,-50%) scale(0)', opacity:1 },
      { transform:'translate(-50%,-50%) scale(8)', opacity:0 }
    ], { duration:500, easing:'ease-out' });
    setTimeout(function(){ flash.remove(); }, 550);
  }

  function openEnvelope(){
    if(opened) return;
    opened = true;

    var envTopWrapper = document.getElementById('envelope-top-wrapper');
    var envShadow = document.getElementById('envelope-shadow');
    var coupleCard = document.getElementById('couple-card');

    if(reduced) return;

    // Firework burst from envelope center
    var envRect = envelope.getBoundingClientRect();
    var burstX = envRect.left + envRect.width / 2;
    var burstY = envRect.top + envRect.height / 2;
    createFireworkBurst(burstX, burstY);

    // Step 1: Shadow appears (200ms)
    if(envShadow){
      setTimeout(function(){
        envShadow.style.opacity = '1';
      }, 200);
    }

    // Step 2: Top flap flips backward (300ms)
    if(envTopWrapper){
      setTimeout(function(){
        envTopWrapper.style.transform = 'perspective(800px) rotateX(160deg)';
      }, 300);
    }

    // Step 3: Couple card fades in (800ms)
    if(coupleCard){
      setTimeout(function(){
        coupleCard.style.opacity = '1';
        coupleCard.style.pointerEvents = 'auto';
      }, 800);
    }

    // Step 4: Envelope + whole scene glide UP and out, glass card rises into its place (2200ms)
    setTimeout(function(){
      if(envShadow) envShadow.style.opacity = '0';

      // The entire scene (envelope + couple illustration) slides upward off the screen
      scene.style.transition = 'transform 1.15s cubic-bezier(0.5,0,0.2,1)';
      scene.classList.add('gone');
      scene.style.pointerEvents = 'none';

      // The transparent glass card simultaneously rises from below into the envelope's place
      showInvitationCard();
    }, 2200);
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openEnvelope(); }
  });

  // ═══════════════ FALLING FLOWERS & BUTTERFLIES ═══════════════
  function dropPetals(){
    if(petalsStarted) return;
    petalsStarted = true;
    if(reduced) return;
    var atmosphere = document.getElementById('atmosphere');
    if(!atmosphere) return;

    // ── Falling Flowers (slow) ──
    var flowerColors = [
      {petal:'#C26070',center:'#9B3A4F'},
      {petal:'#E8A8B4',center:'#C26070'},
      {petal:'#F5D8DE',center:'#E8A8B4'},
      {petal:'#064e3b',center:'#003527'},
      {petal:'#0b513d',center:'#064e3b'},
      {petal:'#C8A040',center:'#735c00'},
      {petal:'#E0C060',center:'#C8A040'},
    ];

    function createFlower(){
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:-50px;pointer-events:none;z-index:6;will-change:transform;';
      wrapper.style.left = (Math.random()*100)+'vw';

      var fSize = 14 + Math.random()*18;
      var col = flowerColors[Math.floor(Math.random()*flowerColors.length)];
      var petalCount = 5 + Math.floor(Math.random()*3);
      var rotation = Math.random()*360;

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('width', fSize);
      svg.setAttribute('height', fSize);
      svg.setAttribute('viewBox','0 0 40 40');
      svg.style.transform = 'rotate('+rotation+'deg)';

      for(var p=0; p<petalCount; p++){
        var angle = (360/petalCount)*p;
        var petal = document.createElementNS(svgNS,'ellipse');
        petal.setAttribute('cx','20');petal.setAttribute('cy','10');
        petal.setAttribute('rx','5');petal.setAttribute('ry','9');
        petal.setAttribute('fill', col.petal);
        petal.setAttribute('opacity','0.75');
        petal.setAttribute('transform','rotate('+angle+' 20 20)');
        svg.appendChild(petal);
      }
      var center = document.createElementNS(svgNS,'circle');
      center.setAttribute('cx','20');center.setAttribute('cy','20');center.setAttribute('r','4');
      center.setAttribute('fill', col.center);
      svg.appendChild(center);

      wrapper.appendChild(svg);
      atmosphere.appendChild(wrapper);

      // Slow: 14-24 seconds to fall
      var dur = 14000 + Math.random()*10000;
      var drift = (Math.random()*80-40);
      var sway = 20 + Math.random()*40;
      var data = {el:wrapper, active:true, baseDur:dur};
      atmosphereFalling.push(data);

      var anim = wrapper.animate([
        {transform:'translateY(0) translateX(0) rotate(0deg)', opacity:0},
        {transform:'translateY(20vh) translateX('+(drift*0.3)+'px) rotate(60deg)', opacity:0.8, offset:0.15},
        {transform:'translateY(45vh) translateX('+(drift+sway)+'px) rotate(180deg)', opacity:0.7, offset:0.45},
        {transform:'translateY(70vh) translateX('+(drift-sway*0.5)+'px) rotate(280deg)', opacity:0.5, offset:0.75},
        {transform:'translateY(105vh) translateX('+drift+'px) rotate(400deg)', opacity:0}
      ], {duration:dur, easing:'linear'});

      anim.onfinish = function(){
        data.active = false;
        wrapper.remove();
      };
    }

    // ── Falling Leaves (slow) ──
    function createLeaf(){
      var leaf = document.createElement('div');
      var lSize = 10 + Math.random()*14;
      var greens = ['#064e3b','#0b513d','#003527'];
      var col = greens[Math.floor(Math.random()*greens.length)];
      leaf.style.cssText = 'position:fixed;top:-40px;pointer-events:none;z-index:6;will-change:transform;left:'+(Math.random()*100)+'vw;';

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('width', lSize);
      svg.setAttribute('height', lSize*1.6);
      svg.setAttribute('viewBox','0 0 24 38');

      var path = document.createElementNS(svgNS,'path');
      path.setAttribute('d','M12 0 Q24 12 18 28 Q14 36 12 38 Q10 36 6 28 Q0 12 12 0Z');
      path.setAttribute('fill', col);path.setAttribute('opacity','0.6');
      svg.appendChild(path);

      var vein = document.createElementNS(svgNS,'line');
      vein.setAttribute('x1','12');vein.setAttribute('y1','2');
      vein.setAttribute('x2','12');vein.setAttribute('y2','36');
      vein.setAttribute('stroke','#fff');vein.setAttribute('stroke-width','0.5');
      vein.setAttribute('opacity','0.3');
      svg.appendChild(vein);

      leaf.appendChild(svg);
      atmosphere.appendChild(leaf);

      // Slow: 16-28 seconds
      var dur = 16000 + Math.random()*12000;
      var drift = (Math.random()*60-30);
      var sway = 25 + Math.random()*35;
      var data = {el:leaf, active:true, baseDur:dur};
      atmosphereFalling.push(data);

      var anim = leaf.animate([
        {transform:'translateY(0) translateX(0) rotate(0deg)', opacity:0},
        {transform:'translateY(25vh) translateX('+(drift*0.4)+'px) rotate(80deg)', opacity:0.6, offset:0.2},
        {transform:'translateY(55vh) translateX('+(drift+sway)+'px) rotate(200deg)', opacity:0.5, offset:0.55},
        {transform:'translateY(80vh) translateX('+(drift-sway*0.6)+'px) rotate(300deg)', opacity:0.3, offset:0.8},
        {transform:'translateY(105vh) translateX('+drift+'px) rotate(400deg)', opacity:0}
      ], {duration:dur, easing:'linear'});

      anim.onfinish = function(){
        data.active = false;
        leaf.remove();
      };
    }

    // ── Butterflies (slow + follows mouse) ──
    function createButterfly(){
      var bf = document.createElement('div');
      bf.style.cssText = 'position:fixed;pointer-events:none;z-index:7;will-change:transform;';
      bf.style.left = (-60)+'px';
      bf.style.top = (5 + Math.random()*55)+'vh';

      var bSize = 28 + Math.random()*16;
      var colors = [
        ['#C26070','#E8A8B4','#9B3A4F'],
        ['#064e3b','#80bea6','#003527'],
        ['#C8A040','#E0C060','#735c00'],
        ['#F5D8DE','#E8A8B4','#C26070'],
      ];
      var col = colors[Math.floor(Math.random()*colors.length)];

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('width', bSize);
      svg.setAttribute('height', bSize*0.7);
      svg.setAttribute('viewBox','0 0 60 42');

      var lw1 = document.createElementNS(svgNS,'path');
      lw1.setAttribute('d','M30 20 Q18 4 4 8 Q0 14 8 22 Q14 28 30 20Z');
      lw1.setAttribute('fill',col[0]);lw1.setAttribute('opacity','0.7');
      svg.appendChild(lw1);
      var lw2 = document.createElementNS(svgNS,'path');
      lw2.setAttribute('d','M30 20 Q16 24 6 32 Q4 38 12 36 Q20 32 30 20Z');
      lw2.setAttribute('fill',col[1]);lw2.setAttribute('opacity','0.6');
      svg.appendChild(lw2);
      var rw1 = document.createElementNS(svgNS,'path');
      rw1.setAttribute('d','M30 20 Q42 4 56 8 Q60 14 52 22 Q46 28 30 20Z');
      rw1.setAttribute('fill',col[0]);rw1.setAttribute('opacity','0.7');
      svg.appendChild(rw1);
      var rw2 = document.createElementNS(svgNS,'path');
      rw2.setAttribute('d','M30 20 Q44 24 54 32 Q56 38 48 36 Q40 32 30 20Z');
      rw2.setAttribute('fill',col[1]);rw2.setAttribute('opacity','0.6');
      svg.appendChild(rw2);
      var d1 = document.createElementNS(svgNS,'circle');
      d1.setAttribute('cx','16');d1.setAttribute('cy','14');
      d1.setAttribute('r','2.5');d1.setAttribute('fill',col[2]);d1.setAttribute('opacity','0.5');
      svg.appendChild(d1);
      var d2 = document.createElementNS(svgNS,'circle');
      d2.setAttribute('cx','44');d2.setAttribute('cy','14');
      d2.setAttribute('r','2.5');d2.setAttribute('fill',col[2]);d2.setAttribute('opacity','0.5');
      svg.appendChild(d2);
      var body = document.createElementNS(svgNS,'line');
      body.setAttribute('x1','30');body.setAttribute('y1','8');
      body.setAttribute('x2','30');body.setAttribute('y2','32');
      body.setAttribute('stroke',col[2]);body.setAttribute('stroke-width','1.5');
      body.setAttribute('opacity','0.6');
      svg.appendChild(body);
      var a1 = document.createElementNS(svgNS,'path');
      a1.setAttribute('d','M30 8 Q26 2 22 0');
      a1.setAttribute('stroke',col[2]);a1.setAttribute('stroke-width','0.8');
      a1.setAttribute('fill','none');a1.setAttribute('opacity','0.5');
      svg.appendChild(a1);
      var a2 = document.createElementNS(svgNS,'path');
      a2.setAttribute('d','M30 8 Q34 2 38 0');
      a2.setAttribute('stroke',col[2]);a2.setAttribute('stroke-width','0.8');
      a2.setAttribute('fill','none');a2.setAttribute('opacity','0.5');
      svg.appendChild(a2);

      bf.appendChild(svg);
      atmosphere.appendChild(bf);

      svg.animate([
        {transform:'scaleX(1)'},{transform:'scaleX(0.25)'},{transform:'scaleX(1)'}
      ], {duration:220+Math.random()*120, iterations:Infinity});

      // Slow: 18-30 seconds to cross
      var dur = 18000 + Math.random()*12000;
      var endX = window.innerWidth + 100;
      var startY = parseFloat(bf.style.top);
      var wobbleAmp = 40 + Math.random()*60;
      var wobbleFreq = 1.5 + Math.random()*2.5;
      var data = {el:bf, active:true, baseDur:dur, startX:-60, endX:endX, startY:startY, wobbleAmp:wobbleAmp, wobbleFreq:wobbleFreq, flightProgress:0};
      atmosphereFalling.push(data);

      var keyframes = [];
      var steps = 30;
      for(var s=0; s<=steps; s++){
        var t = s/steps;
        var x = -70 + (endX+70)*t;
        var y = startY + Math.sin(t*Math.PI*wobbleFreq)*wobbleAmp;
        keyframes.push({transform:'translate('+x+'px,'+y+'px)', offset:t});
      }

      var anim = bf.animate(keyframes, {duration:dur, easing:'linear'});
      anim.onfinish = function(){
        data.active = false;
        bf.remove();
      };
    }

    // ── Launch sequence (spread out more) ──
    var totalFlowers = 20;
    var totalLeaves = 10;
    var totalButterflies = 5;

    for(var i=0; i<totalFlowers; i++){
      (function(i){ setTimeout(createFlower, i*600); })(i);
    }
    for(var j=0; j<totalLeaves; j++){
      (function(j){ setTimeout(createLeaf, j*900 + 1000); })(j);
    }
    for(var k=0; k<totalButterflies; k++){
      (function(k){ setTimeout(createButterfly, k*2000 + 2000); })(k);
    }
  }

  // ═══════════════ ATMOSPHERE PETALS (continuous, slow) ═══════════════
  var atmosphereFalling = [];
  var atmosphereElements = [];

  (function(){
    var atmosphere = document.getElementById('atmosphere');
    if(!atmosphere) return;
    var pColors = ['#064e3b18','#0b513d12','#C8A0400c','#E8A8B40a','#C260700c'];

    function createPetal(){
      var petal = document.createElement('div');
      petal.className = 'floating-petal';
      var size = Math.random() * 12 + 5;
      petal.style.width = size+'px';
      petal.style.height = size+'px';
      petal.style.left = (Math.random()*100)+'vw';
      petal.style.top = '-30px';
      petal.style.position = 'fixed';
      petal.style.willChange = 'transform';
      petal.style.backgroundColor = pColors[Math.floor(Math.random()*pColors.length)];
      var shapes = ['50% 0 50% 50%','50% 50% 0 50%','0 50% 50% 50%'];
      petal.style.borderRadius = shapes[Math.floor(Math.random()*shapes.length)];
      var rot = Math.random()*360;
      petal.style.transform = 'rotate('+rot+'deg)';
      atmosphere.appendChild(petal);

      // Slow: 10-18 seconds
      var dur = 10000 + Math.random()*8000;
      var drift = (Math.random()*40-20);
      var startX = parseFloat(petal.style.left);
      var data = {el:petal, x:startX, y:-30, active:true, baseDur:dur};
      atmosphereFalling.push(data);
      atmosphereElements.push(data);

      var anim = petal.animate([
        {transform:'translate(0,0) rotate('+rot+'deg)', opacity:0},
        {transform:'translate('+drift+'px, 50vh) rotate('+(rot+200)+'deg)', opacity:0.35, offset:0.4},
        {transform:'translate('+(drift+10)+'px, 100vh) rotate('+(rot+500)+'deg)', opacity:0}
      ], {duration:dur, easing:'linear'});

      anim.onfinish = function(){
        data.active = false;
        var idx = atmosphereElements.indexOf(data);
        if(idx > -1) atmosphereElements.splice(idx,1);
        var idx2 = atmosphereFalling.indexOf(data);
        if(idx2 > -1) atmosphereFalling.splice(idx2,1);
        petal.remove();
      };
    }

    setInterval(function(){
      if(!reduced && Math.random() > 0.3) createPetal();
    }, 2500);
  })();

  // ═══════════════ CONTINUOUS BUTTERFLIES (from every direction, whole site) ═══════════════
  (function(){
    var atmosphere = document.getElementById('atmosphere');
    if(!atmosphere || reduced) return;

    var bfColors = [
      ['#C26070','#E8A8B4','#9B3A4F'],
      ['#064e3b','#80bea6','#003527'],
      ['#C8A040','#E0C060','#735c00'],
      ['#F5D8DE','#E8A8B4','#C26070'],
      ['#7A5060','#C26070','#9B3A4F'],
      ['#E0C060','#F5D8DE','#C8A040']
    ];

    function buildButterflySVG(bSize, col){
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('width', bSize);
      svg.setAttribute('height', bSize*0.7);
      svg.setAttribute('viewBox','0 0 60 42');
      function add(tag, attrs){
        var e = document.createElementNS(svgNS, tag);
        for(var k in attrs){ e.setAttribute(k, attrs[k]); }
        svg.appendChild(e);
      }
      add('path',{d:'M30 20 Q18 4 4 8 Q0 14 8 22 Q14 28 30 20Z',fill:col[0],opacity:'0.75'});
      add('path',{d:'M30 20 Q16 24 6 32 Q4 38 12 36 Q20 32 30 20Z',fill:col[1],opacity:'0.65'});
      add('path',{d:'M30 20 Q42 4 56 8 Q60 14 52 22 Q46 28 30 20Z',fill:col[0],opacity:'0.75'});
      add('path',{d:'M30 20 Q44 24 54 32 Q56 38 48 36 Q40 32 30 20Z',fill:col[1],opacity:'0.65'});
      add('circle',{cx:'16',cy:'14',r:'2.5',fill:col[2],opacity:'0.5'});
      add('circle',{cx:'44',cy:'14',r:'2.5',fill:col[2],opacity:'0.5'});
      add('line',{x1:'30',y1:'8',x2:'30',y2:'32',stroke:col[2],'stroke-width':'1.5',opacity:'0.6'});
      add('path',{d:'M30 8 Q26 2 22 0',stroke:col[2],'stroke-width':'0.8',fill:'none',opacity:'0.5'});
      add('path',{d:'M30 8 Q34 2 38 0',stroke:col[2],'stroke-width':'0.8',fill:'none',opacity:'0.5'});
      return svg;
    }

    function spawnButterfly(){
      var W = window.innerWidth, H = window.innerHeight;
      var bf = document.createElement('div');
      bf.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:7;will-change:transform;';

      var bSize = 26 + Math.random()*20;
      var col = bfColors[Math.floor(Math.random()*bfColors.length)];
      var svg = buildButterflySVG(bSize, col);
      bf.appendChild(svg);
      atmosphere.appendChild(bf);

      // Flapping wings
      svg.animate(
        [{transform:'scaleX(1)'},{transform:'scaleX(0.25)'},{transform:'scaleX(1)'}],
        {duration:200+Math.random()*140, iterations:Infinity}
      );

      // Pick a random edge to enter from, exit toward the opposite side
      var edge = Math.floor(Math.random()*4); // 0 left,1 right,2 top,3 bottom
      var sx, sy, ex, ey;
      if(edge === 0){ sx = -80;      sy = Math.random()*H; ex = W+80;      ey = Math.random()*H; }
      else if(edge === 1){ sx = W+80; sy = Math.random()*H; ex = -80;      ey = Math.random()*H; }
      else if(edge === 2){ sx = Math.random()*W; sy = -80;  ex = Math.random()*W; ey = H+80; }
      else { sx = Math.random()*W; sy = H+80;  ex = Math.random()*W; ey = -80; }

      var dur = 14000 + Math.random()*12000;
      var wobbleAmp = 30 + Math.random()*50;
      var wobbleFreq = 1.5 + Math.random()*2.5;
      var data = {el:bf, active:true, baseDur:dur};
      atmosphereFalling.push(data);

      // Perpendicular wobble across the straight path
      var dx = ex - sx, dy = ey - sy;
      var len = Math.sqrt(dx*dx + dy*dy) || 1;
      var px = -dy/len, py = dx/len; // perpendicular unit vector
      var keyframes = [];
      var steps = 32;
      for(var s=0; s<=steps; s++){
        var t = s/steps;
        var wob = Math.sin(t*Math.PI*wobbleFreq)*wobbleAmp;
        var x = sx + dx*t + px*wob;
        var y = sy + dy*t + py*wob;
        var op = (t < 0.08) ? (t/0.08) : (t > 0.92 ? (1-t)/0.08 : 1);
        keyframes.push({transform:'translate('+x+'px,'+y+'px)', opacity:op, offset:t});
      }

      var anim = bf.animate(keyframes, {duration:dur, easing:'linear'});
      anim.onfinish = function(){
        data.active = false;
        var idx = atmosphereFalling.indexOf(data);
        if(idx > -1) atmosphereFalling.splice(idx,1);
        bf.remove();
      };
    }

    // Seed a few immediately, then keep a steady stream from all directions
    for(var i=0; i<4; i++){ (function(i){ setTimeout(spawnButterfly, i*700); })(i); }
    setInterval(function(){
      if(reduced || document.hidden) return;
      // cap concurrent butterflies
      var count = atmosphere.querySelectorAll('div').length;
      if(count < 26) spawnButterfly();
    }, 1600);
  })();

  // ═══════════════ MOUSE INTERACTION (smooth repel + follow) ═══════════════
  if(!reduced){
    var mouseX = -999, mouseY = -999;
    var prevMouseX = -999, prevMouseY = -999;
    var mouseVX = 0, mouseVY = 0;
    var repelRadius = 160;
    var repelStrength = 5;
    var attractRadius = 250;
    var attractStrength = 0.8;

    document.addEventListener('mousemove', function(e){
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseVX = mouseX - prevMouseX;
      mouseVY = mouseY - prevMouseY;
    });

    // Smooth animation loop for mouse interaction
    var lastFrame = 0;
    function mouseFrame(now){
      if(now - lastFrame > 30){ // ~33fps for smoothness
        lastFrame = now;
        for(var i=0; i<atmosphereFalling.length; i++){
          var item = atmosphereFalling[i];
          if(!item.active || !item.el.parentNode) continue;
          var rect = item.el.getBoundingClientRect();
          var cx = rect.left + rect.width/2;
          var cy = rect.top + rect.height/2;
          var dx = cx - mouseX;
          var dy = cy - mouseY;
          var dist = Math.sqrt(dx*dx + dy*dy);

          if(dist < repelRadius && dist > 1){
            // Repel — push away from cursor
            var force = Math.pow(1 - dist/repelRadius, 2) * repelStrength;
            var pushX = (dx/dist) * force;
            var pushY = (dy/dist) * force;
            item.el.style.transition = 'none';
            item.el.style.transform += ' translate('+pushX+'px,'+pushY+'px)';
          } else if(dist < attractRadius && dist > repelRadius){
            // Gentle attract — elements drift slightly toward cursor
            var aForce = ((dist - repelRadius)/(attractRadius - repelRadius)) * attractStrength;
            var attractX = (-dx/dist) * aForce;
            var attractY = (-dy/dist) * aForce;
            item.el.style.transition = 'none';
            item.el.style.transform += ' translate('+attractX+'px,'+attractY+'px)';
          }
        }
      }
      requestAnimationFrame(mouseFrame);
    }
    requestAnimationFrame(mouseFrame);

    // ═══════════════ CLICK BURST ═══════════════
    document.addEventListener('click', function(e){
      if(e.target.closest('a, button, [role="button"]')) return;
      createClickBurst(e.clientX, e.clientY);
    });

    document.addEventListener('touchstart', function(e){
      if(e.target.closest('a, button, [role="button"]')) return;
      var touch = e.touches[0];
      createClickBurst(touch.clientX, touch.clientY);
    }, {passive:true});

    function createClickBurst(cx, cy){
      var atmosphere = document.getElementById('atmosphere');
      if(!atmosphere) return;

      // ── Mini flowers burst ──
      var burstFlowerColors = [
        {petal:'#C26070',center:'#9B3A4F'},
        {petal:'#E8A8B4',center:'#C26070'},
        {petal:'#F5D8DE',center:'#E8A8B4'},
        {petal:'#064e3b',center:'#003527'},
        {petal:'#C8A040',center:'#735c00'},
        {petal:'#E0C060',center:'#C8A040'},
      ];

      for(var i=0; i<8; i++){
        (function(i){
          var angle = (Math.PI*2/8)*i + (Math.random()*0.4-0.2);
          var dist = 40 + Math.random()*60;
          var fSize = 10 + Math.random()*12;
          var col = burstFlowerColors[Math.floor(Math.random()*burstFlowerColors.length)];

          var el = document.createElement('div');
          el.style.cssText = 'position:fixed;pointer-events:none;z-index:55;';

          var svgNS = 'http://www.w3.org/2000/svg';
          var svg = document.createElementNS(svgNS,'svg');
          svg.setAttribute('width', fSize);
          svg.setAttribute('height', fSize);
          svg.setAttribute('viewBox','0 0 40 40');

          var petalCount = 5 + Math.floor(Math.random()*3);
          for(var p=0; p<petalCount; p++){
            var pa = (360/petalCount)*p;
            var pet = document.createElementNS(svgNS,'ellipse');
            pet.setAttribute('cx','20');pet.setAttribute('cy','10');
            pet.setAttribute('rx','5');pet.setAttribute('ry','9');
            pet.setAttribute('fill', col.petal);
            pet.setAttribute('opacity','0.8');
            pet.setAttribute('transform','rotate('+pa+' 20 20)');
            svg.appendChild(pet);
          }
          var ct = document.createElementNS(svgNS,'circle');
          ct.setAttribute('cx','20');ct.setAttribute('cy','20');ct.setAttribute('r','4');
          ct.setAttribute('fill', col.center);
          svg.appendChild(ct);

          el.appendChild(svg);
          el.style.left = cx+'px';
          el.style.top = cy+'px';
          atmosphere.appendChild(el);

          var tx = Math.cos(angle)*dist;
          var ty = Math.sin(angle)*dist;
          var dur = 800 + Math.random()*600;

          el.animate([
            {transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1},
            {transform:'translate(calc(-50% + '+tx+'px), calc(-50% + '+ty+'px)) scale(1.2) rotate(180deg)', opacity:0.9, offset:0.3},
            {transform:'translate(calc(-50% + '+tx*1.3+'px), calc(-50% + '+ty*1.3+'px)) scale(0.8) rotate(360deg)', opacity:0}
          ], {duration:dur, easing:'cubic-bezier(0.16,1,0.3,1)'});
          setTimeout(function(){ el.remove(); }, dur);
        })(i);
      }

      // ── Sparkle ring burst ──
      for(var s=0; s<12; s++){
        (function(s){
          var sparkAngle = (Math.PI*2/12)*s;
          var sparkDist = 20 + Math.random()*50;
          var spark = document.createElement('div');
          spark.className = 'sparkle';
          spark.style.left = cx+'px';
          spark.style.top = cy+'px';
          spark.style.zIndex = '55';
          atmosphere.appendChild(spark);

          var sx = Math.cos(sparkAngle)*sparkDist;
          var sy = Math.sin(sparkAngle)*sparkDist;

          spark.animate([
            {transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1},
            {transform:'translate(calc(-50% + '+sx+'px), calc(-50% + '+sy+'px)) scale(1.5) rotate(180deg)', opacity:0.8, offset:0.3},
            {transform:'translate(calc(-50% + '+sx*1.4+'px), calc(-50% + '+sy*1.4+'px)) scale(0) rotate(360deg)', opacity:0}
          ], {duration:600+Math.random()*400, easing:'ease-out'});
          setTimeout(function(){ spark.remove(); }, 1100);
        })(s);
      }

      // ── Mini butterfly burst ──
      for(var b=0; b<3; b++){
        (function(b){
          var bAngle = (Math.PI*2/3)*b + Math.random()*0.5;
          var bDist = 30 + Math.random()*40;
          var bSize = 16 + Math.random()*10;
          var bfColors = [
            ['#C26070','#E8A8B4','#9B3A4F'],
            ['#064e3b','#80bea6','#003527'],
            ['#C8A040','#E0C060','#735c00'],
          ];
          var bCol = bfColors[b % bfColors.length];

          var bf = document.createElement('div');
          bf.style.cssText = 'position:fixed;pointer-events:none;z-index:55;left:'+cx+'px;top:'+cy+'px;';

          var svgNS = 'http://www.w3.org/2000/svg';
          var svg = document.createElementNS(svgNS,'svg');
          svg.setAttribute('width', bSize);
          svg.setAttribute('height', bSize*0.7);
          svg.setAttribute('viewBox','0 0 60 42');

          var lw1 = document.createElementNS(svgNS,'path');
          lw1.setAttribute('d','M30 20 Q18 4 4 8 Q0 14 8 22 Q14 28 30 20Z');
          lw1.setAttribute('fill',bCol[0]);lw1.setAttribute('opacity','0.8');
          svg.appendChild(lw1);
          var lw2 = document.createElementNS(svgNS,'path');
          lw2.setAttribute('d','M30 20 Q16 24 6 32 Q4 38 12 36 Q20 32 30 20Z');
          lw2.setAttribute('fill',bCol[1]);lw2.setAttribute('opacity','0.7');
          svg.appendChild(lw2);
          var rw1 = document.createElementNS(svgNS,'path');
          rw1.setAttribute('d','M30 20 Q42 4 56 8 Q60 14 52 22 Q46 28 30 20Z');
          rw1.setAttribute('fill',bCol[0]);rw1.setAttribute('opacity','0.8');
          svg.appendChild(rw1);
          var rw2 = document.createElementNS(svgNS,'path');
          rw2.setAttribute('d','M30 20 Q44 24 54 32 Q56 38 48 36 Q40 32 30 20Z');
          rw2.setAttribute('fill',bCol[1]);rw2.setAttribute('opacity','0.7');
          svg.appendChild(rw2);
          var body = document.createElementNS(svgNS,'line');
          body.setAttribute('x1','30');body.setAttribute('y1','8');
          body.setAttribute('x2','30');body.setAttribute('y2','32');
          body.setAttribute('stroke',bCol[2]);body.setAttribute('stroke-width','1.5');
          body.setAttribute('opacity','0.6');
          svg.appendChild(body);

          bf.appendChild(svg);
          atmosphere.appendChild(bf);

          svg.animate([
            {transform:'scaleX(1)'},{transform:'scaleX(0.2)'},{transform:'scaleX(1)'}
          ], {duration:180, iterations:Math.floor(6+Math.random()*4)});

          var btx = Math.cos(bAngle)*bDist;
          var bty = Math.sin(bAngle)*bDist - 60;
          var bdur = 1200 + Math.random()*800;

          bf.animate([
            {transform:'translate(-50%,-50%) scale(0)', opacity:1},
            {transform:'translate(calc(-50% + '+btx*0.5+'px), calc(-50% + '+bty*0.5+'px)) scale(1.2)', opacity:1, offset:0.3},
            {transform:'translate(calc(-50% + '+btx+'px), calc(-50% + '+bty+'px)) scale(0.6)', opacity:0}
          ], {duration:bdur, easing:'cubic-bezier(0.16,1,0.3,1)'});
          setTimeout(function(){ bf.remove(); }, bdur);
        })(b);
      }

      // ── Click ripple ring ──
      var ring = document.createElement('div');
      ring.style.cssText = 'position:fixed;pointer-events:none;z-index:54;border:2px solid rgba(0,53,39,0.2);border-radius:50%;left:'+cx+'px;top:'+cy+'px;transform:translate(-50%,-50%) scale(0);';
      atmosphere.appendChild(ring);
      ring.animate([
        {width:'0px',height:'0px',opacity:0.6},
        {width:'160px',height:'160px',opacity:0}
      ], {duration:700, easing:'ease-out'});
      setTimeout(function(){ ring.remove(); }, 750);
    }
  }

  // ═══════════════ ENVELOPE HOVER TILT ═══════════════
  if(!reduced && envelope){
    envelope.addEventListener('mousemove', function(e){
      if(opened) return;
      var rect = envelope.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      envelope.style.transform = 'perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)';
    });
    envelope.addEventListener('mouseleave', function(){
      envelope.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
      envelope.style.transition = 'transform 0.5s ease';
    });
  }

})();
