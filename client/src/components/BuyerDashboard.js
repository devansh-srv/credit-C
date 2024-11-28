import React, { useState, useEffect, useContext } from 'react';
import { getBuyerCredits, purchaseCredit, sellCreditApi, removeSaleCreditApi, getPurchasedCredits, generateCertificate, downloadCertificate } from '../api/api';
import { CC_Context } from "../context/SmartContractConnector.js";
import { ethers } from "ethers";


const BuyerDashboard = ({ onLogout }) => {
  const [availableCredits, setAvailableCredits] = useState([]);
  const [purchasedCredits, setPurchasedCredits] = useState([]);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  const {
    connectWallet,
    generateCredit,
    getCreditDetails,
    getNextCreditId,
    getPrice,
    sellCredit,
    removeFromSale,
    buyCredit,
    currentAccount
    // error 
  } = useContext(CC_Context);

  const fetchAllCredits = async () => {
    try {
      const [availableResponse, purchasedResponse] = await Promise.all([
        getBuyerCredits(),
        getPurchasedCredits()
      ]);

      const creditsWithSalePrice = purchasedResponse.data.map(credit => ({
        ...credit,
        salePrice: '', // Initialize salePrice if not present
      }));

      setPurchasedCredits(creditsWithSalePrice);
      setAvailableCredits(availableResponse.data);

      // setPurchasedCredits(purchasedResponse.data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setError('Failed to fetch credits. Please try again.');
    }
  };

  useEffect(() => {
    fetchAllCredits();
  }, []);

  const handleBuyCredit = async (creditId) => {
    try {
      setError(null);
      //NOTE: the -1 is temporary
      // const price = await getPrice();
      const credit = await getCreditDetails(creditId - 1);
      // Convert the price from wei to ether for the transaction
      const priceInEther = ethers.formatEther(credit.price);
      console.log("id, price: ", creditId - 1, priceInEther);
      await buyCredit(creditId - 1, priceInEther);
      await purchaseCredit({ credit_id: creditId, amount: 1 });
      await fetchAllCredits(); // Refresh both available and purchased credits
    } catch (error) {
      console.error('Failed to purchase credit:', error);
      setError('Failed to purchase credit. Please try again.');
    }
  };

  const handleGenerateCertificate = async (creditId) => {
    try {
      setError(null);
      const response = await generateCertificate(creditId);
      setCertificateData(response.data);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      setError('Failed to generate certificate. Please try again.');
    }
  };
  const handleDownloadCertificate = async (creditId) => {
    try {
      setError(null);
      const response = await downloadCertificate(creditId);
      const linksource = `data:application/pdf;base64,${response.data.pdf_base64}`;
      const downloadLink = document.createElement("a");
      const fileName = response.data.filename;
      downloadLink.href = linksource;
      downloadLink.download = fileName;
      downloadLink.click();

    } catch (error) {
      console.error("Failed to download Certificate: ", error);
      setError('Failed to download certificate. Please try again.');
    }
  }
  ///The code from here till return might be a little sketchy cause i dont know how it works mf
  const handleSellInput = (creditId) => {
    setPurchasedCredits((prevCredits) =>
      prevCredits.map((credit) =>
        credit.id === creditId ? { ...credit, showSellInput: !credit.showSellInput } : credit
      )
    );
  };

  const handlePriceChange = (creditId, price) => {
    setPurchasedCredits((prevCredits) =>
      prevCredits.map((credit) =>
        credit.id === creditId ? { ...credit, salePrice: price } : credit
      )
    );
  };

  const confirmSale = async (creditId) => {
    try {
      const updatedCredits = purchasedCredits.map((credit) =>
        credit.id === creditId
          ? { ...credit, is_active: true, showSellInput: false, salePrice: credit.salePrice || '' }
          : credit
      );
      setPurchasedCredits(updatedCredits);

      // Log the updated credit
      const updatedCredit = updatedCredits.find((credit) => credit.id === creditId);
      console.log(`Credit put on sale with price: ${updatedCredit.salePrice}`);

      // Call API to mark credit as on sale in the backend and contract
      await sellCredit(creditId - 1, updatedCredit.salePrice);
      const respose = await sellCreditApi({ credit_id: creditId, salePrice: updatedCredit.salePrice });
      console.log(respose);
      await fetchAllCredits();
    } catch (error) {
      console.error("Can't sale credit: ", error);
      setError('Failed to sell credit');
    }


  };

  const handleRemoveFromSale = async (creditId) => {
    try {
      setPurchasedCredits((prevCredits) =>
        prevCredits.map((credit) =>
          credit.id === creditId ? { ...credit, is_active: false, salePrice: null } : credit
        )
      );

      // Call API to remove the credit from sale in the backend
      await removeFromSale(creditId - 1);
      await removeSaleCreditApi({ credit_id: creditId })
      console.log(`Removed credit ID ${creditId} from sale`);
      await fetchAllCredits();
    } catch (error) {
      console.error("We shouldnt be getting error here T:T : ", error);
      setError('Failed to remove credit');
    }

  };


  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="py-5 px-4 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Buyer Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">View and purchase carbon credits</p>
      </div>

      {error && (
        <div className="py-3 px-4 text-red-700 bg-red-50">
          {error}
        </div>
      )}

      <div className="border-t border-gray-200">
        <dl>
          <div className="py-5 px-4 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Available Credits</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul className="rounded-md border border-gray-200 divide-y divide-gray-200">
                {availableCredits.map((credit) => (
                  <li key={credit.id} className="flex justify-between items-center py-3 pr-4 pl-3 text-sm">
                    <div className="flex flex-1 items-center w-0">
                      <span className="flex-1 ml-2 w-0 truncate">
                        {credit.name} - Amount: {credit.amount}, Price: ${credit.price}
                      </span>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleBuyCredit(credit.id)}
                        className="btn btn-secondary"
                        disabled={credit.amount <= 0}
                      >
                        {credit.amount > 0 ? 'Buy' : 'Out of Stock'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>

          <div className="py-5 px-4 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Purchased Credits</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {purchasedCredits.length > 0 ? (
                <ul className="rounded-md border border-gray-200 divide-y divide-gray-200">
                  {purchasedCredits.map((credit) => (
                    <li
                      key={credit.id}
                      className={`pl-3 pr-4 py-3 flex items-center justify-between text-sm ${credit.is_expired ? 'bg-[#D4EDDA]' : ''
                        }`}
                    >
                      <div className="flex flex-1 items-center w-0">
                        <span className="flex-1 ml-2 w-0 truncate">
                          {credit.name} - Amount: {credit.amount}, Price: ${credit.price}
                        </span>
                      </div>

                      <div className="flex-shrink-0 ml-4">
                        {credit.is_expired ? (
                          <>
                            <button
                              onClick={() => handleGenerateCertificate(credit.id)}
                              className="btn btn-secondary"
                            >
                              Generate Certificate
                            </button>
                            <button
                              onClick={() => handleDownloadCertificate(credit.id)}
                              className="btn btn-secondary"
                            >
                              Download Certificate
                            </button>
                          </>
                        ) : credit.is_active ? (
                          <button
                            onClick={() => handleRemoveFromSale(credit.id)}
                            className="py-1 px-3 text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Remove from Sale
                          </button>
                        ) : (
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleSellInput(credit.id)}
                              className="py-1 px-3 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                              Sell
                            </button>
                            {credit.showSellInput && (
                              <div className="mt-2">
                                <input
                                  type="number"
                                  placeholder="Enter price"
                                  className="p-1 rounded border"
                                  value={credit.salePrice || ''}
                                  onChange={(e) => handlePriceChange(credit.id, e.target.value)}
                                />
                                <button
                                  onClick={() => confirmSale(credit.id)}
                                  className="py-1 px-3 ml-2 text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                  Confirm
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No credits purchased yet.</p>
              )}



            </dd>
          </div>

          {certificateData && (
            <div className="py-5 px-4 mt-6 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Certificate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div
                  className="p-4 rounded-md border"
                  dangerouslySetInnerHTML={{ __html: certificateData.certificate_html }}
                />
              </dd>
            </div>
          )}
        </dl>
      </div>
      <div className="py-3 px-4 text-right bg-gray-50 sm:px-6">
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
};

export default BuyerDashboard;
