import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import AgroMash from "./abis/AgroMash.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const loadBlockchainData = async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    // set network
    const network = await provider.getNetwork();
    const agroMash = new ethers.Contract(
      config[network.chainId].agroMash.address,
      AgroMash,
      provider
    );

    const totalSupply = await agroMash.totalSupply();
    const agriBusinesses = [];

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await agroMash.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      agriBusinesses.push(metadata);
    }

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    // handle account change
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Agri-Businesses for You</h3>
        <hr />
        <div className="cards">
          <div className="card">
            <div className="card__image">
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h4>1 ETH</h4>
              <p>
                <strong>1</strong> type |<strong>2</strong> size |
                <strong>3</strong> output
              </p>
              <p> Plantain Plantation, Mbaise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
