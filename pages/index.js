import { ethers } from "ethers";
import { useState, useEffect } from 'react';

function Home() {
  const [walletAddress, setWalletAddress] = useState();
  const [accessToken, setAccessToken] = useState();
  const [signedHash, setSignedHash] = useState();
  

  // runs when page started and when walletAddress state changes
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
    if (accessToken && tokenType) {
      fetch('https://discord.com/api/users/@me', {
			  headers: {
			  	authorization: `${tokenType} ${accessToken}`,
			  },
		  })
			.then(result => result.json())
			.then(response => {
				console.log(response);
        setAccessToken(response.id);
			})
			.catch(console.error);
    }
    // checks if ethereum provider is detected
    try{
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      if (typeof provider !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
          console.log(`account changed to ${accounts[0]}`);
          setWalletAddress(accounts[0]);
        })

        window.ethereum.on('chainChanged', (chainId) => {
          console.log(`network changed to ${chainId}. Reloading...`);
          window.location.reload();
        })

        window.ethereum.on('disconnect', (providerRpcError) => {
          console.log('ethereum disconnected', providerRpcError);
          setWalletAddress(undefined);
        })

        getAccount();
        testFetch();
      }
    } catch (err) {
      console.log("No ethereum service.");
    }
  },
  [walletAddress])

  const requestAccount = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
      console.log(err);
    }
  }

  const getAccount = async () => {
    try {
      console.log('ethereum connected');
      let accounts = await window.ethereum.request({ method: "eth_accounts" });
      console.log(`${accounts[0]} connected`);
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const signMessage = async (message) => {
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      fetch(`/api/verify/${message}`)
      .then((response) => response.json())
      .then((data) => {
        signer.signMessage(data.hash).then(value => {
          setSignedHash(value);
        }).catch(err => {
          console.log(err);
        })
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className='h-screen bg-zinc-800 flex flex-col'>
      {walletAddress === undefined ? (
        <>
          <div className='mt-[45vh] flex flex-col'>
            <div onClick={requestAccount} className='text-white mx-auto px-5 py-1 rounded-full cursor-pointer select-none transition-all drop-shadow active:drop-shadow-none active:translate-y-[2px] bg-orange-500 hover:bg-orange-400 active:bg-orange-600'>
              connect
            </div>
          </div>
        </>
      ):(
        <>
          <div className='mt-[45vh] flex flex-col'>
            <div className='text-white mx-auto mt-5'>
              {walletAddress}
            </div>
            {accessToken === undefined ? (
              <>
                <div className='mt-5 flex flex-col'>
                  <a href='https://discord.com/api/oauth2/authorize?client_id=746492859397439508&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=token&scope=identify' className='text-white mx-auto px-5 py-1 rounded-full cursor-pointer select-none transition-all drop-shadow active:drop-shadow-none active:translate-y-[2px] bg-orange-500 hover:bg-orange-400 active:bg-orange-600'>
                    connect discord
                  </a>
                </div>
              </>
            ):(
              <>
                <div className='text-white mx-auto mt-5'>
                  {accessToken}
                </div>
                {signedHash === undefined ? (
                  <>
                    <div onClick={() => signMessage(accessToken)} className='text-white mx-auto mt-5 px-5 py-1 rounded-full cursor-pointer select-none transition-all drop-shadow active:drop-shadow-none active:translate-y-[2px] bg-orange-500 hover:bg-orange-400 active:bg-orange-600'>
                      sign
                    </div>
                  </>
                ):(
                  <>
                    <div className='text-white mx-auto mt-5'>
                      {signedHash}
                    </div>
                  </>
                )}
                
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
