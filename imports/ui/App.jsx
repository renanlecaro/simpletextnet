import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Docs } from '/imports/api/Docs';

import TextareaAutosize from 'react-autosize-textarea';

export function App({docId,userId}){
  const { doc } = useTracker(() => {
    Meteor.subscribe('docById',docId);

    return ({
      doc: Docs.findOne(docId),
    });
  });
 if(!doc) return 'Loading'

 return  <div id={'editor'}>
   {
     doc.parts.map(part=><Input key={part.id} part={part} docId={docId} userId={userId}/>)
   }
   <footer>
     <h2>Magic paper</h2>
     <p>Create a document, edit it together, on mobile and on desktop.</p>
     <p>This only supports plain text</p>
     <p>Magic Paper, brought to you by <a href={'https://renanlecaro.github.io/'}>Renan LE CARO</a></p>
     <p>I make 0 garantee about this software, use it at your own risks. </p>
   </footer>

  </div>
}

class Input extends React.Component{
  state={
    value:this.props.part.text
  }
  componentWillReceiveProps(nextProps, nextContext) {
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
      disabled={status==='other'}
      onFocus={e=>Meteor.call('partFocus',docId, part.id, userId)}
      onBlur={e=>Meteor.call('partBlur', docId, part.id, userId, e.target.value)}
    />
  }
}