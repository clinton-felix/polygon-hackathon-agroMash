import { ethers } from "ethers";
import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const AgriBusiness = ({ agriBusiness, provider, escrow, togglePop }) => {
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

          <div>
            <button className="agribusiness__buy">Invest</button>
          </div>
          <button className="agribusiness__contact">Contact Agent</button>
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
