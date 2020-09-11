


function cleanVal(val){
  if(val === 0) return '0'
  if(!val) return ''
  return val.toString()
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

let currentId=0
export default class Importabular{
  data=[['']]
  parent=null

  constructor({data=[[]],node}) {
    this.parent=node

    this.importArray(data)
    this.setupDom()
  }
  renderTDContent(td, x,y){
    const div=document.createElement('div')
    td.setAttribute('x',x.toString())
    td.setAttribute('y',y.toString())
    const val=this.getVal( x,y)
    if(val){
      div.innerText=val;
    }else{
      // Force no collapse of cell
      div.innerHTML='&nbsp;'
    }
    Object.assign(div.style,this.cellStyle(x,y,val))
    td.appendChild(div)
  }
  setupDom(){
    const table=document.createElement('table')
    const tbody=document.createElement('tbody')
    table.cellSpacing=0
    table.cellPadding=0
    for(let y=0;y<this.height;y++){
      const tr=document.createElement('tr')
      tbody.appendChild(tr)
      for(let x=0;x<this.width;x++){
        const td=document.createElement('td')
        td.style.borderLeft = x?'1px solid #ddd':''
        td.style.borderTop = y?'1px solid #ddd':''
        tr.appendChild(td)
        this.renderTDContent(td,x,y)
      }
    }

    table.appendChild(tbody)
    this.parent.appendChild(table)
    this.tbody=tbody
    table.addEventListener('mousedown', this.mousedown, true)
    table.addEventListener('mouseenter', this.mouseenter, true)
    table.addEventListener('mouseup', this.mouseup, true)

    document.addEventListener('keydown', this.keydown, true)

    table.addEventListener('mouseleave', this.mouseleave)
  }


  keydown=e=>{
    const code=e.keyCode

    if(this.selectionStart && code===13){
      // enter
      const {x,y}=this.selectionStart
      this.changeSelection(()=>{
        this.selectionStart=this.selectionEnd = {x, y:y+1}
      })
      e.preventDefault()
    }else if(event.key.length === 1 && this.selectionStart && !this.editing){
      this.changeSelection(()=>{
        const {x,y}=this.selectionStart
        this.setVal(x,y, event.key)
        this.startEditing({x,y})
      })
    }else{
      console.log({
        'event.key':event.key,
        'this.selectionStart':!!this.selectionStart,
        'this.editing':!!this.editing
      })
    }
  }
  selecting=false;
  selectionStart=null
  selectionEnd=null
  selection={rx:[0,0],ry:[0,0]}
  editing=null

  mousedown=e=>{
    this.changeSelection(()=>{
      this.tbody.style.userSelect='none'
      this.selectionStart=this.getCoords(e);
      this.selectionEnd=this.selectionStart
      this.selecting=true;
    })
  }
  mouseenter=e=>{
    if(this.selecting){
      this.changeSelection(()=>{
        this.selectionEnd=this.getCoords(e);
      })
    }
  }

  lastMouseUp=null
  lastMouseUpTarget=null
  endSelection(){
    this.selecting=false;
    this.tbody.style.userSelect=''
  }
  mouseup=e=>{
    if(this.selecting){
      this.changeSelection(()=>{
        this.selectionEnd=this.getCoords(e);
       this.endSelection()

        if(this.lastMouseUp &&
          this.lastMouseUp>Date.now()-300 &&
          this.lastMouseUpTarget.x===this.selectionEnd.x &&
          this.lastMouseUpTarget.y===this.selectionEnd.y
        ){
          this.startEditing(this.selectionEnd)
        }
        this.lastMouseUp=Date.now()
        this.lastMouseUpTarget=this.selectionEnd
      })
    }
  }
  mouseleave=e=>{
    if(this.selecting){
      this.endSelection()
    }
  }
  startEditing({x,y}){
    console.debug(`startEditing({${x},${y})`)
    this.editing={x,y}
    const td=this.getCell(x,y)
    const {width,height}=td.firstChild.getBoundingClientRect()
    this.editingSize={width,height}
    td.removeChild(td.firstChild)
    const input=document.createElement('input');
    input.type='text'
    input.value=this.getVal(x,y)
    td.appendChild(input)
    input.focus()

    input.addEventListener('blur', this.stopEditing)
    input.addEventListener('keydown', this.blurIfEnter)

  }


  stopEditing=e=>{
    console.debug(`stopEditing()`)
    e.target.removeEventListener('blur', this.stopEditing)
    e.target.removeEventListener('keydown', this.blurIfEnter)
    const {x,y}=this.editing
    const td=this.getCell(x,y)
    this.setVal(x,y,td.firstChild.value)
    td.removeChild(td.firstChild)
    this.editing=null

    this.renderTDContent(td, x,y)
  }
  blurIfEnter=e=>{
    const code=e.keyCode
    if(code===13){
      // enter
      this.stopEditing(e)
      e.preventDefault()
    }
  }
  changeSelection(callback){
    const oldS=this.selection
    callback()
    this.selection=this.getSelectionCoords()
    const updated=this.selectionUnion(oldS,this.selection)
    this.forSelectionCoord(updated,this.rerender)
  }
  selectionUnion(s1,s2){
    if(s1.rx[0] === s1.rx[1]) return s2
    if(s2.rx[0] === s2.rx[1]) return s1
    const x = [...s1.rx, ...s2.rx]
    const y = [...s1.ry,... s2.ry]
    return {
      rx:[Math.min(...x), Math.max(...x)],
      ry:[Math.min(...y), Math.max(...y)]
    }
  }
  getSelectionCoords(){
    if(!this.selectionStart) return {rx:[0,0], ry:[0,0]}
    let rx=[this.selectionStart.x,this.selectionEnd.x]
    if(rx[0]>rx[1]) rx.reverse()
    let ry=[this.selectionStart.y,this.selectionEnd.y]
    if(ry[0]>ry[1]) ry.reverse()
    return {rx:[rx[0],rx[1]+1],ry:[ry[0],ry[1]+1]}
  }
  forSelectionCoord({rx,ry}, cb){
    for(let x=rx[0];x<rx[1];x++)
      for(let y=ry[0];y<ry[1];y++)
        cb({x,y})
  }
  rerender=({x,y})=>{
    Object.assign(this.getCell(x,y).firstChild.style,
      this.cellStyle(x,y))
  }


  getCoords(e){
    // Returns the clicked cell coords or null
    let node=e.target;
    while (!node.getAttribute('x') && node.parentElement && node.parentElement!==this.parent){
      node=node.parentElement
    }
    return {
      x:parseInt(node.getAttribute('x')) || 0,
      y:parseInt(node.getAttribute('y')) || 0,
    }
  }


  importArray(data) {
    this.data={}
    this.width=1;
    this.height=1;

    data.forEach((line, y)=>{
      line.forEach((val, x)=>{
        this.setVal( x,y, val)
      })
    })
  }
  setVal( x,y,val){
    const hash=this.data
    const cleanedVal=cleanVal(val)
    if(cleanedVal){
      if(!hash[x])hash[x]={}
      hash[x][y] = cleanedVal
      if(x+2>=this.width){
        this.width=x+2
      }
      if(y+2>=this.height){
        this.height=y+2
      }

    }else{
      // delete item
      if(hash[x] && hash[x][y]){
        delete hash[x][y]
        if(isEmpty(hash[x]))
          delete hash[x]
      }
    }
  }
   getVal(x,y) {
    const hash=this.data
    return hash && hash[x] && hash[x][y] || ''
  }
  getStatus(x,y){
    const {rx,ry} = this.selection
    const selected = x>=rx[0] && x<rx[1] && y>=ry[0] && y<ry[1]
    const editTarget = x===rx[0] && y===ry[0] && rx[0]!==rx[1]
    const editing= this.editing && x===this.editing.x &&  y===this.editing.y
    const selectedCount = (rx[1]-rx[0])*(ry[1]-ry[0])
    return {selected,editTarget,editing, onlySelected:selected && selectedCount<2}
  }
  getCell(x,y){
    return this.tbody.children[y].children[x]
  }

  cellStyle(x,y){
    const {selected,onlySelected, editTarget,editing}=this.getStatus(x,y)

    return {
      background:selected && !editing && !onlySelected?'#d7f2f9':'white',
      border:editTarget && !editing?
        '1px solid black':
        '1px solid transparent',
      padding:'0 10px',
      minWidth:'100px',
      minHeight:'40px',
      lineHeight:'40px',
      width:editing?this.editingSize.width+'px':'',
      height:editing?this.editingSize.height+'px':'',
      fontFamily:'inherit',
      fontSize:'inherit',
      color:'inherit',
    }
  }
}