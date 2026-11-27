/* An actual interactive canvas animation, bounded to the homepage and paused offscreen. */
(()=>{
 let dispose=()=>{};
 function init(){dispose();const stage=document.querySelector('#pulseStage'),canvas=document.querySelector('#pulseCanvas');if(!stage||!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
 const quiet=document.body.classList.contains('quiet-motion');let width=0,height=0,raf=0,visible=true,t=0,last=0,px=0,py=0,tx=0,ty=0;const sculpture=stage.querySelector('.sculpture-wrap');const color=getComputedStyle(document.body).getPropertyValue('--canvas').trim();
 function resize(){const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(quiet)draw(0)}
 function draw(stamp){if(!width||!height)return;if(last)t+=Math.min(32,stamp-last)*.001;last=stamp;px+=(tx-px)*.035;py+=(ty-py)*.035;ctx.clearRect(0,0,width,height);const cx=width*.5+px*9,cy=height*.5+py*9,scale=Math.min(width,height);ctx.strokeStyle=color;ctx.fillStyle=color;
 for(let ring=0;ring<3;ring++){ctx.beginPath();for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;const radius=scale*(.31+ring*.055)+Math.sin(a*3+t*.35+ring)*scale*.015;const tilt=ring*.6+t*.045;const x=Math.cos(a)*radius,y=Math.sin(a)*radius*.55;const X=cx+x*Math.cos(tilt)-y*Math.sin(tilt),Y=cy+x*Math.sin(tilt)+y*Math.cos(tilt);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}ctx.globalAlpha=.1+ring*.025;ctx.lineWidth=.8;ctx.stroke();}
 for(let i=0;i<42;i++){const a=i*.618*Math.PI*2+t*(.1+(i%3)*.025),radius=scale*(.32+(i%5)*.018),tilt=(i%3)*.6+t*.045,x=Math.cos(a)*radius,y=Math.sin(a)*radius*.56;const X=cx+x*Math.cos(tilt)-y*Math.sin(tilt),Y=cy+x*Math.sin(tilt)+y*Math.cos(tilt);ctx.globalAlpha=.2+(Math.sin(t*.7+i)+1)*.15;ctx.beginPath();ctx.arc(X,Y,i%7===0?2:1.1,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;if(sculpture&&!quiet)sculpture.style.transform=`rotateX(${-py*5}deg) rotateY(${px*6}deg)`;if(!quiet&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
 function pointer(e){if(quiet)return;const r=stage.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=(e.clientY-r.top)/r.height*2-1;}function leave(){tx=0;ty=0}function resume(){cancelAnimationFrame(raf);last=0;if(visible&&!document.hidden){quiet?draw(0):raf=requestAnimationFrame(draw)}}
 const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting;resume()},{threshold:.1});io.observe(stage);stage.addEventListener('pointermove',pointer);stage.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',resume);resize();resume();
 dispose=()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.removeEventListener('pointermove',pointer);stage.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',resume)};
 }
 document.addEventListener('pulse:dispose',()=>dispose());document.addEventListener('pulse:render',init);init();
})();
