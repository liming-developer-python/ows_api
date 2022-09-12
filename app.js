const express = require("express");
const crypto = require('crypto');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');

app.use('/', express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // support json encoded bodies

const apiKey = "4fac5cda-dc49-47a1-a796-75d9c2e9e7f9"
const apiSecret = "ayyzzGnt8xF373UaUBqSJiYDOppyA-HPc6HlNz6-ANUdomFssmrAPJjto0IX3LRijF5GGOvgXQz2GjDXuTbp4A=="

function signRequest(nonce, path, body) {
  return crypto
      .createHmac("sha512", apiSecret)
      .update(apiKey)
      .update(nonce)
      .update(path)
      .update(body)
      .digest("hex");
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

app.post("/api/trade", (req, res) => {
  var keyAPI = '2NHd0JMUUFDQTNNVEwwWlVuRUtoVExaLyt5Wmx2OWZTMnZUVA'
  var signature = 'Mjk5Mzk5OTIyOAtrDtKNxZoXKwANjNHK0ZFVkY1UWVCaCtRQXYvWkIxQnp4VFBTd'
  var data = {
    'cmd': 'buy',
    'auth_token': signature + keyAPI,
    'market': 'BTC-BRL',
    'price': req.body.apiPrice,
    'volume': req.body.apiVolume,
    'amount': req.body.apiAmount,
    'limited': false
  }

  var returnValue = {}
  let getResults = () => {
    axios({
      method: "post",
      url: 'https://api.bitpreco.com/trading',
      data: data
    }).then((res) => {
      if (res) {
        console.log(res.data)
        returnValue = res.data
      } else {

      }
    }).catch((err) => {
      // handle err
      console.log(err)
    })
  }
  getResults()

  async function respond() {
    await delay(3000)
    var jsonResponse = JSON.stringify(returnValue);
    console.log(jsonResponse)

    res.end(jsonResponse)
  }

  respond()
  
})

app.post("/api/price", (req, res) => {
  var returnValue = {}
  let getResults = () => {
    axios({
      method: "post",
      url: 'https://api.bitpreco.com/btc-brl/ticker',
    }).then((res) => {
      if (res) {
        console.log(res.data)
        returnValue = {price: res.data.last * 1.1}
      } else {

      }
    }).catch((err) => {
      // handle err
      console.log(err)
    })
  }
  getResults()

  async function respond() {
    await delay(3000)
    var jsonResponse = JSON.stringify(returnValue);
    console.log(jsonResponse)

    res.end(jsonResponse)
  }

  respond()
  
})

app.post("/signature", (req, res) => {
    var path = req.body.path_var
    var nonce = req.body.nonce
    var formData = req.body.form_data !== undefined ? req.body.form_data : ''
    var req_url = '', method = '', body = '', sign_path = path
    var balances = [], exposures = [], quotes = [], trades = [], withdrawls = [], deposits = [], channel = []
    if (formData !== '') {
      body = JSON.stringify(formData).toString()
    }
    
    if (path.includes('balance')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/balance'
    }
    if (path.includes('exposure')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/exposure'
    }
    if (path.includes('quote')) {
      method = "post"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/quote'
    }
    if (path.includes('trade')) {
      method = "post"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/trade'
    }
    if (path.includes('withdrawl/request')) {
      method = "post"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/withdrawl/request'
    }
    if (path.includes('deposit/send')) {
      method = "post"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/deposit/send'
    }
    if (path.includes('stream/subscribe')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/stream'
    }
    else if (path.includes('stream/unsubscribe')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/stream'
    }
    else if (path.includes('stream/close')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/stream'
    }
    else if (path.includes('stream')) {
      method = "get"
      req_url = 'https://gateway-sandbox.oneworldservices.com/v1/stream'
      body = '{"event":"auth"}'
      sign_path = '/v1/stream'
      formData = {'event' : 'auth'}
    }

    x_signature = signRequest(nonce, sign_path, body)

    let getResults = () => {
      const headerPayload = {
        "X-API-Key": apiKey,
        "X-Nonce": nonce,
        "X-Signature": x_signature,
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json",
      }
      axios({
        method: method,
        data: formData,
        url: req_url,
        headers: headerPayload
      }).then((res) => {
        if (res) {
          console.log(res.data)
          if (path.includes('balance')) {
            balances = res.data.balances
          }
          if (path.includes('exposure')) {
            exposures = res.data
          }
          if (path.includes('quote')) {
            quotes = res.data
          }
          if (path.includes('trade')) {
            trades = res.data
          }
          if (path.includes('withdrawl/request')) {
            withdrawls = res.data
          }
          if (path.includes('deposit/send')) {
            deposits = res.data
          }
          if (path.includes('stream/subscribe')) {
            channel = res.data
          }
          else if (path.includes('stream/unsubscribe')) {
            channel = res.data
          }
          else if (path.includes('stream/close')) {
            channel = res.data
          }
          else if (path.includes('stream')) {
            channel = res.data
          }
          
        } else {

        }
      }).catch((err) => {
        // handle err
        console.log(err)
      })
    }
    getResults()
    
    async function respond() {
      await delay(2000)
      if (path.includes('balance')) {
        res.send(JSON.stringify(balances))
      }
      if (path.includes('exposure')) {
        res.send(JSON.stringify(exposures))
      }
      if (path.includes('quote')) {
        res.send(JSON.stringify(quotes)) 
      }
      if (path.includes('trade')) {
        res.send(JSON.stringify(trades))
      }
      if (path.includes('withdrawl/request')) {
        res.send(JSON.stringify(withdrawls))
      }
      if (path.includes('deposit/send')) {
        res.send(JSON.stringify(deposits))
      }
      if (path.includes('stream/subscribe')) {
        res.send(JSON.stringify(channel))
      }
      else if (path.includes('stream/unsubscribe')) {
        res.send(JSON.stringify(channel))
      }
      else if (path.includes('stream/close')) {
        res.send(JSON.stringify(channel))
      }
      else if (path.includes('stream')) {
        res.send(JSON.stringify(channel))
      }
    }
    respond()
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
