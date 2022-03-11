import * as anchor from "@project-serum/anchor";
import {
  TOKEN_METADATA_PROGRAM_ID,
  BASE_URI,
  ANTOURAGE_PROGRAM_ID,
  ANTOURAGE_CREATOR,
  DEVNET_COUNTER_PUBKEY,
} from "../utils/constants";
import { programs, Wallet } from "@metaplex/js";
import {
  getMasterEdition,
  getCounterAccount,
  getAntourageProgram,
  getProgramSignerCreator,
  constructBaseUri,
  deriveCounterAccount,
} from "../utils/utils";
import * as splToken from "@solana/spl-token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  CreateMasterEditionV3,
  MetadataData,
} from "@metaplex-foundation/mpl-token-metadata";

const { Metadata, MetadataDataData, CreateMetadata, Creator, UpdateMetadata } =
  programs.metadata;

const { TokenAccount } = programs.core;

const Transaction = programs.core.Transaction;

/*
Creates the mint account, token account, adds metadata account and master edition
*/
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
  const metadataPDA = await Metadata.getPDA(mint.publicKey);
  const editionAccount = await getMasterEdition(mint.publicKey);
  const [program_signer] = await getProgramSignerCreator();

  let ata = await splToken.Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always associated token program id
    TOKEN_PROGRAM_ID, // always token program id
    mint.publicKey, // mint
    dest_owner // token account authority,
  );

 
  let tx_mint = await loadBaseMint(fee_payer, lamports, mint, ata, dest_owner);
  let tx_metadata = await loadMetadata(connection, wallet,program_signer,fee_payer,metadataPDA, mint)
  let tx_master_edition = await loadMasterEdition(fee_payer,editionAccount,metadataPDA,mint);

  const tx = Transaction.fromCombined([tx_mint, tx_metadata, tx_master_edition]);

  return [mint, metadataPDA, tx, ata, editionAccount];
}

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

  return { redLionMint, redLionTokenAcc, redLionMetadataAcc };
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

  console.log("mint to use", golfMint.publicKey.toBase58());
  const program = await getAntourageProgram(wallet, connection);
  const [programPdaSigner, programSignerBump] = await getProgramSignerCreator();
  const { redLionMint, redLionTokenAcc, redLionMetadataAcc } =
    await loadRedLiontest();
  let [counter_account, counter_bump] =
    await deriveCounterAccount()
  let programTX = program.transaction.buyBall(counter_bump, programSignerBump, {
    accounts: {
      programPdaSigner: programPdaSigner,
      user: wallet.publicKey,
      redLionTokenAccount: redLionTokenAcc,
      redLionMintAccount: redLionMint,
      redLionMetadataAccount: redLionMetadataAcc,
      golfTokenAccount: ata,
      golfMintAccount: golfMint.publicKey,
      golfMasterEdition: golfMasterEdition,
      golfMetadataAccount: golfMetadata,
      counter: counter_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [],
  });

  let fullTX = Transaction.fromCombined([initTX, programTX]);

  let signature = await program.provider.send(fullTX, [golfMint]);

  console.log("signature", signature);
  return signature;
};



const loadMetadata = async (
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet,
  program_signer: anchor.web3.PublicKey,
  fee_payer: anchor.web3.PublicKey,
  metadataPDA: anchor.web3.PublicKey,
  mint: anchor.web3.Keypair
) => {
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

  return tx_metadata;
};

const loadMasterEdition = async (
  fee_payer: anchor.web3.PublicKey,
  editionAccount: anchor.web3.PublicKey,
  metadataPDA: anchor.web3.PublicKey,
  mint: anchor.web3.Keypair
) => {
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

  return masterEditionTx;
};

const loadBaseMint = async (
    fee_payer: anchor.web3.PublicKey,
    lamports: number,
    mint: anchor.web3.Keypair,
    ata: anchor.web3.PublicKey,
    dest_owner: anchor.web3.PublicKey
) => {

  const tx_mint = new Transaction({ feePayer: fee_payer });


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

    return tx_mint

}