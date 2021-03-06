import {Random} from "meteor/random";
import Quill from "quill/dist/quill.core";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Docs} from "../api/Docs";
import 'quill/dist/quill.core.css'
import Delta from 'quill-delta'
import {askForARealName, getUserName, renameMySelf, userColor} from "./userName";


export default function setupTextEditor(docId){
  document.getElementById('editor-wrap').style.display=""


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
    askForARealName()
    Meteor.call('document.selection.update',docId, getUserName(), range )
  })

  document.getElementById('renameMySelf')
    .addEventListener('click',e=>{
      e.preventDefault()
      const oldName=getUserName()
      renameMySelf()
      Meteor.call('document.selection.update',docId,oldName , null )
      Meteor.call('document.selection.update',docId, getUserName(), quill.getSelection() )

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
    if(!doc) return


    // The doc loaded for the first time
    if(!isSetup){
      isSetup=true
      const loading = document.getElementById('loadingText')
      loading.parentElement.removeChild(loading)
    }

    // This way we keep our selection. However, if the user was typing
    // when this happened, he might see a jump / loose a few letters
    const diff = new Delta(quill.getContents()).diff(new Delta(doc.content))
    quill.updateContents(diff,  'api')

    const selections=[]
    for(const userId in doc.selections){
      const s=doc.selections[userId]
      if(s.time>Date.now()-2*60*1000 && userId!=getUserName()) {
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
  const position=`top:${top.toFixed(2)}px;left:${left.toFixed(2)}px;width:${width.toFixed(2)}px;height:${height.toFixed(2)}px;`
  const highlightColor=`background: ${userColor(userId, 0.1)};`
  const nameColor=`background:${userColor(userId, 1)};`
    return `
      <div style="${position} ${highlightColor}">
        <div style="${nameColor}">${userId}</div>
      </div>
      `
}
