import { SequenceIndexer, TokenBalance, ContractType } from '@0xsequence/indexer'
import { ChainId, networks, indexerURL } from '@0xsequence/network'
import { ethers } from 'ethers'

const getIndexerClient = (chainId: number) => {
  const network = networks[chainId as ChainId]
  return new SequenceIndexer(indexerURL(network.name))
}

interface GetTokenBalancesArgs {
  accountAddress: string
  chainId: number
}

export const getNativeTokenBalance = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const indexerClient = getIndexerClient(chainId)

    const res = await indexerClient.getEtherBalance({ accountAddress })

    const tokenBalance: TokenBalance = {
      chainId,
      contractAddress: '0x0000000000000000000000000000000000000000',
      accountAddress,
      balance: res?.balance.balanceWei || '0',
      contractType: ContractType.UNKNOWN,
      blockHash: '',
      blockNumber: 0,
      tokenID: '',
      uniqueCollectibles: '',
      isSummary: false
    }
    return [tokenBalance]
  } catch (e) {
    console.error(e)
    return []
  }
}

export const getTokenBalances = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const indexerClient = getIndexerClient(chainId)

    const res = await indexerClient.getTokenBalances({
      accountAddress,
      includeMetadata: true
    })

    return res?.balances || []
  } catch (e) {
    console.error(e)
    return []
  }
}

export const fetchBalances = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const tokenBalances = (
      await Promise.all([
        getNativeTokenBalance({
          accountAddress,
          chainId
        }),
        getTokenBalances({
          accountAddress,
          chainId
        })
      ])
    ).flat()
    return tokenBalances
  } catch (e) {
    console.error(e)
    return []
  }
}

const DEVICE_EMOJIS = [
  // 256 emojis for unsigned byte range 0 - 255
  ...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦩🕊🐇🦝🦨🦡🦦🦥🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿🍀🎍🎋🍃👣🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🥭🍍🥥🥝🍅🥑🥦🥬🥒🌶🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜👀👂👃👄👅👆👇👈👉👊👋👌👍👎👏👐👑👒👓🎯🎰🎱🎲🎳👾👯👺👻👽🏂🏃🏄'
]

// Generate a random name for the session, using a single random emoji and 2 random words
// from the list of words of ethers
export function randomName() {
  const wordlistSize = 2048
  const words = ethers.wordlists.en

  const randomValues = new Uint32Array(3)
  window.crypto.getRandomValues(randomValues)

  const randomEmoji = DEVICE_EMOJIS[randomValues[0] % DEVICE_EMOJIS.length]
  const randomWord1 = words.getWord(randomValues[1] % wordlistSize)
  const randomWord2 = words.getWord(randomValues[2] % wordlistSize)

  return `${randomEmoji} ${randomWord1} ${randomWord2}`
}
