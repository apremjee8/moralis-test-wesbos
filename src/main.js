/* Moralis init code */
const serverUrl = 'https://dhdx1ac7t6t8.usemoralis.com:2053/server';
const appId = '5P0ZpGLMoHfRrzdpCAOcp4oLZjUFAwzfbQUx5x5H';
Moralis.start({ serverUrl, appId });

const txnTable = document.querySelector('.txn');

// wallet addresses for testing - will eventually switch to getting the user's wallet when the connect
const apWallet = '0xed645e1a76F4BbA630371125e3025304eB8f5462';
const fundWallet = '0xefB51E9570b4FF2ef30e7Fb6E4B8ac7b19E317b1';

/* Authentication code */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate({
      signingMessage: 'Log in using Moralis',
    })
      .then((user) => {
        console.log('logged in user:', user);
        console.log(user.get('ethAddress'));
      })
      .catch((error) => {
        console.log(error);
      });
    return user;
  }
  return user;
}

// const user = Moralis.User.current().get('ethAddress');
// console.log(user);

async function logOut() {
  await Moralis.User.logOut();
  console.log('logged out');
}

function handleError(err) {
  console.log('Oh nooo!');
  console.log(err);
}

function fixURL(url) {
  if (url.startsWith('ipfs')) {
    return `https://ipfs.moralis.io:2053/ipfs/${url
      .split('ipfs://ipfs/')
      .slice(-1)}`;
  }

  return `${url}?format=json`;
}

async function getNFTTransactions() {
  const user = await login();
  const userEthAddress = user.get('ethAddress');
  console.log(userEthAddress);
  const options = {
    chain: 'eth',
    address: userEthAddress, // change this to user's wallet
  };
  const response = await Moralis.Web3API.account.getNFTTransfers(options);
  const data = response.result;
  console.log(data);

  data.forEach((txn) => {
    const html = `
        <tr>    
          <td>${txn.from_address}</td>
          <td>${txn.to_address}</td>
          <td>${txn.token_address}</td>
          <td>${txn.token_id}</td>
          <td>${txn.contract_type}</td>
          <td>${txn.transaction_hash}</td>
          <td>${txn.transaction_type}</td>
          <td>${txn.value}</td>
        </tr>
        `;
    txnTable.insertAdjacentHTML('afterBegin', html);
  });
}

// archive functions
async function getNFT() {
  const options = {
    chain: 'eth',
    address: fundWallet, // change this to user's wallet
  };
  const response = await Moralis.Web3API.account.getNFTs(options);
  console.log(response);
  const data = response.result;
  console.log(data);

  data.forEach((nft) => {
    const collectionName = nft.name;
    const uri = nft.token_uri;
    fetch(uri)
      .then((res) => res.json())
      .then((dt) => {
        console.log(dt);
        const imgURL = fixURL(dt.image);
        const html = `
        <tr>    
        <td>${collectionName}</td>
          <td>${dt.name}</td>
          <td><img src="${dt.image}" alt="NFT Image" width="100" height="100"></td>
        </tr>
        `;
        console.log(html);
        txnTable.insertAdjacentHTML('afterBegin', html);
      })
      .catch(handleError);
  });
}

async function getAllTransactions() {
  const options = {
    chain: 'eth',
    address: fundWallet, // change this to user's wallet
  };
  const response = await Moralis.Web3API.account.getTransactions(options);
  console.log(response);
}

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logOut;
document.getElementById('btn-txn').onclick = getNFTTransactions;
// call functions
getNFTTransactions().catch(handleError);

// run tailwind with: npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
