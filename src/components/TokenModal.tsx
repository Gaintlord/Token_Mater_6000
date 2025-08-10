import InputBox from "./InputBox";
import * as token from "@solana/spl-token";
import {
  useWallet,
  type WalletContextState,
} from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { useState } from "react";

const TokenModal = () => {
  async function CreateMintTrans(
    payer: WalletContextState | null,
    decimal: number
  ) {
    if (payer == null) {
      console.log("wallet not connected");
      return;
    }
    const connection: web3.Connection = new web3.Connection(
      "https://api.devnet.solana.com"
    );
    const lamports = await token.getMinimumBalanceForRentExemptAccount(
      connection
    );
    const accountKeypair = web3.Keypair.generate();
    const programId = token.TOKEN_PROGRAM_ID;

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        //@ts-ignore
        fromPubkey: payer.publicKey,
        newAccountPubkey: accountKeypair.publicKey,
        space: token.MINT_SIZE,
        lamports,
        programId,
      }),
      token.createInitializeMintInstruction(
        accountKeypair.publicKey,
        decimal,
        //@ts-ignore
        payer.publicKey,
        //@ts-ignore
        payer.publicKey,
        programId
      )
    );
    //@ts-ignore
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(accountKeypair);
    await payer.sendTransaction(transaction, connection);
    console.log(accountKeypair.publicKey.toBase58());

    const associateAccount = token.getAssociatedTokenAddressSync(
      accountKeypair.publicKey,
      //@ts-ignore
      payer.publicKey,
      false,
      programId,
      token.ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(
      `#####################${associateAccount.toBase58()}###########3`
    );

    const transaction2 = new web3.Transaction().add(
      token.createAssociatedTokenAccountInstruction(
        //@ts-ignore
        payer.publicKey,
        associateAccount,
        payer.publicKey,
        accountKeypair.publicKey,
        programId,
        token.ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    //@ts-ignore
    transaction2.feePayer = payer.publicKey;
    transaction2.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    try {
      await payer.sendTransaction(transaction2, connection);
    } catch (e) {
      console.log(e);
    }

    console.log(
      `###############assocoate account created and and paid for by you #############`
    );

    const transaction3 = new web3.Transaction().add(
      token.createMintToInstruction(
        accountKeypair.publicKey,
        associateAccount,
        //@ts-ignore
        payer.publicKey,
        10e9 * 100000000,
        [],
        programId
      )
    );
    //@ts-ignore
    transaction3.feePayer = payer.publicKey;
    transaction3.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    await payer.sendTransaction(transaction3, connection);
    console.log("########## Minted To Your address ###############");
  }

  const [name, setName] = useState();
  const [Symbol, setSymbol] = useState();
  const [decimal, setDecimal] = useState();
  console.log(name);
  console.log(Symbol);
  console.log(decimal);
  const wallet = useWallet();

  return (
    <>
      <div className="  bg-white justify-center w-1/4 h-2/3 rounded-xl">
        <div className="m-2 ">
          <InputBox
            type="text"
            placeholder="Name"
            setValue={setName}
            autocap="off"
          ></InputBox>
          <InputBox
            type="text"
            placeholder="SYMBOL"
            setValue={setSymbol}
            autocap="on"
          ></InputBox>
          <InputBox
            type="number"
            placeholder="DECIMAL"
            setValue={setDecimal}
            autocap="off"
          ></InputBox>
        </div>
        <div className="justify-center flex">
          <button
            onClick={() => CreateMintTrans(wallet, 9)}
            className="bg-green-300 rounded-md w-2/3 h-12 text-blue-600 font-bold text-3xl "
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
};

export default TokenModal;
