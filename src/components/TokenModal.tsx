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
    decimal: number,
    Tokenamount: number
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

    transaction.add(
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

    console.log(
      `###############assocoate account created and and paid for by you #############`
    );

    transaction.add(
      token.createMintToInstruction(
        accountKeypair.publicKey,
        associateAccount,
        //@ts-ignore
        payer.publicKey,
        Tokenamount * 100000000,
        [],
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
    console.log("########## Minted To Your address ###############");
  }

  const [name, setName] = useState();
  const [Symbol, setSymbol] = useState();
  const [decimal, setDecimal] = useState(9);
  const [circulation, setCirculation] = useState(10e9);

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
          <InputBox
            type="number"
            placeholder="Circulation"
            setValue={setCirculation}
            autocap="off"
          ></InputBox>
        </div>
        <div className="justify-center flex">
          <button
            onClick={() => CreateMintTrans(wallet, 9, circulation)}
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
