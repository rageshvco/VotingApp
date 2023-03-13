import { Injectable } from "@nestjs/common";
import { ethers } from "ethers";
import * as tokenJson from "./assets/MyToken.json";
import * as tokenizedBallotJson from "./assets/TokenizedBallot.json";
import * as dotenv from 'dotenv';
dotenv.config();

const CONTRACT_ADDRESS = "0xE2EF249E4aBeC90c8c319A4BA5e3A0b515715c10";
const CONTRACT_TOKENIZED_BALLOT_ADDRESS = "0xE2EF249E4aBeC90c8c319A4BA5e3A0b515715c10";

@Injectable()
export class AppService {
  [x: string]: any;
  //provider: ethers.providers.BaseProvider;
  alchemyProvider: ethers.providers.AlchemyProvider;
  contract: ethers.Contract;
  tokenizedBallot : ethers.Contract;
  wallet: ethers.Wallet;
  signer: ethers.Signer;

  constructor() {
    //this.provider = ethers.getDefaultProvider("goerli");
    // this.contract = new ethers.Contract(
    //   CONTRACT_ADDRESS,
    //   tokenJson.abi,
    //   this.provider
    // );
    this.alchemyProvider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY_API_KEY);
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length <= 0) throw new Error("Missing environment private key");
    this.wallet = new ethers.Wallet(privateKey);
    this.signer = this.wallet.connect(this.alchemyProvider);    
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenJson.abi,
      this.signer
    );    

    this.tokenizedBallot = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenizedBallotJson.abi,
      this.signer
    );    
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplynumber = parseFloat(totalSupplyString);
    return totalSupplynumber;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransaction(
    hash: string
  ): Promise<ethers.providers.TransactionResponse> {
    return this.provider.getTransaction(hash);
  }

  async requestTokens(address: string, amount: number) : Promise<ethers.providers.TransactionResponse>{
    const txHash = await this.contract.mint(address, ethers.utils.parseEther(amount.toString()));    
    return txHash;
    //return { txHash: "txHash", address: address, amount: amount };
  }

  async exerciseVote(proposalIndex: number, amount: number): Promise<ethers.providers.TransactionResponse> {
    const txVote = await this.tokenizedBallotvote(proposalIndex,ethers.utils.parseUnits(amount.toString()));   
    return txVote;
  }

  async getVotingPower(address: string): Promise<number> {
    const votingPower  = await this.contract.votingPower(address);
    return votingPower;
  }

  async getWinningProposal(): Promise<number> {
    const winningProposal  = await this.contract.winningProposal();
    return winningProposal;
  }


}
