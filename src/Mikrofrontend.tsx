import "./App.module.css";

import { onLanguageSelect } from "@navikt/nav-dekoratoren-moduler";

import App from "./App";
import LanguageProvider from "./providers/LanguageProvider";

let currentLocale = "nb";

onLanguageSelect((language) => {
  currentLocale = language.locale;
});

const Mikrofrontend = () => {
  return (
    <LanguageProvider currentLocale={currentLocale}>
      <App />
    </LanguageProvider>
  );
};

export default Mikrofrontend;
