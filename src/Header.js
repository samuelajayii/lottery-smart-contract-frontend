/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useAccount } from './context/context';

const Header = () => {

    const { account, setAccount, isOwner } = useAccount(null);

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
        connectToMetaMask()
    }, [])


    return (
        <header>
            <nav className="border-b-2 border-black flex flex-col items-center justify-between py-4 px-4">
                {isOwner ? <h1 className="text-xl font-semibold ">Welcome Owner</h1> : <h1 className="text-xl font-semibold ">Welcome Player</h1>}

                <div>
                    {account ? (
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                            <p>Connected Account: </p>
                            <p className="text-sm lg:text-base">{account}</p>
                        </div>

                    ) : (
                        <button
                            className="border rounded border-black py-1 px-3"
                            onClick={connectToMetaMask}
                        >
                            Connect to MetaMask
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;