// Switch for Affinity – Einstellungsfenster v2 (JXA/Cocoa)
// Aufruf: osascript -l JavaScript settings.js <affinityVersion> <donateUrl|-> [--snapshot out.png]
ObjC.import('Cocoa');
var TESTED='3.3';
var TXT={
 de:{sub:'Affinity einrichten wie Adobe', found:'Affinity %v gefunden · getestet mit %t', newer:'Neuere Affinity-Version – Tastenkürzel funktionieren, Werkzeuge/Bedienfelder evtl. nicht.',
     general:'ALLGEMEIN', lang:'Sprache', kb:'Tastatur', ui:'Oberfläche', cols:'Werkzeugleiste links', font:'Schriftgröße', icons:'Symbole', ctx:'Kontextleiste', cmyk:'Farbprofile',
     kbv:['Deutsch','Englisch (US)'], uiv:['Dunkel','Hell'], colsv:['1 Spalte','2 Spalten'], fontv:['Standard','Groß'], iconsv:['Einfarbig','Farbig'], ctxv:['Oben angedockt','Schwebend'], cmykv:['Europa','USA','Nicht ändern'],
     from:'ÜBERNEHMEN VON', keys:'Tastenkürzel', tools:'Werkzeuge', panels:'Bedienfelder', fit:'Anpassen ⇧⌘E',
     sLayout:'Layout-Studio', sVector:'Vektor-Studio', sPixel:'Pixel-Studio',
     note:'Ausgeschaltetes wird auf den Affinity-Standard zurückgesetzt. „Anpassen“ bei Illustrator/Photoshop hat Vorrang vor dort belegten Kürzeln (z. B. ⌥⌘E Exportieren, ⌥⌘C Arbeitsfläche, ⇧⌘E Reduzieren). Vorher wird alles gesichert, Affinity wird kurz beendet.',
     apply:'Übernehmen', cancel:'Abbrechen', restore:'Wiederherstellen…', donate:'♥ Unterstützen'},
 en:{sub:'Set up Affinity like Adobe', found:'Found Affinity %v · tested with %t', newer:'Newer Affinity version – shortcuts work, tools/panels may not.',
     general:'GENERAL', lang:'Language', kb:'Keyboard', ui:'Appearance', cols:'Toolbar (left)', font:'Font size', icons:'Icons', ctx:'Context toolbar', cmyk:'Colour profiles',
     kbv:['German','English (US)'], uiv:['Dark','Light'], colsv:['1 column','2 columns'], fontv:['Standard','Large'], iconsv:['Monochrome','Colour'], ctxv:['Docked at top','Floating'], cmykv:['Europe','USA','Don’t change'],
     from:'ADOPT FROM', keys:'Shortcuts', tools:'Tools', panels:'Panels', fit:'Fitting ⇧⌘E',
     sLayout:'Layout studio', sVector:'Vector studio', sPixel:'Pixel studio',
     note:'Anything switched off is reset to Affinity’s defaults. “Fitting” for Illustrator/Photoshop takes priority over shortcuts used there (e.g. ⌥⌘E Export, ⌥⌘C Canvas Size, ⇧⌘E Flatten). Everything is backed up first; Affinity will quit briefly.',
     apply:'Apply', cancel:'Cancel', restore:'Restore…', donate:'♥ Support'}
};
function run(argv){
  var affVer=argv[0]||'', donate=(argv[1]&&argv[1]!=='-')?argv[1]:'', snap=(argv[2]==='--snapshot')?argv[3]:null;
  var ud=$.NSUserDefaults.alloc.initWithSuiteName('app.affinityswitch');
  function gi(k,def){ var v=ud.objectForKey(k); return v.isNil()? def : Number(ud.integerForKey(k)); }
  var sysLang=ObjC.unwrap($.NSLocale.preferredLanguages.firstObject)||'de';
  var sysKb=ObjC.unwrap($.NSUserDefaults.alloc.initWithSuiteName('com.apple.HIToolbox').stringForKey('AppleCurrentKeyboardLayoutInputSourceID'))||'';
  var S=globalThis.__as={
    lang:gi('lang', sysLang.indexOf('de')===0?0:1), kb:gi('kb', /German|Swiss|Austria/i.test(sysKb)?0:1),
    ui:gi('ui',0), cols:gi('cols',1), font:gi('font',0), icons:gi('icons',0), ctx:gi('ctx',0), cmyk:gi('cmyk', sysLang.indexOf('en-US')===0?1:0),
    indesign:gi('indesign',1), illustrator:gi('illustrator',1), photoshop:gi('photoshop',1)
  };
  ['indesign','illustrator','photoshop'].forEach(function(p){ ['keys','tools','panels'].forEach(function(a){ S[p+'_'+a]=gi(p+'_'+a,1); }); });
  S.indesign_fit=gi('indesign_fit',1); S.illustrator_fit=gi('illustrator_fit',0); S.photoshop_fit=gi('photoshop_fit',0);
  function L(){ return TXT[S.lang===0?'de':'en']; }

  var app=$.NSApplication.sharedApplication; app.setActivationPolicy(0);
  var W=600, ROW=34, PROW=72;
  try{ var vh=$.NSScreen.mainScreen.visibleFrame.size.height; if(vh && vh<840){ ROW=28; PROW=62; } }catch(e){}
  var genRows=['lang','kb','ui','cols','font','icons','ctx','cmyk'];
  var H= 110 + 26 + genRows.length*ROW + 18 + 26 + 3*PROW + 10 + 58 + 66;
  var win=$.NSWindow.alloc.initWithContentRectStyleMaskBackingDefer($.NSMakeRect(0,0,W,H),(1|2|32768),2,false);
  win.title='Switch for Affinity'; win.titlebarAppearsTransparent=true; win.titleVisibility=1;
  function setAppearance(){ win.appearance=$.NSAppearance.appearanceNamed(S.ui===0?'NSAppearanceNameDarkAqua':'NSAppearanceNameAqua'); }
  setAppearance();
  var v=win.contentView;
  function R(x,top,w,h){ return $.NSMakeRect(x,H-top-h,w,h); }
  var bg=$.NSBox.alloc.initWithFrame($.NSMakeRect(0,0,W,H)); bg.boxType=4; bg.borderWidth=0; bg.cornerRadius=0; bg.fillColor=$.NSColor.windowBackgroundColor; bg.titlePosition=0; v.addSubview(bg);
  var texts=[]; // [control, key, kind]
  function label(key,x,top,w,h,size,bold,grey,wrap){
    var t= wrap? $.NSTextField.wrappingLabelWithString('') : $.NSTextField.labelWithString('');
    t.frame=R(x,top,w,h); t.font= bold? $.NSFont.boldSystemFontOfSize(size) : $.NSFont.systemFontOfSize(size);
    if(grey) t.textColor=$.NSColor.secondaryLabelColor; v.addSubview(t); texts.push([t,key,'label']); return t; }
  function box(top,h){ var b=$.NSBox.alloc.initWithFrame(R(20,top,W-40,h)); b.boxType=4; b.cornerRadius=10; b.borderWidth=0; b.fillColor=$.NSColor.quaternaryLabelColor; b.titlePosition=0; v.addSubview(b); }
  function sep(top){ var s=$.NSBox.alloc.initWithFrame(R(36,top,W-72,1)); s.boxType=2; v.addSubview(s); }

  // Handler-Klasse (Zustand wird in globalThis.__as gefuehrt)
  var methods={
    'ok:':{types:['void',['id']],implementation:function(){ globalThis.__asResult='apply'; $.NSApp.stopModal; }},
    'cancel:':{types:['void',['id']],implementation:function(){ globalThis.__asResult='cancel'; $.NSApp.stopModal; }},
    'restore:':{types:['void',['id']],implementation:function(){ globalThis.__asResult='restore'; $.NSApp.stopModal; }},
    'donate:':{types:['void',['id']],implementation:function(){ if(globalThis.__asDonate) $.NSWorkspace.sharedWorkspace.openURL($.NSURL.URLWithString(globalThis.__asDonate)); }},
    'windowWillClose:':{types:['void',['id']],implementation:function(){ if(!globalThis.__asResult) globalThis.__asResult='cancel'; $.NSApp.stopModal; }}
  };
  genRows.forEach(function(k){ methods['seg_'+k+':']={types:['void',['id']],implementation:function(s){ var n=(k==='cmyk')?3:2; for(var i=0;i<n;i++) if(s.isSelectedForSegment(i)) globalThis.__as[k]=i; globalThis.__asChanged(k); }}; });
  var toggles=['indesign','illustrator','photoshop','indesign_keys','indesign_tools','indesign_panels','indesign_fit','illustrator_keys','illustrator_tools','illustrator_panels','illustrator_fit','photoshop_keys','photoshop_tools','photoshop_panels','photoshop_fit'];
  toggles.forEach(function(k){ methods['tg_'+k+':']={types:['void',['id']],implementation:function(){ globalThis.__as[k]=globalThis.__as[k]?0:1; globalThis.__asChanged(k); }}; });
  if(!$.ASHandler2) ObjC.registerSubclass({name:'ASHandler2', methods:methods});
  var h=$.ASHandler2.alloc.init; globalThis.__asHandler=h; globalThis.__asDonate=donate;

  // Kopf
  var top=34;
  var title=$.NSTextField.labelWithString('Switch for Affinity'); title.frame=R(24,top,400,30); title.font=$.NSFont.boldSystemFontOfSize(22); v.addSubview(title);
  label('sub',24,top+30,400,18,13,false,true);
  var vlab=$.NSTextField.labelWithString('v1.0'); vlab.frame=R(W-70,top+8,46,16); vlab.font=$.NSFont.systemFontOfSize(11); vlab.textColor=$.NSColor.tertiaryLabelColor; vlab.alignment=2; v.addSubview(vlab);
  var info=label('found',24,top+50,W-48,16,11,false,true);
  top=110;
  // Allgemein
  label('general',24,top,300,16,11,true,true); top+=22;
  box(top, genRows.length*ROW);
  var segs={};
  genRows.forEach(function(k,i){
    var rt=top+i*ROW;
    label(k,36,rt+Math.round((ROW-18)/2),200,18,13);
    var n=(k==='cmyk')?3:2, labels=[]; for(var j=0;j<n;j++) labels.push('x');
    var sc=$.NSSegmentedControl.segmentedControlWithLabelsTrackingModeTargetAction($(labels),0,h,'seg_'+k+':');
    var sw=(k==='cmyk'||k==='ctx')?250:200; sc.frame=R(W-40-sw,rt+Math.round((ROW-24)/2),sw,24); sc.selectedSegment=S[k]; v.addSubview(sc); segs[k]=sc;
    if(i<genRows.length-1) sep(rt+ROW);
  });
  top+=genRows.length*ROW+18;
  // Programme
  label('from',24,top,300,16,11,true,true); top+=22;
  box(top,3*PROW);
  var progs=[['indesign','InDesign','sLayout',['keys','tools','panels','fit']],['illustrator','Illustrator','sVector',['keys','tools','panels','fit']],['photoshop','Photoshop','sPixel',['keys','tools','panels','fit']]];
  var switches={}, checks={};
  progs.forEach(function(p,i){
    var rt=top+i*PROW;
    var nm=$.NSTextField.labelWithString(p[1]); nm.frame=R(36,rt+10,120,20); nm.font=$.NSFont.boldSystemFontOfSize(14); v.addSubview(nm);
    label(p[2],140,rt+12,200,18,11,false,true);
    var s=$.NSSwitch.alloc.initWithFrame(R(W-90,rt+8,50,26)); s.state=S[p[0]]?1:0; s.target=h; s.action='tg_'+p[0]+':'; v.addSubview(s); switches[p[0]]=s;
    var x=36;
    p[3].forEach(function(a){
      var cb=$.NSButton.checkboxWithTitleTargetAction('x',h,'tg_'+p[0]+'_'+a+':'); cb.frame=R(x,rt+40,a==='fit'?120:110,20); cb.state=S[p[0]+'_'+a]?1:0;
      cb.enabled=!!S[p[0]]; cb.font=$.NSFont.systemFontOfSize(12); v.addSubview(cb); checks[p[0]+'_'+a]=cb; texts.push([cb,a,'title']); x+= (a==='fit'?126:112);
    });
    if(i<2) sep(rt+PROW);
  });
  top+=3*PROW+10;
  label('note',24,top,W-48,54,11,false,true,true);
  // Knoepfe
  var ok=$.NSButton.buttonWithTitleTargetAction('x',h,'ok:'); ok.frame=$.NSMakeRect(W-136,18,120,34); ok.keyEquivalent='\r'; v.addSubview(ok); texts.push([ok,'apply','title']);
  var ca=$.NSButton.buttonWithTitleTargetAction('x',h,'cancel:'); ca.frame=$.NSMakeRect(W-244,18,104,34); ca.keyEquivalent='\x1b'; v.addSubview(ca); texts.push([ca,'cancel','title']);
  var rs=$.NSButton.buttonWithTitleTargetAction('x',h,'restore:'); rs.frame=$.NSMakeRect(donate?212:16,18,134,34); v.addSubview(rs); texts.push([rs,'restore','title']);
  if(donate){ var dn=$.NSButton.buttonWithTitleTargetAction('x',h,'donate:'); dn.frame=$.NSMakeRect(16,16,190,38); dn.bezelStyle=1; dn.controlSize=3;
    dn.bezelColor=$.NSColor.systemPinkColor; dn.font=$.NSFont.boldSystemFontOfSize(15); v.addSubview(dn); texts.push([dn,'donate','title']); }
  function applyTexts(){
    var t=L();
    texts.forEach(function(e){ var s=t[e[1]]; if(s===undefined) return; if(e[2]==='label') e[0].stringValue=s; else e[0].title=s; });
    genRows.forEach(function(k){ if(k==='lang'){ segs[k].setLabelForSegment('Deutsch',0); segs[k].setLabelForSegment('English',1); return; }
      t[k+'v'].forEach(function(s,i){ segs[k].setLabelForSegment(s,i); }); });
    var older=false, newer=false; var a=affVer.split('.').map(Number), b=TESTED.split('.').map(Number);
    if(a[0]>b[0]||(a[0]===b[0]&&a[1]>b[1])) newer=true;
    info.stringValue= newer? t.newer : t.found.replace('%v',affVer||'?').replace('%t',TESTED);
    info.textColor= newer? $.NSColor.systemOrangeColor : $.NSColor.secondaryLabelColor;
  }
  globalThis.__asChanged=function(k){
    if(k==='lang') applyTexts();
    if(k==='ui') setAppearance();
    ['indesign','illustrator','photoshop'].forEach(function(p){ if(k===p){ Object.keys(checks).forEach(function(c){ if(c.indexOf(p+'_')===0) checks[c].enabled=!!globalThis.__as[p]; }); } });
  };
  applyTexts();
  win.delegate=h; win.center;

  if(snap){ win.displayIfNeeded; var rep=v.bitmapImageRepForCachingDisplayInRect(v.bounds); v.cacheDisplayInRectToBitmapImageRep(v.bounds,rep);
    rep.representationUsingTypeProperties(4,$({})).writeToFileAtomically(snap,true); return 'snapshot'; }

  app.activateIgnoringOtherApps(true); win.makeKeyAndOrderFront(null);
  globalThis.__asResult=null; app.runModalForWindow(win); win.orderOut(null);
  var res=globalThis.__asResult; if(res!=='apply' && res!=='restore') return 'cancel';
  var st=globalThis.__as; Object.keys(st).forEach(function(k){ ud.setIntegerForKey(st[k],k); }); ud.synchronize;
  var out=['action='+res,'lang='+(st.lang?'en':'de'),'kb='+(st.kb?'us':'de'),'ui='+(st.ui?'light':'dark'),'cols='+(st.cols?2:1),'font='+(st.font?'large':'std'),
           'icons='+(st.icons?'color':'mono'),'ctx='+(st.ctx?'float':'dock'),'cmyk='+(['eu','us','keep'][st.cmyk])];
  ['indesign','illustrator','photoshop'].forEach(function(p){ ['keys','tools','panels','fit'].forEach(function(a){ out.push(p+'_'+a+'='+((st[p]&&st[p+'_'+a])?1:0)); }); });
  return out.join(';');
}
