import axios from 'axios';
import dotenv, { config } from "dotenv";
import {PrismaClient} from "../../backend/node_modules/@prisma/client/default"
import { JsonRpcProvider } from 'ethers';
dotenv.config()
const etherUnit=Math.pow(10,18); //1 ether = 10^18 wei 
const provider=new JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
let CURRENT_BLOCK_NUMBER;
const prisma=new PrismaClient();
type Transaction={
    hash: string,
    to: string,
    from: string,
    value: string
}

async function main(){
    //getting interested addresses from the DB
    CURRENT_BLOCK_NUMBER=await provider.getBlockNumber();
    const userAddresses=await prisma.binanceUsers.findMany({
        select: {depositAddress: true}
    })
    // const interestedAddress=["0x68c905040BcA2Ed08223621b1305E61CB83a5192", "0x870248D3d08A422006813909694cE6deCF27f2b8", "0x72bB98f9de3FA19614375D860bD3973e44dAB3B8"]
    const interestedAddress = userAddresses.map(x=> x.depositAddress);
    const HEX_CURRENT_BLOCKNO="0x"+CURRENT_BLOCK_NUMBER.toString(16);
    const req1_block:{result: {transactions: Transaction[]}}=await fetchRequest1(HEX_CURRENT_BLOCKNO);
    const req2_block:{result: {transactions: Transaction[]}}=await fetchRequest2(HEX_CURRENT_BLOCKNO);
    if(!req1_block || !req2_block){
        console.log("Either block requests's not found");
        return;
    }
    if (req1_block.result.transactions.length === 0 || req2_block.result.transactions.length===0) {
        console.log("No transactions in either or both block");
        return;
    }
    //updating balance
    for(const txn of req1_block.result.transactions){
        if(interestedAddress.includes(txn.to)){
            const txnReq2=req2_block.result.transactions.find((t)=>t.hash===txn.hash);
            if(txnReq2 && txnReq2.to===txn.to && txnReq2.value===txn.value){
                await prisma.binanceUsers.update({
                    where:{depositAddress: txn.to}, 
                    data:{
                        balance: {
                            increment: parseInt(txn.value, 16)/etherUnit
                        }
                    }
                })
            }else{
                console.log("Inconsistent transaction data")
            }
        }
        
        /* CAN'T WITHDRAW FROM SAME DEPOSIT ADDRESS BUT NEED TO SWEEP AND THEN WITHDRAW FROM ANOTHER ADDRESS (WALLET) */
    }
}

async function fetchRequest1(blockNumber: string){
    const body={
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [
          blockNumber,
          true
        ]
    }
    if(!process.env.ALCHEMY_RPC_URL){
        return;
    }
    const response=await axios.post(process.env.ALCHEMY_RPC_URL, body); 
    return response.data;
}

async function fetchRequest2(blockNumber:string) {
    const body={
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [
          blockNumber,
          true
        ]
    }
    if(!process.env.MORALIS_RPC_URL){
        return;
    }
    const response=await axios.post(process.env.MORALIS_RPC_URL, body); 
    return response.data;
}

async function runIndexer() {
    for(;;){
        try{
            await main()
        }catch(e){
            console.log(`Error Running the Indexer: ${e}`)
        }
    }
}
runIndexer();
