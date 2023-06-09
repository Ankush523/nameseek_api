import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";

import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const MintNft: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getNftCount = useCallback(async () => {
    if (!walletState?.address || !web3Provider) return;
    const nftContract = new ethers.Contract(
      config.nft.address,
      config.nft.abi,
      web3Provider
    );
    const count = await nftContract.balanceOf(walletState?.address);
    console.log("count", Number(count));
    setNftCount(Number(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getNftCount();
  }, [getNftCount, walletState]);

  const mintNft = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      setLoading(true);
      let smartAccount = wallet;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      console.log("smartAccount.address ", smartAccount.address);
      const safeMintTx = await nftContract.populateTransaction.safeMint(
        smartAccount.address
      );
      console.log(safeMintTx.data);
      const tx1 = {
        to: config.nft.address,
        data: safeMintTx.data,
      };

      const txResponse = await smartAccount.sendTransaction({
        transaction: tx1,
      });
      console.log("Tx sent, userOpHash:", txResponse);
      console.log("Waiting for tx to be mined...");
      const txHash = await txResponse.wait();
      console.log("txHash", txHash);
      showSuccessMessage(
        `Minted Nft ${txHash.transactionHash}`,
        txHash.transactionHash
      );
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getNftCount();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Get API
      </p>

      <h3 className={classes.subTitle}>Mint Nft and Get an API key</h3>

      {/* <p style={{ marginBottom: 20 }}>
        This is an example gasless transaction to Mint Nft.
      </p> */}
      <p style={{ marginBottom: 20 }}>
        Click on the button below to generate a new API key for your new Smart Account.
      </p>
      {/* <p style={{ marginBottom: 30, marginTop: 30, fontSize: 24 }}>
        Nft Balance in SCW:{" "}
        {nftCount === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          nftCount
        )}
      </p> */}

      <Button title="Generate API Key" isLoading={loading} onClickFunc={mintNft} />
      <p className={classes.APITitle}  style={{ marginBottom: 10, marginTop: 30 }}> Your API KEY :</p>
      {nftCount === null || nftCount === 0 ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>Fetching... Click on Generate API Key above if not generated before</p>
        ) : (
          <p>{config.nft.address}{nftCount}</p>
        )
      }
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  APITitle: {
    color: "#FFB999",
    fontSize: 20,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
}));

export default MintNft;
