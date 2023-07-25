import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'

import 'solidity-coverage'
import path from 'path'

import * as fs from 'fs'
const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${path.resolve('.secret/testnet-mnemonic.txt')}`
let mnemonic = 'test '.repeat(11) + 'junk'
if (fs.existsSync(mnemonicFileName)) { mnemonic = fs.readFileSync(mnemonicFileName, 'ascii') }

function getNetwork1 (url: string): { url: string, accounts: { mnemonic: string } } {
  return {
    url,
    accounts: { mnemonic }
  }
}

const INFURA_ID = '9aa3d95b3bc440fa88ea12eaa4456161'
function getNetwork (name: string): { url: string, accounts: { mnemonic: string } } {
  return getNetwork1(`https://${name}.infura.io/v3/${INFURA_ID}`)
  // return getNetwork1(`wss://${name}.infura.io/ws/v3/${process.env.INFURA_ID}`)
}

const optimizedComilerSettings = {
  version: '0.8.17',
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{
      version: '0.8.15',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }],
    overrides: {
      'contracts/core/EntryPoint.sol': optimizedComilerSettings,
      'contracts/samples/SimpleAccount.sol': optimizedComilerSettings
    }
  },
  networks: {
    dev: { url: 'http://localhost:8545' },
    // github action starts localgeth service, for gas calculations
    localgeth: { url: 'http://localgeth:8545' },
    goerli: getNetwork('goerli'),
    kovan: getNetwork('kovan'),
    sepolia: getNetwork('sepolia'),
    proxy: getNetwork1('http://localhost:8545'),
    mantleQa: {
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: mnemonic,
        path: "m/44'/60'/0'/0",
      },
      chainId: 1705003,
      url: 'https://mantle-l2geth.qa.davionlabs.com/',
    },
    mantleTestnet: {
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: mnemonic,
        path: "m/44'/60'/0'/0",
      },
      chainId: 5001,
      url: 'https://rpc.testnet.mantle.xyz',
      allowUnlimitedContractSize: true
    },
  },
  mocha: {
    timeout: 10000
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  deterministicDeployment: {
    "5001": {
      factory: "0x47416ea33cd1e6026e199d88ae2719f5be3d321d",
      deployer: "0x67318b895775b2aaa9e5330981b620af942b8c73",
      funding: "100000",
      signedTx: "0xf8a08001830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222",
    }
  }
}

// coverage chokes on the "compilers" settings
if (process.env.COVERAGE != null) {
  // @ts-ignore
  config.solidity = config.solidity.compilers[0]
}

export default config
