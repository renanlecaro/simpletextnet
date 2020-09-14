
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Docs} from "../api/Docs";

import {askForARealName, getUserName, renameMySelf, userColor} from "./userName";
import Importabular from "./Importabular";



export default function setupTableEditor(docId){
  document.getElementById('editor-wrap').style.display=""
  Meteor.subscribe('docById',docId);
  let isSetup=false;
  let lastSelections={}
  let editor;

  class RTTable extends Importabular{
    TDStyle(x,y,{selected,onlySelected, editTarget,editing}){
      const style=super.TDStyle(...arguments)
      if(!style.background){
        for(let user in lastSelections){
          const {time, range}=lastSelections[user]
          if(user !== getUserName() &&
            time>Date.now()-2*60*1000 &&
            x>=range.rx[0] && x<range.rx[1] &&
            y>=range.ry[0] && y<range.ry[1]
          ){
            style.background= userColor(user,0.1)
          }
        }
      }
      return style
    }
  }

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

      editor = new RTTable({
        node:document.getElementById('editor'),
        data:doc.content,
        onChange: content=>Meteor.call('document.sheet.update',docId, {content}),
        onSelectionChange: sel=>{
          askForARealName()
          Meteor.call('document.selection.update',docId, getUserName(), sel )
        },
      })
      return;
    }

    lastSelections=doc.selections
    editor.setData(doc.content)
  })
}
