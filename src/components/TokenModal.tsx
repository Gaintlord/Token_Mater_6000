import InputBox from "./InputBox";
import * as token from "@solana/spl-token";
import {
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  useConnection,
  useWallet,
  type WalletContextState,
} from "@solana/wallet-adapter-react";

import {
  SystemProgram,
  Transaction,
  type Connection,
  Keypair,
} from "@solana/web3.js";
import { pack, type TokenMetadata } from "@solana/spl-token-metadata";
import { useState } from "react";

const TokenModal = () => {
  async function CreateMintTrans(
    wallet: WalletContextState | null,
    decimal: number,
    connection: Connection,
    Tokenamount: number,
    name: string,
    symbol: string
  ) {
    if (wallet?.publicKey == null) {
      console.log("wallet not connected");
      return;
    }

    const mintKeyPair = Keypair.generate();

    const metaData: TokenMetadata = {
      mint: mintKeyPair.publicKey,
      name: name,
      symbol: symbol,
      uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
      additionalMetadata: [],
    };

    const metaDataSize =
      token.TYPE_SIZE + token.LENGTH_SIZE + pack(metaData).length;
    //size of type +  size of actual data + realmetadata

    const newMintsizeWAddedData = token.getMintLen([
      token.ExtensionType.MetadataPointer,
    ]);
    console.log(newMintsizeWAddedData);

    const neededLamport = await connection.getMinimumBalanceForRentExemption(
      newMintsizeWAddedData + metaDataSize
    );

    console.log(neededLamport);

    const tx = new Transaction();
    const createAccont = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeyPair.publicKey,
      space: newMintsizeWAddedData,
      lamports: neededLamport,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    console.log("1");
    const creatingMedaDataPointer =
      token.createInitializeMetadataPointerInstruction(
        mintKeyPair.publicKey,
        wallet.publicKey,
        mintKeyPair.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
    const createMetaDataAccount = token.createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mintKeyPair.publicKey,
      metadata: mintKeyPair.publicKey,
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
      mintAuthority: wallet.publicKey,
      updateAuthority: wallet.publicKey,
    });

    console.log("2");

    const mintInstruction = token.createInitializeMintInstruction(
      mintKeyPair.publicKey,
      decimal,
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_2022_PROGRAM_ID
    );
    // make a new associateToken adress
    const associateToken = await token.getAssociatedTokenAddress(
      mintKeyPair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log("3");
    const creatATAonChain = await token.createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      associateToken,
      wallet.publicKey,
      mintKeyPair.publicKey,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("4");
    const mintingInstruction = token.createMintToInstruction(
      mintKeyPair.publicKey,
      associateToken,
      wallet.publicKey,
      circulation * 10 ** decimal,
      [],
      TOKEN_2022_PROGRAM_ID
    );

    console.log("5");
    tx.add(
      createAccont,
      creatingMedaDataPointer,
      mintInstruction,
      createMetaDataAccount,
      creatATAonChain,
      mintingInstruction
    );

    console.log("6");
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.partialSign(mintKeyPair);
    await wallet.sendTransaction(tx, connection);

    console.log("mintaddress", mintKeyPair.publicKey.toBase58());

    console.log(`##########  ${associateToken}   ############`);
    console.log(`${circulation} ${name} Minted and are in circulation`);

    //
  }

  const [tokenName, setName] = useState("SHERCOIN");
  const [tokenSymbol, setSymbol] = useState("SHRC");
  const [decimal, setDecimal] = useState(9);
  const [circulation, setCirculation] = useState(10e8);
  const [Icon, setIcon] = useState("");

  const wallet = useWallet();
  const { connection } = useConnection();

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
        <div>
          <input type="file" accept="image?*"></input>
        </div>
        <div className="justify-center flex">
          <button
            onClick={() =>
              CreateMintTrans(
                wallet,
                decimal,
                connection,
                circulation,
                tokenName,
                tokenSymbol
              )
            }
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
