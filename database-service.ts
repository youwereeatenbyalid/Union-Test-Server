import * as mongoDB from "mongodb";
export const collections: {
    keyTable?: mongoDB.Collection,
    messageTable?: mongoDB.Collection
} = {}

export async function connectToDatabase () {

    const client: mongoDB.MongoClient = new mongoDB.MongoClient("mongodb://localhost:27017/");
    
    await client.connect();
    
    const db: mongoDB.Db = client.db("uniondb");

    const keyTable: mongoDB.Collection = db.collection("keyTable");
    
    collections.keyTable = keyTable;

    const messageTable: mongoDB.Collection = db.collection("messageTable");
    
    collections.messageTable = messageTable;

    console.log("Database loaded");
    return true;
}
