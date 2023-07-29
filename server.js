const express = require('express')
const app = express()
const port = 3000
const xrpl = require("xrpl")
var mysql = require('mysql');
const { createHash } = require('crypto');
 

function getNet() {
  let net
     net = "wss://s.altnet.rippletest.net:51233"
  // net = "wss://s.devnet.rippletest.net:51233"
  return net
} 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// *******************************************************
// ************ CONNECT TO DATABASE          *************
// *******************************************************
var con = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  port: "3306"
});

con.connect(function(err) {
if (err) throw err;
console.log("Connected!");

});

// *******************************************************
// ************          ROUTES             *************
// *******************************************************

app.get('/gatewaybalance/:account/', async (req, res) => {
    data = await get_gateway_balance(req.params.account);
    res.send(data);
 })

 app.get('/balance/:account/', async (req, res) => {
    data = await get_wallet_balance(req.params.account);
    res.send(data);
 })

 
app.get('/nft/:account/', async (req, res) => {
    data = await getTokens(req.params.account);
    res.send(data);
})

app.get('/burn/:tokenID/', async (req, res) => {
  accountSeed="sEdTs5vAVSzpJgBQW5CXkE8GLkHyNoY"
  data = await burnToken(req.params.tokenID, accountSeed);
  res.send(data);
})

 

app.get('/lines/:account/', async (req, res) => {
   data = await getAccount_lines(req.params.account);
   res.send(data);
 })

app.get('/send/:toaccount/:quantity/:currency', async (req, res) => {
  
  let fromAccountSeed="sEdVPaY5T2BLb8gbDfvg9CQcgfCPm5a"
  let toAccount=req.params.toaccount
  let Quantity=req.params.quantity
  let currencyCode=req.params.currency

   data = await SendCurrency(fromAccountSeed,toAccount,Quantity,currencyCode);
   res.send(data);
})

app.get('/trust/:account/', async (req, res) => {
  
  let fromAccountSeed="sEd7cWbgg537Fs5Y4v2DCGPuF2coztB"
  let toAccountSeed="sEdTncqgFfdGdLsBrviuWS75wKuVFgC"
  let Quantity="540"
  let currencyCode="USD"

   data = await createTrustline(fromAccountSeed,toAccountSeed,Quantity,currencyCode);
   res.send(data+" "+req.params.walletId);
   console.log(data+"--->"+req.params)
})

  
// *******************************************************
// *******************  XRP BALANCE     ******************
// *******************************************************

async function get_wallet_balance(walletID){  
  
      let net = getNet()
      const client = new xrpl.Client(net)
      await client.connect()

     try {
        const wallet_balance = (await client.getXrpBalance(walletID))  
          
        const response = await client.request({
            "command": "account_info",
            "account": walletID,
            "ledger_index": "validated"
        })

        client.disconnect()
        return wallet_balance;

      } catch (e) {

        if (!(e instanceof Error)) {
          e = new Error(e);
        }
        console.error(e);
        let results = JSON.stringify(e, null, 2)
        client.disconnect()
        return results
    }

      
  }

// *******************************************************
// ******************* GET TOKEN BALANCE *****************
// *******************************************************


  async function get_gateway_balance(standby_wallet){  
    
    let net = getNet()
    const client = new xrpl.Client(net)
    await client.connect()
  
    try {

        const standby_balances = await client.request({
          command: "gateway_balances",
          account: standby_wallet,
          ledger_index: "validated",
        })


        let results = JSON.stringify(standby_balances.result, null, 2)
        client.disconnect()
        return results

    } catch (e) {

        if (!(e instanceof Error)) {
          e = new Error(e);
        }
        console.error(e);
        let results = JSON.stringify(e, null, 2)
        client.disconnect()
        return results
    }
 
     
    
  }

// *******************************************************
// ******************* Get NFT  ************************
// *******************************************************
      
async function getTokens(wallet) {
 
  let net = getNet()
  const client = new xrpl.Client(net)  
  await client.connect()
   
  try{
      const nfts = await client.request({
        method: "account_nfts",
        account: wallet,
      })
    
      let results = JSON.stringify(nfts,null,2)
      client.disconnect()
      return results;

    } catch (e) {

      if (!(e instanceof Error)) {
        e = new Error(e);
      }

      console.error(e);
      let results = JSON.stringify(e, null, 2)
      client.disconnect()
      return results
    }

}  

 

// *******************************************************
// ******************* Get Account Lines  ****************
// *******************************************************
      

async function getAccount_lines(standby_wallet) {
  let net = getNet()
  const client = new xrpl.Client(net)
  
  await client.connect()
   
  try{
    const trusutlines = await client.request({
      command: "account_lines",
      account: standby_wallet,
    })
    let results = JSON.stringify(trusutlines,null,2)
  
    client.disconnect()
    return results;


  } catch (e) {

    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    console.error(e);
    let results = JSON.stringify(e, null, 2)
    client.disconnect()
    return results
  }
}  
 
 
// *******************************************************
// ************* Operational Send Issued Currency ********
// *******************************************************
      

async function SendCurrency(fromAccountSeed,toAccount,Quantity,currencyCode) {


  let net = getNet()
  const client = new xrpl.Client(net)

  await client.connect()        

  const operational_wallet = xrpl.Wallet.fromSeed(fromAccountSeed)
  const currency_code = currencyCode
  const issue_quantity = Quantity
        
  const send_token_tx = {
            "TransactionType": "Payment",
            "Account": operational_wallet.address,
            "Amount": {
                "currency": currency_code,
                "value": issue_quantity,
                "issuer": operational_wallet.address
            },
            "Destination": toAccount
         }
    
  try {

  const pay_prepared = await client.autofill(send_token_tx)
  const pay_signed = operational_wallet.sign(pay_prepared)
  const pay_result = await client.submitAndWait(pay_signed.tx_blob)

    if (pay_result.result.meta.TransactionResult == "tesSUCCESS") {
      return(pay_result.result.meta.TransactionResult)
    } 
    if (pay_result.result.meta.TransactionResult == "tecPATH_DRY") {
      // THERE IS NOT TRUST LINE -> GOTO CREATE
    }
    if (pay_result.result.meta.TransactionResult == "tecPATH_PARTIAL") {
      console.log(pay_result.result.meta.TransactionResult)
      return "not enough liquidity"
    }

  
  } catch (e) {
      if (!(e instanceof Error)) {
        e = new Error(e);
      }
      console.error(e);
  }
 
  client.disconnect()
} // end of sendCurrency()


// *******************************************************
// ************ Create Operational TrustLine *************
// *******************************************************
      

async function createTrustline(fromAccountSeed,toAccountSeed,Quantity,currencyCode) {


  let net = getNet()
  const client = new xrpl.Client(net)

  await client.connect()        

  const standby_wallet = xrpl.Wallet.fromSeed("sEd74kXw8UVEutU7AeAo5QNxrUmKsj9") // CUENTA QUE RECIBE EL TOKEN
  const operational_wallet = xrpl.Wallet.fromSeed("sEdT1HLoeWWi5b8pENuWWZX9r1Ruk9K") // CUENTA QUE POSEE EL TOKEN EJMPLO "VMX" 
  const trustSet_tx = {
    "TransactionType": "TrustSet",
    "Account": "rMGkXvtmajmBG4VENm8T8xg2rLQh37vadi", // CUENTA QUE RECIBE EL TOKEN
    "LimitAmount": {
      "currency": "VMX",
      "issuer": operational_wallet.address, // CUENTA QUE POSEE EL TOKEN EJMPLO "VMX" 
      "value": "100000"
    }
  }
  
    const ts_prepared = await client.autofill(trustSet_tx)
    const ts_signed = standby_wallet.sign(ts_prepared)
    const ts_result = await client.submitAndWait(ts_signed.tx_blob)

    client.disconnect()
    if (ts_result.result.meta.TransactionResult == "tesSUCCESS") {
      return(ts_result.result.meta.TransactionResult)
    }else{
      return(ts_result.result.meta.TransactionResult)
    } 
    
   // return(ts_result.result.meta.TransactionResult)
  
 
  client.disconnect()
} // end of TrustLine()


// *******************************************************
// *************  Burn Token ******************
// *******************************************************
      
async function burnToken(TokenId,accountSeed) {
  const operational_wallet = xrpl.Wallet.fromSeed(accountSeed)
  let net = getNet()
  const client = new xrpl.Client(net)
  
  await client.connect()
 
  try{
    const transactionBlob = {
      "TransactionType": "NFTokenBurn",
      "Account": operational_wallet.classicAddress,
      "NFTokenID": TokenId
    }
        
    const tx = await client.submitAndWait(transactionBlob,{wallet: operational_wallet})
    const nfts = await client.request({
      method: "account_nfts",
      account: operational_wallet.classicAddress
    })
  
    //results =  JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
    //operationalBalanceField.value = (await client.getXrpBalance(operational_wallet.address))
   // operationalBalanceField.value = (await client.getXrpBalance(operational_wallet.address))

    results = JSON.stringify(nfts,null,2)
    client.disconnect()
    return results  

  } catch (e) {
    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    console.error(e);
  }

  client.disconnect()

}


    



  
   
