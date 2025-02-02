import dotenv from "dotenv";
dotenv.config()

type config= Record<"MNEMONICS" | "SECRET_KEY" | "DATABASE_URL"| "PORT" | "RPC_URL" | "HOT_WALLET_PRIVATE"|"ENCRYPT_SECRET_KEY", string>

if (!process.env.SECRET_KEY || !process.env.MNEMONICS || !process.env.DATABASE_URL || !process.env.PORT || !process.env.RPC_URL || !process.env.HOT_WALLET_PRIVATE || !process.env.ENCRYPT_SECRET_KEY){
    throw new Error("Environment variables might be empty")
}

export const config: config={    
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    MNEMONICS: process.env.MNEMONICS,
    PORT: process.env.PORT,
    RPC_URL: process.env.RPC_URL,
    HOT_WALLET_PRIVATE: process.env.HOT_WALLET_PRIVATE,
    ENCRYPT_SECRET_KEY: process.env.ENCRYPT_SECRET_KEY
}