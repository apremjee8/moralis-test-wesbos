/* Moralis init code */
const serverUrl = 'https://dhdx1ac7t6t8.usemoralis.com:2053/server';
const appId = '5P0ZpGLMoHfRrzdpCAOcp4oLZjUFAwzfbQUx5x5H';
Moralis.start({ serverUrl, appId });

const txnTable = document.querySelector('.txn');

// wallet addresses for testing - will eventually switch to getting the user's wallet when the connect
const apWallet = '0xed645e1a76F4BbA630371125e3025304eB8f5462';
const fundWallet = '0xefB51E9570b4FF2ef30e7Fb6E4B8ac7b19E317b1';
const convertEth = 10 ** -18;
let userNFTBuys = {};
let userNFTSells = {};
let userAllTxns = {};

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

async function logOut() {
  await Moralis.User.logOut();
  console.log('logged out');
}

// utility functions
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

// main functions
async function getNFTBuys() {
  const options = {
    chain: 'eth',
    address: fundWallet, // change this to user's wallet
    direction: 'to',
  };
  const response = await Moralis.Web3API.account.getNFTTransfers(options);
  const data = response.result;
  userNFTBuys = data;
  // console.log(data);
  // data.forEach((txn) => {
  //   const html = `
  //       <tr>
  //         <td>${txn.from_address}</td>
  //         <td>${txn.to_address}</td>
  //         <td>${txn.token_address}</td>
  //         <td>${txn.token_id}</td>
  //         <td>${txn.contract_type}</td>
  //         <td>${txn.transaction_hash}</td>
  //         <td>${txn.transaction_type}</td>
  //         <td>${txn.value}</td>
  //       </tr>
  //       `;
  //   txnTable.insertAdjacentHTML('afterBegin', html);
  // });
}

async function getNFTSells() {
  const options = {
    chain: 'eth',
    address: fundWallet, // change this to user's wallet
    direction: 'from',
  };
  const response = await Moralis.Web3API.account.getNFTTransfers(options);
  const data = response.result;
  userNFTSells = data;
}

async function buildData() {
  // set up buy and sell objects
  await getNFTBuys().catch(handleError);
  await getNFTSells().catch(handleError);
  // fill in useralltxns with data from buy
  userAllTxns = userNFTBuys.map((input) => ({
    token_address: input.token_address,
    token_id: input.token_id,
    image: 'later',
    state: null,
    buy_price: input.value * convertEth,
    sell_price: null,
    net_profit: null,
    floor_price: 'later',
    traits: 'later',
    floor_by_trait: 'later',
  }));
  // check for sells and populate data accordingly
  userAllTxns.forEach((item) => {
    if (
      userNFTSells.some(
        (txn) =>
          txn.token_address === item.token_address &&
          txn.token_id === item.token_id
      )
    ) {
      item.state = 'sold';
      item.sell_price =
        userNFTSells.filter(
          (txn) => txn.token_address === item.token_address
        )[0].value * convertEth;
      item.net_profit = item.sell_price - item.buy_price;
    } else {
      item.state = 'hold';
    }
  });
}

// build HTML functions
async function perNFTTable() {
  await buildData();
  console.log(userAllTxns);
  userAllTxns.forEach((txn) => {
    const html = `
        <tr>
          <td>${txn.token_address}</td>
          <td>${txn.token_id}</td>
          <td>${txn.image}</td>
          <td>${txn.state}</td>
          <td>${txn.buy_price}</td>
          <td>${txn.sell_price}</td>
          <td>${txn.net_profit}</td>
          <td>${txn.floor_price}</td>
          <td>${txn.traits}</td>
          <td>${txn.floor_by_trait}</td>
        </tr>
        `;
    txnTable.insertAdjacentHTML('afterBegin', html);
  });
}

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logOut;
// document.getElementById('btn-txn').onclick = getNFTBuys;
// call functions
// getNFTBuys().catch(handleError);
// getNFTSells().catch(handleError);
// buildData();
perNFTTable();

// run tailwind with: npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
