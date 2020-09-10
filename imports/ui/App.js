import {Random} from "meteor/random";
import Quill from "quill/dist/quill.core";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Docs} from "../api/Docs";
import 'quill/dist/quill.core.css'
import Delta from 'quill-delta'

let userName = localStorage.getItem('userName')
if(!userName) {
  while(!(userName = prompt('Please enter a username (only letter and numbers, no space)')
    .trim().replace(/[^a-z0-9]/gi,'')));
  localStorage.setItem('userName',userName)
}

export function setupUI(){

  // We either use the provided id, or redirect to a new
  // page with a random ID
  let docId=window.location.pathname.slice(1)
  if(!docId){
    docId=Random.id()
    history.replaceState(null, '', '/'+docId)
  }

  // Setup the text editor
  const quill = new Quill('#editor')

  quill.on('text-change', function(delta, oldDelta, source) {
    // The source might be API if the content of the text box changed
    // to reflect the work of a remote user
    if (source === 'user') {
      Meteor.call('userEditedDocument',docId, delta )
    }
  });

  quill.on('selection-change', function (range) {

    Meteor.call('setUserSelection',docId, userName, range )
    //getBounds
  })

  // Tell meteor to load the document
  Meteor.subscribe('docById',docId);

  let isSetup=false;
  // This function will run automatically every time one of the
  // tracked functions it uses have new data.
  Tracker.autorun(function () {

    // This function, comming from minimongo, will trigger an autorun
    // every time the doc changes
    const doc=Docs.findOne(docId)

    // The doc might still be loading
    if(!doc) return console.debug('No document yet')


    // The doc loaded for the first time
    if(!isSetup){
      isSetup=true
      document.body.removeChild(document.getElementById('loadingText'))
    }

    // This way we keep our selection. However, if the user was typing
    // when this happened, he might see a jump / loose a few letters
    const diff = new Delta(quill.getContents()).diff(new Delta(doc.content))
    quill.updateContents(diff,  'api')

    const selections=[]
    for(const userId in doc.selections){
      const s=doc.selections[userId]
      if(s.time>Date.now()-2*60*1000 && userId!=userName) {
        selections.push({
          ...quill.getBounds(s.range),
        userId
        })
      }
    }
    document.getElementById("selections").innerHTML=selections.map(selectionToHTML).join('')
 
  })
}

function selectionToHTML({top, left, width, height, userId}) {
  const hue=hash(userId)%360
  const position=`top:${top.toFixed(2)}px;left:${left.toFixed(2)}px;width:${width.toFixed(2)}px;height:${height.toFixed(2)}px;`
  const highlightColor=`background:hsla(${hue}, 100%, 50%, 0.1);`
  const nameColor=`background:hsla(${hue}, 90%, 80%, 0.9);`
    return `
      <div style="${position} ${highlightColor}">
        <div style="${nameColor}">${userId}</div>
      </div>
      `
}

function hash(str) {
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
