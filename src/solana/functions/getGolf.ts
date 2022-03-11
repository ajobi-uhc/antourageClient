import * as anchor from "@project-serum/anchor";
import { programs, Wallet } from "@metaplex/js";
import { getMetadata } from "../utils/utils";
import { UPDATE_AUTHORITY } from "../utils/constants";

const {
  Metadata,
  MetadataData,
  MetadataDataData,
  CreateMetadata,
  Creator,
  UpdateMetadata,
} = programs.metadata;

const { TokenAccount } = programs.core;



/*
Get all nfts from user, 
get metadata, filter by update auth,
return metadata uri and mint of correct update auth

@param rpc connection object
@param user wallet

*/
export const getGolfBalls = async (
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet
) => {
  let eluuneNft = [];
  try {
    const accountsUser = await TokenAccount.getTokenAccountsByOwner(
      connection,
      wallet.publicKey
    );

    let potentialNftAccounts = accountsUser.filter(
      (account) => account.data.amount.toNumber() === 1
    );
    let nftMetadataAddresses: Array<anchor.web3.PublicKey> = [];
    for (let potentialNftAccount of potentialNftAccounts) {

      nftMetadataAddresses.push(
        await getMetadata(potentialNftAccount.data.mint)
      );
    }
    let nftAcinfo = await connection.getMultipleAccountsInfo(
      nftMetadataAddresses,
      "processed"
    );


    for (let info of nftAcinfo) {
      if (!info) {
        continue;
      }
      let accountMetaData = MetadataData.deserialize(info.data);
      if (
        accountMetaData.updateAuthority !==
        UPDATE_AUTHORITY.toString()
      ) {
        continue;
      }
      eluuneNft.push({
        mint: accountMetaData.mint,
        uri: accountMetaData.data.uri,
      });

    }
  } catch (err) {
    console.log(" you dont have any eyes");
  }
  return eluuneNft;
};


