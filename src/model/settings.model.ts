import { Schema,model } from "mongoose"

interface ISettings{
    ownerId:string
    businessName:string
    supportEmail:string
    knowledge:string
}

const settingsSchema = new Schema <ISettings> ({
    ownerId:{
        type:String,
        required:true
    },
    businessName:{
        type:String,
        required:true
    },
    supportEmail:{
        type:String,
        required:true
    },
    knowledge:{
        type:String,
        required:true
    }

},{timestamps:true})

const Settings = model("Settings",settingsSchema)