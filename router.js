import dotenv from "dotenv"
dotenv.config()
import fetch from "node-fetch"
import express from "express"
const ROUTER_PORT = process.env.ROUTER_PORT
const app = express()


import {routerLog, errorLog, debugLog, defaultLog} from './loggingConf.js'

const mtaRoutes = [process.env.MTA_REAL, process.env.MTA_DOP, process.env.MTA_DEV]


app.post('/', (req, res) => {

    let chunks = []
    let url = req.headers.host
    console.log(url)
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    console.log(fullUrl)
    routerLog.info('Full_url: ', fullUrl)
    const parts = fullUrl.split('/')
    console.log(parts)
    routerLog.info('Parts_of_url: ', parts)
    let targetUrl = parts[2]
    console.log(targetUrl)
    routerLog.info('Target_url: ', targetUrl)
    req.on('data', function(data) {
        chunks.push(data)

    })
        .on('end', function() {
            const data = Buffer.concat(chunks)
            const reqBody = JSON.parse(data)
            console.log(reqBody)
            routerLog.info('Request_body: ', reqBody)
            // for (let i in chunks) {console.log(' ', chunks[i])}

            switch (targetUrl){
                case 'localhost:3005':
                    resendPostMethod(reqBody);
                    res.status(200).send('localhost:3005')
                    break;
                default:
                    resendPostMethod(reqBody)
                    res.status(200).send('From router external')
                    break;
            }
        });
});

function resendPostMethod(reqBody) {
    for(let i in mtaRoutes){
        let mta = mtaRoutes[i]
        console.log(mta)
        fetch(mta, {
            method: 'POST',
            body: JSON.stringify(reqBody),
            headers: {
                /* auth headers */
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(json => debugLog.info(json))

    }
}

app.listen(ROUTER_PORT,() => {
    console.log('Server has been started on port', + ROUTER_PORT, '...')
})