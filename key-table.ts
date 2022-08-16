import { FindCursor, MongoClient, ObjectId } from 'mongodb';

import {collections} from './database-service';

// All public keys are in fact base64 encoded byte arrays
export interface PublicPreKey {
    keyId: number,
    publicKey: string
}

export interface SignedPublicKey {
    keyId: number,
    publicKey: string,
    signature: string
}

export interface FullKeyBundle {
    registrationId: number,
    identityKey: string,
    signedPreKey: SignedPublicKey,
    oneTimePreKeys: PublicPreKey[]
}

export interface KeyTableItem extends FullKeyBundle {
    _id: ObjectId,
    address: string,
    created: number,
    updated: number
}

export interface PublicPreKeyBundle {
    identityKey: string,
    signedPreKey: SignedPublicKey,
    preKey?: PublicPreKey,
    registrationId: number,
}

// Register a key bundle with the app, currently update if already exists
export async function registerKeyBundle(address: string, bundle: FullKeyBundle): Promise<string> {
    const timestamp = new Date().getTime()
    console.log(address.length)
    const item: KeyTableItem = {
        _id: new ObjectId(address),
	address:address,
        created: timestamp,
        updated: timestamp,
        ...bundle
    }
    try {
	const r = await collections.keyTable.updateOne({_id: item._id}, {$set:item} , {upsert: true});

	// const r1 = await collections.keyTable.find({_id:item._id}).toArray();
	// return JSON.stringify(r1);
	
	return address;

    } catch (err) {
	console.log(err)
	return 'err';
    }
}; //</string>

// Get the full key bundle for a given address
export async function getFullKeyBundle(address: string): Promise<KeyTableItem[]> {
    try {
        const result = await collections.keyTable.find({
            "username":address
        });
        const array =await result.toArray()
            console.log(JSON.stringify(result))
            if (array.length > 0) {
                const items = array as KeyTableItem[];
                return items
            }
        } catch (error) {
            console.error(error)
        }
        return []
}


// Replace the signed pre key for a given address
export async function replaceSignedPreKey(address: string, signedPublicPreKey: SignedPublicKey): Promise<void> {
    try {
	const r = await collections.keyTable.updateOne({_id: new ObjectId(address)}, {$set:{
	    'SignedPreKey': signedPublicPreKey,
	    'updated': Date.now()
	}});
	//return;
    } catch (error) {
        console.error(error)
    }    
}

// Replace the onetimeprekeys
export async function replaceOneTimePreKeys(address: string, prekeys: PublicPreKey[]): Promise<void> {
    try {
	const r = await collections.keyTable.updateOne({_id: new ObjectId(address)}, {$set:{
	    'oneTimePreKeys': prekeys,
	    'updated': Date.now()
	}});
	//return;
    } catch (error) {
        console.error(error)
    }    

    //const result = await dynamoDb.update(params).promise()
    //console.log(JSON.stringify(result))
}

// Remove an address from the table
export async function removeAddress(address: string): Promise<void> {
    try {
	const r = await collections.keyTable.deleteOne({_id: new ObjectId(address)});
	//return;
    } catch (error) {
        console.error(error)
    }    
}


// Pops the first prekey from the bundle and returns it
export async function getPublicPreKeyBundle(address: string): Promise<PublicPreKeyBundle | null> {
    const bundle = await getFullKeyBundle(address)
    if (!bundle) {
        return null
    }
    const preKey = bundle[0].oneTimePreKeys.pop()
    if (preKey) {
        // remove it from the db
        // TODO: we have a race condition here and we could end up storing a key that another
        // request used.  Need to put this in a transaction.
        await replaceOneTimePreKeys(address, bundle[0].oneTimePreKeys)
    }

    const { registrationId, identityKey, signedPreKey } = bundle[0]
    return { registrationId, identityKey, signedPreKey, preKey }
}
