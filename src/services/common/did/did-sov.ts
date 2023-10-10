import { Resolver, DIDResolver } from 'did-resolver';
import { DIDMethod, DIDWithKeys, DID } from './did'
import { KeyPair, KEY_ALG } from '../../../utils/KeyUtils';
import { ec as EC } from 'elliptic';
import * as indy from 'indy-sdk';
import { DIDMethodFailureError } from '../../../errors';
const secp256k1 = new EC('secp256k1');

export class SovrinDIDMethod implements DIDMethod {
    name = 'sov';
    poolHandle: number;
    walletHandle: number;

    constructor(private ledgerName: string, private genesisPath: string, private passKey: string, private idName: string) {
        this.initialize();
    }

    async initialize(): Promise<void> {
        // Setup as before, but integrate with the class structure
        const poolConfig = {
            'genesis_txn': this.genesisPath
        };

        await indy.createPoolLedgerConfig(this.ledgerName, poolConfig);
        this.poolHandle = await indy.openPoolLedger(this.ledgerName);

        const walletConfig = { 'id': this.idName };
        const walletCredentials = { 'key': this.passKey };

        try {
            await indy.createWallet(walletConfig, walletCredentials);
        } catch (e) {
            if (e.message !== 'WalletAlreadyExistsError') {
                throw e;
            }
        }

        this.walletHandle = await indy.openWallet(walletConfig, walletCredentials);
    }

    async create(): Promise<DIDWithKeys> {
        const [did, verkey] = await indy.createAndStoreMyDid(this.walletHandle, {});

        const nymRequest = await indy.buildNYMRequest(did, did, verkey, null, 'TRUST_ANCHOR');
        await indy.signAndSubmitRequest(this.poolHandle, this.walletHandle, did, nymRequest);

        return { did, keyPair: {algorithm: KEY_ALG.Ed25519, publicKey: verkey, privateKey: '' } };  // Note: indy doesn't return the private key here
    }

    async resolve(did: DID): Promise<DIDResolutionResult> {
        const nymData = await indy.getNym(this.poolHandle, this.walletHandle, did);
        const verkey = nymData.verkey;
    
        if (!verkey) {
            throw new Error('DID not found');
        }
    
        return {
            didDocument: {
                id: did,
                publicKey: [{
                    id: `${did}#key1`,
                    type: 'Ed25519VerificationKey2018',
                    controller: did,
                    publicKeyPem: verkey 
                }]
            },
            didResolutionMetadata: {
                contentType: 'application/did+ld+json'
            },
            didDocumentMetadata: {}
        };
    }
    
    async update(didWithKeys: DIDWithKeys, newKey: string | Uint8Array): Promise<boolean> {
        await indy.replaceKeysStart(this.walletHandle, didWithKeys.did, {});
        await indy.replaceKeysApply(this.walletHandle, didWithKeys.did);
        return true;
    }
    
    // Note: Deactivating isn't a direct feature, so this method is a bit of a workaround.
    async deactivate(didWithKeys: DIDWithKeys): Promise<boolean> {
        const newKeyPair = this.generateKeyPair();
        await this.update(didWithKeys, newKeyPair.publicKey);
        return true;
    }
    // Note: Sov doesn't return the private key so the user would not have it
    async generateFromPrivateKey(privateKey: string | Uint8Array): Promise<DIDWithKeys> {
        throw new Error("Unable to generate DID from provided private key");
    }


    async isActive(did: DID): Promise<boolean> {
        try {
            await indy.getNym(this.poolHandle, this.walletHandle, did);
            return true;
        } catch (e) {
            return false;
        }
    }

    getDIDResolver(): Record<string, DIDResolver> {
        return {
            [this.name]: async (did: string) => this.resolve(did)
        };
    }

    private generateKeyPair(): KeyPair {
        const key = secp256k1.genKeyPair();
        const publicKeyHex = key.getPublic('hex');
        const privateKeyHex = key.getPrivate('hex');
    
        return {
            algorithm: KEY_ALG.ES256K,
            publicKey: publicKeyHex,
            privateKey: privateKeyHex
        };
    }
    async closeResources(): Promise<void> {
        await indy.closeWallet(this.walletHandle);
        await indy.closePoolLedger(this.poolHandle);
    }
    getIdentifier(did: DID): string {
        const parts = did.split(':');
        if (parts.length !== 3) {
            throw new DIDMethodFailureError('Invalid DID format');
        }
        return parts[2];
    }
}

interface DIDResolutionResult {
    didDocument: {
        id: string;
        publicKey: {
            id: string;
            type: string;
            controller: string;
            publicKeyPem: string;
        }[];
    };
    didResolutionMetadata: {
        contentType: string;
    };
    didDocumentMetadata: Record<string, any>;
}

export function getSupportedResolvers(supportedMethods: DIDMethod[]): Resolver {
    let resolvers: Record<string, DIDResolver> = {};
    supportedMethods.forEach(function (r) {
        const record = r.getDIDResolver();
        resolvers = {...resolvers, ...record};
    });
    return new Resolver(resolvers);
}