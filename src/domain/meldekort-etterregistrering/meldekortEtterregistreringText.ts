import { IntlShape, useIntl } from "react-intl";

import { MeldekortData } from "../../types/MeldekortType";

export const createMeldekortEtterregistreringText = (meldekort: MeldekortData | undefined) => {
  const { formatMessage }: IntlShape = useIntl();

  return formatMessage(
    { id: "meldekort.etterregistreringer" },
    { etterregistreringer: meldekort?.etterregistrerteMeldekort },
  );
};
