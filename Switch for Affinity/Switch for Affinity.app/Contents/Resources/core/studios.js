// fzstd 0.1.1 – MIT License, Copyright (c) 2020 Arjun Barrett – https://github.com/101arrowz/fzstd
var fzstd=(function(){var module={exports:{}},exports=module.exports;
!function(f){typeof module!='undefined'&&typeof exports=='object'?module.exports=f():typeof define!='undefined'&&define.amd?define(['fzstd',f]):(typeof self!='undefined'?self:this).fzstd=f()}(function(){var _e={};"use strict";var r=ArrayBuffer,t=Uint8Array,e=Uint16Array,n=Int16Array,a=Uint32Array,s=Int32Array,i=function(r,e,n){if(t.prototype.slice)return t.prototype.slice.call(r,e,n);(null==e||e<0)&&(e=0),(null==n||n>r.length)&&(n=r.length);var a=new t(n-e);return a.set(r.subarray(e,n)),a},o=function(r,e,n,a){if(t.prototype.fill)return t.prototype.fill.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;++n)r[n]=e;return r},u=function(r,e,n,a){if(t.prototype.copyWithin)return t.prototype.copyWithin.call(r,e,n,a);for((null==n||n<0)&&(n=0),(null==a||a>r.length)&&(a=r.length);n<a;)r[e++]=r[n++]};_e.ZstdErrorCode={InvalidData:0,WindowSizeTooLarge:1,InvalidBlockType:2,FSEAccuracyTooHigh:3,DistanceTooFarBack:4,UnexpectedEOF:5};var h=["invalid zstd data","window size too large (>2046MB)","invalid block type","FSE accuracy too high","match distance too far back","unexpected EOF"],f=function(r,t,e){var n=Error(t||h[r]);if(n.code=r,Error.captureStackTrace&&Error.captureStackTrace(n,f),!e)throw n;return n},l=function(r,t,e){for(var n=0,a=0;n<e;++n)a|=r[t++]<<(n<<3);return a},v=function(r,t){return(r[t]|r[t+1]<<8|r[t+2]<<16|r[t+3]<<24)>>>0},c=function(r,e){var n=r[0]|r[1]<<8|r[2]<<16;if(3126568==n&&253==r[3]){var a=r[4],i=a>>5&1,o=a>>2&1,u=3&a,h=a>>6;8&a&&f(0);var c=6-i,b=3==u?4:u,y=l(r,c,b),p=h?1<<h:i,w=l(r,c+=b,p)+(1==h&&256),g=w;if(!i){var d=1<<10+(r[5]>>3);g=d+(d>>3)*(7&r[5])}g>2145386496&&f(1);var m=new t((1==e?w||g:e?0:g)+12);return m[0]=1,m[4]=4,m[8]=8,{b:c+p,y:0,l:0,d:y,w:e&&1!=e?e:m.subarray(12),e:g,o:new s(m.buffer,0,3),u:w,c:o,m:Math.min(131072,g)}}if(25481893==(n>>4|r[3]<<20))return v(r,4)+8;f(0)},b=function(r){for(var t=0;1<<t<=r;++t);return t-1},y=function(a,s,i){var o=4+(s<<3),u=5+(15&a[s]);u>i&&f(3);for(var h=1<<u,l=h,v=-1,c=-1,y=-1,p=h,w=new r(512+(h<<2)),g=new n(w,0,256),d=new e(w,0,256),m=new e(w,512,h),z=512+(h<<1),E=new t(w,z,h),k=new t(w,z+h);v<255&&l>0;){var A=b(l+1),T=o>>3,x=(1<<A+1)-1,F=(a[T]|a[T+1]<<8|a[T+2]<<16)>>(7&o)&x,S=(1<<A)-1,B=x-l-1,I=F&S;if(I<B?(o+=A,F=I):(o+=A+1,F>S&&(F-=B)),g[++v]=--F,-1==F?(l+=F,E[--p]=v):l-=F,!F)do{var U=o>>3;c=(a[U]|a[U+1]<<8)>>(7&o)&3,o+=2,v+=c}while(3==c)}(v>255||l)&&f(0);for(var D=0,M=(h>>1)+(h>>3)+3,W=h-1,O=0;O<=v;++O){var j=g[O];if(j<1)d[O]=-j;else for(y=0;y<j;++y){E[D]=O;do{D=D+M&W}while(D>=p)}}for(D&&f(0),y=0;y<h;++y){var C=d[E[y]]++,H=k[y]=u-b(C);m[y]=(C<<H)-h}return[o+7>>3,{b:u,s:E,n:k,t:m}]},p=function(r,n){var a=0,s=-1,i=new t(292),u=r[n],h=i.subarray(0,256),l=i.subarray(256,268),v=new e(i.buffer,268);if(u<128){var c=y(r,n+1,6),p=c[1],w=c[0]<<3,g=r[n+=u];g||f(0);for(var d=0,m=0,z=p.b,E=z,k=(++n<<3)-8+b(g);!((k-=z)<w);){var A=k>>3;if(h[++s]=p.s[d+=(r[A]|r[A+1]<<8)>>(7&k)&(1<<z)-1],(k-=E)<w)break;h[++s]=p.s[m+=(r[A=k>>3]|r[A+1]<<8)>>(7&k)&(1<<E)-1],z=p.n[d],d=p.t[d],E=p.n[m],m=p.t[m]}++s>255&&f(0)}else{for(s=u-127;a<s;a+=2){var T=r[++n];h[a]=T>>4,h[a+1]=15&T}++n}var x=0;for(a=0;a<s;++a)(I=h[a])>11&&f(0),x+=I&&1<<I-1;var F=b(x)+1,S=1<<F,B=S-x;for(B&B-1&&f(0),h[s++]=b(B)+1,a=0;a<s;++a){var I;++l[h[a]=(I=h[a])&&F+1-I]}var U=new t(S<<1),D=U.subarray(0,S),M=U.subarray(S);for(v[F]=0,a=F;a>0;--a){var W=v[a];o(M,a,W,v[a-1]=W+l[a]*(1<<F-a))}for(v[0]!=S&&f(0),a=0;a<s;++a){var O=h[a];if(O){var j=v[O];o(D,a,j,v[O]=j+(1<<F-O))}}return[n,{n:M,b:F,s:D}]},w=y(new t([81,16,99,140,49,198,24,99,12,33,196,24,99,102,102,134,70,146,4]),0,6)[1],g=y(new t([33,20,196,24,99,140,33,132,16,66,8,33,132,16,66,8,33,68,68,68,68,68,68,68,68,36,9]),0,6)[1],d=y(new t([32,132,16,66,102,70,68,68,68,68,36,73,2]),0,5)[1],m=function(r,t){for(var e=r.length,n=new s(e),a=0;a<e;++a)n[a]=t,t+=1<<r[a];return n},z=new t(new s([0,0,0,0,16843009,50528770,134678020,202050057,269422093]).buffer,0,36),E=m(z,0),k=new t(new s([0,0,0,0,0,0,0,0,16843009,50528770,117769220,185207048,252579084,16]).buffer,0,53),A=m(k,3),T=function(r,t,e){var n=r.length,a=t.length,s=r[n-1],i=(1<<e.b)-1,o=-e.b;s||f(0);for(var u=0,h=e.b,l=(n<<3)-8+b(s)-h,v=-1;l>o&&v<a;){var c=l>>3;t[++v]=e.s[u=(u<<h|(r[c]|r[c+1]<<8|r[c+2]<<16)>>(7&l))&i],l-=h=e.n[u]}l==o&&v+1==a||f(0)},x=function(r,t,e){var n=6,a=t.length+3>>2,s=a<<1,i=a+s;T(r.subarray(n,n+=r[0]|r[1]<<8),t.subarray(0,a),e),T(r.subarray(n,n+=r[2]|r[3]<<8),t.subarray(a,s),e),T(r.subarray(n,n+=r[4]|r[5]<<8),t.subarray(s,i),e),T(r.subarray(n),t.subarray(i),e)},F=function(r,n,a){var s,u=n.b,h=r[u],l=h>>1&3;n.l=1&h;var v=h>>3|r[u+1]<<5|r[u+2]<<13,c=(u+=3)+v;if(1==l){if(u>=r.length)return;return n.b=u+1,a?(o(a,r[u],n.y,n.y+=v),a):o(new t(v),r[u])}if(!(c>r.length)){if(0==l)return n.b=c,a?(a.set(r.subarray(u,c),n.y),n.y+=v,a):i(r,u,c);if(2==l){var m=r[u],F=3&m,S=m>>2&3,B=m>>4,I=0,U=0;F<2?1&S?B|=r[++u]<<4|(2&S&&r[++u]<<12):B=m>>3:(U=S,S<2?(B|=(63&r[++u])<<4,I=r[u]>>6|r[++u]<<2):2==S?(B|=r[++u]<<4|(3&r[++u])<<12,I=r[u]>>2|r[++u]<<6):(B|=r[++u]<<4|(63&r[++u])<<12,I=r[u]>>6|r[++u]<<2|r[++u]<<10)),++u;var D=a?a.subarray(n.y,n.y+n.m):new t(n.m),M=D.length-B;if(0==F)D.set(r.subarray(u,u+=B),M);else if(1==F)o(D,r[u++],M);else{var W=n.h;if(2==F){var O=p(r,u);I+=u-(u=O[0]),n.h=W=O[1]}else W||f(0);(U?x:T)(r.subarray(u,u+=I),D.subarray(M),W)}var j=r[u++];if(j){255==j?j=32512+(r[u++]|r[u++]<<8):j>127&&(j=j-128<<8|r[u++]);var C=r[u++];3&C&&f(0);for(var H=[g,d,w],L=2;L>-1;--L){var Z=C>>2+(L<<1)&3;if(1==Z){var q=new t([0,0,r[u++]]);H[L]={s:q.subarray(2,3),n:q.subarray(0,1),t:new e(q.buffer,0,1),b:0}}else 2==Z?(u=(s=y(r,u,9-(1&L)))[0],H[L]=s[1]):3==Z&&(n.t||f(0),H[L]=n.t[L])}var G=n.t=H,J=G[0],K=G[1],N=G[2],P=r[c-1];P||f(0);var Q=(c<<3)-8+b(P)-N.b,R=Q>>3,V=0,X=(r[R]|r[R+1]<<8)>>(7&Q)&(1<<N.b)-1,Y=(r[R=(Q-=K.b)>>3]|r[R+1]<<8)>>(7&Q)&(1<<K.b)-1,$=(r[R=(Q-=J.b)>>3]|r[R+1]<<8)>>(7&Q)&(1<<J.b)-1;for(++j;--j;){var _=N.s[X],rr=N.n[X],tr=J.s[$],er=J.n[$],nr=K.s[Y],ar=K.n[Y],sr=1<<nr,ir=sr+((r[R=(Q-=nr)>>3]|r[R+1]<<8|r[R+2]<<16|r[R+3]<<24)>>>(7&Q)&sr-1);R=(Q-=k[tr])>>3;var or=A[tr]+((r[R]|r[R+1]<<8|r[R+2]<<16)>>(7&Q)&(1<<k[tr])-1);R=(Q-=z[_])>>3;var ur=E[_]+((r[R]|r[R+1]<<8|r[R+2]<<16)>>(7&Q)&(1<<z[_])-1);if(R=(Q-=rr)>>3,X=N.t[X]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<rr)-1),R=(Q-=er)>>3,$=J.t[$]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<er)-1),R=(Q-=ar)>>3,Y=K.t[Y]+((r[R]|r[R+1]<<8)>>(7&Q)&(1<<ar)-1),ir>3)n.o[2]=n.o[1],n.o[1]=n.o[0],n.o[0]=ir-=3;else{var hr=ir-(0!=ur);hr?(ir=3==hr?n.o[0]-1:n.o[hr],hr>1&&(n.o[2]=n.o[1]),n.o[1]=n.o[0],n.o[0]=ir):ir=n.o[0]}for(L=0;L<ur;++L)D[V+L]=D[M+L];M+=ur;var fr=(V+=ur)-ir;if(fr<0){var lr=-fr,vr=n.e+fr;for(lr>or&&(lr=or),L=0;L<lr;++L)D[V+L]=n.w[vr+L];V+=lr,or-=lr,fr=0}for(L=0;L<or;++L)D[V+L]=D[fr+L];V+=or}if(V!=M)for(;M<D.length;)D[V++]=D[M++];else V=D.length;a?n.y+=V:D=i(D,0,V)}else if(a){if(n.y+=B,M)for(L=0;L<B;++L)D[L]=D[M+L]}else M&&(D=i(D,M));return n.b=c,D}f(2)}},S=function(r,e){if(1==r.length)return r[0];for(var n=new t(e),a=0,s=0;a<r.length;++a){var i=r[a];n.set(i,s),s+=i.length}return n};function B(r,t){for(var e=[],n=+!t,a=0,s=0;r.length;){var i=c(r,n||t);if("object"==typeof i){for(n?(t=null,i.w.length==i.u&&(e.push(t=i.w),s+=i.u)):(e.push(t),i.e=0);!i.l;){var o=F(r,i,t);o||f(5),t?i.e=i.y:(e.push(o),s+=o.length,u(i.w,0,o.length),i.w.set(o,i.w.length-o.length))}a=i.b+4*i.c}else a=i;r=r.subarray(a)}return S(e,s)}_e.decompress=B;var I=function(){function r(r){this.ondata=r,this.c=[],this.l=0,this.z=0}return r.prototype.push=function(r,e){if("number"==typeof this.s){var n=Math.min(r.length,this.s);r=r.subarray(n),this.s-=n}var a=r.length+this.l;if(!this.s){if(e){if(!a)return void this.ondata(new t(0),!0);a<5&&f(5)}else if(a<18)return this.c.push(r),void(this.l=a);if(this.l&&(this.c.push(r),r=S(this.c,a),this.c=[],this.l=0),"number"==typeof(this.s=c(r)))return this.push(r,e)}if("number"!=typeof this.s){if(a<(this.z||3))return e&&f(5),this.c.push(r),void(this.l=a);if(this.l&&(this.c.push(r),r=S(this.c,a),this.c=[],this.l=0),!this.z&&a<(this.z=2&r[this.s.b]?4:3+(r[this.s.b]>>3|r[this.s.b+1]<<5|r[this.s.b+2]<<13)))return e&&f(5),this.c.push(r),void(this.l=a);for(this.z=0;;){var s=F(r,this.s);if(!s){e&&f(5);var i=r.subarray(this.s.b);return this.s.b=0,this.c.push(i),void(this.l+=i.length)}if(this.ondata(s,!1),u(this.s.w,0,s.length),this.s.w.set(s,this.s.w.length-s.length),this.s.l){var o=r.subarray(this.s.b);return this.s=4*this.s.c,void this.push(o,e)}}}else e&&f(5)},r}();_e.Decompress=I;return _e});return module.exports;})();
// Switch for Affinity – studios3.dat (Werkzeugleisten) lesen/schreiben. Benoetigt fzstd (MIT).
var ST=(function(){
function u32(b,o){ return (b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0; }
function w32(b,o,v){ b[o]=v&255; b[o+1]=(v>>>8)&255; b[o+2]=(v>>>16)&255; b[o+3]=(v>>>24)&255; }
function w64(b,o,v){ w32(b,o,v>>>0); w32(b,o+4,Math.floor(v/4294967296)); }
function tag(b,o){ return String.fromCharCode(b[o],b[o+1],b[o+2],b[o+3]); }
function find(b,s,from){ outer: for(var i=from||0;i<=b.length-s.length;i++){ for(var k=0;k<s.length;k++) if(b[i+k]!==s.charCodeAt(k)) continue outer; return i; } return -1; }
var CRC=(function(){ var t=new Int32Array(256); for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c; } return t; })();
function crc32(b){ var c=-1; for(var i=0;i<b.length;i++) c=CRC[(c^b[i])&255]^(c>>>8); return (c^-1)>>>0; }
function unpack(file){
  if(file[0]!==0||file[1]!==0xff||tag(file,2)!=='KA\f\0') throw new Error('Unbekanntes Dateiformat');
  if(tag(file,12)!=='#Inf'||tag(file,72)!=='#Fil') throw new Error('Unbekannter Kopf');
  var comp=u32(file,32), ft=u32(file,16); if(tag(file,ft)!=='#FT4') throw new Error('Unbekanntes Ende');
  var frame=file.subarray(76,76+comp);
  var raw=fzstd.decompress(frame);
  if(crc32(raw)!==u32(file,ft+88)) throw new Error('Pruefsumme stimmt nicht');
  return {file:file, raw:raw, ft:ft};
}
function zstdRaw(raw){ // zstd-Frame aus unkomprimierten Bloecken
  var MAXB=100000, nb=Math.max(1,Math.ceil(raw.length/MAXB)), out=new Uint8Array(4+2+4+nb*3+raw.length), p=0;
  out.set([0x28,0xb5,0x2f,0xfd],0); p=4;
  out[p++]=0xA0; out[p++]=0; // FHD: FCS 4 Byte, Single-Segment aus -> Window-Descriptor
  // Single_Segment=1 sparen wir uns nicht: 0xA0 = FCS_flag 2 (4 Byte) + Single_Segment 1; dann kein Window-Byte
  p=5; w32(out,p,raw.length); p+=4;
  for(var i=0;i<nb;i++){ var s=i*MAXB, n=Math.min(MAXB,raw.length-s), last=(i===nb-1)?1:0, h=(n<<3)|last;
    out[p++]=h&255; out[p++]=(h>>8)&255; out[p++]=(h>>16)&255; out.set(raw.subarray(s,s+n),p); p+=n; }
  return out.subarray(0,p);
}
function pack(u,raw){
  var f=u.file, ft=u.ft, frame=zstdRaw(raw), head=f.subarray(0,76), tail=f.subarray(ft);
  var total=76+frame.length+4+tail.length, out=new Uint8Array(total);
  out.set(head,0); out.set(frame,76); out.set([255,255,255,255],76+frame.length); var nft=76+frame.length+4; out.set(tail,nft);
  w64(out,16,nft); w64(out,24,total); w64(out,32,frame.length);
  w64(out,nft+20,total); w64(out,nft+28,frame.length); w64(out,nft+72,raw.length); w64(out,nft+80,frame.length);
  w32(out,nft+88,crc32(raw)); w32(out,nft+97,crc32(frame));
  return out;
}
// Objekt-Definitionen: 01 <u32 id> (00|01) <4 Zeichen Klasse>
function objects(b){
  var list=[], exp=1;
  for(var i=0;i<b.length-10;i++){
    if(b[i]===1 && (b[i+5]===0||b[i+5]===1) && u32(b,i+1)===exp){
      var ok=true; for(var k=6;k<10;k++){ if(b[i+k]<32||b[i+k]>126){ok=false;break;} }
      if(ok){ list.push(i); exp++; i+=9; }
    }
  }
  return list;
}
function parseGroups(b,p,count){
  var gs=[];
  for(var g=0;g<count;g++){
    var s=p; if(b[p]!==1) throw new Error('Gruppe@'+p); p+=5; var fl=b[p]; p+=1;
    if(tag(b,p)!=='rgpt') throw new Error('keine Werkzeuggruppe@'+p); p+=4;
    if(fl===0) p+=4; // Schema-Version bei erster Definition
    if(b[p]!==0x83||tag(b,p+1)!=='smti') throw new Error('items@'+p); var n=u32(b,p+5); p+=9;
    var items=[]; for(var k=0;k<n;k++){ items.push(String.fromCharCode(b[p+3],b[p+2],b[p+1],b[p])); p+=4; }
    if(b[p]!==0x2b||tag(b,p+1)!=='eman') throw new Error('name@'+p); var L=u32(b,p+5); var gname=''; for(var q=0;q<L;q++) gname+=String.fromCharCode(b[p+9+q]); p+=9+L;
    if(b[p]!==0) throw new Error('Ende@'+p); p++;
    gs.push({start:s,end:p,items:items,name:gname,first:fl===0});
  }
  return gs;
}
function guidAt(b,p){ var h=''; for(var i=0;i<16;i++) h+=(b[p+i]<256?(b[p+i]+256).toString(16).slice(1):''); return (h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)).toUpperCase(); }
function studioToolsets(b){
  var res=[], p=0, cur=null, defs={};
  while(true){
    var q=find(b,'Ddiug',p), r=find(b,'\xb1sprg',p), d=find(b,'\xb1Ifed',p);
    var cands=[q,r,d].filter(function(x){return x>=0;}); if(!cands.length) break;
    var m=Math.min.apply(null,cands);
    if(m===q){ cur=guidAt(b,q+5); p=q+21; continue; }
    if(m===d){ try{ defs[cur]=parseGroups(b,d+9,u32(b,d+5)).map(function(g){ var it=g.items.slice(); it.groupName=g.name; return it; }); }catch(e){} p=d+9; continue; }
    res.push({guid:cur, at:r, count:u32(b,r+5), groupsStart:r+9}); p=r+9;
  }
  res.forEach(function(x){ x.defaults=defs[x.guid]||null; });
  return res;
}
function encGroup(items,first,sch){
  var n=items.length, name=(items.groupName!==undefined)? items.groupName : (n>1?'Group':''), len=6+4+(first?4:0)+9+4*n+9+name.length+1, o=new Uint8Array(len), p=0;
  o[p++]=1; p+=4; o[p++]=first?0:1; o.set([0x72,0x67,0x70,0x74],p); p+=4; if(first){ o.set(sch&&sch.length===4?sch:[1,0,0,2],p); p+=4; }
  o[p++]=0x83; o.set([0x73,0x6d,0x74,0x69],p); p+=4; w32(o,p,n); p+=4;
  items.forEach(function(t){ var s=(t+'    ').slice(0,4); o[p++]=s.charCodeAt(3); o[p++]=s.charCodeAt(2); o[p++]=s.charCodeAt(1); o[p++]=s.charCodeAt(0); });
  o[p++]=0x2b; o.set([0x65,0x6d,0x61,0x6e],p); p+=4; w32(o,p,name.length); p+=4;
  for(var i=0;i<name.length;i++) o[p++]=name.charCodeAt(i);
  o[p++]=0; return o;
}
function applyToolbars(raw, cfg){
  var rep={changed:[],skipped:[]};
  var before=objects(raw).length;
  var sets=studioToolsets(raw), edits=[];
  var resetList=cfg.reset||[];
  sets.forEach(function(s){
    var want=cfg.studios[s.guid], groups=null, label;
    if(want){ groups=want.groups; label=want.name; }
    else if(resetList.indexOf(s.guid)>=0 && s.defaults){ groups=s.defaults; label=s.guid+' (Affinity-Standard)'; }
    if(!groups) return;
    var gs=parseGroups(raw,s.groupsStart,s.count);
    var region=[]; var sch=gs[0].first? raw.slice(gs[0].start+10, gs[0].start+14) : null; groups.forEach(function(g,i){ region.push(encGroup(g, i===0 && gs[0].first, sch)); });
    edits.push({start:s.at+5, end:gs[gs.length-1].end, count:groups.length, region:region, guid:s.guid});
    rep.changed.push(label+': '+gs.length+' -> '+groups.length+' Knoepfe');
  });
  var oldPos=objects(raw);
  if(oldPos.length<10) throw new Error('Objektliste nicht erkannt');
  edits.sort(function(a,b){return a.start-b.start;});
  var buf=new Uint8Array(raw.length+edits.reduce(function(t,e){ var sz=4; e.region.forEach(function(r){sz+=r.length;}); e.size=sz; return t+sz-(e.end-e.start); },0));
  var src=0, dst=0, shift=[], newObj=[];
  edits.forEach(function(e){
    shift.push({from:src,to:e.start,delta:dst-src});
    buf.set(raw.subarray(src,e.start),dst); dst+=e.start-src;
    w32(buf,dst,e.count); var p=dst+4; e.region.forEach(function(r){ buf.set(r,p); newObj.push(p); p+=r.length; });
    dst=p; src=e.end;
  });
  buf.set(raw.subarray(src),dst); shift.push({from:src,to:raw.length,delta:dst-src});
  var all=newObj.slice();
  oldPos.forEach(function(q){ for(var k=0;k<shift.length;k++){ if(q>=shift[k].from && q<shift[k].to){ all.push(q+shift[k].delta); return; } } });
  all.sort(function(a,b){return a-b;});
  all.forEach(function(q,i){ w32(buf,q+1,i+1); });
  var id=all.length+1;
  raw=null;
  rep.objects=[before,id-1];
  var chk=objects(buf).length; if(chk!==id-1) throw new Error('Nummerierung fehlerhaft '+chk+'/'+(id-1));
  return {raw:buf, report:rep};
}
return {unpack:unpack, pack:pack, applyToolbars:applyToolbars, objects:objects, parseGroups:parseGroups, studioToolsets:studioToolsets, crc32:crc32};
})();
if(typeof module!=='undefined') module.exports=ST;

ObjC.import('Foundation');
var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64dec(s){ var L=new Int16Array(256).fill(-1); for(var i=0;i<64;i++) L[B64.charCodeAt(i)]=i;
  s=s.replace(/[^A-Za-z0-9+\/]/g,''); var n=Math.floor(s.length*3/4), out=new Uint8Array(n), o=0, buf=0, bits=0;
  for(var j=0;j<s.length;j++){ buf=(buf<<6)|L[s.charCodeAt(j)]; bits+=6; if(bits>=8){ bits-=8; if(o<n) out[o++]=(buf>>bits)&255; } } return out.subarray(0,o); }
function b64enc(b){ var s='',i; for(i=0;i+2<b.length;i+=3){ var v=(b[i]<<16)|(b[i+1]<<8)|b[i+2]; s+=B64[v>>18]+B64[(v>>12)&63]+B64[(v>>6)&63]+B64[v&63]; }
  var r=b.length-i; if(r===1){ var v1=b[i]<<16; s+=B64[v1>>18]+B64[(v1>>12)&63]+'=='; } else if(r===2){ var v2=(b[i]<<16)|(b[i+1]<<8); s+=B64[v2>>18]+B64[(v2>>12)&63]+B64[(v2>>6)&63]+'='; } return s; }

function run(argv){
  var src=argv[0], cfgPath=argv[1], dst=argv[2];
  var d=$.NSData.dataWithContentsOfFile(src); if(d.isNil()) return JSON.stringify({error:'missing'});
  var file=b64dec(d.base64EncodedStringWithOptions(0).js);
  var cfg=JSON.parse($.NSString.stringWithContentsOfFileEncodingError(cfgPath,$.NSUTF8StringEncoding,null).js);
  var u=ST.unpack(file); var r=ST.applyToolbars(u.raw,cfg); var out=ST.pack(u,r.raw);
  var chk=ST.unpack(out); if(chk.raw.length!==r.raw.length) throw new Error('Pruefung fehlgeschlagen');
  var nd=$.NSData.alloc.initWithBase64EncodedStringOptions(b64enc(out),0);
  if(!nd.writeToFileAtomically(dst,true)) throw new Error('Schreiben fehlgeschlagen');
  return JSON.stringify(r.report);
}
