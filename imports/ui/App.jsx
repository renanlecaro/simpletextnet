import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Docs } from '/imports/api/Docs';

import TextareaAutosize from 'react-autosize-textarea';
import {Meteor} from "meteor/meteor";
import {isDebug} from "../isDebug";


export function App({docId,userId}){
  const { doc } = useTracker(() => {
    Meteor.subscribe('docById',docId);

    return ({
      doc: Docs.findOne(docId),
    });
  });
 if(!doc) return null

 startPinging(docId,userId )
 return  <div >
     {
       doc.parts.map(part=><Input key={part.id} part={part} docId={docId} userId={userId}/>)
     }
   </div>

}

class Input extends React.Component{
  state={
    value:this.props.part.text
  }
  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.part.editing!=this.props.userId){
      this.setState({value:nextProps.part.text})
    }
  }


  render() {
    const {userId, docId, part} = this.props;

    const status=part.editing?(part.editing==userId?'me':'other'):'none'
    return  <TextareaAutosize
      className={status}
      value={this.state.value}
      onChange={e=>{
        Meteor.call('partChange', docId, part.id, userId, e.target.value)
        this.setState({value:e.target.value})
      }}
      onKeyUp={e=>{
        if(e.target.value) return

        if(e.keyCode==8 || e.keyCode==46){
          Meteor.call('removePart', docId, part.id, userId)
        }

      }}
      disabled={status==='other'}
      onFocus={e=>Meteor.call('partFocus',docId, part.id, userId)}
      onBlur={e=>Meteor.call('partBlur', docId, part.id, userId, e.target.value)}
    />
  }
}


let pinging = false
function startPinging(docId,userId ) {
  if(pinging) return
  pinging=true
  function ping() {
    requestAnimationFrame(()=>{
      Meteor.call('ping',docId,userId)
    })
  }
  ping()
  setInterval(ping, isDebug ? 5*1000:30*1000)
}