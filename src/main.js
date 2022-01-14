/* Moralis init code */
const serverUrl = 'https://dhdx1ac7t6t8.usemoralis.com:2053/server';
const appId = '5P0ZpGLMoHfRrzdpCAOcp4oLZjUFAwzfbQUx5x5H';
Moralis.start({ serverUrl, appId });

// wallet addresses for testing - will eventually switch to getting the user's wallet when the connect
const apWallet = '0xed645e1a76F4BbA630371125e3025304eB8f5462';
const fundWallet = '0xefB51E9570b4FF2ef30e7Fb6E4B8ac7b19E317b1';
let userWallet = '';
const convertEth = 10 ** -18;

// OpenSea API endpoints
// single asset https://api.opensea.io/api/v1/asset/{asset_contract_address}/{token_id}/
const osAssetEndpoint = 'https://api.opensea.io/api/v1/asset/';

// set empty objects for buy, sell, and all txns
let userNFTBuys = {};
let userNFTSells = {};
let userAllTxns = {};

// select HTML elements
const txnTable = document.querySelector('.txn');

/* Authentication code */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate({
      signingMessage: 'Log in using Moralis',
    })
      .then((user) => {
        console.log('logged in user:', user);
        // console.log(user.get('ethAddress'));
        userWallet = user.get('ethAddress');
        console.log(userWallet);
      })
      .catch((error) => {
        console.log(error);
      });
    return user;
  }
  userWallet = user.get('ethAddress');
  console.log(userWallet);
  return user;
}

async function logOut() {
  await Moralis.User.logOut();
  console.log('logged out');
}

// utility functions
function handleError(err) {
  console.log('Oh nooo!');
  console.log(err);
}

// API calls
// Moralis Buy NFTs
async function getNFTBuys() {
  const options = {
    chain: 'eth',
    address: userWallet, // change this to user's wallet
    direction: 'to',
  };
  const response = await Moralis.Web3API.account.getNFTTransfers(options);
  const data = response.result;
  userNFTBuys = data;
}

// Moralist sold NFTs
async function getNFTSells() {
  const options = {
    chain: 'eth',
    address: userWallet, // change this to user's wallet
    direction: 'from',
  };
  const response = await Moralis.Web3API.account.getNFTTransfers(options);
  const data = response.result;
  userNFTSells = data;
}

// OS single asset for image and traits
async function osAssets(contractAddress, tokenId) {
  const options = { method: 'GET' };
  const response = await fetch(
    `${osAssetEndpoint}${contractAddress}/${tokenId}/`,
    options
  );
  const data = await response.json();
  return data;
}

// build the data from API calls
async function buildData() {
  // set up buy and sell objects
  await getNFTBuys().catch(handleError);
  await getNFTSells().catch(handleError);
  // fill in useralltxns with data from buy
  userAllTxns = userNFTBuys.map((input) => ({
    token_address: input.token_address,
    collection_name: 'later',
    token_id: input.token_id,
    nft_name: 'later',
    image: 'later',
    buy_price: input.value * convertEth,
    sell_price: null,
    net_profit: null,
    floor_price: 'later',
    traits: 'later',
    floor_by_trait: 'later',
    os_link: 'later',
  }));
  // check for sells and populate data accordingly
  userAllTxns.forEach(async (item) => {
    if (
      userNFTSells.some(
        (txn) =>
          txn.token_address === item.token_address &&
          txn.token_id === item.token_id
      )
    ) {
      item.sell_price =
        userNFTSells.filter(
          (txn) => txn.token_address === item.token_address
        )[0].value * convertEth;
      item.net_profit = item.sell_price - item.buy_price;
    } else {
      item.sell_price = 'diamond hands';
      item.net_profit = 'diamond hands';
    }
  });
}

// build HTML functions
async function perNFTTable() {
  await buildData().catch(handleError);
  console.log(userAllTxns);
  userAllTxns.forEach(async (item) => {
    const osInfo = await osAssets(item.token_address, item.token_id).catch(
      handleError
    );
    // console.log(osInfo);
    // let traitsList = {};
    // traitsList = osInfo.traits.map((trait) => ({
    //   type: trait.trait_type,
    //   value: trait.value,
    // }));
    item.collection_name = osInfo.collection.name;
    item.nft_name = osInfo.name;
    item.image = osInfo.image_url;
    item.os_link = osInfo.permalink;
    // item.traits = traitsList;
    const html = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">${item.collection_name}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.nft_name}</td>
          <td class="px-6 py-4 whitespace-nowrap"><img src="${item.image}" alt="NFT image"></td>
          <td class="px-6 py-4 whitespace-nowrap">${item.buy_price}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.sell_price}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.net_profit}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.floor_price}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.traits}</td>
          <td class="px-6 py-4 whitespace-nowrap">${item.floor_by_trait}</td>
        </tr>
        `;
    txnTable.insertAdjacentHTML('afterBegin', html);
  });
}

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logOut;

perNFTTable();

// run tailwind with: npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
