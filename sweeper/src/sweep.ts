import { JsonRpcProvider, parseUnits, Wallet } from "ethers";
import {PrismaClient} from "../../backend/node_modules/@prisma/client/default"
import dotenv from "dotenv"
import axios from "axios";
import Cryptr from "cryptr";

dotenv.config(); //private key testnet
const prisma= new PrismaClient(); 
if(!process.env.ENCRYPT_SECRET_KEY){
    throw Error("Empty variable");
}
const cryptr= new Cryptr(process.env.ENCRYPT_SECRET_KEY);// same secret used in backend, now for decryption
const MIN_ETH_SWEEP_THRESHOLD=0.05; 
const maxGasPriceLimit=11;
const HOT_WALLET_WITHDRAWAL_ADDREES="0x2966473D85A76A190697B5b9b66b769436EFE8e5";

const getGasPrice=async()=>{ //api for gas prices estimate
    const res= await axios.get("https://api.blocknative.com/gasprices/blockprices", {
        headers:{ Authorization: process.env.BLOCK_NATIVE_API_KEY},
        params: {chainid: 1, confidenceLevels: "50,70,80,90,99"}
    })
    const gasData=res.data.blockPrices[0].estimatedPrices;
    const gasPrice=gasData.find((x:any)=>x.confidence===70).maxFeePerGas //selecting confidence limit as 70%

    if(!gasPrice) return;
    return gasPrice;
}

(async()=>{
    for(;;){
        const provider=new JsonRpcProvider(process.env.RPC_URL);
        const user=await prisma.binanceUsers.findFirst({
            select:{
                privateKey: true,
                balance: true
            }
        })
        if(!user){
            return;
        } 
        const gasPriceData=await getGasPrice();
        if(user.balance > MIN_ETH_SWEEP_THRESHOLD && gasPriceData<maxGasPriceLimit){
            const signer=new Wallet(cryptr.decrypt(user.privateKey), provider);
            const txn= await signer.sendTransaction({
                to: HOT_WALLET_WITHDRAWAL_ADDREES,
                value: parseUnits(user.balance.toString(), 'ether'),
                maxFeePerGas: parseUnits(gasPriceData.toString(), 'gwei')
            })
            if(!txn){
                console.log("issue with sweep transaction");
                return;
            }
            console.log("Sweeped");
        } 
    }      
})()    

