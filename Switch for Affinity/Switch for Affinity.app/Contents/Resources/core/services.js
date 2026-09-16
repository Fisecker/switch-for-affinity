ObjC.import('Foundation');
function run(argv){
  var fit=[["Switch for Affinity – Inhalt zentrieren","@$e"],["Switch for Affinity – Inhalt proportional anpassen","@~$e"],["Switch for Affinity – Inhalt an Rahmen anpassen","@~e"],["Switch for Affinity – Rahmen proportional füllen","@~$c"],["Switch for Affinity – Rahmen an Inhalt anpassen","@~c"]];
  var old=["Affinity – Inhalt zentrieren","Affinity – Inhalt proportional anpassen","Affinity – Inhalt an Rahmen anpassen","Affinity – Rahmen proportional füllen","Affinity – Rahmen an Inhalt anpassen"];
  var ud=$.NSUserDefaults.alloc.initWithSuiteName('pbs');
  var cur=ud.dictionaryForKey('NSServicesStatus');
  var m=cur.isNil()? $.NSMutableDictionary.dictionary : $.NSMutableDictionary.dictionaryWithDictionary(cur);
  function key(n){ return "(null) - "+n+" - runWorkflowAsService"; }
  function on(n,k){ m.setObjectForKey($({"enabled_context_menu":true,"enabled_services_menu":true,"key_equivalent":k,"presentation_modes":{"ContextMenu":true,"ServicesMenu":true}}), key(n)); }
  old.forEach(function(n){ m.removeObjectForKey(key(n)); }); fit.concat([["Switch for Affinity – Einstellungen",""]]).forEach(function(it){ m.removeObjectForKey(key(it[0].replace("Switch for Affinity","Affinity Switch"))); });
  if(argv[0]==='set') fit.forEach(function(it){ on(it[0],it[1]); });
  else if(argv[0]==='remove') { fit.forEach(function(it){ m.removeObjectForKey(key(it[0])); }); m.removeObjectForKey(key("Switch for Affinity – Einstellungen")); }
  else if(argv[0]==='settings') on("Switch for Affinity – Einstellungen","");
  ud.setObjectForKey(m,'NSServicesStatus'); ud.synchronize;
  return 'ok';
}
