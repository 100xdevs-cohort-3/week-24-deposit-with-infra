import express, {Request, Response} from "express";
import { ethers, HDNodeWallet } from "ethers6";
import {config} from "./config";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"
import { mnemonicToSeedSync } from "bip39";
import cors from "cors";
import { auth } from "./auth";
import Cryptr from "cryptr";

const prisma=new PrismaClient();
const cryptr= new Cryptr(config.ENCRYPT_SECRET_KEY);
const seed=mnemonicToSeedSync(config.MNEMONICS);
const app=express();
app.use(express.json());
app.use(cors());

app.post("/signup", async(req, res)=>{
    const username=req.body.username;
    const password=req.body.password;   
    const result=await prisma.binanceUsers.create({
        data:{
            username,
            password,
            depositAddress:"",
            privateKey:"",
            balance: 0,
        }
    })
    const userId=result.id;
    const hdNode=HDNodeWallet.fromSeed(seed);
    const derivationPath=`m/44'/60'/${userId}'/0`;
    const child=hdNode.derivePath(derivationPath);

    await prisma.binanceUsers.update({
        where:{ id: userId},
        data:{
            depositAddress: child.address.toLowerCase(),
            privateKey: cryptr.encrypt(child.privateKey),
        }
    })

    console.log(child.address);
    console.log(child.privateKey);

    console.log(child);
    res.json({
        userId: userId
    })
})

app.post("/signin", async(req, res)=>{
    const {username, password}=req.body;
    const user=await prisma.binanceUsers.findFirst({where: {username, password}})
    if(!user){
        res.json({
            message: "No such user"
        })
        return;
    }
    const token=jwt.sign({userId: user.id}, config.SECRET_KEY);
    res.json({
        token: token
    })
    
})

app.get("/depositAddress/:userId", async(req, res)=>{
    const userId=req.params.userId;
    const user=await prisma.binanceUsers.findUnique({
        where:{id: Number(userId)}
    })
    if(!user){
        res.json({
            message: "User not found"
        })
        return;
    }
    res.json({
        depositAddress: user.depositAddress
    })
})

app.post("/withdrawAddress", auth, async(req, res)=>{
    const {amount, toAddress, userId}= req.body;
    const user=await prisma.binanceUsers.findFirst({
        where:{id: userId}
    })
    if(!user){
        res.json({message:"No user found"});
        return;
    }
    //@ts-ignore
    if(amount>user.balance){
        res.json({message: "Insufficient Balance"});
        return;
    }
    (async()=>{
        const provider=new ethers.JsonRpcProvider(config.RPC_URL);
        const signer=new ethers.Wallet(config.HOT_WALLET_PRIVATE, provider);
        const txn=await signer.sendTransaction({
            to: toAddress,
            value: ethers.parseUnits(amount.toString(), 'ether')
        })
        if(!txn){
            console.log("Issue with transaction");
            return;
        }

        //storing details of successful transaction in new withdrawal model
        await prisma.withdrawalHotWallet.create({
            data:{
                id: userId,
                value: amount,
                withdrawalFromAddres: signer.address,
                userToAddress: toAddress,
                TransactionHash: txn.hash
            }
        })

        //updating original binance user model's balance
        await prisma.binanceUsers.update({
            where: {id: userId},
            data:{
                balance: {
                    decrement: amount
                }
            }
        })

        res.json({
            message: "Withdrawn Successfully",
            "transaction hash" : txn.hash,
            "Amount Withdrawed": amount
        })
    })();
})

app.listen(config.PORT)