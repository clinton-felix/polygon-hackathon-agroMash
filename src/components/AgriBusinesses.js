import { ethers } from "ethers";
import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const AgriBusiness = ({
  agriBusiness,
  account,
  provider,
  escrow,
  togglePop,
}) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);
  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [owner, setOwner] = useState(null);

  const fetchDetails = async () => {
    // buyer
    const buyer = await escrow.buyer(agriBusiness.id);
    setBuyer(buyer);

    const hasBought = await escrow.approvalStatus(agriBusiness.id, buyer);
    setHasBought(hasBought);
    // -- seller
    const seller = await escrow.seller();
    setSeller(seller);

    const hasSold = await escrow.approvalStatus(agriBusiness.id, seller);
    setHasSold(hasSold);

    // -- lender
    const lender = await escrow.lender();
    setLender(lender);

    const hasLended = await escrow.approvalStatus(agriBusiness.id, lender);
    setHasLended(hasLended);

    // -- inspector
    const inspector = await escrow.inspector();
    setInspector(inspector);

    const hasInspected = await escrow.reviewPassed(agriBusiness.id, inspector);
    setHasInspected(hasInspected);
  };

  const fetchOwner = async () => {
    if (await escrow.isListed(agriBusiness.id)) return;
    const owner = await escrow.buyer(agriBusiness.id);
    setOwner(owner);
  };

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(agriBusiness.id);
    const signer = await provider.getSigner();

    // buyer deposits earnest
    let transaction = await escrow
      .connect(signer)
      .depositEarnest(agriBusiness.id, { value: escrowAmount });
    await transaction.wait();

    // Buyer Approves;
    transaction = await escrow.connect(signer).approvalSale(agriBusiness.id);
    await transaction.wait();

    setHasBought(true);
  };

  const inspectHandler = async () => {
    const signer = await provider.getSigner();

    // inspector update status
    const transaction = await escrow
      .connect(signer)
      .updateReviewStatus(agriBusiness.id, true);
    await transaction.wait();

    setHasInspected(true);
  };

  const lendHandler = async () => {
    const signer = await provider.getSigner();

    // lender approves..
    const transaction = await escrow
      .connect(signer)
      .approvalSale(agriBusiness.id);
    await transaction.wait();

    // lender sends funds to escrow contract
    const lendAmount =
      (await escrow.purchasePrice(agriBusiness.id)) -
      (await escrow.escrowAmount(agriBusiness.id));
    await signer.sendTransaction({
      to: escrow.address,
      value: lendAmount.toString(),
      gasLimit: 60000,
    });

    setHasLended(true);
  };

  const sellHandler = async () => {
    const signer = await provider.getSigner();

    // seller approves..
    let transaction = await escrow
      .connect(signer)
      .approvalSale(agriBusiness.id);
    await transaction.wait();

    // seller finalizes
    transaction = await escrow.connect(signer).finalizeSale(agriBusiness.id);
    await transaction.wait();

    setHasSold(true);
  };

  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="agribusiness">
      <div className="agribusiness__details">
        <div className="agribusiness__image">
          <img src={agriBusiness.image} alt="AgriBusiness" />
        </div>
        <div className="agribusiness__overview">
          <h1>{agriBusiness.name}</h1>
          <p>
            <strong>{agriBusiness.attributes[1].value}</strong> type |
            <strong>{agriBusiness.attributes[2].value}</strong> acres |
            <strong>{agriBusiness.attributes[4].value}</strong> units/yr
          </p>
          <p>{agriBusiness.address}</p>
          <h2>{agriBusiness.attributes[0].value * 768} MATIC</h2>
          {owner ? (
            <div className="agribusiness__owned">
              Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {account === inspector ? (
                <button
                  className="agribusiness__buy"
                  onClick={inspectHandler}
                  disabled={hasInspected}>
                  Approve Review
                </button>
              ) : account === lender ? (
                <button
                  className="agribusiness__buy"
                  onClick={lendHandler}
                  disabled={hasLended}>
                  Approve and Lend
                </button>
              ) : account === seller ? (
                <button
                  className="agribusiness__buy"
                  onClick={sellHandler}
                  disabled={hasSold}>
                  Approve and Sell
                </button>
              ) : (
                <button
                  className="agribusiness__buy"
                  onClick={buyHandler}
                  disabled={hasBought}>
                  Invest
                </button>
              )}

              <button className="agribusiness__contact">Contact Agent</button>
            </div>
          )}
          <hr />

          <h2>Farm Overview</h2>

          <p>{agriBusiness.description}</p>

          <hr />

          <h2> Facts and Features</h2>
          <ul>
            {agriBusiness.attributes.map((attribute, index) => (
              <li key={index}>
                <strong>{attribute.trait_type}</strong>: {attribute.value}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={togglePop} className="agribusiness__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default AgriBusiness;
