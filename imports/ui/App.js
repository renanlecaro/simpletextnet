import {Random} from "meteor/random";
import Quill from "quill/dist/quill.core";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Docs} from "../api/Docs";
import 'quill/dist/quill.core.css'

export function setupUI(){

  // We either use the provided id, or redirect to a new
  // page with a random ID
  let docId=window.location.pathname.slice(1)
  if(!docId){
    docId=Random.id()
    history.replaceState(null, '', '/'+docId)
  }

  // Id of last applied edit
  let lastApplied=null

  // Setup the text editor
  const quill = new Quill('#editor')

  quill.on('text-change', function(delta, oldDelta, source) {
    // The source might be API if the content of the text box changed
    // to reflect the work of a remote user
    if (source === 'user') {
      lastApplied= Random.id()
      Meteor.call('userEditedDocument',docId, delta, lastApplied )
    }
  });

  // Tell meteor to load the document
  Meteor.subscribe('docById',docId);

  // This function will run automatically every time one of the
  // tracked functions it uses have new data.
  Tracker.autorun(function () {

    // This function, comming from minimongo, will trigger an autorun
    // every time the doc changes
    const doc=Docs.findOne(docId)

    // The doc might still be loading
    if(!doc) return


    // The doc loaded for the first time
    if(!lastApplied){
      // Fill the editor
      quill.setContents(doc.content,  'api')
      // Save where we're at in the edit stack
      lastApplied=doc.lastOpId
      // Remove the loading screen indicator
      document.body.removeChild(document.getElementById('loadingText'))
      return
    }

    // We applied that change already, the last edit
    // to the doc was ours, we can ignore it.
    if(lastApplied===doc.lastOpId) return

    // The last edit happened to the version of the doc we're seeing,
    // but was done by someone else.
    if(lastApplied === doc.prevOpId){
      // We apply the change to our editor
      quill.updateContents(doc.lastOp,  'api')
      // and store which version we're using
      lastApplied=doc.lastOpId
      return
    }

    // The edits happened faster than we could update, and therefore
    // they happened to a different version than what we had.
    // That's not a huge deal, we just do a diff of the document and
    // apply it.
    // This way we keep our selection. However, if the user was typing
    // when this happened, he might see a jump / loose a few letters
    const diff = new Delta(quill.getContents()).diff(new Delta(doc.content))
    quill.updateContents(diff,  'api')
    lastApplied=doc.lastOpId
  })
}