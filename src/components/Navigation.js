import logo from "../assets/logo.svg";
import { useMoralis } from "react-moralis";
import { useEffect } from "react";

const Navigation = ({ account, setAccount }) => {
  //   const {
  //     enableWeb3,
  //     account,
  //     isWeb3Enabled,
  //     Moralis,
  //     deactivateWeb3,
  //     isWeb3EnableLoading,
  //   } = useMoralis();

  //   // use effect that checks to see if we are disconnected
  //   // and if we are, prompts for a connection
  //   useEffect(() => {
  //     // check if the browser is already connected, and return if True
  //     if (isWeb3Enabled) return;
  //     if (typeof window !== undefined) {
  //       if (window.localStorage.getItem("connected")) {
  //         enableWeb3();
  //       }
  //     }
  //   }, [isWeb3Enabled]);

  //   // useEffect here will check to see if we are connected and
  //   useEffect(() => {
  //     Moralis.onAccountChanged((account) => {
  //       console.log(`Account changed to ${account}`);
  //       // if account == nul, we assume they have disconnected
  //       if (account == null) {
  //         window.localStorage.removeItem("connected");
  //         deactivateWeb3();
  //         console.log("Null account found");
  //       }
  //     });
  //   }, []);

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    console.log(accounts[0]); // reading from the state
  };
  return (
    <nav>
      <ul className="nav__links">
        <li>
          <a href="#">Buy</a>
        </li>
        <li>
          <a href="#">Rent</a>
        </li>
        <li>
          <a href="#">Sell</a>
        </li>
      </ul>

      <div className="nav__brand">
        <img src={logo} alt="AgroMash" />
        <h1>AgroMash</h1>
      </div>

      {/* {account ? (
        <div>
          Connected to: {account.slice(0, 6)}....
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          className="nav__connect"
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
      )} */}
      {account ? (
        <button type="button" className="nav__connect">
          {account.slice(0, 6) + "..." + account.slice(38, 42)}
        </button>
      ) : (
        <button type="button" className="nav__connect" onClick={connectHandler}>
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navigation;
