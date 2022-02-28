import * as anchor from "@project-serum/anchor";
import {
  TOKEN_METADATA_PROGRAM_ID,
  BASE_URI,
  ANTOURAGE_PROGRAM_ID,
  ANTOURAGE_CREATOR,
  DEVNET_COUNTER_PUBKEY,
} from "./constants";
import { programs, Wallet } from "@metaplex/js";
import myIdl from "./antourage.json";
import * as splToken from "@solana/spl-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { CreateMasterEditionV3 } from "@metaplex-foundation/mpl-token-metadata";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";
import { updateMetadata } from "@metaplex/js/lib/actions";

const { Metadata, MetadataDataData, CreateMetadata, Creator, UpdateMetadata } =
  programs.metadata;

const Transaction = programs.core.Transaction;


const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

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

export const awaitTransactionSignatureConfirmation = async (
  txid: anchor.web3.TransactionSignature,
  timeout: number,
  connection: anchor.web3.Connection,
  commitment: anchor.web3.Commitment = "recent",
  queryStatus = false
): Promise<anchor.web3.SignatureStatus | null | void> => {
  let done = false;
  let status: anchor.web3.SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log("Rejecting for timeout...");
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result: any, context: any) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            console.log("Rejected via websocket", result.err);
            reject(status);
          } else {
            console.log("Resolved via websocket", result);
            resolve(status);
          }
        },
        commitment
      );
    } catch (e) {
      done = true;
      console.error("WS error in setup", txid, e);
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              console.log("REST null result for", txid, status);
            } else if (status.err) {
              console.log("REST error for", txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log("REST no confirmations for", txid, status);
            } else {
              console.log("REST confirmation for", txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log("REST connection error: txid", txid, e);
          }
        }
      })();
      await sleep(2000);
    }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId]) {
    connection.removeSignatureListener(subId);
  }
  done = true;
  console.log("Returning status", status);
  return status;
};

const getMasterEdition = async (
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

const getMetadata = async (
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

const getTokenWallet = async (
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

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function createMint(
  wallet: anchor.Wallet,
  connection: anchor.web3.Connection,
  fee_payer: anchor.web3.PublicKey,
  dest_owner: anchor.web3.PublicKey,
  lamports: any
): Promise<
  [
    anchor.web3.Keypair,
    anchor.web3.PublicKey,
    programs.core.Transaction,
    anchor.web3.PublicKey,
    anchor.web3.PublicKey
  ]
> {
  const mint = anchor.web3.Keypair.generate();
  console.log(`https://solscan.io/token/${mint.publicKey.toString()}`);
  const tx_mint = new Transaction({ feePayer: fee_payer });
  const metadataPDA = await Metadata.getPDA(mint.publicKey);
  const editionAccount = await getMasterEdition(mint.publicKey);
  const [program_signer] = await getProgramSignerCreator();

  let ata = await splToken.Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always associated token program id
    TOKEN_PROGRAM_ID, // always token program id
    mint.publicKey, // mint
    dest_owner // token account authority,
  );

  tx_mint.add(
    // create mint
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: fee_payer,
      newAccountPubkey: mint.publicKey,
      space: MintLayout.span,
      lamports: lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    splToken.Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      0,
      fee_payer,
      fee_payer
    ),
    // create token account
    splToken.Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      ata,
      dest_owner,
      fee_payer
    ),
    // mint to token account
    splToken.Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      ata,
      fee_payer,
      [],
      1
    )
  );

  let json_url = await constructBaseUri(connection, wallet);

  const metadataData = new MetadataDataData({
    name: "whocares",
    symbol: "YUP",
    uri: json_url,
    sellerFeeBasisPoints: 720,
    creators: [
      new Creator({
        address: program_signer.toString(),
        verified: false,
        share: 0,
      }),
      new Creator({
        address: fee_payer.toString(),
        verified: false,
        share: 100,
      }),
    ],
  });

  console.log("program signer", program_signer.toBase58());


  const tx_metadata = new CreateMetadata(
    {
      feePayer: fee_payer,
    },
    {
      metadata: metadataPDA,
      metadataData,
      updateAuthority: fee_payer,
      mint: mint.publicKey,
      mintAuthority: fee_payer,
    }
  );

  const masterEditionTx = new CreateMasterEditionV3(
    { feePayer: fee_payer },
    {
      edition: editionAccount,
      metadata: metadataPDA,
      updateAuthority: fee_payer,
      mint: mint.publicKey,
      mintAuthority: fee_payer,
    }
  );

  const tx = Transaction.fromCombined([
    tx_mint,
    tx_metadata,
    masterEditionTx,
  ]);

  return [mint, metadataPDA, tx, ata, editionAccount];
}

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

export const getCounterAccount = async ( connection:anchor.web3.Connection,
  wallet:anchor.Wallet ) => {
    let program = await getAntourageProgram(wallet, connection);
    let counter = await program.account.counter.fetch(DEVNET_COUNTER_PUBKEY);
    return counter;
  }

const deriveCounterAccount = async ( ) => {
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

export const fullSend = async (
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet
) => {
  const lamports = await splToken.Token.getMinBalanceRentForExemptMint(
    connection
  );
  let [golfMint, golfMetadata, initTX, ata, golfMasterEdition] =
  await createMint(
    wallet,
    connection,
    wallet.publicKey,
    wallet.publicKey,
    lamports
  );

  console.log("mint to use", golfMint.publicKey.toBase58())
  console.log("token account to use", golfMetadata.toBase58());

  const program = await getAntourageProgram(wallet,connection);
  const [programPdaSigner, programSignerBump] = await getProgramSignerCreator();
  const {redLionMint, redLionTokenAcc, redLionMetadataAcc} = await loadRedLiontest();
  let [counter_account, counter_bump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("counter")],
      ANTOURAGE_PROGRAM_ID
    );
  let programTX = program.transaction.buyBall(counter_bump, programSignerBump, {
    accounts:{

      programPdaSigner:programPdaSigner,
      user:wallet.publicKey,
      redLionTokenAccount:redLionTokenAcc,
      redLionMintAccount:redLionMint,
      redLionMetadataAccount:redLionMetadataAcc,
      golfTokenAccount:ata,
      golfMintAccount:golfMint.publicKey,
      golfMasterEdition:golfMasterEdition,
      golfMetadataAccount:golfMetadata,
      counter:counter_account,
      tokenProgram:TOKEN_PROGRAM_ID,
      tokenMetadataProgram:TOKEN_METADATA_PROGRAM_ID,
      systemProgram:anchor.web3.SystemProgram.programId

    },
    signers:[]
  })

  let fullTX = Transaction.fromCombined([initTX,programTX])

  let signature = await program.provider.send(fullTX,[golfMint]);

  console.log("signature", signature)
  return signature


};


const loadRedLiontest = async () => {
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