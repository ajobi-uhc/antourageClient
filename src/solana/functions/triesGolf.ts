import * as anchor from "@project-serum/anchor"

export const triesGolf = async (mint:anchor.web3.PublicKey) => {
    let triesLeft = await (await fetch("http://localhost:4001/golf/info" + `${mint.toString()}`)).json();
    return triesLeft
}
  