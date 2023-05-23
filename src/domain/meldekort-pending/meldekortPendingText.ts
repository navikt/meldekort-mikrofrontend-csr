import { MeldekortData } from "../../types/MeldekortType";
import { formatDayAndMonth } from "../../language/i18";
import { IntlShape, useIntl } from "react-intl";

export const createPendingForInnsendingText = (meldekort: MeldekortData) => {
  const { formatMessage }: IntlShape = useIntl();

  return meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort
    ? formatMessage(
        { id: "meldekort.melding.fremtidig" },
        { dato: formatDayAndMonth(meldekort.nyeMeldekort?.nesteInnsendingAvMeldekort) }
      )
    : "";
};
