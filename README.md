# noahjs-tx

[![NPM Package](https://img.shields.io/npm/v/noahjs-tx.svg?style=flat-square)](https://www.npmjs.org/package/noahjs-tx)
[![Build Status](https://img.shields.io/travis/noah-blockchain/noahjs-tx.svg?style=flat-square)](https://travis-ci.org/noah-blockchain/noahjs-tx)
[![Coverage Status](https://img.shields.io/coveralls/github/noah-blockchain/noahjs-tx/master.svg?style=flat-square)](https://coveralls.io/github/noah-blockchain/noahjs-tx?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/noah-blockchain/noahjs-tx/blob/master/LICENSE)

A low level module for creating, manipulating and signing Noah transactions.
Consider using [noah-js-sdk](https://github.com/noah-blockchain/noah-js-sdk) to have full-featured solution.

It is complemented by the following packages:
- [noah-js-sdk](https://github.com/noah-blockchain/noah-js-sdk) complete JS solution to work with Noah
- [noahjs-wallet](https://github.com/noah-blockchain/noahjs-wallet) to create wallet
- [noahjs-util](https://github.com/noah-blockchain/noahjs-util) utility functions

## Install

```npm install noahjs-tx```

or from browser

```html
<script src="https://unpkg.com/noahjs-tx"></script>
<script>
const txData = noahTx.NoahTxDataSend(...);
const tx = noahTx.NoahTx(...);
</script>
```

## Usage

### Full example

[example](https://github.com/noah-blockchain/noahjs-tx/blob/master/examples/transaction.js)

```js
import NoahTx from 'noahjs-tx';
import NoahTxSignature from 'noahjs-tx/src/tx-signature';
import NoahTxDataSend from 'noahjs-tx/src/tx-data/send';
import {TX_TYPE_SEND} from 'noahjs-tx/src/tx-types';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

// make tx data
const txData = new NoahTxDataSend({
    to: '0x0000000000000000000000000000000000000000',
    coin: coinToBuffer('BIP'),
    value: `0x01`,
});

// make tx
const tx = new NoahTx({
    nonce: '0x01',
    chainId: '0x01',
    gasPrice: '0x01',
    gasCoin: coinToBuffer('BIP'), 
    type: TX_TYPE_SEND,
    data: txData.serialize(),
});

// sign tx
const privateKey = Buffer.from('5fa3a8b186f6cc2d748ee2d8c0eb7a905a7b73de0f2c34c5e7857c3b46f187da', 'hex');
tx.signatureData = (new NoahTxSignature()).sign(tx.hash(false), privateKey).serialize();

// get signed tx string
const serializedTx = tx.serialize().toString('hex');

// post tx to blockchain
fetch(`https://noah-node-1.testnet.noah.network/send_transaction?tx=0x${serializedTx}`)
    .then((response) => {
        console.log('Success!', response.json());
    });

```


### Initialization
```js
import NoahTx from 'noahjs-tx';

const tx = new NoahTx(txParams);
```

### Tx params
All tx params can be passed as Buffer or Hex string

- `nonce` - int, used for prevent transaction reply (count of txs for this private key + 1)
- `chainId' - int, identify network type, 0x01 - mainnet, 0x02 - testnet
- `gasPrice` - big int, used for managing transaction fees
- `gasCoin` - symbol of a coin to pay fee
- `type` - type of transaction (see below).
- `data` - data of transaction (depends on transaction type, see below).
- `payload` (arbitrary bytes) - arbitrary user-defined bytes, e.g. tx message
- `serviceData` - reserved field.
- ECDSA fields (`r`, `s` and `v`) - digital signature of transaction


### Methods

#### `.sign(privateKey)`
Sign a transaction with a given private key.
`privateKey` - 32 bytes Buffer.

```js
tx.sign(privateKey);
```

#### `.verifySignature()`
Determines if the signature is valid.
Returns boolean.

```js
const isValid = tx.verifySignature();
```

#### `.validate(stringError)`
Validates the signature.
`stringError` - whether to return a string with a description of why the validation failed.
Return boolean or string with errors.

```js
const isValid = tx.validate();
const validationErrors = tx.validate(true);
```

#### `.hash(includeSignature)`
Computes a sha3-256 hash of the serialized tx.
`includeSignature` - whether or not to include the signature, default true.
Returns Buffer.

```js
// hash of tx with signature
const hash = tx.hash();
// hash of tx without signature
const hashWithoutSignature = tx.hash(false);
```

#### `.getSenderAddress()`
Returns the sender's address.
Returns Buffer.

```js
const address = tx.getSenderAddress();
```

#### `.getSenderPublicKey()`
Returns the sender's public key.
Returns Buffer.

```js
const publicKey = tx.getSenderPublicKey();
```


### Tx types
`TX_TYPE_SEND`:              `'0x01'`
`TX_TYPE_SELL`:              `'0x02'`
`TX_TYPE_SELL_ALL`:          `'0x03'`
`TX_TYPE_BUY`:               `'0x04'`
`TX_TYPE_CREATE_COIN`:       `'0x05'`
`TX_TYPE_DECLARE_CANDIDACY`: `'0x06'`
`TX_TYPE_DELEGATE`:          `'0x07'`
`TX_TYPE_UNBOND`:            `'0x08'`
`TX_TYPE_REDEEM_CHECK`:      `'0x09'`
`TX_TYPE_SET_CANDIDATE_ON`:  `'0x0A'`
`TX_TYPE_SET_CANDIDATE_OFF`: `'0x0B'`
`TX_TYPE_CREATE_MULTISIG`:   `'0x0C'`
`TX_TYPE_MULTISEND`:         `'0x0D'`
`TX_TYPE_EDIT_CANDIDATE`:    `'0x0E'`

### Tx data

#### Send
```js
import {toBuffer, convertToPip} from 'noahjs-util';
import NoahTxDataSend from 'noahjs-tx/src/tx-data/send';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataSend({
   coin: coinToBuffer('MNT'),
   to: toBuffer('Mx7633980c000139dd3bd24a3f54e06474fa941e16'),
   value: `0x${convertToPip(10, 'hex')}`,
});
```

#### Multisend
```js
import {toBuffer, convertToPip} from 'noahjs-util';
import NoahTxDataMultisend from 'noahjs-tx/src/tx-data/send';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataMultisend({
    list: [
        {
           coin: coinToBuffer('MNT'),
           to: toBuffer('Mx7633980c000139dd3bd24a3f54e06474fa941e16'),
           value: `0x${convertToPip(10, 'hex')}`,
        },
        {
           coin: coinToBuffer('MNT'),
           to: toBuffer('Mxddab6281766ad86497741ff91b6b48fe85012e3c'),
           value: `0x${convertToPip(2, 'hex')}`,
        },
    ]
});
```

#### Sell
```js
import {convertToPip} from 'noahjs-util';
import NoahTxDataSell from 'noahjs-tx/src/tx-data/sell';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataSell({
   coinToSell: coinToBuffer('MNT'),
   valueToSell: `0x${convertToPip(10, 'hex')}`,
   coinToBuy: coinToBuffer('BELTCOIN'),
});
```

#### Sell All
```js
import {convertToPip} from 'noahjs-util';
import NoahTxDataSellAll from 'noahjs-tx/src/tx-data/sell-all';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataSellAll({
   coinToSell: coinToBuffer('MNT'),
   coinToBuy: coinToBuffer('BELTCOIN'),
});
```

#### Buy
```js
import {convertToPip} from 'noahjs-util';
import NoahTxDataBuy from 'noahjs-tx/src/tx-data/buy';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataBuy({
     coinToBuy: coinToBuffer('MNT'),
     valueToBuy: `0x${convertToPip(10, 'hex')}`,
     coinToSell: coinToBuffer('BELTCOIN'),
 });
```

#### Create Coin
```js
import {convertToPip} from 'noahjs-util';
import NoahTxDataCreateCoin from 'noahjs-tx/src/tx-data/create-coin';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataCreateCoin({
   name: 'My coin',
   symbol: coinToBuffer('MYCOIN'),
   initialAmount: `0x${convertToPip(10, 'hex')}`,
   initialReserve: `0x${convertToPip(50, 'hex')}`,
   constantReserveRatio: 100,
});
```

#### Declare Candidacy
```js
import {toBuffer, convertToPip} from 'noahjs-util';
import NoahTxDataDeclareCandidacy from 'noahjs-tx/src/tx-data/declare-candidacy';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataDeclareCandidacy({
   address: toBuffer('Mx7633980c000139dd3bd24a3f54e06474fa941e16'),
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
   commission: 10,
   coin: coinToBuffer('MNT'),
   stake: `0x${convertToPip(1000, 'hex')}`,
});
```

#### Edit Candidacy
```js
import {toBuffer} from 'noahjs-util';
import NoahTxDataEditCandidate from 'noahjs-tx/src/tx-data/declare-candidacy';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataEditCandidate({
   ownerAddress: toBuffer('Mx7633980c000139dd3bd24a3f54e06474fa941e16'),
   rewardAddress: toBuffer('Mx7633980c000139dd3bd24a3f54e06474fa941e16'),
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
});
```

#### Delegate
```js
import {toBuffer, convertToPip} from 'noahjs-util';
import NoahTxDataDelegate from 'noahjs-tx/src/tx-data/delegate';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataDelegate({
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
   coin: coinToBuffer('MNT'),
   stake: `0x${convertToPip(1000, 'hex')}`,
});
```

#### Unbond
```js
import {toBuffer, convertToPip} from 'noahjs-util';
import NoahTxDataUnbond from 'noahjs-tx/src/tx-data/unbond';
import {coinToBuffer} from 'noahjs-tx/src/helpers';

const txData = new NoahTxDataUnbond({
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
   coin: coinToBuffer('MNT'),
   stake: `0x${convertToPip(1000, 'hex')}`,
});
```

#### Redeem Check
```js
import {toBuffer} from 'noahjs-util';
import {Buffer} from 'safe-buffer';
import NoahTxDataRedeemCheck from 'noahjs-tx/src/tx-data/redeem-check';

const txData = new NoahTxDataRedeemCheck({
   rawCheck: toBuffer('Mcf89f01830f423f8a4d4e5400000000000000888ac7230489e80000b841ada7ad273bef8a1d22f3e314fdfad1e19b90b1fe8dc7eeb30bd1d391e89af8642af029c138c2e379b95d6bc71b26c531ea155d9435e156a3d113a14c912dfebf001ca0781a7b7d781634bcf632579b99d583887ab093dfbd50b65de5c0e5813028a277a071272d8e1be721f5307f40f87daa4ab632781640f18fd424839396442cc7ff17'),
   proof: Buffer.from('7f8b6d3ed18d2fe131bbdc9f9bce3b96724ac354ce2cfb49b4ffc4bd71aabf580a8dfed407a34122e45d290941d855d744a62110fa1c11448078b13d3117bdfc01', 'hex'),
});
```

#### Set Candidate On
```js
import {toBuffer} from 'noahjs-util';
import NoahTxDataSetCandidateOn from 'noahjs-tx/src/tx-data/set-candidate-on';

const txData = new NoahTxDataSetCandidateOn({
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
});
```

#### Set Candidate Off
```js
import {toBuffer} from 'noahjs-util';
import NoahTxDataSetCandidateOff from 'noahjs-tx/src/tx-data/set-candidate-off';

const txData = new NoahTxDataSetCandidateOff({
   pubKey: toBuffer('Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3'),
});
```

#### Create Multisig
```js
import {toBuffer} from 'noahjs-util';
import NoahTxDataCreateMultisig from 'noahjs-tx/src/tx-data/create-multisig';

const txData = new NoahTxDataCreateMultisig({
   addresses: [toBuffer('Mxee81347211c72524338f9680072af90744333146'), toBuffer('Mxee81347211c72524338f9680072af90744333145'), toBuffer('Mxee81347211c72524338f9680072af90744333144')],
   weights: [1, 3, 5],
   threshold: 7,
});
```


## License

MIT License
