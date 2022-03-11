import * as anchor from "@project-serum/anchor"
import { signArbitraryMessage } from "../utils/utils";
import * as axios from 'axios'
export const playGolf = async (wallet:anchor.Wallet, mint: anchor.web3.PublicKey) => {
    //run fetch to server and get response
        if (wallet) {
  
          // wallet signs message => returns trx details
          // call backend to verify signature
          const trx = await signArbitraryMessage(wallet as anchor.Wallet)
          //console.log('trx = ', trx)
  
          const pubkey = trx.pubkey;
            console.log('pubkey: ', pubkey);
          const sig = trx.signature;
            console.log('sig: ', sig.signature);
          const msg = trx.message;
            console.log('msg: ', msg);
     
  
          const route = `http://localhost:4001/golf/play/${mint.toString()}`
          console.log("route", route)
        
          const payload = {
            mint:mint.toString(),
            user:pubkey,
            signedMsg:msg,
            signature:sig
          }
          // verify User on backend 
          // verified = boolean verified user?
          const verified = await axios.default.post
          (
              `http://localhost:4001/golf/play/${mint.toString()}`, 
                payload
          )
          console.log('verified? = ', verified)
  
        }
}