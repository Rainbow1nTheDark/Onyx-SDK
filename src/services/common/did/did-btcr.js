"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BTCRDIDMethod = void 0;
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var node_fetch_1 = require("node-fetch"); // for sending HTTP requests
var ecpair_1 = require("ecpair");
var BTCRDIDMethod = /** @class */ (function () {
    function BTCRDIDMethod(networkType, privateKeyHex) {
        this.tinysecp = require('tiny-secp256k1');
        this.ECPair = (0, ecpair_1.ECPairFactory)(this.tinysecp);
        this.YOURTOKEN = "c9591ac3187946979360d12fdc2cb26a";
        this.did = 'BTCR';
        this.network = networkType === 'testnet' ? bitcoinjs_lib_1.networks.testnet : bitcoinjs_lib_1.networks.bitcoin;
        if (privateKeyHex) {
            var privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
            this.keyPair = this.ECPair.fromPrivateKey(privateKeyBuffer, { network: this.network });
        }
        else {
            this.keyPair = this.ECPair.makeRandom({ network: this.network });
        }
    }
    BTCRDIDMethod.prototype.fundWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var address, faucetUrl, body, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = bitcoinjs_lib_1.payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network }).address;
                        if (!(this.network === bitcoinjs_lib_1.networks.testnet)) return [3 /*break*/, 3];
                        faucetUrl = "https://api.blockcypher.com/v1/btc/test3/faucet?token=" + this.YOURTOKEN;
                        body = {
                            address: address,
                            amount: 100000 // or whatever amount you want in satoshis
                        };
                        return [4 /*yield*/, (0, node_fetch_1.default)(faucetUrl, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fund testnet wallet via BlockCypher faucet');
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                    case 2:
                        _a.sent(); // wait for the faucet to process
                        return [3 /*break*/, 4];
                    case 3:
                        console.log("Please fund the mainnet wallet at this address: ".concat(address));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BTCRDIDMethod.prototype.getBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var address, url, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = bitcoinjs_lib_1.payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network }).address;
                        url = "".concat(BTCRDIDMethod.BASE_URL, "/addrs/").concat(address, "/balance");
                        return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to get wallet balance');
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.final_balance]; // BlockCypher's balance property for an address
                }
            });
        });
    };
    BTCRDIDMethod.prototype.sendTransaction = function (txb) {
        return __awaiter(this, void 0, void 0, function () {
            var rawTx, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Finalize all inputs and extract the transaction object
                        txb.finalizeAllInputs();
                        rawTx = txb.extractTransaction().toHex();
                        return [4 /*yield*/, this.sendBatchTransactions([rawTx])];
                    case 1:
                        results = _a.sent();
                        if (results[0].error) {
                            throw new Error("Transaction failed: ".concat(results[0].error.message));
                        }
                        return [2 /*return*/, results[0].tx.hash];
                }
            });
        });
    };
    BTCRDIDMethod.prototype.sendBatchTransactions = function (transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var batchBody, response, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batchBody = transactions.map(function (tx) { return ({
                            method: "POST",
                            endpoint: "txs/push",
                            body: JSON.stringify({ tx: tx })
                        }); });
                        return [4 /*yield*/, (0, node_fetch_1.default)("".concat(BTCRDIDMethod.BASE_URL, "/batch"), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(batchBody)
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Batch request failed with status: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    BTCRDIDMethod.BASE_URL = "https://api.blockcypher.com/v1/btc/test3"; // BlockCypher testnet base URL
    return BTCRDIDMethod;
}());
exports.BTCRDIDMethod = BTCRDIDMethod;
var NETWORK = 'testnet';
var ISSUER_ES256K_PRIVATE_KEY = '';
var createDidWebFromPrivateKey = function () { return __awaiter(void 0, void 0, void 0, function () {
    var didBtcr;
    return __generator(this, function (_a) {
        didBtcr = new BTCRDIDMethod(NETWORK, ISSUER_ES256K_PRIVATE_KEY);
        console.log("Restoring from a private key pair");
        console.log("==========================");
        console.log("key pair generated");
        console.log("Public Key: ".concat(Buffer.from(didBtcr.keyPair.publicKey).toString("hex")));
        console.log("==========================");
        console.log("Generating did:web");
        console.log("Issuer did: ".concat(didBtcr.did));
        return [2 /*return*/];
    });
}); };
var createDidWeb = function () { return __awaiter(void 0, void 0, void 0, function () {
    var didBtcr;
    return __generator(this, function (_a) {
        didBtcr = new BTCRDIDMethod(NETWORK, ISSUER_ES256K_PRIVATE_KEY);
        console.log("Restoring from a private key pair");
        console.log("==========================");
        console.log("key pair generated");
        console.log("Public Key: ".concat(Buffer.from(didBtcr.keyPair.publicKey).toString("hex")));
        console.log("==========================");
        console.log("Generating did:web");
        console.log("Issuer did: ".concat(didBtcr.did));
        return [2 /*return*/];
    });
}); };
var main = function () {
    console.log('MAIN');
    ISSUER_ES256K_PRIVATE_KEY ? createDidWebFromPrivateKey() : createDidWeb();
};
main();
