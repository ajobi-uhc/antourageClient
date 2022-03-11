
import * as anchor from "@project-serum/anchor";
import {
  TOKEN_METADATA_PROGRAM_ID,
  BASE_URI,
  ANTOURAGE_PROGRAM_ID,
  ANTOURAGE_CREATOR,
  DEVNET_COUNTER_PUBKEY,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
} from "./constants";
import { programs, Wallet } from "@metaplex/js";
import myIdl from "../utils/antourage.json";
import * as splToken from "@solana/spl-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { CreateMasterEditionV3, MetadataData } from "@metaplex-foundation/mpl-token-metadata";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";




export const loadRedLiontest = async () => {
    let redLionMint = new anchor.web3.PublicKey(
    "9Ws9gSV9v9oxQjc8RjSJG9UJbVzU2FUmaBhYc7mx6PH5"
  );
  let redLionTokenAcc = new anchor.web3.PublicKey(
    "2891V2b9eEhEaGJBuu8Q8cvacBJ9PBzpVRMWgZ1v6VrT"
  );
  let [redLionMetadataAcc, bumpMetadata] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        redLionMint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    return {redLionMint, redLionTokenAcc, redLionMetadataAcc}
}
export const getMasterEdition = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
};
  
export const getMetadata = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
};

export const getTokenWallet = async (
    wallet: anchor.web3.PublicKey,
    mint: anchor.web3.PublicKey
  ) => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )
    )[0];
};
  
export const shortenAddress = (address: string, chars = 4): string => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
  
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


export const getCounterAccount = async ( connection:anchor.web3.Connection,
    wallet:anchor.Wallet ) => {
      let program = await getAntourageProgram(wallet, connection);
      let counter = await program.account.counter.fetch(DEVNET_COUNTER_PUBKEY);
      return counter;
}

export const getAntourageProgram = async (
    wallet: Wallet,
    connection: anchor.web3.Connection
  ) => {
    const provider = new anchor.Provider(connection, wallet, {
      preflightCommitment: "recent",
    });
  
    //@ts-ignore
    return new anchor.Program(myIdl, ANTOURAGE_PROGRAM_ID, provider);
};

export const deriveCounterAccount = async ( ) => {
    let [counter_account, counter_bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("counter")],
        ANTOURAGE_PROGRAM_ID
      );
  
    return [counter_account, counter_bump];
}

export const constructBaseUri = async (
    connection: anchor.web3.Connection,
    wallet: anchor.Wallet
  ) => {
    let counter = await getCounterAccount(connection,wallet);
    //@ts-ignore
    let newIndex = counter.currentCount++;
    let addString = `${newIndex}` + ".json";
    let fullBase = BASE_URI.concat(addString);
    return fullBase;
};

export const getProgramSignerCreator = async (): Promise<
  [anchor.web3.PublicKey, number]
> => {
  let [program_signer_pubkey, signer_bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("creator")],
      ANTOURAGE_PROGRAM_ID
    );

  return [program_signer_pubkey, signer_bump];
};


export const signArbitraryMessage = async (
    wallet: anchor.Wallet
  ): Promise<any> => {
    const msg = "arbitrary message to verify wallet";
    const encodedMsg = decodeUTF8(msg);
    // @ts-ignore
    const signature = await window.solana.signMessage(encodedMsg, "utf8");
    console.log("signature: ", signature);
    const pubkey = signature.publicKey.toBase58().toString();
  
    const response = {
      pubkey: pubkey,
      signature: signature,
      message: msg,
    };
  
    if (signature) {
      console.log(response);
      return response;
    } else {
      return undefined;
    }
  };
  