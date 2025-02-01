import { config } from "dotenv";
config();
export const phrase = process.env.MNEMONICS
export const bufferBlocks = 2
export const pastBlocksToIndex = 10