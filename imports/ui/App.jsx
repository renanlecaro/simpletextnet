import {Random} from "meteor/random";
import Quill from "quill/dist/quill.core";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Docs} from "../api/Docs";
import 'quill/dist/quill.core.css'

export function setupUI(){

  let docId=window.location.pathname.slice(1)
  if(!docId){
    docId=Random.id()
    history.replaceState(null, '', '/'+docId)
  }

  let lastApplied=null
  const quill = new Quill('#editor')
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source === 'user') {

      lastApplied= Random.id()
      Meteor.call('userDelta',docId, delta, lastApplied )
    }
  });

  Meteor.subscribe('docById',docId);

  Tracker.autorun(function () {
    const doc=Docs.findOne(docId)

    if(!doc) return


    if(!lastApplied){
      lastApplied=doc.lastOpId
      document.body.removeChild(document.getElementById('loadingText'))
      return quill.setContents(doc.content,  'api')
    }

    // We applied that change already
    if(lastApplied===doc.lastOpId) return

    // We were on the same page
    if(lastApplied === doc.prevOpId){
      quill.updateContents(doc.lastOp,  'api')
      lastApplied=doc.lastOpId
      return
    }

    const diff = new Delta(quill.getContents()).diff(new Delta(doc.content))
    quill.updateContents(diff,  'api')
    lastApplied=doc.lastOpId
  })
}