import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('links');
import { Random } from 'meteor/random'
import {isDebug} from "../isDebug";
import {Meteor} from "meteor/meteor";

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
  partChange(docId, partId, userId, text) {

    // No need to split
    return Docs.update({
        _id: docId,
        'parts.id': partId,
        'parts.editing': userId,
      },
      {
        $set: {"parts.$.text": text},
      })
  },

  removePart(docId, partId, userId){
      Docs.update(docId,
        { $pull: {
          'parts': { id:partId,editing:userId}
        } })
  },

  ping(docId,userId){
    Docs.update(docId, {$set:{
      ['ping.'+userId]:Date.now()
      }})
    cleanupOldPings(docId)
  },
  reset(){
    if(!isDebug) return
    Docs.remove(
      {},
      { multi: true}
    )
  }

})



function cleanupOldPings(docId) {
  const edited=Docs.findOne({_id:docId, 'parts.editing':{$exists:true}, lastCleanup:{$lt:Date.now()-10*1000}})
  if(!edited) return
  const {ping, parts} = edited

  const toRemove=[]
  const limit= Date.now()-(isDebug ? 15*1000:90*1000)

  for(const userId in ping){
    if(ping.hasOwnProperty(userId)){
      if(ping[userId]<limit){
        toRemove.push(userId)
      }
    }
  }
  if(!toRemove.length) return

  toRemove.forEach(k=>{
    delete ping[k]
  })
  parts.forEach(p=>{
    if(toRemove.indexOf(p.editing)!==-1){
      delete p.editing
    }
  })


  Docs.update(
    docId,
    {
      $set:{
        ping, parts, lastCleanup:Date.now()
      }
    }
  )
}