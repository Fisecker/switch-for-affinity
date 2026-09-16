// Switch for Affinity – core (bplist reader/writer + shortcut generator). Runs in node and in macOS JXA.
'use strict';
var AS = (function(){
function UID(n){ this.uid=n; }
function Real(v){ this.real=v; }
function Data(b){ this.data=b; } // Uint8Array
function DateV(v){ this.date=v; }
function rdInt(b,o,n){ var v=0n; for(var i=0;i<n;i++) v=(v<<8n)|BigInt(b[o+i]); return v; }
function parse(b){
  var h=String.fromCharCode.apply(null,b.subarray(0,8)); if(h.indexOf('bplist0')!==0) throw new Error('keine bplist');
  var t=b.length-32; var offSize=b[t+6], refSize=b[t+7];
  var num=Number(rdInt(b,t+8,8)), top=Number(rdInt(b,t+16,8)), tbl=Number(rdInt(b,t+24,8));
  var offs=[]; for(var i=0;i<num;i++) offs.push(Number(rdInt(b,tbl+i*offSize,offSize)));
  var cache={};
  function cnt(o,low){ if(low<15) return [low,o+1]; var m=b[o+1]; var n=1<<(m&0xf); return [Number(rdInt(b,o+2,n)),o+2+n]; }
  function obj(r){
    if(cache.hasOwnProperty(r)) return cache[r];
    var o=offs[r], m=b[o], hi=m>>4, low=m&0xf, v, c;
    switch(hi){
      case 0: v= low===8?false: low===9?true: null; break;
      case 1: { var n=1<<low; v=rdInt(b,o+1,n); if(n===8 && v>=(1n<<63n)) v-= (1n<<64n); break; }
      case 2: { var dv=new DataView(b.buffer,b.byteOffset+o+1,1<<low); v=new Real(low===2?dv.getFloat32(0):dv.getFloat64(0)); break; }
      case 3: { var dv2=new DataView(b.buffer,b.byteOffset+o+1,8); v=new DateV(dv2.getFloat64(0)); break; }
      case 4: c=cnt(o,low); v=new Data(b.slice(c[1],c[1]+c[0])); break;
      case 5: c=cnt(o,low); v=String.fromCharCode.apply(null,b.subarray(c[1],c[1]+c[0])); break;
      case 6: { c=cnt(o,low); var s=''; for(var k=0;k<c[0];k++) s+=String.fromCharCode((b[c[1]+2*k]<<8)|b[c[1]+2*k+1]); v=s; break; }
      case 8: v=new UID(Number(rdInt(b,o+1,low+1))); break;
      case 0xA: case 0xC: { c=cnt(o,low); v=[]; cache[r]=v; for(var k2=0;k2<c[0];k2++) v.push(obj(Number(rdInt(b,c[1]+k2*refSize,refSize)))); break; }
      case 0xD: { c=cnt(o,low); v={__keys:[]}; cache[r]=v; var kk=[],vv=[];
        for(var k3=0;k3<c[0];k3++){ kk.push(obj(Number(rdInt(b,c[1]+k3*refSize,refSize)))); }
        for(var k4=0;k4<c[0];k4++){ vv.push(obj(Number(rdInt(b,c[1]+(c[0]+k4)*refSize,refSize)))); }
        for(var k5=0;k5<kk.length;k5++){ v.__keys.push(kk[k5]); v[kk[k5]]=vv[k5]; } break; }
      default: throw new Error('Typ '+hi);
    }
    cache[r]=v; return v;
  }
  return obj(top);
}
function write(root){
  var objs=[], memo=new Map();
  function keyOf(v){
    if(v===null) return 'n'; if(v===true) return 'T'; if(v===false) return 'F';
    if(typeof v==='bigint') return 'i'+v; if(typeof v==='string') return 's'+v;
    if(v instanceof UID) return 'u'+v.uid; if(v instanceof Real) return 'r'+v.real;
    return null;
  }
  function add(v){
    var k=keyOf(v); if(k!==null && memo.has(k)) return memo.get(k);
    if(k===null && memo.has(v)) return memo.get(v);
    var idx=objs.length; var e={v:v}; objs.push(e);
    if(k!==null) memo.set(k,idx); else memo.set(v,idx);
    if(Array.isArray(v)) e.refs=v.map(add);
    else if(v && typeof v==='object' && v.__keys){ var ks=v.__keys.map(add); var vs=v.__keys.map(function(x){return add(v[x]);}); e.refs=ks.concat(vs); e.n=ks.length; }
    return idx;
  }
  add(root);
  var n=objs.length, refSize= n<256?1: n<65536?2:4;
  var out=[]; var offs=[]; var len=8;
  function push(arr){ out.push(arr); len+=arr.length; }
  function be(v,nb){ var a=new Uint8Array(nb); var x=BigInt(v); if(x<0n) x+= (1n<<BigInt(nb*8)); for(var i=nb-1;i>=0;i--){ a[i]=Number(x&0xffn); x>>=8n; } return a; }
  function marker(hi,count){ if(count<15) return new Uint8Array([(hi<<4)|count]); var ib=intBytes(BigInt(count)); var a=new Uint8Array(1+ib.length); a[0]=(hi<<4)|0xf; a.set(ib,1); return a; }
  function intBytes(x){ var lg, nb; if(x<0n){lg=3;nb=8;} else if(x<256n){lg=0;nb=1;} else if(x<65536n){lg=1;nb=2;} else if(x<4294967296n){lg=2;nb=4;} else {lg=3;nb=8;} var a=new Uint8Array(1+nb); a[0]=0x10|lg; a.set(be(x,nb),1); return a; }
  objs.forEach(function(e){
    offs.push(len); var v=e.v;
    if(v===null) push(new Uint8Array([0])); else if(v===true) push(new Uint8Array([9])); else if(v===false) push(new Uint8Array([8]));
    else if(typeof v==='bigint') push(intBytes(v));
    else if(v instanceof Real){ var a=new Uint8Array(9); a[0]=0x23; new DataView(a.buffer).setFloat64(1,v.real); push(a); }
    else if(v instanceof DateV){ var a2=new Uint8Array(9); a2[0]=0x33; new DataView(a2.buffer).setFloat64(1,v.date); push(a2); }
    else if(v instanceof Data){ push(marker(4,v.data.length)); push(v.data); }
    else if(v instanceof UID){ var nb=v.uid<256?1:v.uid<65536?2:4; var u=new Uint8Array(1+nb); u[0]=0x80|(nb-1); u.set(be(v.uid,nb),1); push(u); }
    else if(typeof v==='string'){
      var ascii=true; for(var i=0;i<v.length;i++) if(v.charCodeAt(i)>127){ascii=false;break;}
      if(ascii){ push(marker(5,v.length)); var s=new Uint8Array(v.length); for(var j=0;j<v.length;j++) s[j]=v.charCodeAt(j); push(s); }
      else { push(marker(6,v.length)); var s2=new Uint8Array(v.length*2); for(var j2=0;j2<v.length;j2++){ var c=v.charCodeAt(j2); s2[2*j2]=c>>8; s2[2*j2+1]=c&255; } push(s2); }
    }
    else if(Array.isArray(v)){ push(marker(0xA,v.length)); var r=new Uint8Array(e.refs.length*refSize); e.refs.forEach(function(x,i){ r.set(be(x,refSize),i*refSize); }); push(r); }
    else { push(marker(0xD,e.n)); var r2=new Uint8Array(e.refs.length*refSize); e.refs.forEach(function(x,i){ r2.set(be(x,refSize),i*refSize); }); push(r2); }
  });
  var tblOff=len, maxOff=tblOff, offSize= maxOff<256?1: maxOff<65536?2: maxOff<4294967296?4:8;
  var tb=new Uint8Array(n*offSize); offs.forEach(function(o,i){ tb.set(be(o,offSize),i*offSize); }); push(tb);
  var tr=new Uint8Array(32); tr[6]=offSize; tr[7]=refSize; tr.set(be(n,8),8); tr.set(be(0,8),16); tr.set(be(tblOff,8),24); push(tr);
  var res=new Uint8Array(len); res.set([98,112,108,105,115,116,48,48],0); var p=8; out.forEach(function(a){ res.set(a,p); p+=a.length; });
  return res;
}
var MOD={'^':262144,'~':524288,'$':131072,'@':1048576};
var NONE=9223372036854775807n;
var P='com.canva.affinity.KeyEquivalentData.';
function parseSpec(s){ var m=0,i=0; while(i<s.length-1 && MOD[s[i]]){ m|=MOD[s[i]]; i++; } return [m,s.slice(i)]; }
function fmtSpec(m,k){ var s=''; for(var c in MOD) if(m&MOD[c]) s+=c; return s+k; }
function fourcc(n){ n=Number(n); return String.fromCharCode((n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255); }
// Apply mapping to an NSKeyedArchiver shortcuts archive (tree from parse). Returns report.
function apply(arch, mapping){
  var O=arch['$objects'], root=O[arch['$top'].root.uid], rep={studios:{},missing:{},toolsMissing:{},warnings:[]};
  function deref(x){ return x instanceof UID? O[x.uid]: x; }
  var rkeys=root['NS.keys'].map(deref), rvals=root['NS.objects'];
  var strIdx=new Map(); O.forEach(function(o,i){ if(typeof o==='string' && !strIdx.has(o)) strIdx.set(o,i); });
  function sref(s){ if(strIdx.has(s)) return new UID(strIdx.get(s)); O.push(s); strIdx.set(s,O.length-1); return new UID(O.length-1); }
  var gi=rkeys.indexOf('shortcut.globalOverrides');
  if(gi>=0 && mapping.clearGlobalOverrides!==false && Object.keys(mapping.studios).length>0){ var g=deref(rvals[gi]); if(g && g['NS.objects']){ rep.globalOverridesCleared=g['NS.objects'].length; g['NS.objects'].length=0; } }
  Object.keys(mapping.studios).forEach(function(st){
    var guid=mapping.studios[st], i=rkeys.indexOf(guid);
    if(i<0){ rep.warnings.push('Studio fehlt: '+st); return; }
    var arr=deref(rvals[i])['NS.objects'].map(deref);
    var rows=arr.map(function(e){
      var a=deref(e[P+'Action']); var t=e[P+'ToolIDTag'];
      return {e:e, act: typeof a==='string'&&a!=='$null'?a:null, tool: t!==undefined&&t!==0n? fourcc(t):null, plain: e[P+'FuncEnum']===undefined||e[P+'FuncEnum']===NONE,
        get m(){ return Number(e[P+'Modifier']||0n); }, get k(){ var k=deref(e[P+'Key']); return (typeof k==='string'&&k!=='$null')?k:''; } };
    });
    function set(r,m,k){ r.e[P+'Modifier']=BigInt(m); r.e[P+'Key']=sref(k); }
    function clash(m,k,keep){ if(!k) return; rows.forEach(function(r){ if(r!==keep && r.plain && r.m===m && r.k.toLowerCase()===k.toLowerCase() && r.act!==keep.act){ if(!(keep.tool && r.tool)) set(r,0,''); } }); }
    var cmds=mapping.commands[st]||{}, done=0, miss=[];
    Object.keys(cmds).forEach(function(a){
      var ps=cmds[a]? parseSpec(cmds[a]):[0,''], hits=rows.filter(function(r){return r.act===a && r.plain;});
      if(!hits.length){ miss.push(a); return; }
      clash(ps[0],ps[1],hits[0]); hits.forEach(function(r){ set(r,ps[0],ps[1]); }); done++;
    });
    var tools=mapping.tools[st]||{}, tdone=0, tmiss=[];
    Object.keys(tools).forEach(function(t){
      var hits=rows.filter(function(r){return r.tool===t && r.plain;});
      if(!hits.length){ tmiss.push(t); return; }
      hits.forEach(function(r){ set(r,0,tools[t]); }); tdone++;
    });
    rep.studios[st]={commands:done, tools:tdone}; rep.missing[st]=miss; rep.toolsMissing[st]=tmiss;
  });
  return rep;
}
return {parse:parse, write:write, apply:apply, UID:UID, parseSpec:parseSpec, fmtSpec:fmtSpec, fourcc:fourcc};
})();
if(typeof module!=='undefined') module.exports=AS;
// JXA-Einstiegspunkt: osascript -l JavaScript shortcuts.js <quelle> <mapping.json> <ziel>
ObjC.import('Foundation');
var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64dec(s){ var L=new Int16Array(256).fill(-1); for(var i=0;i<64;i++) L[B64.charCodeAt(i)]=i;
  s=s.replace(/[^A-Za-z0-9+\/]/g,''); var n=Math.floor(s.length*3/4), out=new Uint8Array(n), o=0, buf=0, bits=0;
  for(var j=0;j<s.length;j++){ buf=(buf<<6)|L[s.charCodeAt(j)]; bits+=6; if(bits>=8){ bits-=8; if(o<n) out[o++]=(buf>>bits)&255; } } return out.subarray(0,o); }
function b64enc(b){ var s='',i; for(i=0;i+2<b.length;i+=3){ var v=(b[i]<<16)|(b[i+1]<<8)|b[i+2]; s+=B64[v>>18]+B64[(v>>12)&63]+B64[(v>>6)&63]+B64[v&63]; }
  var r=b.length-i; if(r===1){ var v1=b[i]<<16; s+=B64[v1>>18]+B64[(v1>>12)&63]+'=='; } else if(r===2){ var v2=(b[i]<<16)|(b[i+1]<<8); s+=B64[v2>>18]+B64[(v2>>12)&63]+B64[(v2>>6)&63]+'='; } return s; }
function run(argv){
  var src=argv[0], map=argv[1], dst=argv[2];
  var d=$.NSData.dataWithContentsOfFile(src); if(d.isNil()) throw new Error('Datei fehlt: '+src);
  var bytes=b64dec(d.base64EncodedStringWithOptions(0).js);
  var mapping=JSON.parse($.NSString.stringWithContentsOfFileEncodingError(map,$.NSUTF8StringEncoding,null).js);
  if(argv[3]!==undefined){ var only=argv[3].split(',').filter(String), st={}; only.forEach(function(k){ if(mapping.studios[k]) st[k]=mapping.studios[k]; }); mapping.studios=st; }
  if(argv[4]==='us'){ var US_KEYS={'ä':']','ö':'[','ü':';','´':"'",'+':'=','#':'\\'};
    ['commands','tools'].forEach(function(sec){ Object.keys(mapping[sec]).forEach(function(st){ var c=mapping[sec][st]; Object.keys(c).forEach(function(a){ var s=c[a]; if(!s) return; var last=s.slice(-1); if(US_KEYS[last]) c[a]=s.slice(0,-1)+US_KEYS[last]; }); }); }); }
  var arch=AS.parse(bytes);
  // Basis ist eine bereits umgestellte Datei: vorher die Original-Tastenkuerzel zurueckholen (neue Befehle einer neueren Affinity-Version bleiben erhalten)
  var unsw=null; if(argv[6]){ var od=$.NSData.dataWithContentsOfFile(argv[6]); if(od.isNil()) throw new Error('Datei fehlt: '+argv[6]); unsw=unswitch(arch, AS.parse(b64dec(od.base64EncodedStringWithOptions(0).js))); }
  var rep=AS.apply(arch,mapping); if(unsw!==null) rep.unswitched=unsw;
  if(argv[5]){ rep.fitFreed=freeCombos(arch, argv[5].split(',').filter(String).map(function(k){ return {layout:'E9159E4D-661F-4138-A995-81A178A1824C',vector:'7C4CC2E1-D695-422B-AD3B-326C60971BE7',pixel:'831AAB2C-659F-4906-A8B1-8BA4544DB274'}[k]; }).filter(Boolean), ['$@e','~$@e','~@e','~$@c','~@c']); }
  var out=AS.write(arch);
  var nd=$.NSData.alloc.initWithBase64EncodedStringOptions(b64enc(out),0);
  if(!nd.writeToFileAtomically(dst,true)) throw new Error('Schreiben fehlgeschlagen: '+dst);
  return JSON.stringify(rep);
}

// Pruefmodus: ist die Datei schon umgestellt? (Einstellungen = Cmd+K oder Layout-Platzieren = Cmd+D)
function isSwitched(arch){
  var O=arch['$objects'], root=O[arch['$top'].root.uid];
  function d(x){ return x instanceof AS.UID? O[x.uid]: x; }
  var P='com.canva.affinity.KeyEquivalentData.', keys=root['NS.keys'].map(d), hit=false;
  ['E9159E4D-661F-4138-A995-81A178A1824C','7C4CC2E1-D695-422B-AD3B-326C60971BE7','831AAB2C-659F-4906-A8B1-8BA4544DB274'].forEach(function(g){
    var i=keys.indexOf(g); if(i<0) return;
    d(root['NS.objects'][i])['NS.objects'].map(d).forEach(function(e){
      var a=d(e[P+'Action']), m=Number(e[P+'Modifier']), k=d(e[P+'Key']);
      if((a==='showPreferences:' && m===1048576 && k==='k') || (g[0]==='E' && a==='addEmbeddedDocument:' && m===1048576 && k==='d')) hit=true;
    });
  });
  return hit;
}
// Tastenkuerzel aus einer Original-Datei uebernehmen (Zuordnung je Studio ueber Action|Werkzeug|FuncEnum|n-tes Vorkommen)
function unswitch(cur, orig){
  var P='com.canva.affinity.KeyEquivalentData.', n=0;
  function index(arch){ var O=arch['$objects'], root=O[arch['$top'].root.uid], res={};
    function d(x){ return x instanceof AS.UID? O[x.uid]: x; }
    var keys=root['NS.keys'].map(d);
    keys.forEach(function(g,i){ if(typeof g!=='string' || !/^[0-9A-F]{8}-/.test(g)) return; var v=d(root['NS.objects'][i]); if(!v || !v['NS.objects']) return;
      var cnt={}, m={}; v['NS.objects'].map(d).forEach(function(e){ var id=String(d(e[P+'Action']))+'|'+String(e[P+'ToolIDTag'])+'|'+String(e[P+'FuncEnum']);
        cnt[id]=(cnt[id]||0)+1; m[id+'|'+cnt[id]]=e; }); res[g]={map:m, d:d}; });
    return {res:res, O:O}; }
  var a=index(cur), b=index(orig), O=a.O;
  Object.keys(a.res).forEach(function(g){ var o=b.res[g]; if(!o) return; var cm=a.res[g].map;
    Object.keys(cm).forEach(function(id){ var oe=o.map[id]; if(!oe) return; var e=cm[id];
      var k=o.d(oe[P+'Key']); if(typeof k!=='string') k=''; var mod=oe[P+'Modifier']===undefined?0n:BigInt(oe[P+'Modifier']);
      var ck=a.res[g].d(e[P+'Key']); if(ck===k && BigInt(e[P+'Modifier']||0n)===mod) return;
      var i=O.indexOf(k); if(i<0){ O.push(k); i=O.length-1; } e[P+'Modifier']=mod; e[P+'Key']=new AS.UID(i); n++; }); });
  return n;
}
// Tastenkombinationen fuer die Anpassen-Dienste freimachen (Menue-Kuerzel haetten sonst Vorrang)
function freeCombos(arch, guids, specs){
  var O=arch['$objects'], root=O[arch['$top'].root.uid], P='com.canva.affinity.KeyEquivalentData.', NONE=9223372036854775807n, freed=[];
  function d(x){ return x instanceof AS.UID? O[x.uid]: x; }
  var empty=O.indexOf(''); if(empty<0){ O.push(''); empty=O.length-1; }
  var combos=specs.map(function(s){ var p=AS.parseSpec(s); return p[0]+'|'+p[1].toLowerCase(); });
  var keys=root['NS.keys'].map(d);
  guids.forEach(function(g){ var i=keys.indexOf(g); if(i<0) return;
    d(root['NS.objects'][i])['NS.objects'].map(d).forEach(function(e){
      var fe=e[P+'FuncEnum']; if(fe!==undefined && fe!==NONE) return;
      var t=e[P+'ToolIDTag']; if(t!==undefined && t!==0n) return;
      var k=d(e[P+'Key']); if(typeof k!=='string'||k==='$null'||!k) return;
      if(combos.indexOf(Number(e[P+'Modifier']||0n)+'|'+k.toLowerCase())>=0){ freed.push(d(e[P+'Action'])); e[P+'Modifier']=0n; e[P+'Key']=new AS.UID(empty); }
    });
  });
  return freed;
}
var _run=run;
run=function(argv){
  if(argv[0]==='--check'){ var d=$.NSData.dataWithContentsOfFile(argv[1]); if(d.isNil()) return 'missing';
    try{ return isSwitched(AS.parse(b64dec(d.base64EncodedStringWithOptions(0).js)))?'switched':'clean'; }catch(e){ return 'invalid'; } }
  return _run(argv);
};
