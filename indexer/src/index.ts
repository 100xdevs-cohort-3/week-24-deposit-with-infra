import { BlockTag, JsonRpcProvider } from "ethers";
import { pool } from "./db";
import { config } from "dotenv";
import { bufferBlocks, pastBlocksToIndex } from "./config";
config();
const provider = new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/9KWVvqT1WlbcRwJ35eIZIjHk7HzG_GmG')
async function index(startingBlock: number, blockToIndex: BlockTag | string) {
    if (blockToIndex == startingBlock - pastBlocksToIndex)
        return;
    console.log('Processing Block---', blockToIndex)
    try {
        // get addresses from db
        const client = await pool.connect();
        const res = await client.query('SELECT deposit_address FROM users');
        const addresses = res.rows.map(i => i.deposit_address)
        // const addresses = ["0xa95a23115B0aB94182C5893E1A45140F0F3B6D53","0x4E0Aa635E7ef2BC8C349899E0E4a2df012F6c978"]
        const block = await provider.getBlock(blockToIndex, true);
        const transactions = block?.prefetchedTransactions;
        const interestedTransactions = transactions?.filter(txn => addresses.includes(txn.to as string))
        console.log('interestedTransactions---',interestedTransactions);
        //update balances
        interestedTransactions?.forEach(async txn=>{
            //get the user with the public key and increase the balance
           await client.query('UPDATE users SET balance = balance + $1 WHERE deposit_address = $2',[txn.value,txn.to])
        })


    } catch (error) {
        console.log(error)
    }
    finally {
        index(startingBlock, Number(blockToIndex) - 1);
    }
}
async function main() {
    const latestBlock = await provider.getBlockNumber();
    //start indexing from 10 blocks less for 50 blocks
    index(latestBlock - bufferBlocks, latestBlock - bufferBlocks);
}
main()