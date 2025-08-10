import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import TokenModal from "./components/TokenModal";

const App = () => {
  return (
    <>
      <div className="w-screen h-screen bg-gray-200">
        <div className="flex h-full justify-center items-center">
          <ConnectionProvider endpoint="https://api.devnet.solana.com">
            <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
                <div className="absolute left-2 top-2">
                  <WalletMultiButton></WalletMultiButton>
                </div>
                <div className="absolute right-2 top-2">
                  <WalletDisconnectButton></WalletDisconnectButton>
                </div>
                <TokenModal></TokenModal>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </div>
      </div>
    </>
  );
};

export default App;
