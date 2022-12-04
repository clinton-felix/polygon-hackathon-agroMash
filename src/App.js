import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import AgriBusiness from "./components/AgriBusinesses";

// ABIs
import AgroMash from "./abis/AgroMash.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  const [escrow, setEscrow] = useState(null);
  const [agriBusinesses, setAgriBusinesses] = useState([]);
  const [agriBusiness, setAgriBusiness] = useState([]);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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

    setAgriBusinesses(agriBusinesses);

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

  const togglePop = (agriBusiness) => {
    setAgriBusiness(agriBusiness);
    toggle ? setToggle(false) : setToggle(true);
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Agri-Businesses For You</h3>
        <hr />
        <div className="cards">
          {agriBusinesses.map((agriBusiness, index) => (
            <div
              className="card"
              key={index}
              onClick={() => togglePop(agriBusiness)}>
              <div className="card__image">
                <img src={agriBusiness.image} alt="AgriBusiness" />
              </div>
              <div className="card__info">
                <h4>{agriBusiness.attributes[0].value * 768} MATIC</h4>
                <p>
                  <strong>{agriBusiness.attributes[1].value}</strong> type |
                  <strong>{agriBusiness.attributes[2].value}</strong> acres |
                  <strong>{agriBusiness.attributes[4].value}</strong> units
                </p>
                <h5> {agriBusiness.name}</h5>
                <p> {agriBusiness.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toggle && (
        <AgriBusiness
          agriBusiness={agriBusiness}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
