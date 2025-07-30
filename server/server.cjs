const path = require("path");
const express = require("express");
const cors = require("cors");
const expressStaticGzip = require("express-static-gzip");
const oasis = require("@navikt/oasis");
const winston = require("winston");

const logger = winston.createLogger({
  format: process.env.NODE_ENV === "development" ? winston.format.simple() : winston.format.json(),
  transports: new winston.transports.Console(),
});

const corsAllowedOrigin = process.env.CORS_ALLOWED_ORIGIN || "http://localhost:3000";
const basePath = "/meldekort-mikrofrontend";
const buildPath = path.resolve(__dirname, "../dist");
const port = 7800;

const server = express();

server.use(cors({ origin: corsAllowedOrigin }));

server.use(
  basePath,
  expressStaticGzip(buildPath, {
    enableBrotli: true,
    orderPreference: ["br"]
  })
);

server.get(`${basePath}/internal/isAlive`, (req, res) => {
  res.sendStatus(200);
});

server.get(`${basePath}/internal/isReady`, (req, res) => {
  res.sendStatus(200);
});

server.get(`${basePath}/proxy`, async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(500).send("Feil ved henting av token fra request");
    return;
  }

  const validation = await oasis.validateIdportenToken(token);
  if (!validation.ok) {
    logger.error("Feil ved validering av token", validation.error);
    res.status(500).send("Feil ved validering av token");
    return;
  }

  // meldekort-api
  const meldekortApiAudience = process.env.MELDEKORT_API_AUDIENCE || "";
  const meldekortApiUrl = process.env.MELDEKORT_API_URL || "";

  const meldekortFraArena = await hentMeldekortstatus(token, meldekortApiAudience, meldekortApiUrl, true);


  // dp-meldekortregister
  const meldekortregisterAudience = process.env.MELDEKORTREGISTER_AUDIENCE || "";
  const meldekortregisterUrl = process.env.MELDEKORTREGISTER_URL || "";

  const meldekortFraDp = await hentMeldekortstatus(token, meldekortregisterAudience, meldekortregisterUrl, false);

  // Sammenslåing
  const antallGjenstaaendeFeriedagerArena = meldekortFraArena ? meldekortFraArena.antallGjenstaaendeFeriedager : 0;
  const antallGjenstaaendeFeriedagerDp = meldekortFraDp ? meldekortFraDp.antallGjenstaaendeFeriedager : 0;

  const etterregistrerteMeldekortArena = meldekortFraArena ? meldekortFraArena.etterregistrerteMeldekort : 0;
  const etterregistrerteMeldekortDp = meldekortFraDp ? meldekortFraDp.etterregistrerteMeldekort : 0;

  const meldekortArena = meldekortFraArena ? meldekortFraArena.meldekort : 0;
  const meldekortDp = meldekortFraDp ? meldekortFraDp.meldekort : 0;

  const nesteInnsendingAvMeldekortArena =
    meldekortFraArena && meldekortFraArena.nesteInnsendingAvMeldekort
      ? meldekortFraArena.nesteInnsendingAvMeldekort
      : null;
  const nesteInnsendingAvMeldekortDp =
    meldekortFraDp && meldekortFraDp.nesteInnsendingAvMeldekort ? meldekortFraDp.nesteInnsendingAvMeldekort : null;

  const nesteInnsendingAvMeldekort = finnNesteInnsendingAvMeldekort(
    nesteInnsendingAvMeldekortArena,
    nesteInnsendingAvMeldekortDp
  );

  const nesteMeldekortArena =
    meldekortFraArena && meldekortFraArena.nesteMeldekort ? meldekortFraArena.nesteMeldekort : null;
  const nesteMeldekortDp = meldekortFraDp && meldekortFraDp.nesteMeldekort ? meldekortFraDp.nesteMeldekort : null;

  const nesteMeldekort = finnNesteMeldekort(nesteMeldekortArena, nesteMeldekortDp);

  const meldekort = {
    antallGjenstaaendeFeriedager: antallGjenstaaendeFeriedagerArena + antallGjenstaaendeFeriedagerDp,
    etterregistrerteMeldekort: etterregistrerteMeldekortArena + etterregistrerteMeldekortDp,
    meldekort: meldekortArena + meldekortDp,
    nesteInnsendingAvMeldekort: nesteInnsendingAvMeldekort,
    nesteMeldekort: nesteMeldekort
  };

  res.send(meldekort);
});

server.listen(port, () => console.log("Server listening on port " + port));

async function hentMeldekortstatus(token, audience, url, logg) {
  let meldekortstatus = {
    antallGjenstaaendeFeriedager: 0,
    etterregistrerteMeldekort: 0,
    meldekort: 0,
    nesteInnsendingAvMeldekort: null,
    nesteMeldekort: null
  };

  try {
    const tokenResult = await oasis.requestTokenxOboToken(token, audience);
    if (!tokenResult.ok) {
      if(logg) logger.error("tokenRequest feilet", tokenResult.error);
      return meldekortstatus
    }

    const dataResponse = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenResult.token}`
        }
      }
    );

    if (!dataResponse.ok && dataResponse.status !== 404) {
      if(logg) logger.error("dataResponse fra " + url + " feilet med status " + dataResponse.status);
      return meldekortstatus
    }

    if (dataResponse.status !== 404) {
      meldekortstatus = await dataResponse.json();
    } else {
      if(logg) logger.info("Person finnes ikke");
      return meldekortstatus
    }
  } catch (e) {
    logger.error("Feil ved henting av data fra " + url, e);
  }

  return meldekortstatus;
}

function finnNesteInnsendingAvMeldekort(
  nesteInnsendingAvMeldekortArena,
  nesteInnsendingAvMeldekortDp
) {
  let nesteInnsendingAvMeldekort;

  if (nesteInnsendingAvMeldekortArena === null && nesteInnsendingAvMeldekortDp === null) {
    nesteInnsendingAvMeldekort = null;
  } else if (nesteInnsendingAvMeldekortArena === null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  } else if (nesteInnsendingAvMeldekortDp === null) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else if (nesteInnsendingAvMeldekortArena < nesteInnsendingAvMeldekortDp) {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortArena;
  } else {
    nesteInnsendingAvMeldekort = nesteInnsendingAvMeldekortDp;
  }

  return nesteInnsendingAvMeldekort;
}

function finnNesteMeldekort(
  nesteMeldekortArena,
  nesteMeldekortDp
) {
  let nesteMeldekort;

  if (nesteMeldekortArena === null && nesteMeldekortDp === null) {
    nesteMeldekort = null;
  } else if (nesteMeldekortArena === null) {
    nesteMeldekort = nesteMeldekortDp;
  } else if (nesteMeldekortDp === null) {
    nesteMeldekort = nesteMeldekortArena;
  } else if (nesteMeldekortArena.kanSendesFra < nesteMeldekortDp.kanSendesFra) {
    nesteMeldekort = nesteMeldekortArena;
  } else {
    nesteMeldekort = nesteMeldekortDp;
  }

  return nesteMeldekort;
}
