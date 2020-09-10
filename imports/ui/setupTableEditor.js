import {Random} from "meteor/random";
import Quill from "quill/dist/quill.core";
import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import jexcel from "jexcel";
import "jexcel/dist/jexcel.css";
// import "jexcel/dist/jexcel.theme.css";

import {Docs} from "../api/Docs";

import {getUserName, renameMySelf, userColor} from "./userName";

export default function setupTableEditor(docId){
  document.getElementById('editor-wrap').style.display=""
   document.getElementById('footer').style.display="none"


  let editor;


  Meteor.subscribe('docById',docId);
  let isSetup=false;
  let lastSelections=[]
  let lastData=''
  let lastSelection=''
  let lastHeader=''

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

      function handleChange(){
          const data= {
            headers:this.getHeaders(),
            content:this.getData()
          }
          console.info('Sending change',data)
          Meteor.call('document.sheet.update',docId, data)
      }

      editor = jexcel(document.getElementById('editor'), {
        data:doc.content,
        columnSorting:false,
        parseFormulas:false,
        minDimensions:[10,10],
        minSpareRows:1,
        minSpareCols:1,
        onafterchanges:handleChange,
        onpaste:handleChange,
        oninsertrow:handleChange,
        ondeleterow:handleChange,
        oninsertcolumn:handleChange,
        ondeletecolumn:handleChange,
        onmoverow:handleChange,
        onmovecolumn:handleChange,
        onundo:handleChange,
        onredo:handleChange,
        // onchangeheader:handleChange,

        onselection() {
          const range={
            rows:editor.getSelectedRows(true),
            columns:editor.getSelectedColumns(true)
          }
          Meteor.call('setUserSelection',docId, getUserName(), range)
        }
      });
      return;
    }


    const currentData=JSON.stringify(doc.content)
    if(lastData!=currentData){
      lastData= currentData
      console.info('Content change', doc.content)
      editor.setData(doc.content)
    }



    const currentHeader=JSON.stringify(doc.headers)
    if(lastHeader!=currentHeader){
      lastHeader= currentHeader
      doc.headers.split(',').forEach(function (name, index) {
        editor.setHeader(index, name)
      })
    }



    const currentSelection=JSON.stringify(doc.selections)
    if(lastSelection!=currentSelection){
      lastSelection= currentSelection

      let newList= selectToList(doc.selections);

      lastSelections.forEach(({row, col, color})=>{
        const cell=editor.getCellFromCoords(col, row)
        cell.style.background='';
      })
      newList.forEach(({row, col, color})=>{
        const cell=editor.getCellFromCoords(col, row)
        cell.style.background=color;
      })

      lastSelections=newList

    }



    //
    // // This way we keep our selection. However, if the user was typing
    // // when this happened, he might see a jump / loose a few letters
    // const diff = new Delta(quill.getContents()).diff(new Delta(doc.content))
    // quill.updateContents(diff,  'api')
    //
    // const selections=[]
    // for(const userId in doc.selections){
    //   const s=doc.selections[userId]
    //   if(s.time>Date.now()-2*60*1000 && userId!=getUserName()) {
    //     selections.push({
    //       ...quill.getBounds(s.range),
    //       userId
    //     })
    //   }
    // }
    // document.getElementById("selections").innerHTML=selections.map(selectionToHTML).join('')
  })
}

function selectToList(selection) {
  const list=[]
  const currentUser= getUserName()
  for(const user in selection){
    if(selection.hasOwnProperty(user) && currentUser!=user){
      const {range, time} = selection[user]
      const color=userColor(user, 0.1)
      if(time>Date.now()-2*60*1000){
        range.rows.forEach(row=>{
          range.columns.forEach(col=>{
            list.push({row, col, color})
          })
        })
      }
    }
  }
  return list
}

//
// function selectionToHTML({top, left, width, height, userId}) {
//   const position=`top:${top.toFixed(2)}px;left:${left.toFixed(2)}px;width:${width.toFixed(2)}px;height:${height.toFixed(2)}px;`
//   const highlightColor=`background: ${userColor(userId, 0.1)};`
//   const nameColor=`background:${userColor(userId, 1)};`
//   return `
//       <div style="${position} ${highlightColor}">
//         <div style="${nameColor}">${userId}</div>
//       </div>
//       `
// }
