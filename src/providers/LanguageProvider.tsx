import React from "react";
import { IntlProvider } from "react-intl";
import nbMessages from "../language/nb.json";
import nnMessages from "../language/nn.json";
import enMessages from "../language/en.json";

const loadMessages = (sprak: string) =>
  ({
    nb: nbMessages,
    nn: nnMessages,
    en: enMessages,
  }[sprak]);

interface Props {
  currentLocale: string;
  children: React.ReactNode;
}

const LanguageProvider = ({ currentLocale, children }: Props) => (
  <IntlProvider locale={currentLocale} messages={loadMessages(currentLocale)}>
    {children}
  </IntlProvider>
);

export default LanguageProvider;
