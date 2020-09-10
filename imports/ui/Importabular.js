


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
        tr.appendChild(td)
        const div=document.createElement('div')
        td.appendChild(div)

        const val=this.getVal( x,y)

        if(val){
          div.innerText=val;
        }else{
          // Force no collapse of cell
          div.innerHTML='&nbsp;'
        }
        Object.assign(div.style,this.cellStyle(x,y,val))
      }
    }

    table.appendChild(tbody)
    this.parent.appendChild(table)
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
      if(x+1>this.width){
        this.width=x+1
      }
      if(y+1>this.height){
        this.height=y+1
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
  cellStyle(x,y,val){
    return {
      background:'white',
      borderTop:y ? '1px solid grey':'',
      borderLeft:x ? '1px solid grey':'',
      padding:'0 10px',
      minWidth:'100px',
      minHeight:'40px',
      lineHeight:'40px',
    }
  }
}