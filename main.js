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
    const html = `
    <p>${nft.name}</p>
    <img src="${nft.image}" alt="NFT Image" width="500" height="600"> 
    `; // need to get this from token uri
    nftName.insertAdjacentHTML('afterbegin', html);
    console.log(html);
    console.log(nft.image);
    fetch(uri)
      .then((res) => res.json())
      .then((dt) => {
        console.log(dt);
      })
      .catch(handleError);
  });
}

getNFT();

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logOut;
