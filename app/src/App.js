import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);
console.log(provider);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

const NETWORKS = {
  hardhat: '0x7A69', // This is a placeholder chainId for Hardhat. Adjust if needed.
  goerli: '0x5',
  sepolia: '0xAA36A7',
};

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState("mainnet");

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    function handleChainChanged(_chainId) {
      console.log("Chain changed:", _chainId);
      const network = Object.keys(NETWORKS).find(net => NETWORKS[net].toLowerCase() === _chainId.toLowerCase());
      console.log("Detected Network:", network);
      setSelectedNetwork(network);
    }

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  provider.on('chainChanged', (chainId) => {
    console.log("Chain changed outside useEffect:", chainId);
  });


  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.BigNumber.from(document.getElementById('wei').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        if (account !== arbiter) {
          document.getElementById(escrowContract.address).innerText =
            "❌ You are not the designated arbiter!";
          return;
        }

        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        try {
          await approve(escrowContract, signer);
        } catch (error) {
          console.error("Error during approval:", error);
          document.getElementById(escrowContract.address).innerText =
            "❌ Error during approval. Check console for details.";
        }
      },
    };

    setEscrows([...escrows, escrow]);
  }

  async function handleNetworkChange(network) {
    console.log("Trying to switch to:", network);
    if (network === "hardhat") {
      alert("Please manually switch to the Hardhat Local Network in MetaMask.");
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[network] }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.message.includes('Unrecognized chain ID')) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NETWORKS[network],
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [`https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPLOIA_PRIVATE_KEY}`], // Notice the change from rpcUrl to rpcUrls
                blockExplorerUrls: ['https://explorer.sepolia.io/'], // Add a block explorer URL for Sepolia if available
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      } else {
        console.error(switchError);
      }
    }
  }

  return (
    <div className="main-container">
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Ether)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();
            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="right-section">
        <div className="metamask-warning">MAKE SURE YOU ARE USING METAMASK!</div>
        <div className="network-selector">
      <select
        value={selectedNetwork}
        onChange={(e) => handleNetworkChange(e.target.value)}
      >
        <option value="hardhat">Hardhat Testnet</option>
        <option value="goerli">Goerli</option>
        <option value="sepolia">Sepolia</option>
      </select>
    </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>
        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </div>
);
}

export default App;
