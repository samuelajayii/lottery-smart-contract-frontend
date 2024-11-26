/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAccount } from "./context/context";
import abi from "./abi/abi.json";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Web3 from 'web3';

const Interactions = () => {

    const { account, isOwner, setIsOwner } = useAccount();
    const [donationAmount, setDonationAmount] = useState("");
    const [sponsorName, setSponsorName] = useState("");
    const [reqId, setreqId] = useState("")
    const [requestStatus, setRequestStatus] = useState("");
    const [lastReqId, setLastReqId] = useState(null)

    const contractAddress = "0xCe885CBE3876D3f6F939359f6e1C06bBF1Fc8c32";

    // Web3 instance for Infura (read-only)
    const web3Infura = new Web3(new Web3.providers.HttpProvider("https://sepolia.infura.io/v3/6c9dab15de64404489e4780952f9d9f0"));
    // Lottery contract instance for Infura (read-only)
    const lotteryContractInfura = new web3Infura.eth.Contract(abi, contractAddress);

    // Web3 instance for MetaMask (sign transactions)
    const web3MetaMask = new Web3(window.ethereum);
    const lotteryContractMetaMask = new web3MetaMask.eth.Contract(abi, contractAddress);

    useEffect(() => {
        const fetchOwnership = async () => {
            try {
                // Fetch the owner address
                const ownerAddress = await lotteryContractInfura.methods.owner().call();

                // Check if the current connected account matches the owner
                if (account && ownerAddress.toLowerCase() === account.toLowerCase()) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
            } catch (error) {
                console.error("Error fetching owner information:", error);
                setIsOwner(false);
            }
        };

        if (account) {
            fetchOwnership();
        }
    }, [account]);


    const getLastReqId = async () => {
        try {
            const data = await lotteryContractInfura.methods.lastRequestId().call();
            setLastReqId(data)
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }


    const getreqStatus = async (e) => {
        e.preventDefault();

        if (!reqId) {
            toast.info("Please fill in both fields.");
            return;
        }

        // Directly pass reqId as a string (assuming the contract expects it as a string)
        const id = reqId.trim(); // Remove any unwanted spaces

        // Ensure the reqId is not empty and is a valid string format
        if (!id || !/^\d+$/.test(id)) {  // Check if the ID is a string of digits
            toast.error("Please provide a valid request ID.", { position: 'top-center' });
            return;
        }

        try {
            const data = await lotteryContractInfura.methods.getRequestStatus(id).call();
            setRequestStatus(data);
            console.log(data)
            toast.success('Request Status Retrieved Successfully', { position: 'top-center' });
            setreqId("");  // Clear the input after success
        } catch (error) {
            toast.error(error.message, { position: 'top-center' });
        }
    };



    const sponsorForm = async (e) => {
        e.preventDefault();

        if (!account) {
            alert("Connect to MetaMask first.");
            return;
        }

        if (!sponsorName || !donationAmount) {
            toast.info("Please fill in both fields.", { position: 'top-center' });
            return;
        }

        try {
            const amountInWei = web3MetaMask.utils.toWei(donationAmount, "ether");

            // Call the sponsorDonation method of the contract
            const tx = await lotteryContractMetaMask.methods
                .sponsorDonation(sponsorName)  // You need to pass the amount too
                .send({ from: account, value: amountInWei });

            // On success
            toast.success("Donation Successful", { position: 'top-center' })
            console.log("Transaction Hash: ", tx.transactionHash);

            setSponsorName("");
            setDonationAmount("");
        } catch (error) {
            // On failure
            console.error("Donation failed:", error);
            toast.error(error.message, { position: 'top-center' })
        }
    }


    return (
        <div className='items-center text-center justify-center flex flex-col mt-2'>
            <h1 className='underline text-3xl mb-2'>Interactions</h1>

            <div className='my-4'>
                <form onSubmit={sponsorForm} className='flex flex-col w-[70vw] border px-8 p-4 rounded shadow'>
                    <label className='text-lg my-1 font-semibold'>Sponsor</label>
                    <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} type='text' placeholder='Sponsor Name' className=' rounded py-2 px-4  outline-none border border-black'></input>
                    <label className='text-lg my-1 font-semibold'>Donation Amount (ETH)</label>
                    <input type='number' placeholder='Donation Amount' value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className='rounded py-2 px-4 outline-none border border-black'
                    />
                    <button
                        type='submit' className='border rounded border-black mt-3 py-1 px-3 text-white bg-blue-500 text-white"'>Send Transaction</button>
                </form>
            </div>

            <div className='my-4 flex flex-col w-[70vw] border px-8 p-4 rounded shadow text-center h-fit'>
                <h1>Last Request ID</h1>
                <p>Copy and paste into the request status tab to check the last random number that was generated by the Chainlink VRF</p>
                <button onClick={getLastReqId} className="border rounded border-black mt-3 py-1 px-3 text-base bg-blue-500 text-white">
                    Check Last Request ID
                </button>
                <h1 className='mt-2 text-center break-words'>{lastReqId?.toString()}</h1>
            </div>

            <div className='my-4'>
                <form onSubmit={getreqStatus} className='flex flex-col w-[70vw] border px-8 p-4 rounded shadow'>
                    <label className='text-lg my-1 font-semibold'>Request Status</label>
                    <input value={reqId} onChange={(e) => setreqId(e.target.value)} type='text' placeholder='Put in the request ID' className=' rounded py-2 px-4  outline-none border border-black'></input>
                    <div className='w-full text-center break-words'>
                        {requestStatus && (
                            <div className='flex flex-col items-center justify-center break-words text-center'>
                                <h1 className='font-semibold'>{requestStatus ? <span>Request Completed</span> : <span>Request in Progress</span>}</h1>
                                <h1 className='font-semibold mt-2 break-words'>Random Words</h1>

                                {requestStatus.randomWords &&
                                    Array.isArray(requestStatus.randomWords) &&
                                    requestStatus.randomWords.length > 0 ? (
                                    <ul>
                                        {requestStatus.randomWords.map((word, index) => (
                                            <h1 className='mt-2 w-[60vw] text-center break-words' key={index}>{word.toString()}</h1>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No random words available.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <button type='submit'
                        className='border rounded border-black mt-3 py-1 px-3 text-white bg-blue-500 text-white"'>
                        Send Transaction
                    </button>
                </form>
            </div>

            <div className='flex items-center justify-center flex-col my-4 w-[70vw]'>
                {isOwner ? (
                    <div className="my-4">
                        <h1 className="font-semibold text-2xl underline">Owner Controls</h1>
                        {/* Admin Panel */}
                        <button
                            onClick={async () => {
                                try {
                                    const tx = await lotteryContractMetaMask.methods.requestRandomWords().send({ from: account });
                                    toast.success("Requested Random Number", { position: "top-center" });
                                    console.log("Transaction Hash: ", tx.transactionHash);
                                } catch (error) {
                                    toast.error("Request Failed" + error.message, { position: "top-center" });
                                }
                            }}
                            className="border rounded border-black mt-3 py-1 px-3 text-white bg-green-500 w-full"
                        >
                            Request Random Number
                        </button>

                        <button onClick={async () => {
                            try {
                                const tx = await lotteryContractMetaMask.methods.changeRaffleState().send({ from: account });
                                toast.success("Requested Random Number", { position: "top-center" });
                                console.log("Transaction Hash: ", tx.transactionHash);
                            } catch (error) {
                                toast.error("Request Failed" + error.message, { position: "top-center" });
                            }
                        }} className='border rounded border-black mt-3 py-1 px-3 text-white bg-blue-500 w-full'>
                            Change Raffle State
                        </button>
                    </div>
                ) : (
                    <p>You do not have permission to access the admin panel.</p>
                )}
            </div>

        </div>
    );
}

export default Interactions;