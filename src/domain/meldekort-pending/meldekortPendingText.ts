import { IntlShape, useIntl } from "react-intl";

import { formatDayAndMonth } from "../../language/i18";
import { MeldekortData } from "../../types/MeldekortType";

export const createPendingForInnsendingText = (meldekort: MeldekortData) => {
  const { formatMessage }: IntlShape = useIntl();

  return meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort
    ? formatMessage(
        { id: "meldekort.melding.fremtidig" },
        { dato: formatDayAndMonth(meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort) },
      )
    : "";
};
