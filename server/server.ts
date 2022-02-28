// server dependencies
import express from 'express'
import logger from 'morgan'
import db from './models'
import cors from 'cors'
//import * as users from './routes/users'

// discord dependencies
import {web3} from "@project-serum/anchor"
import fetch from "node-fetch"
import { Client, Intents } from 'discord.js'
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
import * as config from './config.json'
const port = config.postgres.port


/* ====================== EXPRESS ============================ */

// configure express
const app = express();
app.use(express.json())
app.use(cors())
app.options('/users', cors)
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev')); // log within console

// handle all default routes
app.get('/', (req: any, res: any) => {
    res.status(200).send({
        message: `Welcome to http://localhost:${port}`,
    })
})

// sync all models with database
db.sequelize.sync({ force: true }).then(() => {
    console.log("# Drop and re-sync database");
});

import UserRoutes from './routes/users'
UserRoutes(app);
app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
);


/* ======================== DISCORD ============================ */

// listen for bot login
client.on("ready", () => {
    // @ts-ignore
    console.log(`Logged in as ${client.user.tag}!`)
})

// API fetch request for testing => replaced by POST/GET
const makeUser = async (id: any, wallet: any) => {   
    const route = `http://localhost:${port}/users/${wallet}`

    const user = {
        wallet: wallet,
        discord: id,
        signed: 0
    }
  
    // POST user
    await fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json'
        },
        body: JSON.stringify(user)
    })

    // based on React app server/DNS
    const login = `http://localhost:3000/users/${wallet}`

    // return URL to discord
    console.log('route: ', route)  
    console.log('login: ', login)  
    
    return login
}

  
// discord bot listens for command 'connect-wallet'
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'connect-wallet') {
        const discord = interaction.user.id
        const wallet = interaction.options.data[0].value
        console.log('discord = ', discord)
        console.log('wallet = ', wallet)
        const url = await makeUser(discord, wallet) 

        if (url) {
            // reply to user in server
            await interaction.reply({ 
                content: `${interaction.user} Follow this link to register a Solana wallet: ${url}`, 
                ephemeral: true 
            });
        }
        else {
            console.log('Failed to return link.')
        }
    }
});//end of interaction


// Login to Discord with client's token
const token = config.discord.token
client.login(token);

export default app;