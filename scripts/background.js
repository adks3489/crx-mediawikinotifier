var apiUrl = localStorage.getItem("apiurl");
document.addEventListener('DOMContentLoaded', function(){
  chrome.alarms.create("mediawikinotifier", {periodInMinutes: 5});
  var title = localStorage.getItem("title");//Target Page
  var start = localStorage.getItem("start");
  var end = localStorage.getItem("end");
  console.log("Start Monitor <"+title+"> From:<"+start+"> To:<"+end+">");
  checkModify();
}, false);

chrome.alarms.onAlarm.addListener(checkModify);

function checkModify(alarm){
  var title = localStorage.getItem("title");//Target Page
  var requestUrl = apiUrl + "?action=query&prop=revisions&rvprop=content&format=json&titles=" + title;
  var xhr=new XMLHttpRequest();
  xhr.open("POST", requestUrl, false);
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4){
      var doc=JSON.parse(xhr.responseText).query.pages;
      for (first in doc){
        doc = doc[first];
        break;
      }
      doc = doc.revisions[0];
      for (first in doc){
        doc = doc[first];
        break;
      }
      var startIdx = doc.indexOf(localStorage.getItem("start")); //Target Range Starter
      var endIdx = doc.indexOf(localStorage.getItem("end")); //Target Range Ender
      var content = doc.substring(startIdx, endIdx);

      chrome.storage.local.get("lastContent", function(value){
        if(content!=value.lastContent){
          if(typeof(value.lastContent)=="string"){
            var base = difflib.stringAsLines(value.lastContent);
            var newtxt = difflib.stringAsLines(content);
            // create a SequenceMatcher instance that diffs the two sets of lines
            var sm = new difflib.SequenceMatcher(base, newtxt);
            var opcodes = sm.get_opcodes();
            var message ="";
            for(var i=0; i<opcodes.length; ++i){
              code = opcodes[i];
              change = code[0];
              var b = code[1];
              var be = code[2];
              var n = code[3];
              var ne = code[4];
              var rowcnt = Math.max(be - b, ne - n);
              var contextSize = null;
              for(var j=0;j<rowcnt; ++j){
                if(change=="insert"){
                  message += "+";
                  message += sm.b[n+j];
                  message += "\n";
                }
                else if(change=="replace"){
                  message += "~";
                  message += sm.b[n+j];
                  message += "\n";
                }
                else if(change=="delete"){
                  message += "-";
                  message += sm.a[b+j];
                  message += "\n";
                }

              }
            }
            if( message != ""){
              var options = {
                type: "basic",
                iconUrl: "wiki.png",
                title: "MediaWiki Notifier",
                buttons: [{"title":"View"}],
                message: message
              };
              var findtarget = JSON.stringify(localStorage.getItem("anchor"));
              chrome.notifications.onButtonClicked.addListener(function(id, index){
                if(index == 0){
                  var url = apiUrl.replace("api.php", "index.php/"+title);
                  chrome.tabs.create({ url: url }, function(tab){
                    chrome.tabs.executeScript(tab.id, {
                      code: 'var p=document.body.innerHTML.indexOf('+findtarget+');document.body.innerHTML = document.body.innerHTML.slice(0, p)+"<div id=\'wnanchor\'></div>"+document.body.innerHTML.slice(p);window.scrollTo(0,document.getElementById("wnanchor").offsetTop);document.getElementById("wnanchor").remove();'
                    });
                    //remove node
                  });
                }
              });
              chrome.notifications.create("", options, function(id){
              });
            }
          }
          chrome.storage.local.set({"lastContent":content});
        }
      });
    }
  }
  xhr.send(null);
}