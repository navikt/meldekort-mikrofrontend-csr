import { MeldekortData } from "../../types/MeldekortType";
import { IntlShape, useIntl } from "react-intl";

export const createMeldekortEtterregistreringText = (meldekort: MeldekortData | undefined) => {
  const { formatMessage }: IntlShape = useIntl();

  return formatMessage(
    { id: "meldekort.etterregistreringer" },
    { etterregistreringer: meldekort?.etterregistrerteMeldekort }
  );
};
