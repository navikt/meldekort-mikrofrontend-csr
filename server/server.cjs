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

  const meldekortApiTokenRequest = await oasis.requestTokenxOboToken(token, meldekortApiAudience);
  if (!meldekortApiTokenRequest.ok) {
    logger.error("meldekortApiTokenRequest feilet", meldekortApiTokenRequest.error);
    res.status(500).send("Feil ved henting av meldekort-api token");
    return;
  }

  const meldekortApiResponse = await fetch(
    meldekortApiUrl,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${meldekortApiTokenRequest.token}`
      }
    }
  );

  if (!meldekortApiResponse.ok) {
    logger.error("meldekortApiResponse feilet med status " + meldekortApiResponse.status);
    res.status(500).send("Feil ved henting av data fra meldekort-api");
    return;
  }

  const meldekortFraArena = await meldekortApiResponse.json();


  // dp-meldekortregister
  let meldekortFraDp = {
    antallGjenstaaendeFeriedager: 0,
    etterregistrerteMeldekort: 0,
    meldekort: 0,
    nesteInnsendingAvMeldekort: null,
    nesteMeldekort: null
  };

  const meldekortregisterAudience = process.env.MELDEKORTREGISTER_AUDIENCE || "";
  const meldekortregisterUrl = process.env.MELDEKORTREGISTER_URL || "";

  try {
    const meldekortregisterTokenRequest = await oasis.requestTokenxOboToken(token, meldekortregisterAudience);
    if (!meldekortregisterTokenRequest.ok) {
      logger.error("meldekortregisterTokenRequest feilet", meldekortregisterTokenRequest.error);
      // res.status(500).send("Feil ved henting av dp-meldekortregister token");
      // return;
    }

    const meldekortregisterResponse = await fetch(
      meldekortregisterUrl,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${meldekortregisterTokenRequest.token}`
        }
      }
    );

    if (!meldekortregisterResponse.ok && meldekortregisterResponse.status !== 404) {
      logger.error("meldekortregisterResponse feilet med status " + meldekortregisterResponse.status);
      // res.status(500).send("Feil ved henting av data fra dp-meldekortregister");
      // return;
    }

    if (meldekortregisterResponse.status !== 404) {
      meldekortFraDp = await meldekortregisterResponse.json();
    } else {
      logger.info("Person finnes ikke i dp-meldekortregister");
    }
  } catch (e) {
    logger.error("Feil ved henting av data fra dp-meldekortregister", e);
  }

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
