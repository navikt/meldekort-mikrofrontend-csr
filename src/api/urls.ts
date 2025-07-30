const isProduction = window.location.href.includes("www.intern.nav.no") || window.location.href.includes("www.nav.no");
const isDevelopment = window.location.href.includes("www.intern.dev.nav.no");

export const getEnvironment = (): "production" | "development" | "local" => {
  if (isProduction) {
    return "production";
  }

  if (isDevelopment) {
    return "development";
  }

  return "local";
};

type EnvUrl = { local: string; development: string; production: string };

const PROXY_URL: EnvUrl = {
  local: "http://localhost:3000/proxy",
  development: "https://www.intern.dev.nav.no/meldekort-mikrofrontend/proxy",
  production: "https://www.nav.no/meldekort-mikrofrontend/proxy",
};

const MELDEKORT_URL: EnvUrl = {
  local: "http://localhost:3000/meldekort",
  development: "https://meldekort-frontend-q2.intern.dev.nav.no/meldekort",
  production: "https://www.nav.no/meldekort",
};

const ETTERREGISTRERING_MELDEKORT_URL: EnvUrl = {
  local: "http://localhost:3000/meldekort",
  development: "https://www.dev.nav.no/meldekort/etterregistrer-meldekort",
  production: "https://www.nav.no/meldekort/etterregistrer-meldekort",
};

export const proxyUrl = PROXY_URL[getEnvironment()];
export const meldekortUrl = MELDEKORT_URL[getEnvironment()];
export const etterregistreringUrl = ETTERREGISTRERING_MELDEKORT_URL[getEnvironment()];
