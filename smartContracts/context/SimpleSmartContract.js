'use client'
import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// INTERNAL IMPORTS
import { CC_ABI, CC_ADDRESS } from "./constants";

// FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(CC_ADDRESS, CC_ABI, signerOrProvider);

export const CC_Context = React.createContext();

export const CCProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [error, setError] = useState(null);

    const generateCredit = async (amount, price) => {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        try{
            const transaction = await contract.generateCredit(amount, price);
            await transaction.wait();
            console.log("credit generated!", transaction);
        }
        catch (error){
            console.log("Error generating credit: ", error);
        }
    };

    const sellCredit = async (creditId, price) => {
        try{
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const transaction = await contract.sellCredit(creditId, price);
            await transaction.wait();
            console.log("credit listed for sale!", transaction);
        }
        catch (error){
            console.log("Error listing for sale: ", error);
        }
    };

    const buyCredit = async (creditId, price) => {
        try{
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const transaction = await contract.buyCredit(creditId,
                 {value: ethers.utils.parseUnits(price.toString(), 'ethers')}
                );
            await transaction.wait();
            console.log("credit purchased!", transaction);
        }
        catch (error){
            console.log("Error purchasing credit: ", error);
        }
    };
    
    const removeFromSale = async (creditId) => {
        try {
          const web3Modal = new Web3Modal();
          const connection = await web3Modal.connect();
      
          const provider = new ethers.providers.Web3Provider(connection);
          const signer = provider.getSigner();
          const contract = fetchContract(signer);
      
          const transaction = await contract.removeFromSale(creditId);
          await transaction.wait();
          console.log('Credit removed from sale');
        } catch (error) {
          console.error('Error removing credit from sale:', error);
        }
    };

    const isExpired = async (creditId) => {
        try {
          const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
          const contract = fetchContract(provider);
      
          const expired = await contract.isExpired(creditId);
          return expired;
        } catch (error) {
          console.error('Error checking expiry:', error);
        }
    };

    const getOwner = async (creditId) => {
        try{
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const owner = await contract.getOwner(creditId);
            return owner;
        }
        catch (error){
            console.log('Cant find owner: ', error);
        }
    }
    
    const checkIfWalletIsConnected = async () => {
        try {
          if (!window.ethereum) {
            setError('Install Metamask');
            return;
          }
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length) {
            setCurrentAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
    };
    
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
            setError('Install Metamask');
            return;
            }
            const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };
    
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);
    
    return (
        <CarbonCreditContext.Provider
          value={{
            currentAccount,
            connectWallet,
            generateCredit,
            sellCredit,
            buyCredit,
            removeFromSale,
            getCredits,
            isExpired,
            error,
          }}
        >
          {children}
        </CarbonCreditContext.Provider>
    );

}