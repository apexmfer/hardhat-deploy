/* eslint-disable @typescript-eslint/no-explicit-any */
import 'hardhat/types/runtime';
import 'hardhat/types/config';
import {
  LinkReferences,
  Artifact,
  HardhatRuntimeEnvironment,
} from 'hardhat/types';
import type {BigNumber} from '@ethersproject/bignumber';

export type ExtendedArtifact = {
  abi: any[];
  bytecode: string; // "0x"-prefixed hex string
  deployedBytecode?: string; // "0x"-prefixed hex string
  metadata?: string;
  linkReferences?: LinkReferences;
  deployedLinkReferences?: LinkReferences;
  solcInput?: string;
  solcInputHash?: string;
  userdoc?: any;
  devdoc?: any;
  methodIdentifiers?: any;
  storageLayout?: any;
  evm?: any;
};

export interface DeployFunction {
  (env: HardhatRuntimeEnvironment): Promise<void | boolean>;
  skip?: (env: HardhatRuntimeEnvironment) => Promise<boolean>;
  tags?: string[];
  dependencies?: string[];
  runAtTheEnd?: boolean;
  id?: string;
}

export type Address = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ABI = any[]; // TODO abi

export type Log = {
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
  address: string;
  topics: string[];
  data: string;
};

export type Receipt = {
  from: Address;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  cumulativeGasUsed: BigNumber | string | number;
  gasUsed: BigNumber | string | number;
  contractAddress?: string;
  to?: Address;
  logs?: Log[];
  events?: any[];
  logsBloom?: string;
  byzantium?: boolean;
  status?: number;
  confirmations?: number;
};

export type DiamondFacets = Array<DiamondFacet>; // TODO support Object for facet : {contract} // could be deploymentNames too ? or {abi,address}
export type DiamondFacet = string | DiamondFacetDeployOptions
export interface DiamondFacetDeployOptions extends Omit<DeployOptions, 'from' | 'deterministicDeployment' | 'fieldsToCompare'> {
  contract: string | (ArtifactData & { artifactName: string });
}
export interface DiamondOptions extends TxOptions {
  owner?: Address;
  facets: DiamondFacets;
  onFacetDeployment?: (result: DeployResult) => void | Promise<void>
  log?: boolean;
  libraries?: Libraries;
  linkedData?: any; // JSONable ?
  upgradeIndex?: number;
  execute?: {
    methodName: string;
    args: any[];
  };
  deterministicSalt?: string;
}

type ProxyOptionsBase = {
  owner?: Address;
  upgradeIndex?: number;
  proxyContract?: // default to EIP173Proxy
  string | ArtifactData;
  viaAdminContract?:
    | string
    | {
        name: string;
        artifact?: string | ArtifactData;
      };
};

export type ProxyOptions =
  | (ProxyOptionsBase & {
      methodName?: string;
    })
  | (ProxyOptionsBase & {
      execute?:
        | {
            methodName: string;
            args: any[];
          }
        | {
            init: {
              methodName: string;
              args: any[];
            };
            onUpgrade?: {
              methodName: string;
              args: any[];
            };
          };
    });

export type ArtifactData = {
  abi: ABI;
  bytecode: string;
  deployedBytecode?: string;
  metadata?: string;
  methodIdentifiers?: any;
  storageLayout?: any;
  userdoc?: any;
  devdoc?: any;
  gasEstimates?: any;
};

export interface DeployOptionsBase extends TxOptions {
  contract?: string | ArtifactData;
  args?: any[];
  skipIfAlreadyDeployed?: boolean;
  linkedData?: any; // JSONable ?
  libraries?: Libraries;
  proxy?: boolean | string | ProxyOptions; // TODO support different type of proxies ?
}

export interface DeployOptions extends DeployOptionsBase {
  deterministicDeployment?: boolean | string;
}

export interface Create2DeployOptions extends DeployOptionsBase {
  salt?: string;
}

export interface CallOptions {
  from?: string;
  gasLimit?: string | number | BigNumber;
  gasPrice?: string | BigNumber;
  value?: string | BigNumber;
  nonce?: string | number | BigNumber;
  to?: string; // TODO make to and data part of a `SimpleCallOptions` interface
  data?: string;
}

export interface TxOptions extends CallOptions {
  from: string;
  log?: boolean;
  autoMine?: boolean;
  estimatedGasLimit?: string | number | BigNumber;
  estimateGasExtra?: string | number | BigNumber;
}

export interface Execute extends TxOptions {
  name: string;
  methodName: string;
  args?: any[];
}

export interface SimpleTx extends TxOptions {
  to: string;
}

export interface DeployedContract {
  address: Address;
  abi: ABI;
}

export interface DeployResult extends Deployment {
  newlyDeployed: boolean;
}

export type FixtureFunc<T, O> = (
  env: HardhatRuntimeEnvironment,
  options?: O
) => Promise<T>;

export interface DeploymentsExtension {
  deploy(name: string, options: DeployOptions): Promise<DeployResult>; // deploy a contract
  diamond: {
    // deploy diamond based contract (see section below)
    deploy(name: string, options: DiamondOptions): Promise<DeployResult>;
  };
  deterministic( // return the determinsitic address as well as a function to deploy the contract, can pass the `salt` field in the option to use different salt
    name: string,
    options: Create2DeployOptions
  ): Promise<{
    address: Address;
    deploy(): Promise<DeployResult>;
  }>;
  fetchIfDifferent( // return true if new compiled code is different than deployed contract
    name: string,
    options: DeployOptions
  ): Promise<{differences: boolean; address?: string}>;
  save(name: string, deployment: DeploymentSubmission): Promise<void>; // low level save of deployment
  get(name: string): Promise<Deployment>; // fetch a deployment by name, throw if not existing
  getOrNull(name: string): Promise<Deployment | null>; // fetch deployment by name, return null if not existing
  getDeploymentsFromAddress(address: string): Promise<Deployment[]>;
  all(): Promise<{[name: string]: Deployment}>; // return all deployments
  getArtifact(name: string): Promise<Artifact>; // return a hardhat artifact (compiled contract without deployment)
  getExtendedArtifact(name: string): Promise<ExtendedArtifact>; // return a extended artifact (with more info) (compiled contract without deployment)
  run( // execute deployment scripts
    tags?: string | string[],
    options?: {
      resetMemory?: boolean;
      deletePreviousDeployments?: boolean;
      writeDeploymentsToFiles?: boolean;
      export?: string;
      exportAll?: string;
    }
  ): Promise<{[name: string]: Deployment}>;
  fixture( // execute deployment as fixture for test // use evm_snapshot to revert back
    tags?: string | string[],
    options?: {fallbackToGlobal?: boolean; keepExistingDeployments?: boolean}
  ): Promise<{[name: string]: Deployment}>;
  createFixture<T, O>( // execute a function as fixture using evm_snaphost to revert back each time
    func: FixtureFunc<T, O>,
    id?: string
  ): (options?: O) => Promise<T>;
  log(...args: any[]): void; // log data only ig log enabled (disabled in test fixture)

  execute( // execute function call on contract
    name: string,
    options: TxOptions,
    methodName: string,
    ...args: any[]
  ): Promise<Receipt>;
  rawTx(tx: SimpleTx): Promise<Receipt>; // execute a simple transaction
  catchUnknownSigner( // you can wrap other function with this function and it will catch failure due to missing signer with the details of the tx to be executed
    action: Promise<any> | (() => Promise<any>),
    options?: {log?: boolean}
  ): Promise<null | {
    from: string;
    to?: string;
    value?: string;
    data?: string;
  }>;
  read( // make a read-only call to a contract
    name: string,
    options: CallOptions,
    methodName: string,
    ...args: any[]
  ): Promise<any>;
  read(name: string, methodName: string, ...args: any[]): Promise<any>;
  // rawCall(to: Address, data: string): Promise<any>; // TODO ?
}

export interface ContractExport {
  address: string;
  abi: any[];
  linkedData?: any;
}

export interface Export {
  chainId: string;
  name: string;
  contracts: {[name: string]: ContractExport};
}

export type MultiExport = {
  [chainId: string]: {[name: string]: Export};
};

export type Libraries = {[libraryName: string]: Address};

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export type FacetCut = Facet & {
  action: FacetCutAction;
};

export type Facet = {
  facetAddress: string;
  functionSelectors: string[];
};

export interface DeploymentSubmission extends Deployment {
  contractName?: string
  solcInput?: string;
  execute?: {
    methodName: string;
    args: any[];
  };
}

// export type LibraryReferences = {
//   [filepath: string]: { [name: string]: { length: number; start: number }[] };
// };

export interface Deployment {
  address: Address;
  abi: ABI;
  artifactName?: string
  receipt?: Receipt;
  transactionHash?: string;
  history?: Deployment[];
  implementation?: string;
  args?: any[];
  linkedData?: any;
  solcInputHash?: string;
  metadata?: string;
  bytecode?: string;
  deployedBytecode?: string;
  libraries?: Libraries;
  userdoc?: any;
  devdoc?: any;
  methodIdentifiers?: any;
  diamondCut?: FacetCut[];
  facets?: Facet[];
  storageLayout?: any;
  gasEstimates?: any;
}
