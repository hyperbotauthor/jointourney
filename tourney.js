const fetch = require("node-fetch");
const fs = require("fs");
const colors = require("colors");

const API_BASE_URL = "https://lichess.org/api";

function api(endpoint, opts) {
  return new Promise((resolve) => {
    fetch(`${API_BASE_URL}/${endpoint}`, opts || {})
      .then((resp) => {
        resp
          .json()
          .then((json) => resolve(json))
          .catch((err) => {
            console.error("could not parse response json", err);
            resp
              .text()
              .then((text) => {
                resolve(text);
              })
              .catch((err) => {
                console.error("could not resolve response text", err);
                resolve(undefined);
              });
          });
      })
      .catch((err) => {
        console.error(err);
        resolve(undefined);
      });
  });
}

function getTourneys() {
  return new Promise((resolve) => {
    api("tournament").then((tourneys) => {
      fs.writeFileSync("tourneys.json", JSON.stringify(tourneys, null, 2));
      resolve(tourneys);
    });
  });
}

async function signUp(variant) {
  const tourneys = await getTourneys();

  if (!tourneys) {
    console.error("could not get tourneys");
    return;
  }

  const created = tourneys.created.filter((t) => t.variant.key === variant);
  const started = tourneys.started.filter((t) => t.variant.key === variant);

  for (let t of started.concat(created)) {
    const startingIn = t.secondsToStart
      ? `starting in ${colors.cyan(Math.floor(t.secondsToStart / 60))} min(s)`
      : `finishes in ${colors.green(
          Math.floor((t.finishesAt - new Date().getTime()) / 60000)
        )} min(s)`;
    const tourneyName = t.secondsToStart
      ? `${colors.cyan(t.fullName)}`
      : `${colors.green(t.fullName)}`;
    console.log(
      `joining ${tourneyName} , ${colors.red.bold(
        t.clock.limit / 60
      )} + ${colors.blue.bold(t.clock.increment)} , ${colors.magenta(
        t.minutes
      )} min(s) , ${startingIn} , ${colors.yellow(t.nbPlayers)} player(s)`
    );

    const resp = await api(`tournament/${t.id}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LICHESS_TOURNEY_TOKEN}`,
      },
      body: "",
    });

    if (resp.ok) {
      console.log("done");
    } else {
      console.error("failed");
    }
  }
}

signUp(process.env.TOURNEY_VARIANT || "atomic");
