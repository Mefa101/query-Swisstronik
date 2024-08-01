import React, { useState } from 'react';
import { ethers } from 'ethers';

function App() {
    const [contractInput, setContractInput] = useState('');
    const [txHashInput, setTxHashInput] = useState('');
    const [bytecodes, setBytecodes] = useState([]);
    const [txDetails, setTxDetails] = useState([]);

    // Replace with your JSON RPC URL
    const jsonRpcUrl = 'https://json-rpc.testnet.swisstronik.com';

    // Parse the input text into an array
    const parseInput = (input) => {
        try {
            // Parse JSON-like input or comma-separated list
            const parsedInput = JSON.parse(input);
            return Array.isArray(parsedInput) ? parsedInput : parsedInput.split(',').map(item => item.trim());
        } catch {
            return input.split(',').map(item => item.trim());
        }
    };

    const handleContractQuery = async () => {
        const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
        const addresses = parseInput(contractInput);
        const newBytecodes = [];

        for (const address of addresses) {
            if (!address) {
                newBytecodes.push('Please enter a valid contract address.');
                continue;
            }

            try {
                // Get the bytecode
                const code = await provider.getCode(address);

                if (code === '0x') {
                    newBytecodes.push({ address, bytecode: 'No contract found.' });
                } else {
                    newBytecodes.push({ address, bytecode: code });
                }
            } catch (error) {
                newBytecodes.push({ address, bytecode: `Error fetching bytecode: ${error.message}` });
            }
        }

        setBytecodes(newBytecodes);
    };

    const handleTxQuery = async () => {
        const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
        const hashes = parseInput(txHashInput);
        const newTxDetails = [];

        for (const hash of hashes) {
            if (!hash) {
                newTxDetails.push('Please enter a valid transaction hash.');
                continue;
            }

            try {
                // Get the transaction receipt
                const receipt = await provider.getTransactionReceipt(hash);

                if (receipt) {
                    newTxDetails.push({ hash, receipt });
                } else {
                    newTxDetails.push({ hash, receipt: 'Transaction receipt not found.' });
                }
            } catch (error) {
                newTxDetails.push({ hash, receipt: `Error fetching transaction receipt: ${error.message}` });
            }
        }

        setTxDetails(newTxDetails);
    };

    const downloadJson = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="App">
            <h1>Contract and Transaction Query</h1>
            
            <div>
                <h2>Query Contract Bytecode</h2>
                <textarea
                    rows="4"
                    cols="50"
                    value={contractInput}
                    onChange={(e) => setContractInput(e.target.value)}
                    placeholder='Enter contract addresses as a list (comma-separated or JSON array)'
                />
                <button onClick={handleContractQuery}>Query Bytecode</button>
                <pre>{JSON.stringify(bytecodes, null, 2)}</pre>
                <button onClick={() => downloadJson({ contracts: bytecodes }, 'contracts.json')}>Download Bytecode JSON</button>
            </div>

            <div>
                <h2>Query Transaction Receipt</h2>
                <textarea
                    rows="4"
                    cols="50"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder='Enter transaction hashes as a list (comma-separated or JSON array)'
                />
                <button onClick={handleTxQuery}>Query Transaction</button>
                <pre>{JSON.stringify(txDetails, null, 2)}</pre>
                <button onClick={() => downloadJson({ transactions: txDetails }, 'transactions.json')}>Download Transactions JSON</button>
            </div>
        </div>
    );
}

export default App;
