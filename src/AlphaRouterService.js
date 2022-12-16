//const { AlphaRouter } = require('@uniswap/smart-order-router')
import { AlphaRouter } from '@uniswap/smart-order-router'
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const ERC20ABI = require('./erc20.abi.json')

const mainnet_chainId = 1;
const sepolia_chainId = 11155111;
const Goerli_chainId = 5;

const V3_SWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;//0xE592427A0AEce92De3Edee1F18E0157C05861564;

const INFURA_URL_GOERLI = 'https://goerli.infura.io/v3/817597f04d6941649c41255a1b10e815';
const INFURA_URL_MAINNET = 'https://mainnet.infura.io/v3/817597f04d6941649c41255a1b10e815';

const CHAIN_ID = mainnet_chainId;
const INFURA_URL = INFURA_URL_MAINNET
const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
const router = new AlphaRouter({ chainId: CHAIN_ID, provider: web3Provider });

//les tokens (pour le moment c'est hardcoded)
const name0 = "Wrapped Ether";
const symbol0 = "WETH";
const decimals0 = 18;
const address0 = CHAIN_ID === mainnet_chainId ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const name1 = "Uniswap Token";
const symbol1 = "UNI";
const decimals1 = 18;
const address1 = CHAIN_ID === mainnet_chainId ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" : "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";


const WETH = new Token(CHAIN_ID, address0, decimals0, symbol0, name0)
const UNI = new Token(CHAIN_ID, address1, decimals1, symbol1, name1)

export const getWethContract = () => new ethers.Contract(address0, ERC20ABI, web3Provider)
export const getUniContract = () => new ethers.Contract(address1, ERC20ABI, web3Provider)

export const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0)
  const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))

  const route = await router.route(
    currencyAmount,
    UNI,
    TradeType.EXACT_INPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  )

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route.methodParameters.value),
    from: walletAddress,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000)
  }

  const quoteAmountOut = route.quote.toFixed(6)
  const ratio = (inputAmount / quoteAmountOut).toFixed(3)

  return [
    transaction,
    quoteAmountOut,
    ratio
  ]
}

export const runSwap = async (transaction, signer) => {
  const approvalAmount = ethers.utils.parseUnits('10', 18).toString()
  const contract0 = getWethContract()
  await contract0.connect(signer).approve(
    V3_SWAP_ROUTER_ADDRESS,
    approvalAmount
  )

  signer.sendTransaction(transaction)
}