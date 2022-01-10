/* Moralis init code */
const serverUrl = 'https://dhdx1ac7t6t8.usemoralis.com:2053/server';
const appId = '5P0ZpGLMoHfRrzdpCAOcp4oLZjUFAwzfbQUx5x5H';
Moralis.start({ serverUrl, appId });

const nftName = document.querySelector('.name');

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
  }
}

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

async function getNFT() {
  const options = {
    chain: 'eth',
    address: '0xefB51E9570b4FF2ef30e7Fb6E4B8ac7b19E317b1',
  };
  const response = await Moralis.Web3API.account.getNFTs(options);
  console.log(response);
  const data = response.result;
  console.log(data);

  data.forEach((nft) => {
    const uri = nft.token_uri;
    fetch(uri)
      .then((res) => res.json())
      .then((dt) => {
        console.log(dt);
        console.log(dt.name);
        console.log(dt.image);
        const html = `
        <p>${dt.name}</p>
        <img src="${dt.image}" alt="NFT Image" width="100" height="100">
        `;
        nftName.insertAdjacentHTML('afterbegin', html);
      });
  });
}

getNFT().catch(handleError);

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logOut;
