
const { LCDClient, Coin, MnemonicKey, Fee, MsgExecuteContract, Wallet, isTxError, Int, Coins } = require('@terra-money/terra.js');
/*
require('axios-debug-log/enable')
require('axios-debug-log')({
  request: function (debug, config) {
    debug('Request with ' + config.headers['content-type'])
  },
  response: function (debug, response) {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url
    )
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error)
  }
})
*/
function orcaKiller(mkstr,lcdurl='https://lcd.terra.dev'){

    const mk = new MnemonicKey({
    mnemonic:
    mkstr
    })
    
    console.log('Initalized Wrapper. Wallet Address:  ', mk.accAddress);
    const terra = new LCDClient({
        URL: lcdurl,
        chainID: 'columbus-5',
        //TODO should dynamically set gasprices
        gasPrices: [new Coin('uusd', '0.15')],
        gasAdjustment: '1.5'
        })
    const wallet = terra.wallet(mk)


async function place_bid(input_amount,collateral_asset = "bluna", premium_slot = 2){
  input_amount = input_amount * 1000000
if (collateral_asset == "bluna"){
  collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
}
if (collateral_asset == "beth"){
  collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
}
const msg = new MsgExecuteContract(
  mk.accAddress, //sender
  "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", //anchor liquidation contract
  {
    "submit_bid": {
      "premium_slot": premium_slot,
      "collateral_token": collateral_token_contract
    }
  },
  [new Coin('uusd', input_amount)]
)
try{
  var tx = await wallet.createAndSignTx({
    msgs: [msg]
  });
  await wallet.lcd.tx.broadcast(tx);
  return true
}catch{
  return false
}
}

this.placeBid = place_bid

async function get_bids(collateral_asset = "bluna",pendingBids = false) {

    const request = require('request')
    if (collateral_asset == "bluna"){
      collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
    }
    if (collateral_asset == "beth"){
      collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
    }
    msg_to_encode  ='{"bids_by_user":{"collateral_token":"' + collateral_token_contract+'","bidder":"' + mk.accAddress+'","start_after":"0","limit":31}}'
    encoded_msg = Buffer.from(msg_to_encode).toString('base64')
    const anchor_bids_query_url = lcdurl +'/terra/wasm/v1beta1/contracts/terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u/store?query_msg='+encoded_msg

    current_timestamp = Math.floor(new Date().getTime() / 1000)

    return new Promise((resolve, reject) => {
      request(anchor_bids_query_url, (error, response, body) => {
        if (error) reject(error)
        if (response.statusCode != 200) {
          reject('Invalid status code <' + response.statusCode + '>')
        }
        bids =[]
        const returnData = JSON.parse(body)
        bids_data = returnData["query_result"]["bids"]
        console.log(returnData["query_result"]["bids"])
        x=0

        while(x < bids_data.length){

          bid_id = bids_data[x]["idx"]
          bid_wait_end = bids_data[x]["wait_end"]
          if((pendingBids ==true) && (bid_wait_end !== null)){
            if (current_timestamp > bid_wait_end){
              bids.push(bid_id)
            }
            
          }else{ //

            if ((bid_wait_end == null) && (pendingBids !==true)){
              bids.push(bid_id)
            }
          }

          x = x + 1
        }


        resolve(bids)
      })
    })
  

}
this.getBids = get_bids

//returns bids json response from lcd
async function get_bids_detailed(collateral_asset = "bluna") {

  const request = require('request')
  if (collateral_asset == "bluna"){
    collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
  }
  if (collateral_asset == "beth"){
    collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
  }
  msg_to_encode  ='{"bids_by_user":{"collateral_token":"' + collateral_token_contract+'","bidder":"' + mk.accAddress+'","start_after":"0","limit":31}}'
  encoded_msg = Buffer.from(msg_to_encode).toString('base64')
  const anchor_bids_query_url = lcdurl +'/terra/wasm/v1beta1/contracts/terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u/store?query_msg='+encoded_msg

  current_timestamp = Math.floor(new Date().getTime() / 1000)

  return new Promise((resolve, reject) => {
    request(anchor_bids_query_url, (error, response, body) => {
      if (error) reject(error)
      if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>')
      }
      bids =[]
      const returnData = JSON.parse(body)
      bids_data = returnData["query_result"]["bids"]

      resolve(bids_data)
    })
  })


}
this.getBidsDetailed = get_bids_detailed

//returns the culmative amount of pending asset to be withdrawan
async function get_filled_bids_pending_claim_amount(collateral_asset = "bluna") {

      bids_data = await get_bids_detailed(collateral_asset)
      bid_filled_amount_total=0
      while(x < bids_data.length){

        bid_id = bids_data[x]["idx"]
        bid_filled_amount= bids_data[x]["pending_liquidated_collateral"]
 
        bid_filled_amount_total = bid_filled_amount_total+ bid_filled_amount
        x = x + 1
        }

      return(bid_filled_amount_total / 1000000)
}
this.getFilledBidsPendingClaimAmount = get_filled_bids_pending_claim_amount


async function activate_bid(collateral_asset = "bluna", bid_idx ){
  if (collateral_asset == "bluna"){
    collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
  }
  if (collateral_asset == "beth"){
    collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
  }
  
  const msg = new MsgExecuteContract(
    mk.accAddress, //sender
    "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", //anchor liquidation contract
    {
      "activate_bids": {
        "bids_idx":bid_idx,
        "collateral_token": collateral_token_contract
      }
    }
  )
  try{
       var tx = await wallet.createAndSignTx({
         msgs: [msg]
       });
       await wallet.lcd.tx.broadcast(tx);
       return true
     }catch{
       return false
     }


  }


  this.activateBid = activate_bid
async function withdraw_bid(bid_idx){

  const msg = new MsgExecuteContract(
    mk.accAddress, //sender
    "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", //anchor liquidation contract
    {
      "retract_bid": {
        "bid_idx": bid_idx
      }
    }
  )
  try{
       var tx = await wallet.createAndSignTx({
         msgs: [msg]
       });
       await wallet.lcd.tx.broadcast(tx);
       return true
     }catch{
       return false
     }


}

this.withdrawBid= withdraw_bid

async function claim_proceeds(collateral_asset = "bluna"){
  if (collateral_asset == "bluna"){
    collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
  }
  if (collateral_asset == "beth"){
    collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
  }
  const msg = new MsgExecuteContract(
    mk.accAddress, //sender
    "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", //anchor liquidation contract
    {
      "claim_liquidations": {
        "collateral_token": collateral_token_contract
      }
    }
  )
  
  try{
    var tx = await wallet.createAndSignTx({
      msgs: [msg]
    });
    await wallet.lcd.tx.broadcast(tx);
    return true
  }catch{
    return false
  }

}
this.claimProceeds = claim_proceeds

async function activate_pending_bids(asset){ 
  response = await get_bids(asset,true)
  activate_bid(asset,response)
  response.forEach(bidId => {
      
    console.log(bidId)
  });
}
this.activatePendingBids = activate_pending_bids

async function cancel_open_bids(asset){ 
  response = await get_bids(asset,true)
  response.forEach(bidId => {
   withdraw_bid(bidId)
   sleep (1000) //slight delay incase were processing multiple transactions 
  });
}
this.cancelOpenBids = cancel_open_bids

//returns liquidation queue stats https://lcd.terra.dev/terra/wasm/v1beta1/contracts/terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u/store?query_msg=eyJiaWRfcG9vbHNfYnlfY29sbGF0ZXJhbCI6eyJjb2xsYXRlcmFsX3Rva2VuIjoidGVycmExa2M4N211NDYwZndrcXRlMjlycXVoNGhjMjBtNTRmeHd0c3g3Z3AiLCJsaW1pdCI6MzF9fQ%3D%3D
async function get_queue_detailed(collateral_asset = "bluna") {

  const request = require('request')
  if (collateral_asset == "bluna"){
    collateral_token_contract = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
  }
  if (collateral_asset == "beth"){
    collateral_token_contract = "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun"
  }
  msg_to_encode  ='{"bid_pools_by_collateral":{"collateral_token":"' +  collateral_token_contract + '","limit":31}}'
  encoded_msg = Buffer.from(msg_to_encode).toString('base64')
  const anchor_bids_query_url = lcdurl +'/terra/wasm/v1beta1/contracts/terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u/store?query_msg='+encoded_msg

  return new Promise((resolve, reject) => {
    request(anchor_bids_query_url, (error, response, body) => {
      if (error) reject(error)
      if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>')
      }
      const returnData = JSON.parse(body)
      bids_pool_data = returnData["query_result"]["bid_pools"]

      resolve(bids_pool_data)
    })
  })


}
this.getQueueDetailed = get_queue_detailed


function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

}

module.exports.orcaKiller = orcaKiller