# Sovrin DID Method Implementation

Implementation of the Sovrin DID (Decentralized Identifier) method using the Hyperledger Indy SDK. This solution facilitates the creation, resolution, and updating of DIDs in the Sovrin network.

## Table of Contents
* Overview
* Features
* Prerequisites
* Getting Started
* Usage

## Overview

DID (Decentralized Identifier) is a new type of identifier that is globally unique, resolvable with high availability, and cryptographically verifiable. DIDs are typically associated with distributed ledgers because they are designed to function without a central authority or single point of control.

This implementation focuses on the Sovrin network, leveraging the capabilities provided by the Hyperledger Indy SDK.

## Features
* DID Creation: Generate a new DID and associated verification key.
* DID Resolution: Resolve a DID to retrieve its associated DID Document.
* DID Update: Update the verification key associated with a DID.
* DID Deactivation: Deactivate a DID, rendering it unusable for further operations.
* Active Check: Verify if a DID is currently active.
* Resolver Support: Get supported resolvers for the given DID methods.

## Prerequisites
* Node.js and npm/yarn.
* Access to an instance of a Hyperledger Indy network.
* Familiarity with DIDs and the Hyperledger Indy SDK.

## Usage
Here's a basic guide on using the provided Sovrin DID methods:

1. ### Initialization:
   ``` shell
    const didMethod = new SovrinDIDMethod(ledgerName, genesisPath, passKey, idName);
   ```
2. ### DID Creation:
    ``` shell
    const didWithKeys = await didMethod.create();
   ```
3. ### DID Resolution:
   ``` shell
    const resolutionResult = await didMethod.resolve(did);
   ```
4. ### DID Update:
   ``` shell
   const isSuccess = await didMethod.update(didWithKeys, newKey);
   ```
5. ### DID Deactivation:
     ``` shell
   const isDeactivated = await didMethod.deactivate(didWithKeys);
   ```
For more advanced use cases and features, refer to the API documentation and provided examples.
