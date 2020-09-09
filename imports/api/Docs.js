import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import { Random } from 'meteor/random'

Meteor.methods({
  partFocus(docId, partId, userId){
    return Docs.update({
      _id:docId,
      'parts.id':partId,
    },
    {
      $set: { "parts.$.editing" : userId }
    })
  },
  partBlur(docId, partId, userId, text){

    const textParts = text.split('\n').map(t=>({
      id:Random.id(),
        text:t
    }))
    if(textParts.length===1){
      // No need to split
      return Docs.update({
          _id:docId,
          'parts.id':partId,
          'parts.editing':userId,
        },
        {
          $set: { "parts.$.text" : text },
          $unset: { "parts.$.editing" : '' }
        })
    }
    // Split the text into multiple blocks
    const {parts} = Docs.findOne(docId)

    const part = parts.find(p=>p.id==partId && p.editing==userId);
    const index=parts.indexOf(part)
    const newParts = [
      ...parts.slice(0,index),
        ...textParts,
      ...parts.slice(index+1)
    ]
    Docs.update(docId,{$set:{parts:newParts}})
  },
  partChange(docId, partId, userId, text){

    // No need to split
    return Docs.update({
        _id:docId,
        'parts.id':partId,
        'parts.editing':userId,
      },
      {
        $set: { "parts.$.text" : text },
      })
  }
})