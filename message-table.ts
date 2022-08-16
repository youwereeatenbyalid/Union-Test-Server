import { MongoClient, ObjectId } from 'mongodb';

import {collections} from './database-service';

import { v4 as uuid } from 'uuid';

export interface MessageTableItem {
    _id = ObjectId
    address: string
    sortID: string
    message: string
}

// Stores a message in the database for address
export async function storeMessage(address: string, message: string): Promise<MessageTableItem> {
    const sortID = `${Date.now()}-${uuid()}`
    const item: MessageTableItem = { _id = new ObjectId(sortID), address, sortID, message }

    try {
	const result = await collections.messageTable.insertOne(item);
        const result = await dynamoDb.put(params).promise()
        console.log(JSON.stringify(result))
        return item
    } catch (error) {
        console.error(error)
        return null
    }
} // </MessageTableItem>

// Get messages after a timestamp
export async function getMessagesAfter(address: string, timestamp: number): Promise<MessageTableItem[]> {
    try {
	const result = collections.messageTable.find({
	    "address": address,
	    "sortID": {
		$gte: "${timestamp}"
	    }
	});
        console.log(JSON.stringify(result))
        if (result.Items.length > 0) {
            const items = result as MessageTableItem[]
            return items
        }
    } catch (error) {
        console.error(error)
    }
    return []
}

// Get messages before a timestamp
export async function getMessagesBefore(address: string, timestamp: number): Promise<MessageTableItem[]> {
    try {
	const result = collections.messageTable.find({
	    "address": address,
	    "sortID": {
		$lte: "${timestamp}"
	    }
	});
	
        console.log(JSON.stringify(result))
        if (result.Items.length > 0) {
            const items = result as MessageTableItem[]
            return items
        }
    } catch (error) {
        console.error(error)
    }
    return []
}

// Delete messages from before a timestamp
export async function deleteMessagesBefore(address: string, timestamp: number): Promise<void> {

    try {
	const result = collections.messageTable.deleteMany({
	    "address": address,
	    "sortID": {
		$lte: "${timestamp}"
	    }
	});
    } catch (error) {
        console.error(error)
    }
    
}
