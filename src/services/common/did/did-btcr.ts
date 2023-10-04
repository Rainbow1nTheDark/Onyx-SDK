import { networks, payments, Psbt } from 'bitcoinjs-lib';
import fetch from 'node-fetch';  // for sending HTTP requests
import {ECPairFactory, TinySecp256k1Interface, ECPairAPI, ECPairInterface} from 'ecpair'

export class BTCRDIDMethod {
    tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
    ECPair: ECPairAPI = ECPairFactory(this.tinysecp);
    private static BASE_URL = "https://api.blockcypher.com/v1/btc/test3";  // BlockCypher testnet base URL
    network: any;
    keyPair: ECPairInterface;
    YOURTOKEN: string = "c9591ac3187946979360d12fdc2cb26a"
    did: string = 'BTCR';


    constructor(networkType: 'testnet' | 'mainnet', privateKeyHex?: string) {
        this.network = networkType === 'testnet' ? networks.testnet : networks.bitcoin;

        if (privateKeyHex) {
            const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
            this.keyPair = this.ECPair.fromPrivateKey(privateKeyBuffer, { network: this.network });
        } else {
            this.keyPair = this.ECPair.makeRandom({ network: this.network });
        }
    }

    async fundWallet(): Promise<void> {
        const { address } = payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network });
    
        if (this.network === networks.testnet) {
            const faucetUrl = `https://api.blockcypher.com/v1/btc/test3/faucet?token=` + this.YOURTOKEN;
            const body = {
                address: address,
                amount: 100000  // or whatever amount you want in satoshis
            };
            const response = await fetch(faucetUrl, { 
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) throw new Error('Failed to fund testnet wallet via BlockCypher faucet');
    
            await new Promise(resolve => setTimeout(resolve, 3000));  // wait for the faucet to process
        } else {
            console.log(`Please fund the mainnet wallet at this address: ${address}`);
        }
    }

    async getBalance(): Promise<number> {
        const { address } = payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network });
        const url = `${BTCRDIDMethod.BASE_URL}/addrs/${address}/balance`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to get wallet balance');
        
        const data = await response.json() as  { final_balance: number };
        return data.final_balance;  // BlockCypher's balance property for an address
    }

    async sendTransaction(txb: Psbt): Promise<string> {
        // Finalize all inputs and extract the transaction object
        txb.finalizeAllInputs();
        const rawTx = txb.extractTransaction().toHex();
    
        // Send the transaction using the batch transactions method
        const results = await this.sendBatchTransactions([rawTx]);
    
        if (results[0].error) {
            throw new Error(`Transaction failed: ${results[0].error.message}`);
        }
    
        return results[0].tx.hash;
    }

    async sendBatchTransactions(transactions: string[]): Promise<any[]> {
        const batchBody = transactions.map(tx => ({
            method: "POST",
            endpoint: "txs/push",
            body: JSON.stringify({ tx: tx })
        }));

        const response = await fetch(`${BTCRDIDMethod.BASE_URL}/batch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(batchBody)
        });

        if (!response.ok) {
            throw new Error(`Batch request failed with status: ${response.statusText}`);
        }

        const results: any[] = await response.json() as any[];
        return results;
    }

    // Other DID related methods can go here
}

const NETWORK = 'testnet';
const ISSUER_ES256K_PRIVATE_KEY = '';

const createDidWebFromPrivateKey = async () => {
    const didBtcr = new BTCRDIDMethod(NETWORK, ISSUER_ES256K_PRIVATE_KEY);
  
    console.log("Restoring from a private key pair");
    console.log("==========================");
    console.log("key pair generated");
    console.log(`Public Key: ${Buffer.from(didBtcr.keyPair.publicKey).toString("hex")}`);
    console.log("==========================");
    console.log(`Generating did:web`);
    console.log(`Issuer did: ${didBtcr.did}`);
  };
  
  const createDidWeb = async () => {
    const didBtcr = new BTCRDIDMethod(NETWORK, ISSUER_ES256K_PRIVATE_KEY);
  
    console.log("Restoring from a private key pair");
    console.log("==========================");
    console.log("key pair generated");
    console.log(`Public Key: ${Buffer.from(didBtcr.keyPair.publicKey).toString("hex")}`);
    console.log("==========================");
    console.log(`Generating did:web`);
    console.log(`Issuer did: ${didBtcr.did}`);
  };

  const main = () => {
    console.log('MAIN');
    ISSUER_ES256K_PRIVATE_KEY ? createDidWebFromPrivateKey() : createDidWeb();
  };
  
  main();