import React, { useState, useEffect } from 'react';
import { useAccount } from "./context/context";
import abi from "./abi/abi.json";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Web3 from 'web3';


const Data = () => {

    const contractAddress = "0xCe885CBE3876D3f6F939359f6e1C06bBF1Fc8c32";

    // Web3 instance for Infura (read-only)
    const web3Infura = new Web3(new Web3.providers.HttpProvider("https://sepolia.infura.io/v3/6c9dab15de64404489e4780952f9d9f0"));
    // Lottery contract instance for Infura (read-only)
    const lotteryContractInfura = new web3Infura.eth.Contract(abi, contractAddress);


    // Web3 instance for MetaMask (sign transactions)
    const web3MetaMask = new Web3(window.ethereum);
    const lotteryContractMetaMask = new web3MetaMask.eth.Contract(abi, contractAddress);

    const fetchLotteryData = async () => {
        try {
            const [checkConditions, players, prize, time, state, lastWinner] = await Promise.all([
                lotteryContractInfura.methods.checkConditions().call(),
                lotteryContractInfura.methods.getNumberOfPlayers().call(),
                lotteryContractInfura.methods.checkPrizePool().call(),
                lotteryContractInfura.methods.getLastTimeStamp().call(),
                lotteryContractInfura.methods.getRaffleState().call(),
                lotteryContractInfura.methods.getRecentWinner().call(),
            ]);

            // Convert prize to ETH
            const prizeInEth = Web3.utils.fromWei(prize, "ether");

            setLotteryData({
                checkConditions,
                players: parseInt(players, 10),
                prize: prizeInEth,
                time: time,
                state: parseInt(state, 10),
                lastWinner: lastWinner
            });

            console.log("Lottery data fetched:", { checkConditions, players, prize: prizeInEth, time, state, lastWinner });
        } catch (error) {
            console.error("Error fetching lottery data:", error);
        }
    };

    const { account, setAccount } = useAccount();
    const [lotteryData, setLotteryData] = useState({
        checkConditions: null,
        players: null,
        prize: null,
        time: null,
        state: null,
        lastWinner: null,
    });

    const formatTimestamp = (timestamp) => {
        // Convert BigInt to Number if necessary
        const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
    
        const date = new Date(ts * 1000); // Convert seconds to milliseconds
    
        // Extract date components
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
    
        // Extract time components
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
    
        // Combine date and time
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };
    

    const enterLottery = async () => {
        try {
            if (!account) {
                alert("Connect to MetaMask first.");
                return;
            }

            // Perform a transaction using MetaMask
            const tx = await lotteryContractMetaMask.methods.buyTicketAndEnterRaffle().send({
                from: account,
                value: Web3.utils.toWei("0.01", "ether"),
                gas: 100000, // Adjust gas limit as needed
            });

            console.log("Transaction successful:", tx);

            // Show a success notification
            toast.success("You have bought a ticket and entered the lottery", { position: 'top-center' });

            // Fetch updated lottery data after successful transaction
            await fetchLotteryData(); // Ensure the latest data is loaded

        } catch (error) {
            console.error("Error while entering the lottery:", error);
            toast.error("Transaction could not go through", { position: 'top-center' });
        }
    };
    const connectToMetaMask = async () => {
        try {
            if (window.ethereum) {
                // Request access to the user's MetaMask accounts
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);

                // Listen for account changes
                window.ethereum.on("accountsChanged", (accounts) => {
                    setAccount(accounts[0] || null);
                });
            } else {
                alert("MetaMask is not installed. Please install it to use this app.");
            }
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };


    useEffect(() => {
        connectToMetaMask();
        fetchLotteryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div>
            <section className="flex items-center justify-center flex-col gap-4 mt-6">
                <h1 className="underline text-3xl">How it Works</h1>
                <p className="text-justify w-[80vw] lg:w-[90vw]">
                    This lottery contract provides a secure and fair platform for participants to enter raffles and potentially win a prize. Players can join by purchasing a ticket for 0.01 ETH, with their entries recorded as long as the raffle is open. Sponsors can also contribute to the prize pool by donating Ether, with their names acknowledged in the contract. When conditions are met, the contract owner requests a secure random number from Chainlink VRF to fairly select a winner. The chosen participant receives the entire prize pool, and the raffle resets for a new round. This process ensures transparency, security, and an unbiased winner selection.
                </p>
            </section>

            <main className="mt-1 p-4 text-2xl">
                <div className="flex items-center justify-center">
                    <h1 className="flex gap-2 text-center text-3xl">
                        Prize Pool: {lotteryData.prize !== null ? lotteryData.prize : "Loading..."} ETH
                    </h1>
                </div>
                <div className="mt-4 flex items-center justify-center flex-col">
                    <h2 className="text-3xl font-semibold">Lottery Details</h2>
                    <h1 className="flex gap-2 text-center">
                        Ready: {lotteryData.checkConditions === true ? <p>True</p> : <p>False</p>}
                    </h1>
                    <h1 className="flex gap-2 text-center">
                        Number of players: {lotteryData.players !== null ? lotteryData.players : "Loading..."}
                    </h1>
                    <h1 className="flex gap-2 text-center">
                        Start of Lottery Round: {lotteryData.time ? formatTimestamp(lotteryData.time) : "Loading..."}
                    </h1>
                    <h1 className="flex gap-2 text-center">
                        Lottery State: {lotteryData.state === 0 ? "Open" : lotteryData.state === 1 ? "Closed" : "Loading..."}
                    </h1>
                    <h1 className="flex gap-2 text-sm md:text-base text-center">
                        Recent Winner: {lotteryData.lastWinner}
                    </h1>

                    {account && (
                        <>
                            <button
                                onClick={enterLottery}
                                className="border rounded border-black mt-3 py-1 px-3 text-base bg-blue-500 text-white"
                            >
                                Enter Lottery
                            </button>
                        </>
                    )}
                </div>
            </main>

        </div>
    );
}

export default Data;