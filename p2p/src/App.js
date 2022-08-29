// import './App.css';
import React, { useState, useEffect } from 'react'
import axios from "axios";
import { Card, ListGroup, Form, Button, Row, Col } from 'react-bootstrap';

export default () => {
  const [balances, setBalances] = useState([])
  const [exposures, setExposures] = useState()
  const [quotes, setQuotes] = useState()
  const [trades, setTrades] = useState()
  const [withdrawls, setWithdrawls] = useState()
  const [deposits, setDeposits] = useState()
  const [channel, setChannel] = useState("")

  const [formData, setFormData] = useState()

  const [quoteTrading, setQuoteTrading] = useState("")
  const [quoteSettlement, setQuoteSettlement] = useState("")
  const [quoteSide, setQuoteSide] = useState("")
  const [quoteSize, setQuoteSize] = useState("")
  const [quoteAmount, setQuoteAmount] = useState("")

  const [tradeQuoteID, setTradeQuoteID] = useState("")
  const [tradeSize, setTradeSize] = useState("")
  
  const [withdrawlCurrency, setWithdrawlCurrency] = useState("")
  const [withdrawlAmount, setWithdrawlAmount] = useState("")
  const [withdrawlAddressID, setWithdrawlAddressID] = useState("")
  
  const [sendDepositCurrency, setSendDepositCurrency] = useState("")
  const [sendDepositAmount, setSendDepositAmount] = useState("")
  const [sendDepositAddressID, setSendDepositAddressID] = useState("")
  const [sendDepositTransactionID, setSendDepositTransactionID] = useState("")

  const [apiPrice, setAPIPrice] = useState("")
  const [apiVolume, setAPIVolume] = useState("")
  const [apiAmount, setAPIAmount] = useState("")

  function getNonce() {
    var nonce = Math.floor(
      Date.now() / 1000
    ) + 5
    return nonce.toString() + "000000000"
  }

  let nonce = ""

  const callAPISignature = (path) => {
    nonce = getNonce()
    const headerPayload = {
      "Access-Control-Allow-Origin" : "*",
      "Content-type": "Application/json",
    }
    axios({
      method: "post",
      data: {
        path_var: path,
        nonce: nonce,
        form_data: formData
      },
      url: "../../signature",
      headers: headerPayload
    }).then((res) => {
      if (res) {
        console.log(res.data)
        if (path.includes('balance')) {
          setBalances(res.data)
        }
        if (path.includes('exposure')) {
          setExposures(res.data)
        }
        if (path.includes('quote')) {
          setQuotes(res.data)
        }
        if (path.includes('trade')) {
          setTrades(res.data)
        }
        if (path.includes('withdrawl/request')) {
          setWithdrawls(res.data)
        }
        if (path.includes('deposit/send')) {
          setDeposits(res.data)
        }
      } else {
        console.log("ERR xSignature GET")
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  const handleClick = (e) => {
    e.preventDefault()
    var btn_id = e.currentTarget.id;
    if (btn_id == "balance") {
      callAPISignature('/v1/balance')
    }
    else if (btn_id == "exposure") {
      callAPISignature('/v1/exposure')
    }
  }

  const streamData = (e) => {
    e.preventDefault()
    var btn_id = e.currentTarget.id;
    let getResults = () => {
      axios({
        method: "get",
        url: 'https://api.bitpreco.com/btc-brl/ticker'
      }).then((res) => {
        if (res) {
          console.log(res.data)
          setChannel(res.data.last * 1.01)
        } else {

        }
      }).catch((err) => {
        // handle err
        console.log(err)
      })
    }
    
    if (btn_id == "price_y") {
      getResults();
    }
    else if (btn_id == "price_reload") {
      getResults();
    }
    else if (btn_id == "price_close") {
      setChannel('Stopped');
    }
  }

  const postAPI = (e) => {
    e.preventDefault()
    var FormData = require('form-data');
    var data = new FormData();
    var keyAPI = '2NHd0JMUUFDQTNNVEwwWlVuRUtoVExaLyt5Wmx2OWZTMnZUVA'
    var signature = 'Mjk5Mzk5OTIyOAtrDtKNxZoXKwANjNHK0ZFVkY1UWVCaCtRQXYvWkIxQnp4VFBTd'
    data.append('cmd', 'buy');
    data.append('auth_token', keyAPI + signature);
    data.append('market', 'BTC-BRL');
    data.append('price', apiPrice);
    data.append('volume', apiVolume);
    data.append('amount', apiAmount);
    data.append('limited', false);
    let getResults = () => {
      axios({
        method: "post",
        url: 'https://api.bitpreco.com/trading',
        data: data
      }).then((res) => {
        if (res) {
          console.log(res.data)
        } else {

        }
      }).catch((err) => {
        // handle err
        console.log(err)
      })
    }

    console.log("TEST API TRADE")
    getResults()
  }

  const onSubmit = (e) => {
    e.preventDefault()
    let info = ''
    var form_id = e.currentTarget.id
    
    if (form_id == "quote") {
      if (Number(quoteSize) == 0) {
        info = {
          'trading': quoteTrading,
          'settlement': quoteSettlement,
          'side': quoteSide.toLowerCase(),
          'amount': Number(quoteAmount)
        }
      }
      else if (Number(quoteAmount) == 0) {
        info = {
          'trading': quoteTrading,
          'settlement': quoteSettlement,
          'side': quoteSide.toLowerCase(),
          'size': Number(quoteSize)
        }
      }
  
      setFormData(info)
      callAPISignature('/v1/quote')
    }

    else if (form_id == "trade") {
      info = {
        'quoteID': tradeQuoteID,
        'size': Number(tradeSize)
      }
  
      setFormData(info)
      callAPISignature('/v1/trade')
    }

    else if (form_id == "withdrawl") {
      info = {
        'currency': withdrawlCurrency,
        'address_id': withdrawlAddressID,
        'amount': Number(withdrawlAmount)
      }
  
      setFormData(info)
      callAPISignature('/v1/withdrawl/request')
    }

    else if (form_id == "sendDeposit") {
      info = {
        'currency': sendDepositCurrency,
        'address_id': sendDepositAddressID,
        'transaction_id': sendDepositTransactionID,
        'amount': Number(sendDepositAmount)
      }
  
      setFormData(info)
      callAPISignature('/v1/deposit/send')
    }
  }

  return (
    <div >

      <Row className='mt-4'>
        <Col lg={6}>
          <Card>
            <Card.Header className='bg-success text-white'>
              GET Balance
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Button variant="primary" id="balance" onClick={handleClick}>Balance</Button>
              </Card.Title>
              <Card.Text style={{ display: 'flex' }}>
                {
                  balances.map(u => 
                    <ul>
                      <li>currency: {u.currency}</li>
                      <li>available: {u.available}</li>
                      <li>on_hold: {u.on_hold}</li>
                    </ul>
                  )
                }
              </Card.Text>
              
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card >
            <Card.Header className='bg-success text-white'>
              GET Exposure
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Button variant="primary" id="exposure" onClick={handleClick} >Exposure</Button>
              </Card.Title>
              <Card.Text >
                { 
                exposures !== undefined ?
                  <ul>
                    <li>currency: {exposures.currency}</li>
                    <li>exposure: 
                      <ol>current: {exposures.exposure.current}</ol>
                      <ol>limit: {exposures.exposure.limit}</ol>
                    </li>
                    <li>credit: 
                      <ol>current: {exposures.credit.current}</ol>
                      <ol>limit: {exposures.credit.limit}</ol>  
                    </li>
                  </ul> : ''
                }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col lg={6} >
          <Card >
            <Card.Header className='bg-success text-white'>
              POST Quote Request
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Form onSubmit={onSubmit} id="quote">
                  <Row>
                    <Col xs={6}>
                      <Form.Group id="trading" className="mb-3">
                        <Form.Label>Trading</Form.Label>
                        <Form.Control required type="text" placeholder="Enter the trading" value={quoteTrading} onChange={(e) => { setQuoteTrading(e.target.value) }} />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group id="settlement" className="mb-3">
                        <Form.Label>Settlement</Form.Label>
                        <Form.Control required type="text" placeholder="Enter the settlement" value={quoteSettlement} onChange={(e) => { setQuoteSettlement(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <Form.Group id="side" className="mb-3">
                        <Form.Label>Side</Form.Label>
                        <Form.Control required type="text" placeholder="Enter the side" value={quoteSide} onChange={(e) => { setQuoteSide(e.target.value) }} />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group id="size" className="mb-3">
                        <Form.Label>Size</Form.Label>
                        <Form.Control type="number" placeholder="Enter the size" value={quoteSize} onChange={(e) => { setQuoteSize(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <Form.Group id="amount" className="mb-3">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" placeholder="Enter the amount" value={quoteAmount} onChange={(e) => { setQuoteAmount(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" >Quote</Button>
                </Form>
              </Card.Title>
              { 
                quotes !== undefined ?
                  <ul>
                    <li>quoteID: {quotes.quoteID}</li>
                    <li>trading: {quotes.trading}</li>
                    <li>settlement: {quotes.settlement}</li>
                    <li>side: {quotes.side}</li>
                    <li>size: {quotes.size}</li>
                    <li>price: {quotes.price}</li>
                    <li>expiresAt: {quotes.expiresAt}</li>
                    <li>expiresIn: {quotes.expiresIn}</li>
                  </ul> : ''
                }
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card >
            <Card.Header className='bg-success text-white'>
              POST Trade
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Form onSubmit={onSubmit} id="trade">
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="quoteID" className="mb-3">
                        <Form.Label>QuoteID</Form.Label>
                        <Form.Control required type="text" value={tradeQuoteID} onChange={(e) => { setTradeQuoteID(e.target.value) }} disabled/>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="size" className="mb-3">
                        <Form.Label>Size</Form.Label>
                        <Form.Control required type="number" placeholder="Enter the size" value={tradeSize} onChange={(e) => { setTradeSize(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" >Trade</Button>
                </Form>
              </Card.Title>
              { 
                trades !== undefined ?
                  <ul>
                    <li>orderID: {trades.orderID}</li>
                    <li>trading: {trades.trading}</li>
                    <li>settlement: {trades.settlement}</li>
                    <li>filled: {trades.filled}</li>
                    <li>filled_price: {trades.filled_price}</li>
                    <li>status: {trades.status}</li>
                    <li>quoteID: {trades.quoteID}</li>
                  </ul> : ''
                }
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col lg={6} >
          <Card >
            <Card.Header className='bg-success text-white'>
              POST Withdrawl
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Form onSubmit={onSubmit} id="withdrawl">
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="currency" className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Control type="text" placeholder="Enter the Currency" value={withdrawlCurrency} onChange={(e) => { setWithdrawlCurrency(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="amount" className="mb-3">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" placeholder="Enter the Amount" value={withdrawlAmount} onChange={(e) => { setWithdrawlAmount(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="address_id" className="mb-3">
                        <Form.Label>Address ID</Form.Label>
                        <Form.Control type="text" placeholder="Enter the Address ID" value={withdrawlAddressID} onChange={(e) => { setWithdrawlAddressID(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" >Withdrawl</Button>
                </Form>
              </Card.Title>
              { 
                withdrawls !== undefined ?
                  <ul>
                    <li>batch_id: {withdrawls.batch_id}</li>
                  </ul> : ''
                }
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card >
            <Card.Header className='bg-success text-white'>
              POST Send Deposit
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Form onSubmit={onSubmit} id="sendDeposit">
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="currency" className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Control type="text" placeholder="Enter the Currency" value={sendDepositCurrency} onChange={(e) => { setSendDepositCurrency(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="amount" className="mb-3">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" placeholder="Enter the Amount" value={sendDepositAmount} onChange={(e) => { setSendDepositAmount(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="address_id" className="mb-3">
                        <Form.Label>Address ID</Form.Label>
                        <Form.Control type="text" placeholder="Enter the Address ID" value={sendDepositAddressID} onChange={(e) => { setSendDepositAddressID(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={10}>
                      <Form.Group id="transaction_id" className="mb-3">
                        <Form.Label>Transaction ID</Form.Label>
                        <Form.Control type="text" placeholder="Enter the Transaction ID" value={sendDepositTransactionID} onChange={(e) => { setSendDepositTransactionID(e.target.value) }} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="primary" type="submit" >Send Deposit</Button>
                </Form>
              </Card.Title>
              { 
                deposits !== undefined ?
                  <ul>
                    <li>batch_id: {deposits.batch_id}</li>
                  </ul> : ''
                }
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col lg={6} >
          <Card >
            <Card.Header className='bg-success text-white'>
              Price Channel
            </Card.Header>
            <Card.Body>
              <Card.Title>
                <Row>
                  <Col xs={1}></Col>
                  <Col xs={3}>
                    <Button variant="primary" id="price_y" onClick={streamData} >Start</Button>
                  </Col>
                  <Col xs={4}>
                    <span id='price'>{channel}</span>
                  </Col>
                  <Col xs={2}>
                    <Button variant="primary" id="price_reload" onClick={streamData} >Reload</Button>
                  </Col>
                  <Col xs={2}>
                    <Button variant="primary" id="price_close" onClick={streamData} >Stop</Button>
                  </Col>
                </Row>
                <Row>
                  <Col xs={9}>
                    <Form.Group id="transaction_id" className="mb-3">
                      <Form.Label></Form.Label>
                      <Form.Control type="text" value={window.location.href + 'api/trade'} disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <Form.Group id="price" className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <Form.Control required type="text" placeholder="Enter the price" value={apiPrice} onChange={(e) => { setAPIPrice(e.target.value) }} />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group id="volume" className="mb-3">
                      <Form.Label>Volume</Form.Label>
                      <Form.Control required type="text" placeholder="Enter the volume" value={apiVolume} onChange={(e) => { setAPIVolume(e.target.value) }} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <Form.Group id="amount" className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control required type="text" placeholder="Enter the amount" value={apiAmount} onChange={(e) => { setAPIAmount(e.target.value) }} />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" id="send_post" onClick={postAPI} >POST</Button>
              </Card.Title>
              { 
                withdrawls !== undefined ?
                  <ul>
                    <li>batch_id: {withdrawls.batch_id}</li>
                  </ul> : ''
                }
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
}
