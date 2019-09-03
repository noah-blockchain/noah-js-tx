import {Buffer} from 'safe-buffer';
import {NoahTxDataSellAll, coinToBuffer} from '~/src';
import decodeToArray from '../decode-to-array';

describe('NoahTxDataSellAll', () => {
    test('rlp encoded fields', () => {
        const serializedTxData = (new NoahTxDataSellAll({
            coinToSell: coinToBuffer('MNT'),
            coinToBuy: coinToBuffer('BELTCOIN'),
            minimumValueToBuy: 5,
        })).serialize();

        expect(serializedTxData)
            .toEqual(Buffer.from([215, 138, 77, 78, 84, 0, 0, 0, 0, 0, 0, 0, 138, 66, 69, 76, 84, 67, 79, 73, 78, 0, 0, 5]));

        expect(decodeToArray(serializedTxData))
            .toEqual([
                [77, 78, 84, 0, 0, 0, 0, 0, 0, 0],
                [66, 69, 76, 84, 67, 79, 73, 78, 0, 0],
                [5],
            ]);
    });
});
