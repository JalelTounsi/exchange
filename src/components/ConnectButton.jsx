import React from "react";
import PageButton from "./PageButton.jsx";
const ConnectButton = (props) => {
  const { isConnected, signerAddress, getSigner, provider } = props;
  const displayAddress = `${signerAddress?.substring(0, 10)}...`;
  return (
    <>
      {isConnected() ? (
        <div className="buttonContainer">
          <PageButton name={displayAddress} />
        </div>
      ) : (
        <div className="my-2 connectButton" onClick={() => getSigner(provider)}>
          Connect Wallet
        </div>
      )}
    </>
  );
};

export default ConnectButton;
