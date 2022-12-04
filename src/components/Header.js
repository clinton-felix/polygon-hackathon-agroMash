import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
  //**  Header Connect Button Navbar **/
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  // use effect that checks to see if we are disconnected
  // and if we are, prompts for a connection
  useEffect(() => {
    // check if the browser is already connected, and return if True
    if (isWeb3Enabled) return;
    if (typeof window !== undefined) {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  // useEffect here will check to see if we are connected and
  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      // if account == nul, we assume they have disconnected
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null account found");
      }
    });
  }, []);
  return (
    <div>
      {account ? (
        <div>
          Connected to: {account.slice(0, 6)}....
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            // enable the web3 connection on click of the button
            // store a memory tracker in local storage so that the dapp remembers that user is connected
            await enableWeb3();
            if (typeof window !== undefined) {
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}>
          Connect
        </button>
      )}
    </div>
  );
}
