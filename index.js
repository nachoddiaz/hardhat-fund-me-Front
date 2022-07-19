import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constans.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fund")
const getBalanceButton = document.getElementById("getBalance")
const withdrawButton = document.getElementById("withdraw")

connectButton.onclick = connect
fundButton.onclick = fund
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

//Creamos la función para que se conecte automáticamente
async function connect() {
  //Comprobamos si metamask está instalado
  if (typeof window.ethereum !== "undefined") {
    try {
      //Conectamos metamask al sitio web
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Metamask conectado"
  } else {
    connectButton.innerHTML = "Instala Metamask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Depositando ${ethAmount}`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //Devuelve la cartera que está conectada a nuestro provider
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const TxResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTxMined(TxResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTxMined(TxResponse, provider) {
  console.log(`Minando  ${TxResponse.hash}...`)
  return new Promise((resolve, reject) => {
    //Creamos esta nueva promise para espere a que termine el minado
    //antes de poder continuar con la función fund()
    provider.once(TxResponse.hash, (TxReceipt) => {
      console.log(`Completado con ${TxReceipt.confirmations} confirmations`)
      resolve() //Al llegar a esta linea, terminará Promise
    })
  })
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdraw() {}
if (typeof window.ethereum !== "undefined") {
  console.log("Retirando fondos...")
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  try {
    const TxResponse = await contract.withdraw()
    await listenForTxMined(TxResponse, provider)
  } catch (error) {
    console.log(error)
  }
}
