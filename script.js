const loader=document.getElementById('loader'),loaderProgress=document.getElementById('loader-progress'),loaderPercent=document.getElementById('loader-percent'),loaderCopy=document.getElementById('loader-copy');
const loadStarted=performance.now(),loadDuration=matchMedia('(prefers-reduced-motion: reduce)').matches?250:3500;
const loadMessages=['BOOTSTRAPPING 10,000 PATHS','ESTIMATING LATENT VOLATILITY','SEPARATING SIGNAL FROM NOISE','STRUCTURE FOUND'];
function loadFrame(now){const raw=Math.min((now-loadStarted)/loadDuration,1),eased=1-Math.pow(1-raw,3),percent=Math.round(eased*100);loaderProgress.style.width=percent+'%';loaderPercent.textContent=String(percent).padStart(3,'0')+'%';loaderCopy.textContent=loadMessages[Math.min(Math.floor(raw*loadMessages.length),loadMessages.length-1)];if(raw<1){requestAnimationFrame(loadFrame)}else{setTimeout(()=>{loader.classList.add('is-complete');document.body.classList.remove('is-loading');document.body.classList.add('site-ready')},120)}}
requestAnimationFrame(loadFrame);

document.querySelectorAll('.gallery').forEach(gallery=>{
 const slides=[...gallery.querySelectorAll('.gallery-slide')],dots=[...gallery.querySelectorAll('[data-slide]')],stage=gallery.querySelector('.gallery-stage');let index=0,touchX=null;
 function show(next){index=(next+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==index});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));gallery.querySelector('.gallery-count').textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');gallery.style.setProperty('--shot',`url('${slides[index].querySelector('img').getAttribute('src')}')`);}
 gallery.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>show(index+Number(button.dataset.step))));dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slide))));
 stage.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1))}});
 stage.addEventListener('touchstart',event=>{touchX=event.touches[0].clientX},{passive:true});stage.addEventListener('touchend',event=>{if(touchX!==null){const delta=event.changedTouches[0].clientX-touchX;if(Math.abs(delta)>45)show(index+(delta<0?1:-1));touchX=null}},{passive:true});
});

const canvas=document.getElementById('field'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector('.hero'),button=document.getElementById('motion');
let paused=reduced.matches,time=0,last=0,w=0,h=0,visible=true,dirty=true;
const pointer={x:0,y:0,tx:0,ty:0,active:0,target:0};
function label(){button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));}label();
button.addEventListener('click',()=>{paused=!paused;dirty=true;label()});
function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);dirty=true;}
new ResizeObserver(resize).observe(canvas);
hero.addEventListener('pointermove',e=>{if(reduced.matches||paused)return;const r=canvas.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width*2-1;pointer.ty=(e.clientY-r.top)/r.height*2-1;pointer.target=1;});
hero.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=pointer.target=0;});
hero.addEventListener('pointerup',e=>{if(e.pointerType==='touch')pointer.target=0;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;dirty=true;}).observe(hero);
function project(x,y,z){const angle=-.48+pointer.x*.16,ca=Math.cos(angle),sa=Math.sin(angle);const xx=x*ca-y*sa,yy=x*sa+y*ca;const scale=Math.min(w/10.7,h/6.4);return[w*.53+xx*scale,h*.62+yy*scale*.46-z*scale*.86+pointer.y*12];}
function height(x,y){let z=1.45*Math.exp(-((x-.65*Math.sin(time*.26))**2/2.8+(y+.3)**2/2))*(.68+.26*Math.sin(time*.36));z+=.38*Math.sin(x*1.7+time*.65+y*.8)*Math.exp(-y*y*.12)+.3*Math.cos(y*1.4-time*.35);z+=pointer.active*.9*Math.exp(-((x-pointer.x*4)**2+(y-pointer.y*3)**2)*.9);return z;}
function line(points,color,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function draw(now){requestAnimationFrame(draw);if(now-last<33||!visible||document.hidden)return;const dt=Math.min((now-last)/1000,.05);last=now;if(paused&&!dirty)return;dirty=false;if(!paused){time+=dt;pointer.x+=(pointer.tx-pointer.x)*.045;pointer.y+=(pointer.ty-pointer.y)*.045;pointer.active+=(pointer.target-pointer.active)*.05;}
ctx.clearRect(0,0,w,h);
const glow=ctx.createRadialGradient(w*.56,h*.57,0,w*.56,h*.57,w*.48);glow.addColorStop(0,'rgba(62,91,169,.14)');glow.addColorStop(1,'rgba(7,11,20,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
const n=w<650?35:55,m=75;
for(let j=0;j<=n;j++){const y=-3+j*6/n,points=[];for(let k=0;k<=m;k++){const x=-5+k*10/m;points.push(project(x,y,height(x,y)));}line(points,'rgba(153,177,248,'+(.12+.23*Math.sin(j/n*Math.PI))+')',.8);}
for(let j=0;j<=n;j++){const x=-5+j*10/n,points=[];for(let k=0;k<=m;k++){const y=-3+k*6/m;points.push(project(x,y,height(x,y)));}line(points,'rgba(133,163,232,.19)',.7);}
for(let lane=0;lane<3;lane++){const points=[];for(let k=0;k<=150;k++){const x=-5+k/15,y=(lane-1)*1.35+Math.sin(x*.9+time*.22+lane)*.2;points.push(project(x,y,height(x,y)+.035));}line(points,['rgba(153,201,255,.8)','rgba(213,220,255,.85)','rgba(185,159,239,.55)'][lane],lane===1?1.5:1);const i=Math.floor((time*.07+lane*.31)%1*150),p=points[i];ctx.beginPath();ctx.arc(...p,2.6,0,Math.PI*2);ctx.fillStyle='#e0ecff';ctx.shadowColor='#a9caff';ctx.shadowBlur=15;ctx.fill();ctx.shadowBlur=0;}
for(let i=0;i<35;i++){const x=Math.sin(i*47.1)*4.8,y=Math.cos(i*19.3)*2.9,p=project(x,y,height(x,y));ctx.fillStyle='rgba(197,216,255,.6)';ctx.fillRect(p[0],p[1],1.5,1.5);}
}
requestAnimationFrame(draw);
reduced.addEventListener('change',()=>{paused=reduced.matches;pointer.x=pointer.y=pointer.active=0;dirty=true;label();scrollEffect()});
let scrollPending=false;function scrollEffect(){scrollPending=false;const range=Math.max(innerHeight*.98,1),progress=Math.min(Math.max(-hero.getBoundingClientRect().top/range,0),1);hero.style.setProperty('--exit',reduced.matches?0:progress);document.body.classList.toggle('has-scrolled',scrollY>innerHeight*.16);}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(scrollEffect)}},{passive:true});addEventListener('resize',scrollEffect);scrollEffect();
const sections=document.querySelectorAll('#work .section-heading, .project, .more-work, .about-grid, #experience .section-heading, .timeline article, .toolkit, .contact');
const reveal=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');reveal.unobserve(e.target)}})},{threshold:.08});
sections.forEach(el=>{el.classList.add('scroll-reveal');reveal.observe(el)});
const waveform=document.querySelector('.waveform');if(waveform){for(let i=0;i<65;i++){const bar=document.createElement('i');bar.style.setProperty('--h',(10+Math.abs(Math.sin(i*.63)*Math.cos(i*.14))*72)+'px');waveform.append(bar)}}
