const fetch = require("node-fetch")
const fs = require("fs")

const API_BASE_URL = "https://lichess.org/api"

function api(endpoint, opts){
    return new Promise(resolve => {        
        fetch(`${API_BASE_URL}/${endpoint}`, opts || {}).then(resp=>{
            resp.json().then(json => resolve(json)).catch(err => {
                console.error("could not parse response json", err);
                resp.text().then(text => {
                    resolve(text)
                }).catch(err => {console.error("could not resolve response text",err);resolve(undefined)})
            })
        }).catch(err => {console.error(err);resolve(undefined)})
    })    
}

function getTourneys(){
    return new Promise(resolve => {
        api("tournament").then(tourneys => {
            fs.writeFileSync("tourneys.json", JSON.stringify(tourneys, null, 2))
            resolve(tourneys)
        })
    })    
}

async function signUp(variant){
    const tourneys = await getTourneys()

    if(!tourneys){
        console.error("could not get tourneys")
        return
    }

    const created = tourneys.created.filter(t => t.variant.key === variant)

    for(let t of created){
        console.log(`joining ${t.fullName} ( ${t.id} ) starting in ${Math.floor(t.secondsToStart/60)} min(s)`)

        const resp = await api(`tournament/${t.id}/join`, {
            method:"POST",
            headers: {
                Authorization: `Bearer ${process.env.LICHESS_TOURNEY_TOKEN}`
            },
            body: ""
        })

        if(resp.ok){
            console.log("done")
        }else{
            console.error("failed")
        }
    }
}

signUp(process.env.TOURNEY_VARIANT || "atomic")